# Shared Shopping List PWA

A real-time shared shopping list for two people, built as a Progressive Web App. Installs to the home screen and runs fullscreen like a native app — no app store, no browser chrome.

## What it does

- **Shared, synced list** — both phones read and write the same list. Devices poll the server every few seconds and refresh whenever the app returns to the foreground, so an item added on one phone shows up on the other within moments.
- **Simple flow** — add items, tag who added them, tap to check off what's in the cart, and clear purchased items in one tap.
- **Installable** — a web app manifest (`display: standalone`) plus a service worker make it installable on Android and iOS, with its own icon and splash treatment.
- **Offline-friendly** — static assets are cached by the service worker, so the app shell opens even without a connection; API calls always go to the network to keep the list fresh.
- **RTL Hebrew UI** — designed mobile-first with large touch targets.

## Architecture

```
shopping-list-pwa/
├── server.js                  # Express server + REST API, persists to MongoDB
├── package.json
└── public/
    ├── index.html             # The app: vanilla JS, all PWA meta tags
    ├── manifest.webmanifest   # App identity: name, icons, standalone display
    ├── sw.js                  # Service worker: cache-first static, network-only API
    └── icons/                 # 192px / 512px app icons
```

**Backend** — a minimal Express server exposing two endpoints: `GET /api/list` and `PUT /api/list`. The entire list is stored as a single MongoDB document (last-write-wins), which keeps sync logic trivial for a two-user app. An optional `LIST_TOKEN` environment variable enables a shared-secret header check on the API.

**Frontend** — a single dependency-free HTML file. State lives in memory and is reconciled against the server by polling (`setInterval`) and on `visibilitychange`. The "who am I" preference is stored in `localStorage` per device.

**Sync model** — deliberately simple: the client always sends the full list, the server always returns the full list. No diffing, no conflict resolution beyond last-write-wins. For two users editing a grocery list, that trade-off buys a lot of simplicity.

## Configuration

| Variable      | Default                     | Purpose                                  |
|---------------|-----------------------------|------------------------------------------|
| `MONGODB_URI` | `mongodb://localhost:27017` | MongoDB connection string                |
| `PORT`        | `3000`                      | HTTP port                                |
| `LIST_TOKEN`  | *(unset)*                   | Optional shared secret for the API       |

## Stack

Node.js · Express · MongoDB · Vanilla JS · Service Worker · Web App Manifest
