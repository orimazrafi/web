import express from "express";
import cors from "cors";
import { fetchTimeseriesByCoin, fetchCoinMarketData, } from "./coingecko.js";
const ANALYTICS_COINS = ["bitcoin", "ethereum", "solana"];
const PORT = Number(process.env.PORT) || 3001;
const app = express();
app.use(cors());
app.use(express.json());
/** GET /api/coins/:coinId/market-chart/range?from=YYYY-MM-DD&to=YYYY-MM-DD */
app.get("/api/coins/:coinId/market-chart/range", async (req, res) => {
    try {
        const { coinId } = req.params;
        const from = req.query.from;
        const to = req.query.to;
        if (!from || !to) {
            res.status(400).json({ error: "Query params 'from' and 'to' (YYYY-MM-DD) required" });
            return;
        }
        const data = await fetchTimeseriesByCoin(coinId, from, to);
        res.json(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message === "RATE_LIMIT_429") {
            res.status(429).json({ error: "Rate limit exceeded — try again later" });
            return;
        }
        res.status(502).json({ error: message });
    }
});
/** GET /api/coins/:coinId — market data for KPIs */
app.get("/api/coins/:coinId", async (req, res) => {
    try {
        const { coinId } = req.params;
        const data = await fetchCoinMarketData(coinId);
        res.json(data);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message === "RATE_LIMIT_429") {
            res.status(429).json({ error: "Rate limit exceeded — try again later" });
            return;
        }
        res.status(502).json({ error: message });
    }
});
/** GET /api/multi-timeseries?from=YYYY-MM-DD&to=YYYY-MM-DD — BTC, ETH, SOL in one call */
app.get("/api/multi-timeseries", async (req, res) => {
    try {
        const from = req.query.from;
        const to = req.query.to;
        if (!from || !to) {
            res.status(400).json({ error: "Query params 'from' and 'to' (YYYY-MM-DD) required" });
            return;
        }
        const entries = await Promise.all(ANALYTICS_COINS.map(async (coinId) => {
            const series = await fetchTimeseriesByCoin(coinId, from, to);
            return [coinId, series];
        }));
        res.json(Object.fromEntries(entries));
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message === "RATE_LIMIT_429") {
            res.status(429).json({ error: "Rate limit exceeded — try again later" });
            return;
        }
        res.status(502).json({ error: message });
    }
});
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});
