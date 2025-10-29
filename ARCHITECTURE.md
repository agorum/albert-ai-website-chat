# ALBERT \| AI Chat Widget – Architecture Guide

This document explains how the ALBERT \| AI chat widget is structured after refactoring the original monolithic 4,200-line script into a modular codebase. Use it as a map when you need to extend or debug the widget.

## Overview

- **Framework/Runtime:** Vanilla TypeScript compiled with `tsup`, rendered inside a Shadow DOM
- **Distribution:** ESM bundle (`dist/index.js`) and IIFE/global bundle (`dist/index.global.js`)
- **State:** Managed via lightweight classes (`MessageManager`, widget state fields)
- **Styling:** Generated CSS string injected into the Shadow DOM (`styles/builder.ts`)
- **Mock Data:** Built-in simulated responses, ready to be replaced by REST endpoints

## Directory Structure

```
src/
├─ index.ts               # Main entry point, ChatWidget orchestration
├─ types/                 # TypeScript type definitions
│  └─ index.ts            # All interfaces, types, enums
├─ utils/                 # Shared utility functions
│  ├─ index.ts            # Barrel exporting every util
│  ├─ html-utils.ts       # HTML escaping and sanitizing
│  ├─ format-utils.ts     # Time formatting and parsing helpers
│  ├─ general-utils.ts    # Deep merge, clamping, miscellaneous helpers
│  └─ dom-utils.ts        # DOM helpers for icon creation, etc.
├─ config/
│  └─ default-options.ts  # Default widget configuration
├─ renderer/
│  └─ markdown.ts         # Markdown → HTML rendering
├─ styles/
│  └─ builder.ts          # CSS generation and theme variables
├─ services/
│  └─ chat-service.ts     # REST communication layer (currently mock friendly)
├─ managers/
│  └─ message-manager.ts  # Message bookkeeping and lookup helpers
└─ ui/
   └─ builders.ts         # Functions that create DOM fragments
```

## Modules in Detail

### `index.ts` – ChatWidget Orchestration

- Handles widget life cycle (`mount`, `open`, `close`, `destroy`)
- Applies themes, renders initial state, and sets up event listeners
- Coordinates the message list via `MessageManager`
- Talks to `ChatService` for mock or real responses
- Manages timers (teaser bubble, resize observers) and accessibility attributes

### `types/index.ts`

- Central definition of every public interface (`ChatWidgetOptions`, `ChatMessage`, `ChatWidgetTheme`, etc.)
- Allows consumers to import `DeepPartial<ChatWidgetOptions>` for safe overrides

### `config/default-options.ts`

- Provides a complete default configuration object
- Values are deeply merged with user-supplied options inside `ChatWidget`
- If you add new configuration properties, update this file and the type definitions together

### `utils/`

- `general-utils.ts`: Deep merge, clamping, endpoint normalization
- `format-utils.ts`: Time formatting helpers with graceful fallback if `Intl` fails
- `html-utils.ts`: Escaping and sanitizing helpers for plain text rendering
- `dom-utils.ts`: Helpers to build icon elements (emoji, SVG, image)
- `index.ts`: Barrel export for convenience (`import { deepMerge } from '../utils'`)

### `styles/builder.ts`

- Generates a single CSS string with all widget styles
- Uses CSS custom properties (theme variables) for dynamic updates
- Includes responsive rules to switch to full-screen mode on small devices

### `ui/builders.ts`

- Small pure functions that create DOM structures
- `createHeader`, `createInputArea`, `createFooterLinks`, `createMessageElement`, etc.
- Keeps the main widget class free from manual DOM manipulation boilerplate

### `managers/message-manager.ts`

- Stores chat history inside the widget
- Provides lookup and mutation helpers used by `ChatWidget`
- Responsible for indexing tool-call placeholders and caching tool text

### `services/chat-service.ts`

- Encapsulates all HTTP calls to the backend
- Stores and retrieves chat IDs using `localStorage`
- Polls the backend for new messages (mock-friendly; real endpoints can be plugged in)
- Handles request throttling, error logging, and abort signals

### `renderer/markdown.ts`

- Converts Markdown content to HTML for agent messages
- Sanitizes output before injecting into the DOM

## Data Flow

1. **Initialization**: `AlbertChat.init()` creates a `ChatWidget`.
2. **Mounting**: `ChatWidget.mount()` attaches the widget, injects CSS, renders initial elements.
3. **User Interaction**:
   - Typing triggers textarea auto-sizing (`utils/adjustTextareaHeight`).
   - Sending a message pushes the message into `MessageManager` and `ChatService`.
4. **Service Polling**: `ChatService` polls for updates; responses are fed back into `ChatWidget`.
5. **Rendering**:
   - New messages go through `createMessageElement`.
   - Tool calls leverage `toolCallTextCache` to keep text visible across polls.
6. **Teardown**: `destroy()` removes listeners, stops timers, and detaches the host.

## Extensibility Tips

- **Adding new UI controls**: create DOM builders in `ui/builders.ts`, wire them up in `ChatWidget`.
- **New configuration options**: update the type (`types/index.ts`), defaults (`config/default-options.ts`), and wherever the option is read.
- **Styling tweaks**: adjust theme variables or tweak the CSS template in `styles/builder.ts`.
- **Backend integration**: replace mock responses by pointing `serviceConfig.endpoint` to a real API, extend `chat-service.ts`, and set `serviceConfig.title` when you want to forward a human-readable session name with `/init`.
- **Testing**: The `examples/` folder contains demo pages that are useful for manual verification. Automated tests live under `playwright/` (if configured).

## Naming Conventions

- `ALBERT | AI` is the brand name shown in user-facing copy.
- Classes and helpers keep the `AlbertChat` prefix for backward compatibility in code.
- Files use kebab-case; exported symbols use PascalCase for classes and camelCase for functions.

## Build & Development

- `npm run build`: Bundles the widget using `tsup`.
- `npm run dev`: Starts the local demo server (see `scripts/dev-server.mjs`).
- `npm test`: Runs Playwright tests (optional).

## Troubleshooting Checklist

- **Widget does not mount**: Ensure `AlbertChat.init` is called after DOMContentLoaded.
- **Styles missing**: Verify the host element is attached and CSS variables are generated.
- **Messages disappear**: Check `MessageManager` and the tool call cache; run the tool-call demos in `examples/`.
- **Consent flow stuck**: Make sure `requirePrivacyConsent` matches the intended logic and the service stores chat IDs correctly.

---

Feel free to update this guide whenever new modules or patterns are introduced. Keeping architectural documentation current makes it far easier for future contributors to navigate the project.
