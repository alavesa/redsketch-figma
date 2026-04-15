# RedSketch — Figma Plugin

[![npm version](https://img.shields.io/npm/v/redsketch)](https://www.npmjs.com/package/redsketch)

Threat-model your Figma designs before writing a single line of code — directly inside Figma.

## How it works

1. Select a frame, component, or dialog in Figma
2. Choose the scan scope (Full screen / User flow / Component / Dialog)
3. RedSketch reads the node names, text content, and structure
4. Sends this data to Claude AI for STRIDE threat analysis
5. Results appear in the plugin panel with threats, pattern matches, and compliance gaps

## Setup

1. In Figma: **Plugins** → **Development** → **Import plugin from manifest**
2. Select the `manifest.json` from this repo
3. Run the plugin: **Plugins** → **Development** → **RedSketch**
4. Enter your Anthropic API key in the onboarding screen

### Getting an API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Paste it in the plugin's setup screen

## Data handling & privacy

- **What is sent:** Node names, text content, component names, and hierarchy of the selected frame
- **What is NOT sent:** No images, screenshots, pixel data, or visual renders
- **Where it goes:** Anthropic's Claude API over HTTPS (`api.anthropic.com`)
- **Storage:** Anthropic does not train on API data or store it beyond the request
- **Your API key:** Obfuscated before storing in Figma's local plugin storage. Never logged or shared. You can clear it anytime in Settings
- **No tracking:** No analytics, cookies, or third-party services

## Scan scopes

| Scope | Use when | What it checks |
|-------|----------|----------------|
| **Full screen** | Scanning a complete app screen | Auth, navigation, compliance, missing screens |
| **User flow** | Scanning a multi-step flow (signup, checkout) | Flow integrity, data handling between steps |
| **Component** | Scanning a reusable component (form, card) | Input safety, error states, accessibility |
| **Dialog** | Scanning a modal or confirmation | Action clarity, destructive action design, undo path |

## What it checks

- **STRIDE threats:** Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege
- **36 Security UX patterns** from [uxsec.dev](https://uxsec.dev)
- **19 regulations:** GDPR, EU AI Act, NIS2, DORA, PCI DSS, CCPA, SOC 2, ISO 27001, WCAG 2.2, and more

## Development

```bash
npm install
npm run build        # Build once
npm run watch        # Rebuild on file changes
```

After building, import `manifest.json` in Figma as a development plugin.

## Related

- [RedSketch CLI](https://github.com/alavesa/RedSketch) — CLI version (`npm install -g redsketch`)
- [Security UX Pattern Library](https://uxsec.dev) — 36 interactive patterns
- [uxsec.dev/redsketch](https://uxsec.dev/redsketch) — RedSketch tool page

## License

MIT
