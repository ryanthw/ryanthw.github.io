---
title: Strategy Backtests
tagline: Wheel, debit spreads, iron condors and a Markov regime indicator, tested across a 104-name, six-year universe.
categories: [quant]
order: 4
year: 2024 — 2025
stack:
  - Python
  - pandas
  - NumPy
  - Matplotlib
  - SciPy
  - YFinance
problem: >-
  Every options strategy has a story attached to it and very few have a number. Before
  committing capital to a premium-selling programme I wanted the entry, exit and
  screening rules to come out of measurement rather than out of the story.
approach: >-
  Backtested call credit spreads, put debit spreads, iron condors and the wheel over a
  104-name universe across six years of history, sweeping the parameters that actually
  move the result — entry timing, exit windows, strike selection and the screen that
  decides which names are eligible at all. Built a Markov regime indicator alongside it
  to label the market state each trade was opened into.
result: >-
  A concrete rule set for the wheel — entry, exit and screening — derived from the sweep
  rather than assumed, now running as a live paper test over a small-cap universe and
  reported through the same risk dashboard that tracks the real book.
---

The research corpus and the scripts behind it stay in a private repository: results and
methodology are the part worth protecting, and they are not derivable from the
application code that consumes them.
