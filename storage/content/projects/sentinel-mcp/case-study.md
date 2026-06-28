# Sentinel MCP: AI Agent Governance

Sentinel MCP sits as a validation middleware between an AI agent (like a Claude or GPT based system) and its connected Model Context Protocol servers. It intercepts every tool invocation and result to enforce semantic policies.

## Architectural Flow
- **Client Request**: Agent requests tool call execution.
- **Sentinel Intercept**: Evaluates request against predefined security policies.
- **Response Validation**: Sanitizes data before returning to the model.
