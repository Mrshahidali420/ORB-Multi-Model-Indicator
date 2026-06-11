# ORB Multi-Model Indicator

A Pine Script v6 TradingView indicator implementing **7 Opening Range Breakout (ORB) models** for the New York session, plus a **Combined confidence-scoring mode**. Built for discretionary and systematic traders who want multi-model confluence on ORB setups.

---

## Features

- **7 independent ORB models** — each with its own OR window, entry TF, and signal logic
- **Combined mode** — single signal scored by 8 weighted confidence factors; only fires above a minimum score threshold
- **Non-repainting** — all higher-timeframe data uses confirmed-bar values (`expr[1]` + `lookahead_on`), so live signals match the backtest; NR7/NR4 and previous-day levels use completed days only
- **Automatic DST handling** — NY session detection via IANA timezone (`America/New_York`)
- **Per-model performance dashboard** — win rate, streak, score, agreement count, and BEST badge
- **18 alert conditions** — one per model direction, Combined bull/bear, plus ANY-signal catch-alls
- **Economic event markers** — CPI / NFP on Day Bias label (Gold charts)
- **OR midline, prime-window highlight** — visual aids for the 9:30–10:00 prime window
- **OR width filter** — optional ATR-based gate to skip low-quality ranges
- **Timeframe guard** — on-chart warning if the chart TF is higher than a reference TF (signals then fall back to chart-bar closes)

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
2. Paste the contents of `ORB_Multi_Model_Indicator.pine`
3. Click **Add to chart**
4. Configure inputs: select Mode (Multi-Model or Combined), enable the models you want, set your reference timeframes

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
