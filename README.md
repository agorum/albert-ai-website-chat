# Albert Chat Widget

Eine konfigurierbare Chat-Widget-Lösung, die sich per Script-Tag in beliebige Webseiten einbinden lässt. Die Anwendung setzt auf moderne Browser-Technologien (Shadow DOM, TypeScript, Bundling via tsup) und arbeitet aktuell mit Mockup-Daten. Eine REST-Anbindung kann später ergänzt werden.

## Features

- Launcher-Button unten rechts, der das Chatfenster öffnet/schließt
- Hinweis-Sprechblase nach einstellbarer Zeit, solange der Chat noch nicht geöffnet wurde
- Konfigurierbare Farben, Schriftart, Texte, Icons, Abmessungen und Footer-Links
- Responsive Chat-Oberfläche oberhalb des Launchers mit Header, Reload- und Schließen-Icon
- Scrollbarer Nachrichtenbereich mit voneinander unterscheidbaren Nutzer-/Agent-Bubbles
- Eingabebereich mit automatischer Größenanpassung (max. 5 Zeilen), Enter zum Senden, Button daneben
- Simulierter Agent mit Tipp-Indikator und gestreamten Antworten nach zufälligen Verzögerungen
- Optionale Datenschutzabfrage vor dem ersten Nachrichtenaustausch (abschaltbar und frei konfigurierbar)
- Typdefinitionen und ESM/IIFE-Bundles für einfache Integration in Build- oder klassische Umgebungen

## Installation

```bash
npm install
npm run build
npm test          # optional: End-to-End-Test mit Playwright
```

`dist/index.js` enthält das ESM-Bundle, `dist/index.global.js` das IIFE-Bundle für direkte Nutzung über ein Script-Tag.

## Einbindung per Script-Tag

```html
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <title>Albert Chat Widget – Beispiel</title>
    <script defer src="./dist/index.global.js"></script>
    <script>
      window.addEventListener('DOMContentLoaded', () => {
        const serviceEndpoint =
          window.location.hostname === 'localhost'
            ? 'http://localhost:8010'
            : 'https://www.agorum.com/albert/chat';

        AlbertChat.init({
          texts: {
            headerTitle: 'Albert Demo',
            headerSubtitle: 'Stellen Sie Ihre Fragen',
            teaserText: 'Fragen Sie uns – wir helfen gerne!',
          },
          serviceConfig: {
            endpoint: serviceEndpoint,
            preset: 'albert',
          },
          welcomeMessage: {
            enabled: true,
            text: 'Hallo! Wie kann ich Ihnen helfen? ✨',
          },
          disclaimer: {
            enabled: true,
            text: 'Hinweis: Albert kann Fehler machen – bitte überprüfen Sie wichtige Aussagen.',
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
            { label: 'Datenschutz', href: '/datenschutz', target: '_blank' },
            { label: 'Impressum', href: '/impressum', target: '_blank' }
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
      <h1>Ihre Website</h1>
      <p>Integrieren Sie den Albert Chat überall dort, wo er gebraucht wird.</p>
    </main>
  </body>
</html>
```

## Verwendung in Bundlern (ESM)

```ts
import { init } from 'albert-chat-widget';

const endpoint =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8010'
    : 'https://www.agorum.com/albert/chat';

init({
  texts: {
    launcherLabel: 'Frag Albert',
  },
  serviceConfig: {
    endpoint,
    preset: 'albert',
  },
  welcomeMessage: {
    enabled: true,
    text: 'Willkommen zurück! Ich bin bereit. 🤖',
  },
  disclaimer: {
    enabled: true,
    text: 'Hinweis: Antworten werden automatisch generiert.',
  },
});
```

## Konfigurationsübersicht

```ts
interface ChatWidgetOptions {
  target?: HTMLElement | string; // Standard: document.body
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
    emptyState: string;
    initialMessage: string;
    consentPrompt: string;
    consentAcceptLabel: string;
    consentDeclineLabel: string;
    consentDeclinedMessage: string;
    consentPendingPlaceholder: string;
    consentDeclinedPlaceholder: string;
    sendWhileStreamingTooltip: string;
    sendWhileConsentPendingTooltip: string;
    sendWhileTerminatedTooltip: string;
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

> **Hinweis:** Alle Optionen sind beim Aufruf von `init()` teil-konfigurierbar (Deep Merge mit Defaults).

## Nächste Schritte

- An REST-Endpunkte anbinden (z. B. in `simulateAgentReply` oder via neuem Message-Service)
- State-Management/Queue erweitern, sobald reale Backend-Antworten eingehen
- Optional: Typing-Indikatoren, Offline-State oder Lokalisierung über mehrere Sprachpakete

Viel Erfolg beim Einbinden! Bei Fragen gerne melden.

## Lokaler Testserver

```bash
npm run build
./start.sh
```

Anschließend steht die Demo unter `http://localhost:8080/index.html` bereit. Der Server akzeptiert auch andere Verzeichnisse als Argument (z. B. `./start.sh public`).
