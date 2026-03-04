# Crypto Price Tracker

Real-time cryptocurrency price tracker built with React, TypeScript, Tailwind CSS and Vite. Displays live market data (ticker, orderbook, trades) via WebSocket against a mock server.

---

## Setup

**Prerequisites:** Node.js 18+

### 1. Install and run the app

```bash
cd crypto-price-tracker
npm install
npm run dev
```

App runs at **http://localhost:5173**.

### 2. Run the WebSocket server (required)

In a **separate terminal**:

```bash
cd socket-custom-load
npm install
node index.js
```

- WebSocket: `ws://localhost:8080`
- HTTP API (frequency config): `http://localhost:3000`

Without the server, the app will show "Disconnected"; once it’s running, data streams automatically.

**One-liner from repo root (two processes):**

```bash
# Terminal 1
cd socket-custom-load && npm install && node index.js

# Terminal 2
cd crypto-price-tracker && npm install && npm start
```

---

## Approach

- **Single WebSocket service** – One connection, shared by all views. Subscriptions are managed per screen (list view → ticker for all symbols; detail view → ticker + orderbook + trades for the selected symbol). Subscribe on mount, unsubscribe on unmount to avoid leaks.
- **Batched updates** – High-frequency messages are queued in refs and flushed on `requestAnimationFrame` plus a short timeout fallback (~16 ms) so the UI stays responsive and doesn’t drop updates when RAF is throttled (e.g. background tab). Snapshots of pending data are taken before clearing refs to avoid races.
- **Stable subscription inputs** – Symbol lists passed into hooks (e.g. `useTicker`) are stable (module-level or memoized) so effects don’t re-run every render and cause subscribe/unsubscribe churn.
- **Aligned update rates** – Frequency control (Normal / Fast / Extreme) sends one config to the server; all channels (ticker, orderbook, trades) use the same interval per mode so list and detail views feel consistent.
- **Responsive UI** – List view uses a table on desktop and a card layout on small screens; detail view stacks orderbook and trades on narrow viewports. Performance monitor and frequency controls adapt to screen size.

---

## If I had more time

- Virtualize long trade/orderbook lists (e.g. `react-window`) for 1000+ rows.
- Web Worker for heavy processing (e.g. orderbook aggregation) so the main thread stays smooth.
- Price alerts (e.g. “notify when BTC > 65k”) with optional sound or browser notifications.
- Keyboard shortcuts (e.g. Esc to go back, arrow keys in list).
- Clearer loading skeletons and error states when the server is down or reconnecting.
- Show “last updated timestamp” under ticker or in the list row, using the latest message timestamp and a simple relative-time update (e.g. every 10s or on new data).
- Click column header (e.g. Last price, 24h change, Volume) to sort ascending/descending; persist sort in component state.
