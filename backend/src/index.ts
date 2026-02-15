import express from "express";
import cors from "cors";
import {
  fetchTimeseriesByCoin,
  fetchCoinMarketData,
} from "./coingecko.js";
import { listAlerts, addAlert, type AlertSeverity } from "./alertsStore.js";
import { listAudit, addAudit } from "./auditStore.js";

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

/** GET /api/alerts?message=&from=&to= — list alert log (filter by message, date range) */
app.get("/api/alerts", (req, res) => {
  const message = (req.query.message as string) ?? "";
  const from = (req.query.from as string) ?? "";
  const to = (req.query.to as string) ?? "";
  const data = listAlerts({ message: message || undefined, from: from || undefined, to: to || undefined });
  console.log(`[alerts] list -> ${data.length} entries`);
  res.json(data);
});

/** POST /api/alerts — add alert log entry. Body: { message: string, severity?: "info"|"warn"|"error" } */
app.post("/api/alerts", (req, res) => {
  const { message, severity } = req.body as { message?: string; severity?: AlertSeverity };
  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Body must include non-empty message" });
    return;
  }
  const sev: AlertSeverity = severity === "warn" || severity === "error" ? severity : "info";
  const entry = addAlert(message.trim(), sev);
  console.log(`[alerts] add -> ${entry.id} ${sev}`);
  res.status(201).json(entry);
});

/** GET /api/audit-log?message=&from=&to= — list audit log */
app.get("/api/audit-log", (req, res) => {
  const message = (req.query.message as string) ?? "";
  const from = (req.query.from as string) ?? "";
  const to = (req.query.to as string) ?? "";
  const data = listAudit({ message: message || undefined, from: from || undefined, to: to || undefined });
  console.log(`[audit-log] list -> ${data.length} entries`);
  res.json(data);
});

/** POST /api/audit-log — add audit entry. Body: { action: string, actor?: string } */
app.post("/api/audit-log", (req, res) => {
  const { action, actor } = req.body as { action?: string; actor?: string };
  if (!action || typeof action !== "string" || !action.trim()) {
    res.status(400).json({ error: "Body must include non-empty action" });
    return;
  }
  const entry = addAudit(action.trim(), typeof actor === "string" && actor.trim() ? actor.trim() : "User");
  console.log(`[audit-log] add -> ${entry.id}`);
  res.status(201).json(entry);
});

app.listen(PORT, () => {
  console.log(`[server] Backend running at http://localhost:${PORT}`);
  console.log("[server] Endpoints: coins, market-chart, multi-timeseries, GET/POST /api/alerts, GET /api/audit-log");
});
