---
name: omniroute
description: >
  Manage and route AI model requests, configure provider connections, rate-limit fallbacks,
  and context token compression using the OmniRoute gateway. Use when managing LLM endpoints,
  switching between model providers (OpenAI, Anthropic, Gemini, local Ollama), testing connection quotas,
  or driving the OmniRoute REST/MCP service.
argument-hint: "[status|providers|models|test|mcp]"
---

# OmniRoute Agent Skill

OmniRoute is an open-source AI gateway that provides unified routing across hundreds of model providers, automatic fallback handling when rate limits are hit, quota tracking, and token compression.

## Capabilities & Architecture

- **Unified Proxy**: Translates requests between standard formats (OpenAI, Anthropic Claude, Gemini) through a single endpoint (default `http://localhost:20128`).
- **Quota-Aware Routing**: Automatically routes around depleted quotas, rate limits (HTTP 429), or temporary outages.
- **Token Compression**: Built-in RTK (Run-Time Knowledge) and Caveman prompt compressors reduce context window size.
- **MCP Integration**: Can be launched as an MCP server with `omniroute --mcp` exposing 100+ native control tools.

## Common Workflows & CLI Commands

### 1. Gateway Status & Health
```bash
# Check if local OmniRoute gateway is running
curl -s http://localhost:20128/api/health

# CLI service inspection
omniroute status
```

### 2. Managing Providers & Quotas
```bash
# List all active providers and fallback ranks
omniroute providers list

# Test provider connection and latency
omniroute providers test <provider-id>

# Check current quota and usage statistics
omniroute quota
```

### 3. Model Routing & Fallbacks
- Configure fallback chains in your OmniRoute config (e.g., Primary: `gemini-1.5-pro` -> Secondary: `claude-3-7-sonnet` -> Fallback: `gpt-4o`).
- Query available model aliases:
```bash
omniroute models
```

### 4. Running as an MCP Server
To expose OmniRoute tools directly to the Antigravity agent, configure it in `.agents/mcp_config.json`:
```json
{
  "mcpServers": {
    "omniroute": {
      "command": "omniroute",
      "args": ["--mcp"]
    }
  }
}
```
When active, the agent can call `omniroute_agent_skills_*` tools directly to change routing, inspect token usage, and switch providers without manual CLI commands.
