---
name: plan
description: Architecture and research. Design solutions, create implementation plans, organize multi-phase work.
---

# Plan

Use this skill to design architecture, do research, or create implementation plans. Output plans for execution (file edits, shell, browser as needed); this skill does not execute changes.

For Nuxt/Vue/TypeScript conventions, load **knowledge** references when relevant.

## When to Use

- Planning new feature implementations
- Architecting system designs
- Evaluating technical approaches
- Creating implementation roadmaps
- Breaking down complex requirements
- Assessing technical trade-offs

## Core Principles

Always honoring **YAGNI**, **KISS**, and **DRY** principles.
**Be honest, be brutal, straight to the point, and be concise.**

## Workflow

### 1. Research & Analysis
Load: `references/research-phase.md`
**Skip if:** Provided with researcher reports

### 2. Codebase Understanding
Load: `references/codebase-understanding.md`
**Skip if:** Provided with scout reports

### 3. Impact & Solution Design
Load: `references/solution-design.md`
**Action:** Run impact analysis (read, search, list dirs) to determine plan complexity.

### 4. Plan Creation & Organization
Load: `references/plan-organization.md`

### 5. Task Breakdown & Output Standards
Load: `references/output-standards.md`

## Process

1. **Initial Analysis** → Read `README.md`, understand context and architecture.
2. **Impact Assessment** → Search and quantify impact. Decide: Simple vs Detailed Plan.
3. **Research Phase** → Investigate approaches using search and codebase exploration.
4. **Synthesis** → Analyze findings, identify optimal solution.
5. **Design Phase** → Create architecture, implementation design.
6. **Plan Documentation** → Write comprehensive plan (Single file or Multi-phase).
7. **Review & Refine** → Ensure completeness, clarity, actionability.

## Output Requirements

- Do not implement code—only create plans.
- Respond with plan file path and summary.
- Ensure self-contained plans with necessary context.
- Include code snippets/pseudocode when clarifying.
- Provide multiple options with trade-offs when appropriate.
- Fully respect the project's tech stack: Nuxt 4, Drizzle ORM, Reka UI, Tailwind CSS.

**Plan Directory Structure**

**IMPORTANT**: The `<Random ID>` for plan generation is required!

Short plan (Low Impact):
```
.claude/plans/
    ├── plan-<plan_short_summarization>-<Random ID>.md
    ├── ...
```

Detailed, multi-phase plan (High Impact):
```
.claude/plans/
└── <plan_short_summarization>-<Random ID>/
    ├── research/
    │   ├── report-XX.md
    │   └── ...
    ├── plan.md
    ├── phase-XX-name.md
    └── ...
```

## Quality Standards

- Be thorough and specific.
- Consider long-term maintainability.
- Research thoroughly when uncertain.
- Address security and performance concerns.
- Make plans detailed enough for junior developers.
- Validate against existing codebase patterns.
