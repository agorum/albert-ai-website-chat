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

  const input = page.locator('textarea.acw-textarea');
  await input.click();
  await input.fill('');
  await input.type('Hallo!');
  await page.keyboard.press('Backspace');
  await expect(input).toHaveValue('Hallo');
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('');

  const userMessage = page.locator('.acw-message-user .acw-bubble').last();
  await expect(userMessage).toHaveText('Hallo', { timeout: 2000 });

  const typingIndicator = page.locator('.acw-typing');
  await expect(typingIndicator).toBeVisible({ timeout: 2000 });

  const agentMessage = page.locator('.acw-message-agent .acw-bubble').last();
  await expect(agentMessage).toHaveText(/Albert|Danke/i, { timeout: 8000 });
  await expect(typingIndicator).toBeHidden({ timeout: 4000 });
  const agentText = (await agentMessage.textContent()) ?? '';
  expect(agentText.trim().length).toBeGreaterThan(10);

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

  const atBottom = await page.evaluate(() => {
    const host = document.querySelector('.acw-host');
    if (!(host instanceof HTMLElement) || !host.shadowRoot) {
      return false;
    }
    const container = host.shadowRoot.querySelector('.acw-messages');
    if (!(container instanceof HTMLElement)) {
      return false;
    }
    const distance = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight);
    return distance < 4;
  });
  expect(atBottom).toBe(true);

  expect(consoleErrors, 'Konsolenfehler gefunden').toEqual([]);
  expect(pageErrors, 'Seitenfehler gefunden').toEqual([]);
});
