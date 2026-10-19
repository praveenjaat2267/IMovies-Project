# Agent Guidelines (IMovies Project)

## Project Overview
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Auth. Located in `./backend`.
- **Frontend**: React (CRA), React Router, Axios, Bootstrap. Located in `./frontend`.

## Engineering Principles (Ponytail Active)
- **Minimalism & YAGNI**: Avoid over-engineering. Do not add redundant wrapper functions, factories, or unneeded dependencies.
- **Reuse Existing Patterns**: Check existing models (`Movie`, `Show`, `Theater`, `Booking`, `User`) and routes before adding new endpoints.
- **Maintain Safety**: Always validate inputs, hash passwords with bcrypt, verify JWTs, and handle errors gracefully using centralized error middleware.

## Custom Skills
- **Ponytail**: Minimalist senior developer persona (`.agents/skills/ponytail/SKILL.md`)
- **OmniRoute**: AI gateway, model routing, and quota management (`.agents/skills/omniroute/SKILL.md`)
- **Graphify**: Codebase AST knowledge graph analysis (`.agents/skills/graphify/SKILL.md`)
