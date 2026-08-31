---
title: Butterfly CNN
tagline: Transfer learning on VGG16 to classify 75 butterfly species, retraining two fully connected layers over a 3,000-image set.
categories: [ml]
order: 5
year: "2025"
stack:
  - PyTorch
  - NumPy
  - Matplotlib
  - Python
problem: >-
  Seventy-five visually similar classes with a few thousand training images is far too
  little data to learn general visual features from scratch. The interesting question is
  not how to build a convolutional network but how much of one you can borrow.
approach: >-
  Took VGG16's pretrained convolutional stack as a frozen feature extractor and retrained
  two fully connected layers on the butterfly set, so the parameters being learned were
  the classifier rather than the features. Tracked loss and train/validation accuracy per
  epoch in Matplotlib to watch for the point where the classifier starts memorising.
result: >-
  89–90% accuracy across the 75 species. The curves made the overfitting boundary visible
  early enough to stop at it, which is the whole argument for monitoring training rather
  than reading the final number.
---

Coursework, so there is no repository link — the source sits on instructor-provided
scaffolding and stays private. The result, the architecture and the method are the
publishable part, and they are above.
