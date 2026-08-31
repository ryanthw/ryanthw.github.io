---
title: Semantic Quote Search
tagline: Embedding search over a quote corpus — sentence-transformers into a FAISS inner-product index, joined back to a SQLite metadata store.
categories: [ml]
order: 6
year: "2025"
stack:
  - FAISS
  - sentence-transformers
  - SQLite
  - NumPy
  - Python
problem: >-
  Keyword search over a quote corpus fails exactly where it matters: the quote you want
  rarely shares vocabulary with the idea you are searching for. Matching has to happen on
  meaning, not on tokens.
approach: >-
  Embedded the corpus with GIST-large through sentence-transformers, normalised the
  vectors and indexed them in a FAISS inner-product index so cosine similarity falls out
  of the dot product. Kept the metadata in a SQLite key-value store keyed by vector id, so
  the index stays numeric and the text join happens once, at query time, behind a top-k
  command-line interface.
result: >-
  Queries return semantically close quotes rather than lexically close ones. The shape —
  embed, index, retrieve top-k, join metadata — is the retrieval half of a RAG system, and
  it is the pattern the research sandbox behind the risk dashboard is built on.
---

Coursework, so there is no repository link. The retrieval pattern is the transferable
part, and it is what the research-to-application seam on the risk dashboard reuses.
