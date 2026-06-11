# ORB Multi-Model Indicator

A Pine Script v6 TradingView indicator implementing **7 Opening Range Breakout (ORB) models** for the New York session, plus a **Combined confidence-scoring mode**. Built for discretionary and systematic traders who want multi-model confluence on ORB setups.

> **New:** [`ORB_Pro_Indicator.pine`](ORB_Pro_Indicator.pine) — a separate, research-based single-strategy ORB indicator. See [ORB Pro](#orb-pro--research-based-orb) below.
> **New:** [`XAU_Pro_Indicator.pine`](XAU_Pro_Indicator.pine) — a Gold-specialized session-breakout indicator. See [XAU Pro](#xau-pro--gold-session-breakout) below.

---

## XAU Pro — Gold Session Breakout

`XAU_Pro_Indicator.pine` is purpose-built for **XAUUSD / Gold** — not a generic ORB with gold defaults, but a design driven by how gold actually trades:

**Two gold-native setups:**

- **Setup A — Asian Range Breakout.** Gold consolidates during the Asian session and breaks out when London/NY liquidity arrives — a classic documented gold pattern with typical targets of 1.5–2× the Asian range width. The range builds 19:00–02:00 NY; entries are allowed only during the London → NY-overlap trade window (03:00–11:30 NY). Days where the Asian range is already wide (> 2× ATR) are skipped — the move already happened overnight.
- **Setup B — NY Opening Range Breakout.** COMEX open + US data flow make 8:00–11:30 NY gold's most directional window. Opening-candle direction rule per Zarattini & Aziz (2023). OR start selectable: 9:30 (equity open) or 8:20 (COMEX open).

**Gold-specific machinery:**

- **DXY inverse-correlation filter** read on a 60-min timeframe (where the correlation is stable — minute-level DXY is noise). Scored 25/100 by default; optional hard gate.
- **News-spike guard** — after any bar with range ≥ 3× ATR (8:30 CPI/NFP candles, flash moves), new entries are blocked for a cooldown period. Gold spreads widen up to 3× during news and first reactions frequently reverse; the guard refuses to chase.
- **Window relative volume** — session-window tick volume vs that window's own 14-day average ("in play" filter, softened for tick-volume proxy).
- **Stop floor** — risk is never tighter than 0.5× ATR, so normal gold spread noise can't tag the stop; risk capped at 1.5× ATR.
- **Flat before 17:00 NY** — gold liquidity dies into the daily rollover and spreads spike; default EOD flat at 16:45.

Plus the same honest accounting as ORB Pro: same-bar TP+SL counts as a loss, cumulative net R per setup, daily halt after N losses, non-repainting HTF/DXY data, and machine-parseable webhook alerts (`XAUPRO|setup|side|ticker|entry|sl|tp|score|dxy`). Warns if loaded on a non-Gold chart.

**Run it on XAUUSD, 5-min chart.** Forward-test and watch Net R before risking money — tick volume and 24h sessions make gold less forgiving than the instruments where breakout edges were academically documented.

---

## ORB Pro — Research-Based ORB

`ORB_Pro_Indicator.pine` is a standalone indicator that implements **one ORB strategy done well**, built on the rules documented in two academic studies:

- **Zarattini & Aziz (2023)** — *Can Day Trading Really Be Profitable?* 5-min ORB on QQQ (2016–2023): trade only in the direction of the opening candle, stop at the opposite side of the opening range, R-multiple target, end-of-day exit. Reported 33% annualized alpha.
- **Zarattini, Barbon & Aziz (2024)** — *A Profitable Day Trading Strategy For The U.S. Equity Market*: the edge concentrates almost entirely in **high relative-volume sessions** — relative volume of the opening window vs its own 14-day average.

What it does differently from the Multi-Model indicator:

| Aspect | Multi-Model | ORB Pro |
|---|---|---|
| Strategies | 7 overlapping breakout variants | 1 evidence-based strategy |
| Direction | any breakout direction | opening-candle direction only (paper rule, toggleable) |
| Volume filter | per-bar RVOL | **opening-window volume vs 14-day average of the same window** (the papers' filter) |
| Stop | ATR from OR edge | opposite OR side (paper rule), ATR-capped; midpoint/ATR options |
| Exit | TP/SL only | TP/SL + **end-of-day exit** (paper rule) |
| Risk control | none | daily stop after N losses |
| Same-bar TP+SL | "closer to open wins" heuristic | counted as a **loss** (conservative, honest stats) |
| Stats | win % | win % + **cumulative net R** |
| Alerts | text | text + **machine-parseable webhook format** (`ORBPRO\|LONG\|ticker\|entry\|sl\|tp\|score\|rvol`) |

Context factors (VWAP side, HTF trend, gap alignment, OR width quality) feed a 0–100 confluence score with a minimum threshold — they refine entries but never replace the hard gates.

**Honest disclaimer:** the cited evidence is from US equities/ETFs. No indicator guarantees profits, and edges decay. Forward-test on your instrument with alerts before risking money. On FX/Gold the relative-volume filter uses tick volume, which is a proxy.

---

## Features

- **7 independent ORB models** — each with its own OR window, entry TF, and signal logic
- **Combined mode** — single signal scored by 8 weighted confidence factors; only fires above a minimum score threshold
- **Non-repainting** — all higher-timeframe data uses confirmed-bar values (`expr[1]` + `lookahead_on`), so live signals match the backtest; NR7/NR4 and previous-day levels use completed days only
- **Automatic DST handling** — NY session detection via IANA timezone (`America/New_York`)
- **Per-model performance dashboard** — win rate, streak, score, agreement count, and BEST badge
- **19 alert conditions** — one per model direction, Combined bull/bear, ANY-signal catch-alls, and EOD exit
- **Economic event markers** — CPI / NFP on Day Bias label (Gold charts)
- **OR midline, prime-window highlight** — visual aids for the 9:30–10:00 prime window
- **OR width filter** — optional ATR-based gate to skip low-quality ranges
- **Timeframe guard** — on-chart warning if the chart TF is higher than a reference TF (signals then fall back to chart-bar closes)
- **Risk Guards (ported from ORB Pro / XAU Pro)** — news-spike guard (entry cooldown after ≥ 3× ATR bars), optional OR-window relative-volume gate (vs 14-day average of the same window), optional opening-candle direction filter (M9 exempt), daily stop after N losses, and an EOD exit that books open tracked trades at market (default 16:45 NY) so stats can't be polluted by multi-day stale trades. Same-bar TP+SL conflicts now count as a **loss** (conservative).

---

## Models

| # | Name | OR Window | Entry TF | Notes |
|---|------|-----------|----------|-------|
| M1 | Classic Crabel | User-configured (5–60 min) | 1-min | Breakout of OR high/low |
| M3 | 5-Min Scalper | First 5 min | 1-min | Tight OR, fast entry |
| M4 | Standard 15-Min | First 15 min | 5-min | Core ORB setup |
| M6 | FVG ORB | First 15 min | 5-min | Requires a Fair Value Gap inside the OR |
| M7 | Gold ORB | 9:30–9:45 EST | 5-min / 15-min | Tuned for XAU/USD |
| M9 | Failed ORB Reversal | Primary OR | 5-min | Counter-consensus reversal |
| M10 | Phase ORB | Phase 1/2/3 state machine | 5-min → 1-min | Breakout → retest → bounce |

> M2 (Fisher ACD), M5 (Conservative Retest), and M8 (ICT/Smart Money) were removed after backtesting showed 0–26% win rates across all pairs and timeframes.

---

## Combined Mode

A single signal that fires only when a 15-min OR breakout is confirmed **and** the confluence score meets the minimum threshold (`i_minScore`).

Confidence factors (each weighted 0–100):
1. Higher-timeframe trend alignment
2. RSI momentum
3. Relative volume (RVOL)
4. VWAP position
5. ATR-based volatility
6. OR width quality
7. Session timing (prime window bonus)
8. Multi-model agreement count

---

## Installation

1. Open [TradingView](https://www.tradingview.com) and go to the **Pine Script Editor**
2. Paste the contents of `ORB_Multi_Model_Indicator.pine` (or `ORB_Pro_Indicator.pine` / `XAU_Pro_Indicator.pine`)
3. Click **Add to chart**
4. Configure inputs: select Mode (Multi-Model or Combined), enable the models you want, set your reference timeframes
5. **For alerts:** create one alert on the indicator with condition **"Any alert() function call"** — this delivers the detailed dynamic messages (entry/SL/TP/score, webhook-parseable in ORB Pro and XAU Pro). The named `alertcondition` entries are also available for per-model alerts.

---

## Inputs Overview

| Group | Key Inputs |
|-------|-----------|
| Mode | Multi-Model vs Combined |
| Session | NY session start/end, OR window size |
| Models | Toggle each model on/off |
| Combined | Per-factor weights, minimum score |
| HTF | Higher timeframe for trend filter |
| Visuals | Dashboard, midline, prime window highlight |
| Risk | ATR multiplier for TP/SL levels |

---

## Backtested Performance

The active model set (and the disabled-by-default M6/M9) was selected from CSV win-rate backtests across instruments and timeframes.

Best results observed on:
- **AUDUSD** — strong across most models
- **XAU/USD (Gold)** — M7 and Combined mode
- **US100** — 1-min charts, M3/M4

---

## Requirements

- TradingView account (free or paid)
- Pine Script v6 (built-in to TradingView editor)
- Chart timeframe: **must be at or below the Fast Reference TF (default 1-min)** for the intended behavior — Pine cannot sample a lower timeframe than the chart, so on higher chart TFs signals fall back to chart-bar closes and a red warning is shown on the chart. Recommended: **1-min chart** (1-min and 5-min reference TFs both resolve correctly).

---

## License

MIT — free to use, modify, and distribute. Attribution appreciated.
