import type { MultiTimeseriesResult } from "../api/useMultiTimeseries";

export type AlignedRow = {
  date: string;
  btc: number;
  eth: number;
  sol: number;
};

function toDateKey(ts: string): string {
  return ts.slice(0, 10);
}

/** Resample to one value per calendar day (last value of the day). */
function toDaily(points: { ts: string; value: number }[]): Map<string, number> {
  const byDate = new Map<string, number>();
  for (const p of points) {
    const d = toDateKey(p.ts);
    byDate.set(d, p.value);
  }
  return byDate;
}

/** Align BTC/ETH/SOL to common dates; fill missing with previous value. */
export function alignSeries(data: MultiTimeseriesResult): AlignedRow[] {
  const dailyBtc = toDaily(data.bitcoin ?? []);
  const dailyEth = toDaily(data.ethereum ?? []);
  const dailySol = toDaily(data.solana ?? []);

  const allDates = new Set<string>([
    ...dailyBtc.keys(),
    ...dailyEth.keys(),
    ...dailySol.keys(),
  ]);
  const sorted = Array.from(allDates).sort();

  const rows: AlignedRow[] = [];
  let lastBtc = 0,
    lastEth = 0,
    lastSol = 0;

  for (const date of sorted) {
    if (dailyBtc.has(date)) lastBtc = dailyBtc.get(date)!;
    if (dailyEth.has(date)) lastEth = dailyEth.get(date)!;
    if (dailySol.has(date)) lastSol = dailySol.get(date)!;
    rows.push({ date, btc: lastBtc, eth: lastEth, sol: lastSol });
  }

  return rows;
}

/** Period return from first day: (price / firstPrice - 1) * 100 */
export function computeReturnSeries(rows: AlignedRow[]): AlignedRow[] {
  if (rows.length === 0) return [];
  const r0 = rows[0];
  return rows.map((r) => ({
    date: r.date,
    btc: r0.btc ? ((r.btc / r0.btc - 1) * 100) : 0,
    eth: r0.eth ? ((r.eth / r0.eth - 1) * 100) : 0,
    sol: r0.sol ? ((r.sol / r0.sol - 1) * 100) : 0,
  }));
}

/** Daily log returns for volatility; then rolling or full-period std. */
function dailyReturns(rows: AlignedRow[]): { date: string; btc: number; eth: number; sol: number }[] {
  const out: { date: string; btc: number; eth: number; sol: number }[] = [];
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const curr = rows[i];
    out.push({
      date: curr.date,
      btc: prev.btc ? Math.log(curr.btc / prev.btc) : 0,
      eth: prev.eth ? Math.log(curr.eth / prev.eth) : 0,
      sol: prev.sol ? Math.log(curr.sol / prev.sol) : 0,
    });
  }
  return out;
}

function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((s, x) => s + (x - mean) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

/** Rolling volatility (annualized): std of daily returns so far, * sqrt(252) * 100 */
export function computeVolatilitySeries(rows: AlignedRow[]): AlignedRow[] {
  const rets = dailyReturns(rows);
  const out: AlignedRow[] = [];
  for (let i = 0; i < rets.length; i++) {
    const btcR = rets.slice(0, i + 1).map((r) => r.btc);
    const ethR = rets.slice(0, i + 1).map((r) => r.eth);
    const solR = rets.slice(0, i + 1).map((r) => r.sol);
    const ann = (s: number) => (s * Math.sqrt(252) * 100);
    out.push({
      date: rets[i].date,
      btc: ann(std(btcR)),
      eth: ann(std(ethR)),
      sol: ann(std(solR)),
    });
  }
  return out;
}

/** Drawdown: (price / runningMax - 1) * 100 */
export function computeDrawdownSeries(rows: AlignedRow[]): AlignedRow[] {
  let maxB = 0,
    maxE = 0,
    maxS = 0;
  return rows.map((r) => {
    if (r.btc > maxB) maxB = r.btc;
    if (r.eth > maxE) maxE = r.eth;
    if (r.sol > maxS) maxS = r.sol;
    return {
      date: r.date,
      btc: maxB ? ((r.btc / maxB - 1) * 100) : 0,
      eth: maxE ? ((r.eth / maxE - 1) * 100) : 0,
      sol: maxS ? ((r.sol / maxS - 1) * 100) : 0,
    };
  });
}

function correlation(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length < 2) return 0;
  const n = a.length;
  const ma = a.reduce((s, x) => s + x, 0) / n;
  const mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0,
    da = 0,
    db = 0;
  for (let i = 0; i < n; i++) {
    const va = a[i] - ma;
    const vb = b[i] - mb;
    num += va * vb;
    da += va * va;
    db += vb * vb;
  }
  const den = Math.sqrt(da * db);
  return den === 0 ? 0 : num / den;
}

/** 3x3 correlation matrix of daily returns (BTC, ETH, SOL). */
export function correlationMatrix(rows: AlignedRow[]): Record<string, Record<string, number>> {
  const rets = dailyReturns(rows);
  const btcR = rets.map((r) => r.btc);
  const ethR = rets.map((r) => r.eth);
  const solR = rets.map((r) => r.sol);

  const keys = ["btc", "eth", "sol"] as const;
  const vectors = { btc: btcR, eth: ethR, sol: solR };

  const out: Record<string, Record<string, number>> = {};
  for (const a of keys) {
    out[a] = {};
    for (const b of keys) {
      out[a][b] = correlation(vectors[a], vectors[b]);
    }
  }
  return out;
}
