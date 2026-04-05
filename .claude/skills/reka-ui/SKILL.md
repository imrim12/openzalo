---
name: reka-ui
description: Reka UI component library reference. Use when building or planning Vue UI with Reka UI primitives.
---

# Reka UI

Use this skill when working with Reka UI components — building new UI, composing primitives, or looking up component APIs.

## When to Use

- Building or planning UI components that need Reka UI primitives
- Looking up component props, slots, events, or composition patterns
- Deciding which Reka UI primitive fits a use case

## Workflow

1. **Fetch the full reference**: Always fetch `https://reka-ui.com/llms.txt` first to get the complete component catalog and docs structure.
2. Find the matching primitive for your use case.
3. If needed, fetch the specific component docs page (e.g., `https://reka-ui.com/docs/components/dialog.md`) for detailed API, props, slots, and examples.
4. Build/plan a styled wrapper around the primitive using Tailwind CSS.
5. If no primitive exists, follow Reka UI composition patterns (`asChild`, slots).

## Key Concepts

- **Unstyled primitives** — Reka UI provides behavior and accessibility; style with Tailwind CSS.
- **`asChild` composition** — Render Reka functionality onto your own elements/components.
- **Controlled vs uncontrolled** — Components support both via `v-model` or internal state.
- **SSR compatible** — Works with Nuxt server-side rendering.
