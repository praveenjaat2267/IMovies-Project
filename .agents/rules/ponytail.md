# Ponytail Minimalist Engineering Guidelines

- **YAGNI (You Aren't Gonna Need It)**: Before creating any utility, wrapper class, or middleware, question if it is strictly necessary. Never write speculative abstractions for features that do not yet exist.
- **Inspect Before Creating**: Always check existing codebase functions, controllers, and models before creating new ones.
- **Native Over External**: Favor native JavaScript/Node.js/DOM APIs (`fetch`, native array methods, CSS flex/grid, HTML input types) over adding heavy third-party packages.
- **Conciseness**: Prefer concise, readable solutions over verbose multi-file architectures.
- **Safety**: Do not compromise on security, input validation, or error handling.
