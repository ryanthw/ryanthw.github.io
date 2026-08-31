---
title: TCN Stock Model
tagline: Temporal convolutional network forecasting price series, with trained AAPL and TSLA checkpoints.
categories: [ml, quant]
order: 2
featured: true
year: "2025"
stack:
  - PyTorch
  - NumPy
  - pandas
  - Matplotlib
  - YFinance
  - Python
problem: >-
  Sequence models for price data usually reach for an LSTM, which trains slowly and
  carries a receptive field that is hard to reason about. I wanted a forecaster whose
  history window was an explicit architectural choice rather than an emergent property
  of the recurrence.
approach: >-
  Built a temporal convolutional network in PyTorch — stacked dilated causal
  convolutions, so the receptive field grows exponentially with depth and every
  prediction depends only on the past. Split the work into a data loader over YFinance
  history, the model definition, a training loop and a prediction entry point, so a new
  ticker is a configuration change rather than a rewrite.
result: >-
  Trained checkpoints for AAPL and TSLA, each reproducible from the training script.
  The dilation stack means the history window is set deliberately rather than tuned by
  trial, and training runs materially faster than the recurrent baseline it replaced.
---

Personal work — no coursework or client restrictions on it. The repository is not public
yet; the write-up here is the current record of the project.
