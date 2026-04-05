# Plan Creation & Organization

## Impact Analysis & Complexity Decision

**Before creating a plan, evaluate the impact of changes.**

1.  **Search & Count**: Search for key terms associated with the feature/bug.
2.  **Evaluate**:
    *   **Low Impact**: Affects < 5 files.
    *   **High Impact**: Affects > 5 files or involves core architecture/database schemas.
3.  **Decide Structure**:
    *   **Simple Plan**: Single markdown file in `.agents/plans/`.
    *   **Detailed Plan**: Folder structure in `.agents/plans/` with separate phase files.

## Directory Structure

### Plan Location

**IMPORTANT**: The `<Random ID>` for plan generation is required!

**Simple Plan (Low Impact)**:
Format: `.agents/plans/plan-<plan_short_summarization>-<Random ID>.md`

**Detailed Plan (High Impact)**:
Format: `.agents/plans/<plan_short_summarization>-<Random ID>/`

### File Organization

**Option A: Simple Plan (Single File)**
```
.agents/plans/
    ├── plan-fix_auth_flow-34hjh4.md
    ├── plan-add_user_search-67gdo4.md
    └── ...
```

**Option B: Detailed Multi-Phase Plan (Folder)**
```
.agents/plans/
└── chat-feature-98k2j1/
    ├── research/
    │   ├── report-XX.md
    │   └── ...
    ├── plan.md                                # Overview access point
    ├── phase-01-update-db-schema.md           # Database migrations
    ├── phase-02-implement-services.md         # Backend business logic
    ├── phase-03-implement-api-endpoints.md    # Nitro API routes
    ├── phase-04-implement-ui-components.md    # Nuxt components/pages
    ├── phase-05-write-tests.md                # Tests
    └── ...
```

## File Structure

### Overview Plan (plan.md or plan-<ID>.md)
- Keep generic and under 80 lines.
- List each phase with status/progress.
- Link to detailed phase files.
- High-level timeline.
- Key dependencies.

### Phase Details (Inside Plan File or Linked)
Each phase section should contain:

**Context Links** — Links to related research reports, files, documentation.

**Overview** — Brief description and priority.

**Key Insights** — Important findings from research, critical considerations.

**Architecture** — System design, component interactions, and data flow.

**Related Code Files** — List of files to modify, create, or delete.

**Implementation Steps** — Detailed, numbered steps with specific instructions.

**Todo List** — Checkbox list for tracking progress.

**Success Criteria** — Definition of done and validation methods.

**Security Considerations** — Auth/authorization, data protection, and secret management.
