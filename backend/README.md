# Backend (Node.js)

Express server that proxies CoinGecko API. All crypto data (timeseries, market data) goes through this backend when the frontend is configured with `VITE_API_URL`.

## Run

```bash
# From repo root
cd backend
npm install
npm run ts     # type-check only (no emit)
npm run dev    # dev with tsx watch (port 3001)
# or
npm run build && npm start
```

## API

- `GET /api/coins/:coinId/market-chart/range?from=YYYY-MM-DD&to=YYYY-MM-DD` — price timeseries for one coin
- `GET /api/coins/:coinId` — market data (price, cap, volume, 24h change) for KPIs
- `GET /api/multi-timeseries?from=YYYY-MM-DD&to=YYYY-MM-DD` — BTC, ETH, SOL timeseries in one response

## Frontend

Set `VITE_API_URL=http://localhost:3001` in `.env` (or `.env.local`) so the app uses this backend instead of calling CoinGecko directly.
