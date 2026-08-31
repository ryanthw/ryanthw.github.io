---
company: Personal Portfolio Management
role: Portfolio Manager
location: Remote
start: "2024"
order: 90
summary: Built and now run a ten-module options-risk platform over a live book, plus the strategy research behind it.
groups:
  - heading: Risk platform
    bullets:
      - Built and hosted a Streamlit risk dashboard on a Supabase cloud SQL database, integrating Finnhub and YFinance for real-time concentration (HHI), risk by expiration, projections and Monte Carlo simulation.
      - Migrated the platform to a React application on Vercel, now spanning ten modules including trade analysis, an IV surface, earnings and income scanners and a basis tracker.
      - Used the dashboard analytics to optimise position sizing and surface over-leveraged positions.
  - heading: Research
    bullets:
      - Researched and backtested call credit spreads, put debit spreads, iron condors and the wheel strategy.
      - Ran live paper tests of the wheel over a small-cap universe, governed by entry, exit and screening rules derived from a 104-name, six-year backtest.
stack:
  - React
  - TypeScript
  - Python
  - Supabase
  - PostgreSQL
  - Vercel
  - Streamlit
  - Finnhub API
  - YFinance
evidence:
  - label: risk-dashboard-react
    href: https://github.com/ryanthw/risk-dashboard-react
  - label: Live dashboard
    href: https://risk-dashboard-react.vercel.app
---
