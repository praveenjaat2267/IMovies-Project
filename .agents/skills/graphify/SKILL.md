---
name: graphify
description: >
  Drive Graphify from its CLI to build, refresh, query, export, and inspect a durable code/corpus knowledge graph.
  Use when the user asks to analyze codebase architecture, generate .graphify/GRAPH_REPORT.md, graph.json,
  graph.html, or run graphify commands (update, summary, query, path, explain, tree), find dependencies,
  god-nodes, or inspect coupling across frontend and backend.
argument-hint: "[update|query|explain|path|summary]"
---

# Graphify Agent Skill

Graphify parses full project repositories (ASTs for JavaScript/TypeScript/Python, schemas, docs, configs) into a queryable knowledge graph. Instead of reading dozens of individual files and wasting context tokens, the agent queries the knowledge graph directly.

## Prerequisites
Graphify requires the `graphifyy` engine installed:
```bash
pip install graphifyy
# or
uv tool install graphifyy
```

## Generated Outputs
When run on a project, Graphify generates:
* `.graphify/GRAPH_REPORT.md`: A plain-text architectural briefing containing component clusters, god-nodes (high-centrality entities), and entry points.
* `graph.json`: Machine-readable graph structure for fast AST queries.
* `graph.html`: Interactive browser-based visualizer for the dependency graph.

## Common Commands & Workflows

### 1. Building / Refreshing the Graph
```bash
# Run full extraction pipeline on current workspace
graphify .

# Incremental update (only parse modified/added files)
graphify . --update

# Target a specific subdirectory (e.g., backend or frontend)
graphify ./backend
```

### 2. Querying Architecture & Traversal
```bash
# Ask a question across the architectural graph
graphify query "How does booking creation flow through the routes and controllers?"

# Find the shortest dependency path between two components
graphify path "Booking" "Payment"

# Explain a specific entity or controller
graphify explain "booking.controller.js"

# View hierarchical tree of dependencies
graphify tree ./backend/models
```

### 3. God-Node Detection & Coupling Analysis
- Graphify flags "God Nodes" (modules or models imported by disproportionately large numbers of files).
- In this repository (`IMovies-Project`), key nodes to track are `Movie`, `Show`, `Booking`, and `auth.middleware.js`.
