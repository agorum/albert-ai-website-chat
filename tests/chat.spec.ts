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

  const readyRegex = /ALBERT \| AI dev server running at http:\/\/localhost:8080/i;
  if (!serverProcess.stdout) {
    throw new Error('No server output available');
  }

  serverProcess.stdout.setEncoding('utf-8');
  let buffer = '';

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout: dev server did not print a startup message'));
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
      reject(new Error(`Dev server exited unexpectedly (code: ${code})`));
    };

    serverProcess.stdout.on('data', handleData);
    serverProcess.on('error', handleError);
    serverProcess.on('exit', handleExit);
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

test('chat widget loads without console errors', async ({ page }) => {
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
    'You can send messages after accepting the privacy notice.'
  );

  const input = page.locator('textarea.acw-textarea');
  const inputArea = page.locator('.acw-input-area');
  await expect(inputArea).toBeHidden();

  const consent = page.locator('.acw-consent');
  await expect(consent).toBeVisible();
  await page.locator('.acw-consent-accept').click();
  await expect(consent).toBeHidden();
  await expect(inputArea).toBeVisible();
  await expect(input).toBeVisible();
  await expect(sendButton).toBeEnabled();
  await expect(input).toHaveAttribute('placeholder', 'Your message …');

  await input.fill('First line');
  await input.press('Shift+Enter');
  await input.type('Second line');
  await input.press('Shift+Enter');
  await input.type('Third line for height test');

  const textareaHeight = await input.evaluate((el) => el.style.height);
  expect(Number.parseInt(textareaHeight, 10)).toBeGreaterThan(60);

  await sendButton.click();

  const typingIndicator = page.locator('.acw-typing');
  await expect(typingIndicator).toBeVisible({ timeout: 2000 });

  await expect(sendButton).toBeDisabled();
  await expect(sendButton).toHaveAttribute(
    'title',
    'Please wait until the current response has finished.'
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
  await expect(sendButton).toHaveAttribute('title', 'Send');

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

  await page.getByRole('button', { name: 'Close' }).click();
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
    const difference = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight);
    return difference;
  });
  expect(distance).toBeLessThan(12);

  expect(consoleErrors, 'Console errors detected').toEqual([]);
  expect(pageErrors, 'Page errors detected').toEqual([]);
});

test('declining consent disables the chat', async ({ page }) => {
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
    'The chat cannot continue without consent. Restart if you change your mind.'
  );

  const input = page.locator('textarea.acw-textarea');
  const inputArea = page.locator('.acw-input-area');
  await expect(inputArea).toBeHidden();
  await expect(input).toBeDisabled();

  const sendButton = page.locator('.acw-send-button');
  await expect(sendButton).toBeDisabled();
  await expect(sendButton).toHaveAttribute(
    'title',
    'The chat is inactive. Restart to begin a new session.'
  );

  await page.getByRole('button', { name: 'Restart' }).click();
  await expect(page.locator('.acw-consent')).toBeVisible();
});
