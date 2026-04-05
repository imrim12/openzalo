# Codebase Understanding Phase

**When to skip:** If provided with scout reports, skip this phase.

## Core Activities

### Codebase Investigation
- Build a comprehensive map of the project structure, dependencies, and key files.
- Consult the `README.md` for architecture overview.
- Identify key directories:
    - `app/`: Nuxt frontend (pages, components, stores, composables).
    - `server/`: Nitro backend (API routes, services, tasks, database schema).
    - `shared/`: Server/Client neutral files.

### Essential Documentation Review
**ALWAYS** review these areas first:

1. **`README.md`** — Architecture, tech stack, and system overview.
2. **Database schema** — Understand the data model and relationships.
3. **`server/services/`** — Identify existing business logic patterns.

### Pattern Recognition & Component Precedence
- The project uses **Reka UI** (unstyled, accessible primitives) with **Tailwind CSS** for styling.
- Check `app/components/` to verify if a similar component already exists before planning a new one.


### Integration Planning
- Identify how new features integrate with existing architecture.
- Map dependencies between components and services.
- Understand data flow (frontend -> API -> Service -> Database).

## Best Practices

- Start with the `README.md` and database schema.
- Explore broadly before diving deep.
- Favor existing service and component patterns.
- Use Reka UI primitives where possible to maintain accessibility and consistency.
