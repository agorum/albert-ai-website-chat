# ALBERT \| AI Chat Widget

A configurable chat widget that can be embedded into any website with a single script tag. The project is written in TypeScript, renders inside a Shadow DOM, and currently ships with mock responses so it can run without a backend. A REST integration can be added later.

## Features

- Launcher button in the lower-right corner that opens or closes the chat window
- Optional teaser bubble that appears after a configurable delay if the chat has not been opened yet
- Fully themable (colors, typography, copy, icons, dimensions, footer links)
- Responsive chat window with header, reload action, and close action
- Scrollable transcript with clearly separated user and agent bubbles
- Input area with auto-resizing textarea (up to 5 lines), Enter-to-send, and a send button
- Simulated agent with typing indicator and streamed responses using randomized delays
- Optional privacy consent flow before the first message is sent
- TypeScript types plus ESM and IIFE bundles for modern build setups or classic script tags

## Installation

```bash
npm install
npm run build
npm test          # optional: end-to-end tests with Playwright
```

The ESM bundle is written to `dist/index.js`, the global/IIFE bundle to `dist/index.global.js`.

## Embedding with a Script Tag

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>ALBERT | AI Chat Widget – Example</title>
    <script defer src="./dist/index.global.js"></script>
    <script>
      window.addEventListener('DOMContentLoaded', () => {
        const serviceEndpoint = 'http://localhost:8010';

        AlbertChat.init({
          texts: {
            headerTitle: 'ALBERT | AI Demo',
            headerSubtitle: 'Ask anything you need',
            teaserText: 'Questions? We are happy to help!',
          },
          serviceConfig: {
            endpoint: serviceEndpoint,
            preset: 'albert',
          },
          welcomeMessage: {
            enabled: true,
            text: 'Hello! How can ALBERT | AI support you today? 🤖',
          },
          disclaimer: {
            enabled: true,
            text: 'Note: ALBERT | AI replies are generated automatically. Please verify important details.',
            styles: {
              fontSize: '0.7rem',
            },
          },
          theme: {
            primaryColor: '#9333ea',
            launcherBackground: '#7c3aed',
            userMessageColor: '#7c3aed',
          },
          footerLinks: [
            { label: 'Privacy', href: '/privacy', target: '_blank' },
            { label: 'Imprint', href: '/imprint', target: '_blank' }
          ],
          dimensions: {
            widthPercent: 35,
            minWidthPx: 320,
            heightPercent: 65,
            minHeightPx: 420,
          },
          teaserDelayMs: 6000,
        });
      });
    </script>
  </head>
  <body>
    <main>
      <h1>Your Website</h1>
      <p>Add the ALBERT | AI chat wherever your visitors need support.</p>
    </main>
  </body>
</html>
```

## Usage with Bundlers (ESM)

```ts
import { init } from 'albert-chat-widget';

const endpoint = 'https://your-proxy-endpoint/albert/chat';

init({
  texts: {
    launcherLabel: 'Ask ALBERT | AI',
  },
  serviceConfig: {
    endpoint,
    preset: 'albert',
  },
  welcomeMessage: {
    enabled: true,
    text: 'Welcome back! ALBERT | AI is ready to help. 🤖',
  },
  disclaimer: {
    enabled: true,
    text: 'Note: Responses are generated automatically. Please double-check anything critical.',
  },
});
```

## Configuration Overview

```ts
interface ChatWidgetOptions {
  target?: HTMLElement | string; // default: document.body
  theme: {
    fontFamily: string;
    primaryColor: string;
    secondaryColor: string;
    surfaceColor: string;
    surfaceAccentColor: string;
    textColor: string;
    userMessageColor: string;
    userTextColor: string;
    agentMessageColor: string;
    agentTextColor: string;
    launcherBackground: string;
    launcherTextColor: string;
    sendButtonBackground: string;
    sendButtonTextColor: string;
    borderColor: string;
    shadowColor: string;
  };
  texts: {
    launcherLabel: string;
    launcherAriaLabel: string;
    teaserText: string;
    headerTitle: string;
    headerSubtitle: string;
    placeholder: string;
    sendButtonLabel: string;
    closeLabel: string;
    reloadLabel: string;
    initialMessage: string;
    consentPrompt: string;
    consentAcceptLabel: string;
    consentDeclineLabel: string;
    consentDeclinedMessage: string;
    sendWhileStreamingTooltip: string;
    sendWhileConsentPendingTooltip: string;
    sendWhileTerminatedTooltip: string;
    toolCallPlaceholder: string;
  };
  icons: {
    headerIcon: string;
    closeIcon: string;
    reloadIcon: string;
    launcherIcon: string;
    sendIcon: string;
  };
  serviceConfig?: {
    endpoint: string;
    preset?: string;
    pollIntervalMs?: number;
    storageKey?: string;
  };
  welcomeMessage?: {
    enabled: boolean;
    text?: string;
    className?: string;
    styles?: Record<string, string>;
  };
  disclaimer?: {
    enabled: boolean;
    text: string;
    className?: string;
    styles?: Record<string, string>;
  };
  footerLinks: Array<{ label: string; href: string; target?: string; rel?: string }>;
  dimensions: {
    widthPercent: number;
    minWidthPx: number;
    heightPercent: number;
    minHeightPx: number;
  };
  teaserDelayMs: number;
  mockResponses: string[];
  mockResponseDelayMs: [number, number];
  zIndex: number;
  locale: string;
  requirePrivacyConsent: boolean;
}
```

> **Note:** The `init()` helper performs a deep merge with the defaults, so you can override only the fields you need.

## Roadmap Ideas

- Connect the widget to real REST endpoints (e.g., replace the mock reply pipeline)
- Extend the state management once live responses are delivered by the backend
- Optional: add richer typing indicators, offline handling, or a full localization layer

## Local Test Server

```bash
npm run build
./start.sh
```

The demo becomes available at `http://localhost:8080/index.html`. You can pass a different directory to the script, for example `./start.sh public`.
