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

  // Teaser sollte nach der konfigurierten Zeit erscheinen
  await expect(page.locator('.acw-teaser')).toBeVisible({ timeout: 6000 });

  expect(consoleErrors, 'Konsolenfehler gefunden').toEqual([]);
  expect(pageErrors, 'Seitenfehler gefunden').toEqual([]);
});
