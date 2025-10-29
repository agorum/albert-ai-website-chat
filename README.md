# ALBERT \| AI Chat Widget

A configurable chat widget that can be embedded into any website with a single script tag. This chat component is designed to work hand in hand with ALBERT \| AI so you can bring an AI-driven service to your own site ”ranging from classic conversations to sophisticated agentic workflows that leverage tool calls and MCP integrations for sales, customer support, order tracking, and more. Further information about the ALBERT \| AI ecosystem is available at https://www.agorum.com/albert-ki-universum.

The project is written in TypeScript, renders inside a Shadow DOM, and currently ships with mock responses so it can run without a backend. A REST integration can be added later.

## Features

- Launcher button in the lower-right corner that opens or closes the chat window
- Optional teaser bubble that appears after a configurable delay if the chat has not been opened yet
- Fully themable (colors, typography, copy, icons, dimensions, footer links) with per-element color controls for header, teaser, launcher, messages, inputs, and consent states
- Responsive chat window with header, reload action, and close action
- Scrollable transcript with clearly separated user and agent bubbles
- Input area with auto-resizing textarea (up to 5 lines), Enter-to-send, and a send button
- Simulated agent with typing indicator and streamed responses using randomized delays
- Optional privacy consent flow before the first message is sent
- Remembers its open/closed state across page navigation for a seamless user experience
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
    <title>ALBERT | AI Chat Widget â€“ Example</title>
    <script defer src="./dist/index.global.js"></script>
    <script>
      window.addEventListener('DOMContentLoaded', () => {
        const serviceEndpoint = 'http://localhost:8010';

        AlbertChat.init({
          target: document.body,
          serviceConfig: {
            endpoint: serviceEndpoint,
            preset: 'albert',
            title: 'ALBERT Support Session',
            pollIntervalMs: 500,
            storageKey: 'albert-chat-session-id',
          },
          theme: {
            // Typography and card styling
            fontFamily: "'New Science', 'Tahoma', 'Arial', sans-serif",
            chatBorderColor: '#cecece',
            chatShadowColor: 'rgba(0, 107, 255, 0.25)',

            // Header appearance
            headerBackgroundColor: '#EB4D27',
            headerTitleColor: '#FFFFFF',
            headerSubtitleColor: 'rgba(255, 255, 255, 0.85)',
            headerIconColor: '#FFFFFF',
            headerActionIconColor: '#FFFFFF',
            headerActionHoverBackgroundColor: 'rgba(255, 255, 255, 0.15)',
            headerActionFocusOutlineColor: '#FFFFFF',

            // Transcript bubbles
            userMessageBackgroundColor: '#006bff',
            userMessageTextColor: '#ffffff',
            agentMessageBackgroundColor: '#f0f0f0',
            agentMessageTextColor: '#3b3b3b',

            // Input field
            inputBorderColor: '#c0c0c0',
            inputFocusBorderColor: '#006bff',
            inputFocusShadowColor: 'transparent',
            inputDividerColor: '#cecece',

            // Send button
            sendButtonBackgroundColor: '#CECECE',
            sendButtonTextColor: '#3B3B3B',
            sendButtonHoverShadowColor: 'rgba(0, 107, 255, 0.25)',
            sendButtonFocusOutlineColor: '#006bff',

            // Launcher & teaser
            launcherBackgroundColor: '#EB4D27',
            launcherTextColor: '#ffffff',
            launcherShadowColor: 'rgba(0, 107, 255, 0.25)',
            launcherHoverShadowColor: 'rgba(0, 107, 255, 0.35)',
            launcherFocusOutlineColor: '#EB4D27',
            teaserBackgroundColor: '#EB4D27',
            teaserTextColor: '#ffffff',
            teaserBorderColor: '#EB4D27',
            teaserShadowColor: 'rgba(0, 107, 255, 0.2)',

            // Footer area
            footerBackgroundColor: '#EB4D27',
            footerLinkColor: '#FFFFFF',
            footerLinkHoverColor: '#ffd7cc',

            // Consent buttons
            consentAcceptBackgroundColor: '#006bff',
            consentAcceptTextColor: '#ffffff',
            consentAcceptHoverShadowColor: 'rgba(0, 107, 255, 0.25)',
            consentAcceptFocusOutlineColor: '#ffffff',
            consentDeclineTextColor: '#000000',
            consentDeclineBackgroundColor: 'rgba(255, 255, 255, 0.05)',
            consentDeclineBorderColor: 'rgba(255, 255, 255, 0.6)',
            consentDeclineHoverBackgroundColor: 'rgba(255, 255, 255, 0.12)',
            consentDeclineHoverShadowColor: 'rgba(0, 0, 0, 0.12)',
            consentDeclineFocusOutlineColor: '#ffffff',

            // Decorative toggles
            showChatBorder: false,
            showHeaderBorder: false,
            showInputBorder: true,
            showFooterBorder: false,
            showTeaserBorder: false,
            showInputDivider: true,
            showScrollbar: false,
          },
          texts: {
            launcherLabel: 'Ask ALBERT | AI',
            launcherAriaLabel: 'Open the ALBERT | AI chat',
            teaserText: 'Need a hand? ALBERT | AI is ready.',
            headerTitle: 'ALBERT | AI Assistant',
            headerSubtitle: 'We are happy to support you',
            sendButtonLabel: 'Send',
            closeLabel: 'Close window',
            reloadLabel: 'Restart',
            initialMessage: 'Hello! Great to see you. What can ALBERT | AI explain today?',
            inputPlaceholder: 'Type your message here...',
            consentPrompt:
              'Before we start, please read our **privacy notice** and confirm your consent.',
            consentAcceptLabel: 'Accept',
            consentDeclineLabel: 'Decline',
            consentDeclinedMessage:
              'Without consent the chat cannot continue. Restart if you change your mind.',
            sendWhileStreamingTooltip: 'Please wait until the current response has finished.',
            sendWhileConsentPendingTooltip:
              'You can only send messages after accepting the privacy notice.',
            sendWhileTerminatedTooltip:
              'The chat is inactive. Restart to begin a new conversation.',
            toolCallPlaceholder: 'Give me a moment while I look that up...',
          },
          icons: {
            headerIcon: './assets/agorum-logo.svg',
            closeIcon: '\u2715',
            reloadIcon: '\u21bb',
            launcherIcon: '\u{1f4ac}',
            sendIcon: '\u27a4',
          },
          footerLinks: [
            { label: 'Privacy', href: 'https://example.com/privacy', target: '_blank' },
            { label: 'Imprint', href: 'https://example.com/imprint', target: '_blank' },
          ],
          dimensions: {
            widthPercent: 33,
            minWidthPx: 500,
            maxWidthPx: 720,
            heightPercent: 70,
            minHeightPx: 420,
          },
          events: {
            onReady: () => console.log('[docs] Chat ready'),
            onOpen: () => console.log('[docs] Chat opened'),
            onClose: () => console.log('[docs] Chat closed'),
          },
          teaserDelayMs: 3500,
          mockResponses: [
            'Thanks for your question! I am reviewing everything so I do not miss any detail.',
            'Here is a structured answer:\n\n1. Describe the current status\n2. List the relevant steps\n3. Mention alternatives worth considering\n4. Close with a short recommendation\n\nNeed more depth on any point? Just let me know.',
            'I also gathered a few extra tips:\n\n- Double-check your admin configuration.\n- Compare the latest log files for anomalies.\n- Document the next actions so your team stays aligned.\n\nAnything else ALBERT | AI can do for you?',
          ],
          mockResponseDelayMs: [900, 1800],
          zIndex: 12000,
          locale: 'de-DE',
          requirePrivacyConsent: true,
          welcomeMessage: {
            enabled: true,
            text: 'Hello! ALBERT | AI is on standby. How can we assist you today?',
            className: 'acw-welcome-highlight',
            styles: {
              color: '#000000',
              fontWeight: '600',
            },
          },
          disclaimer: {
            enabled: true,
            text: 'Note: ALBERT | AI may be incorrect. Please verify important information.',
            className: 'acw-disclaimer-note',
            styles: {
              fontSize: '0.78rem',
              color: '#3b3b3b',
              marginTop: '12px',
            },
          },
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

The optional `serviceConfig.title` lets you provide a human-readable session label that is forwarded
to the `/init` endpoint together with the preset information.

Set `texts.inputPlaceholder` if you want to change the message input placeholder (default: `Your message ...`).

Limit desktop layouts with `dimensions.maxWidthPx` while mobile viewports continue to open fullscreen.

Hook into lifecycle changes with events.onReady, events.onOpen, and events.onClose.\n\nAdjust idle and hover states via the new theme colors for the launcher, send, and consent buttons. Switch the launcher caption while open with 	exts.launcherOpenLabel.

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
    title: 'ALBERT Onboarding',
  },
  welcomeMessage: {
    enabled: true,
    text: 'Welcome back! ALBERT | AI is ready to help. ðŸ¤–',
  },
  disclaimer: {
    enabled: true,
    text: 'Note: Responses are generated automatically. Please double-check anything critical.',
  },
});
```

`serviceConfig.title` in this example labels the session so that your backend can show friendlier names in dashboards or logs.

## Configuration Overview

```ts
interface ChatWidgetOptions {
  target?: HTMLElement | string; // default: document.body
  theme: {
    fontFamily: string;
    bodyTextColor: string;
    chatBackgroundColor: string;
    chatBorderColor: string;
    chatShadowColor: string;

    headerBackgroundColor: string;
    headerBorderColor: string;
    headerTitleColor: string;
    headerSubtitleColor: string;
    headerIconColor: string;
    headerActionIconColor: string;
    headerActionHoverBackgroundColor: string;
    headerActionFocusOutlineColor: string;

    bodyBackgroundColor: string;
    emptyStateTextColor: string;
    toolPlaceholderTextColor: string;
    timestampColor: string;
    messageCodeBackgroundColor: string;
    messageCodeTextColor: string;
    messageDividerColor: string;
    messageLinkColor: string;
    failedMessageBackgroundColor: string;
    failedMessageBorderColor: string;
    failedMessageTimestampColor: string;
    userMessageBackgroundColor: string;
    userMessageTextColor: string;
    agentMessageBackgroundColor: string;
    agentMessageTextColor: string;

    scrollbarThumbColor: string;
    scrollbarThumbHoverColor: string;

    inputBackgroundColor: string;
    inputTextColor: string;
    inputPlaceholderColor: string;
    inputBorderColor: string;
    inputFocusBorderColor: string;
    inputFocusShadowColor: string;
    inputDividerColor: string;

    sendButtonBackgroundColor: string;
    sendButtonTextColor: string;
    sendButtonShadowColor: string;
    sendButtonHoverBackgroundColor: string;
    sendButtonHoverTextColor: string;
    sendButtonHoverShadowColor: string;
    sendButtonFocusOutlineColor: string;

    launcherBackgroundColor: string;
    launcherTextColor: string;
    launcherShadowColor: string;
    launcherHoverShadowColor: string;
    launcherHoverBackgroundColor: string;
    launcherHoverTextColor: string;
    launcherFocusOutlineColor: string;

    teaserBackgroundColor: string;
    teaserTextColor: string;
    teaserBorderColor: string;
    teaserShadowColor: string;

    footerBackgroundColor: string;
    footerLinkColor: string;
    footerLinkHoverColor: string;

    consentAcceptBackgroundColor: string;
    consentAcceptTextColor: string;
    consentAcceptShadowColor: string;
    consentAcceptHoverBackgroundColor: string;
    consentAcceptHoverTextColor: string;
    consentAcceptHoverShadowColor: string;
    consentAcceptFocusOutlineColor: string;
    consentDeclineTextColor: string;
    consentDeclineBackgroundColor: string;
    consentDeclineBorderColor: string;
    consentDeclineShadowColor: string;
    consentDeclineHoverBackgroundColor: string;
    consentDeclineHoverTextColor: string;
    consentDeclineHoverShadowColor: string;
    consentDeclineFocusOutlineColor: string;

      disclaimerTextColor: string;
      showChatBorder: boolean;
      showHeaderBorder: boolean;
      showInputBorder: boolean;
      showFooterBorder: boolean;
      showTeaserBorder: boolean;
      showInputDivider: boolean;
      showScrollbar: boolean;
  };
  texts: {
    launcherLabel: string;
    launcherOpenLabel: string;
    launcherAriaLabel: string;
    launcherOpenAriaLabel: string;
    teaserText: string;
    headerTitle: string;
    headerSubtitle: string;
    inputPlaceholder: string;
    sendButtonLabel: string;
    closeLabel: string;
    reloadLabel: string;
    initialMessage: string;
    consentPrompt: string; // supports Markdown
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
    title?: string;
    pollIntervalMs?: number;
    storageKey?: string;
  };
  events?: {
    onReady?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
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
    maxWidthPx?: number;
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

## Connecting to ALBERT \| AI on agorum core

When you are ready to connect the widget to your ALBERT \| AI backend (for example on agorum core or the ALBERT \| AI Operating System), follow these steps:

1. Create an ALBERT \| AI preset that defines the allowed tools, context windows, and any other settings you need for the website chat experience.
2. Assign this preset to the agorum core group that should be allowed to use it.
3. Provision a dedicated agorum core service user and add them to the group that grants access to the preset and associated tools.
4. Generate a JWT for the service user. This token will be injected into your proxy configuration to authenticate requests from the website.
5. Deploy an nginx reverse proxy on a server that can reach the ALBERT \| AI backend (this can be the same server that hosts your website). The proxy terminates TLS, forwards chat traffic to agorum core, and adds the JWT as a Bearer token.

Below is an example nginx configuration that secures the chat endpoint and forwards requests to the ALBERT \| AI chat service:

```nginx
# Define rate limiting zone for the Albert AI chat initialization endpoint.
# This prevents excessive requests from a single client IP and helps protect against abuse (DoS attacks).
limit_req_zone $binary_remote_addr zone=albert_init_limit:10m rate=10r/m;

# Map HTTP Origin headers to a flag indicating if the origin is allowed or not.
# Used for CORS (Cross-Origin Resource Sharing) validation to restrict browser-based access.
map $http_origin $invalid_origin {
    "" 0;                                       # No Origin header – treat as valid (assume non-browser client)
    "https://www.yourwebsite.com" 0;            # Only allow requests from this website
    default 1;                                  # All other origins are considered invalid
}

server {
	listen 443 ssl http2; # Enable HTTPS with HTTP/2 support for better performance

	# Include external configuration for the chat Bearer token (used for authentication/authorization).
	include /etc/nginx/snippets/chat-token.conf;

	# Endpoint for Albert AI chat session initialization
	location /albert/chat/init {
		# Apply rate limiting:
		# - Allow up to 10 quick requests per user
		# - If the limit is exceeded, further requests are rejected with HTTP 429 (Too Many Requests)
		# - After the burst is used, new requests are allowed at 10 requests per minute
		limit_req zone=albert_init_limit burst=10 nodelay;
		limit_req_status 429;

		# Restrict access based on the Origin header (CORS): block any request with an invalid origin
		if ($invalid_origin = 1) {
			return 403; # Forbidden – CORS policy violation
		}

		# Enforce access only through the specified domain for additional security (virtual hosting)
		if ($host != "www.agorum.com") { return 403; }

		# Forward incoming requests to the upstream Albert AI server
		proxy_pass https://your-albert-ai-server/api/rest/custom/agorum.ai.service.chat/init;

		# Set incoming request headers expected by the backend service
		proxy_set_header Host d4w.agorum.com;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;

		# Attach dynamic Bearer token for downstream authentication (defined in included snippet)
		proxy_set_header Authorization $chat_bearer_token;

		# Set strict CORS headers on all responses to allow only specific browser origins and HTTP methods
		add_header Access-Control-Allow-Origin "https://www.yourwebsite.com" always;
		add_header Access-Control-Allow-Headers "Authorization,Content-Type" always;
		add_header Access-Control-Allow-Methods "GET,POST,PUT,DELETE,OPTIONS" always;

		# Handle browser CORS preflight requests (OPTIONS method)
		if ($request_method = OPTIONS) {
			add_header Content-Length 0;
			add_header Content-Type text/plain;
			return 204; # Success – no content
		}
	}

	# Endpoint for general Albert AI chat API calls (not limited to initialization)
	location /albert/chat/ {
		# Restrict access based on the Origin header (CORS): block requests with invalid origins
		if ($invalid_origin = 1) {
			return 403;
		}

		# Enforce that the requests originate from the specified host
		if ($host != "www.agorum.com") { return 403; }

		# Forward incoming requests to the upstream Albert AI backend
		proxy_pass https://your-albert-ai-server/api/rest/custom/agorum.ai.service.chat/;

		# Set upstream headers for user identification and protocol information
		proxy_set_header Host d4w.agorum.com;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;

		# Attach chat Bearer token for backend authorization
		proxy_set_header Authorization $chat_bearer_token;

		# Apply strict CORS headers as above
		add_header Access-Control-Allow-Origin "https://www.yourwebsite.com" always;
		add_header Access-Control-Allow-Headers "Authorization,Content-Type" always;
		add_header Access-Control-Allow-Methods "GET,POST,PUT,DELETE,OPTIONS" always;

		# Respond properly to browser CORS preflight requests
		if ($request_method = OPTIONS) {
			add_header Content-Length 0;
			add_header Content-Type text/plain;
			return 204;
		}
	}
}
```

chat-token.conf

```nginx
set $chat_bearer_token "Bearer YOUR_TOKEN";
```

- `include /etc/nginx/snippets/chat-token.conf;` loads a snippet that defines the `$chat_bearer_token` variable with the JWT you generated in step 4.
- The `if` directives reject traffic from other origins or hosts, making sure only your site can open the chat endpoint.
- The `proxy_pass` forwards requests to the ALBERT \| AI chat REST service and keeps the client IP information intact through the `X-Real-IP` and `X-Forwarded-*` headers.
- The `Authorization` header injects the Bearer token of the agorum core service user so that ALBERT \| AI accepts the request.
- The optional CORS headers restrict browser access to your trusted origin and only allow the required headers and methods. The `OPTIONS` branch returns a 204 for preflight requests, so browsers can complete their CORS checks.

Once the proxy is live, point the widget's `serviceConfig.endpoint` to the public `/albert/chat/` location on your nginx host. The widget will forward all chat requests through the secure proxy to ALBERT | AI. Optionally, use `serviceConfig.title` to tag sessions with a descriptive name that you can log or display on the backend.

## Local Test Server

```bash
npm run build
./start.sh
```

The demo becomes available at `http://localhost:8080/index.html`. You can pass a different directory to the script, for example `./start.sh public`.








