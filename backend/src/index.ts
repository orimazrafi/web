import express from "express";
import cors from "cors";
import {
  fetchTimeseriesByCoin,
  fetchCoinMarketData,
} from "./coingecko.js";

const ANALYTICS_COINS = ["bitcoin", "ethereum", "solana"] as const;
const PORT = Number(process.env.PORT) || 3001;

const app = express();
app.use(cors());
app.use(express.json());

/** Request logging: method, path, status, duration */
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

/** GET /api/coins/:coinId/market-chart/range?from=YYYY-MM-DD&to=YYYY-MM-DD */
app.get("/api/coins/:coinId/market-chart/range", async (req, res) => {
  const { coinId } = req.params;
  const from = req.query.from as string;
  const to = req.query.to as string;
  if (!from || !to) {
    console.log("[market-chart] missing from/to");
    res.status(400).json({ error: "Query params 'from' and 'to' (YYYY-MM-DD) required" });
    return;
  }
  console.log(`[market-chart] coinId=${coinId} from=${from} to=${to}`);
  try {
    const data = await fetchTimeseriesByCoin(coinId, from, to);
    console.log(`[market-chart] ${coinId} -> ${data.length} points`);
    res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`[market-chart] ${coinId} error: ${message}`);
    if (message === "RATE_LIMIT_429") {
      res.status(429).json({ error: "Rate limit exceeded — try again later" });
      return;
    }
    res.status(502).json({ error: message });
  }
});

/** GET /api/coins/:coinId — market data for KPIs */
app.get("/api/coins/:coinId", async (req, res) => {
  const { coinId } = req.params;
  console.log(`[coin] coinId=${coinId}`);
  try {
    const data = await fetchCoinMarketData(coinId);
    console.log(`[coin] ${coinId} -> price=$${data.current_price_usd} cap=$${data.market_cap_usd}`);
    res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`[coin] ${coinId} error: ${message}`);
    if (message === "RATE_LIMIT_429") {
      res.status(429).json({ error: "Rate limit exceeded — try again later" });
      return;
    }
    res.status(502).json({ error: message });
  }
});

/** GET /api/multi-timeseries?from=YYYY-MM-DD&to=YYYY-MM-DD — BTC, ETH, SOL in one call */
app.get("/api/multi-timeseries", async (req, res) => {
  const from = req.query.from as string;
  const to = req.query.to as string;
  if (!from || !to) {
    console.log("[multi-timeseries] missing from/to");
    res.status(400).json({ error: "Query params 'from' and 'to' (YYYY-MM-DD) required" });
    return;
  }
  console.log(`[multi-timeseries] from=${from} to=${to} (fetching BTC, ETH, SOL)`);
  try {
    const entries = await Promise.all(
      ANALYTICS_COINS.map(async (coinId) => {
        const series = await fetchTimeseriesByCoin(coinId, from, to);
        return [coinId, series] as const;
      })
    );
    const out = Object.fromEntries(entries);
    const counts = ANALYTICS_COINS.map((c) => `${c}=${(out[c] ?? []).length}`).join(" ");
    console.log(`[multi-timeseries] -> ${counts}`);
    res.json(out);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`[multi-timeseries] error: ${message}`);
    if (message === "RATE_LIMIT_429") {
      res.status(429).json({ error: "Rate limit exceeded — try again later" });
      return;
    }
    res.status(502).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`[server] Backend running at http://localhost:${PORT}`);
  console.log("[server] Endpoints: GET /api/coins/:id, GET /api/coins/:id/market-chart/range?from=&to=, GET /api/multi-timeseries?from=&to=");
});
