---
title: Options Risk Dashboard
tagline: Ten-module risk platform over a live options book — concentration, tail risk, Greeks, scanners and an IV surface.
categories: [quant, web]
order: 1
featured: true
year: 2024 — Present
stack:
  - React
  - TypeScript
  - Supabase
  - PostgreSQL
  - Vercel
  - Finnhub API
  - YFinance
  - Python
  - Streamlit
repo: https://github.com/ryanthw/risk-dashboard-react
live: https://risk-dashboard-react.vercel.app
highlights:
  - label: TWR
    detail: Time-weighted return, stripping out contributions
  - label: HHI
    detail: Herfindahl concentration across the book
  - label: VaR 95%
    detail: Value at risk at the 95th percentile
  - label: CVaR 95%
    detail: Expected shortfall beyond that threshold
  - label: Sharpe / Sortino
    detail: Risk-adjusted return, total and downside
  - label: Theta / day
    detail: Daily decay, absolute and as a share of net liquidity
  - label: Beta-wtd Delta
    detail: Directional exposure normalised to the index
  - label: ERPA
    detail: Expected return per attempt, with its percentile
problem: >-
  Running a multi-leg options book off a broker screen means you can see every
  position and none of the portfolio. Concentration, correlated tail exposure and
  the rate at which theta is actually paying were all invisible at the level that
  matters.
approach: >-
  Started as a Streamlit dashboard on a Supabase cloud SQL database, pulling
  Finnhub and YFinance for live marks. Rebuilt it as a React and TypeScript
  application on Vercel as the metric set outgrew Streamlit's layout model, and
  grew it into ten modules — trade analysis, an IV surface, earnings and income
  scanners, a basis tracker and generated reports.
result: >-
  Position sizing now runs off measured concentration and expiration-bucketed
  risk rather than intuition, and over-leveraged positions surface before they
  become the problem. The wheel-strategy rules the book trades were derived from
  a 104-name, six-year backtest and are paper-tested live against the same
  dashboard.
---

## Modules

- **Dashboard** — net liquidity against its high-water mark, with the headline risk set
- **Visuals** — exposure and allocation breakdowns across the book
- **Strategy** — position grouping by strategy, with per-strategy performance
- **History** — closed positions and the realised track record
- **Trade Analysis** — win rate, profit factor, expectancy, average win/loss and hold time
- **Earnings Scanner** — upcoming earnings against a reliability screen
- **Income Scanner** — premium-selling candidates over a screened universe
- **Basis Tracker** — cost basis across assignments and rolls
- **IV Surface** — implied volatility by strike and expiration
- **Reports** — generated summaries over any date range

## Where the research lives

Strategy research and backtests sit in a separate private repository and reach the
dashboard one way, through Supabase — the research tables are read-only to the
application. Keeping that seam architectural rather than a list of ignored paths is
what made the app repository publishable at all.
