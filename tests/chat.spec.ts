import { test, expect } from '@playwright/test';
import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let serverProcess: ReturnType<typeof spawn> | undefined;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const projectRoot = path.resolve(__dirname, '..');
  serverProcess = spawn(
    'node',
    [path.join('scripts', 'dev-server.mjs'), 'examples'],
    {
      cwd: projectRoot,
      env: { ...process.env, PORT: '8080' },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  const readyRegex = /läuft auf http:\/\/localhost:8080/i;
  if (!serverProcess.stdout) {
    throw new Error('Keine Server-Ausgabe verfügbar');
  }

  serverProcess.stdout.setEncoding('utf-8');
  let buffer = '';

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout: Dev-Server hat keine Startmeldung ausgegeben'));
    }, 10000);

    const handleData = (data: string) => {
      buffer += data;
      if (readyRegex.test(buffer)) {
        clearTimeout(timeout);
        serverProcess?.stdout?.off('data', handleData);
        resolve();
      }
    };

    const handleError = (err: Error) => {
      clearTimeout(timeout);
      serverProcess?.stdout?.off('data', handleData);
      reject(err);
    };

    const handleExit = (code: number | null) => {
      clearTimeout(timeout);
      serverProcess?.stdout?.off('data', handleData);
      reject(new Error(`Dev-Server beendete sich unerwartet (Code: ${code})`));
    };

    serverProcess?.stdout?.on('data', handleData);
    serverProcess?.on('error', handleError);
    serverProcess?.on('exit', handleExit);
  });
}

async function stopServer() {
  if (!serverProcess) {
    return;
  }
  await new Promise<void>((resolve) => {
    serverProcess?.once('close', () => resolve());
    serverProcess?.kill();
    setTimeout(() => resolve(), 1000);
  });
  serverProcess = undefined;
}

test.beforeAll(async () => {
  execSync('npm run build', { stdio: 'inherit' });
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('Chat-Widget wird geladen und wirft keine Konsolenfehler', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.goto('http://localhost:8080/index.html');

  const launcher = page.locator('.acw-launcher');
  await expect(launcher).toBeVisible();

  const teaser = page.locator('.acw-teaser.acw-visible');
  await expect(teaser).toBeVisible({ timeout: 7000 });

  await launcher.click();

  const chat = page.locator('.acw-chat');
  await expect(chat).toHaveClass(/acw-open/, { timeout: 2000 });
  await expect(teaser).toBeHidden();

  const sendButton = page.locator('.acw-send-button');
  await expect(sendButton).toBeDisabled();
  await expect(sendButton).toHaveAttribute(
    'title',
    'Sie können erst senden, nachdem Sie der Datenschutzerklärung zugestimmt haben.'
  );

  const input = page.locator('textarea.acw-textarea');
  await expect(input).toBeDisabled();

  const consent = page.locator('.acw-consent');
  await expect(consent).toBeVisible();
  await page.locator('.acw-consent-accept').click();
  await expect(consent).toBeHidden();
  await expect(input).toBeEnabled();
  await expect(sendButton).toBeEnabled();
  await expect(sendButton).toHaveAttribute('title', 'Senden');

  const initialHeight = await input.evaluate((el) => el.clientHeight);
  await input.type('Erste Zeile für den Auto-Resize-Test');
  await page.keyboard.press('Shift+Enter');
  await input.type('Zweite Zeile mit zusätzlichem Inhalt');
  await page.keyboard.press('Shift+Enter');
  await input.type('Dritte Zeile um genügend Höhe zu erzeugen');
  await page.keyboard.press('Shift+Enter');
  await input.type('Vierte Zeile, fast geschafft');
  await page.waitForTimeout(60);
  const expandedHeight = await input.evaluate((el) => el.clientHeight);
  expect(expandedHeight).toBeGreaterThan(initialHeight + 10);
  await page.waitForTimeout(200);
  const stableHeight = await input.evaluate((el) => el.clientHeight);
  expect(Math.abs(stableHeight - expandedHeight)).toBeLessThan(2);

  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('');

  const firstTypingIndicator = page.locator('.acw-typing');
  await expect(firstTypingIndicator).toBeVisible({ timeout: 2000 });
  await expect(firstTypingIndicator).toBeHidden({ timeout: 6000 });

  await input.click();
  await input.fill('');
  await input.type('Hallo!');
  await page.keyboard.press('Backspace');
  await expect(input).toHaveValue('Hallo');
  await expect(sendButton).toBeEnabled();
  await expect(sendButton).toHaveAttribute('title', 'Senden');
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('');

  const userMessage = page.locator('.acw-message-user .acw-bubble').last();
  await expect(userMessage).toHaveText('Hallo', { timeout: 2000 });

  const typingIndicator = page.locator('.acw-typing');
  await expect(typingIndicator).toBeVisible({ timeout: 2000 });
  await page.waitForTimeout(150);
  await expect(sendButton).toBeDisabled();
  await expect(sendButton).toHaveAttribute(
    'title',
    'Bitte warten, bis die aktuelle Antwort vollständig ist.'
  );

  const scrollPrep = await page.evaluate(() => {
    const host = document.querySelector('.acw-host');
    if (!(host instanceof HTMLElement) || !host.shadowRoot) {
      return { canScroll: false, top: 0 };
    }
    const container = host.shadowRoot.querySelector('.acw-messages');
    if (!(container instanceof HTMLElement)) {
      return { canScroll: false, top: 0 };
    }
    const canScroll = container.scrollHeight - container.clientHeight > 8;
    if (canScroll) {
      container.scrollTop = 0;
    }
    return { canScroll, top: container.scrollTop };
  });
  expect(scrollPrep.canScroll).toBe(true);
  await page.waitForTimeout(400);
  const scrollPositionDuringStream = await page.evaluate(() => {
    const host = document.querySelector('.acw-host');
    if (!(host instanceof HTMLElement) || !host.shadowRoot) {
      return -1;
    }
    const container = host.shadowRoot.querySelector('.acw-messages');
    if (!(container instanceof HTMLElement)) {
      return -1;
    }
    return container.scrollTop;
  });
  expect(scrollPositionDuringStream).toBeLessThan(12);

  const agentMessage = page.locator('.acw-message-agent .acw-bubble').last();
  await expect(typingIndicator).toBeHidden({ timeout: 6000 });
  await expect
    .poll(async () => ((await agentMessage.textContent()) ?? '').trim().length, {
      timeout: 8000,
    })
    .toBeGreaterThan(10);

  await expect(sendButton).toBeEnabled();
  await expect(sendButton).toHaveAttribute('title', 'Senden');

  await page.evaluate(() => {
    const host = document.querySelector('.acw-host');
    if (!(host instanceof HTMLElement) || !host.shadowRoot) {
      return;
    }
    const container = host.shadowRoot.querySelector('.acw-messages');
    if (container instanceof HTMLElement) {
      container.scrollTop = container.scrollHeight;
    }
  });

  const inputVisible = await page.evaluate(() => {
    const host = document.querySelector('.acw-host');
    if (!(host instanceof HTMLElement) || !host.shadowRoot) {
      return false;
    }
    const chatEl = host.shadowRoot.querySelector('.acw-chat');
    const textarea = host.shadowRoot.querySelector('.acw-textarea');
    if (!(chatEl instanceof HTMLElement) || !(textarea instanceof HTMLElement)) {
      return false;
    }
    const chatRect = chatEl.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();
    return textareaRect.bottom <= chatRect.bottom && textareaRect.top >= chatRect.top;
  });
  expect(inputVisible).toBe(true);

  await page.getByRole('button', { name: 'Schließen' }).click();
  await expect(chat).not.toHaveClass(/acw-open/, { timeout: 2000 });

  await launcher.click();
  await expect(chat).toHaveClass(/acw-open/, { timeout: 2000 });

  await page.waitForTimeout(420);
  const distance = await page.evaluate(() => {
    const host = document.querySelector('.acw-host');
    if (!(host instanceof HTMLElement) || !host.shadowRoot) {
      return Infinity;
    }
    const container = host.shadowRoot.querySelector('.acw-messages');
    if (!(container instanceof HTMLElement)) {
      return Infinity;
    }
    const distance = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight);
    return distance;
  });
  expect(distance).toBeLessThan(12);

  expect(consoleErrors, 'Konsolenfehler gefunden').toEqual([]);
  expect(pageErrors, 'Seitenfehler gefunden').toEqual([]);
});

test('Datenschutz-Ablehnung deaktiviert den Chat', async ({ page }) => {
  await page.goto('http://localhost:8080/index.html');

  const launcher = page.locator('.acw-launcher');
  await expect(launcher).toBeVisible();
  await launcher.click();

  const consent = page.locator('.acw-consent');
  await expect(consent).toBeVisible();
  await page.locator('.acw-consent-decline').click();
  await expect(consent).toBeHidden();

  const declineMessage = page.locator('.acw-message-agent .acw-bubble').last();
  await expect(declineMessage).toHaveText(
    'Ohne Zustimmung zu unseren Datenschutzhinweisen ist der Chat leider nicht verfügbar.'
  );

  const input = page.locator('textarea.acw-textarea');
  await expect(input).toBeDisabled();
  await expect(await input.getAttribute('placeholder')).toContain('Chat deaktiviert');

  const sendButton = page.locator('.acw-send-button');
  await expect(sendButton).toBeDisabled();
  await expect(sendButton).toHaveAttribute(
    'title',
    'Der Chat ist deaktiviert. Starten Sie ihn neu, um eine neue Sitzung zu beginnen.'
  );

  await page.getByRole('button', { name: 'Neu starten' }).click();
  await expect(page.locator('.acw-consent')).toBeVisible();
});
