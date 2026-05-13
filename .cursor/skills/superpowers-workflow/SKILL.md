---
name: superpowers-workflow
description: Apply the Superpowers agentic workflow in Cursor, including install and usage guidance from obra/superpowers. Use for coding tasks, feature implementation, bug fixes, and when the user asks for planning, TDD, review, or autonomous execution workflows.
---

# Superpowers Workflow

Use this skill as the default workflow for coding tasks in this project.

## Install In Cursor

If Superpowers is not installed, tell the user to run:

```bash
/add-plugin superpowers
```

If needed, reference:
- Repository: https://github.com/obra/superpowers
- Cursor install note in README: use `/add-plugin superpowers` in Agent chat

## Default Workflow

Follow this sequence:

1. **Brainstorming first**
   - Clarify intent and constraints before coding
   - Confirm acceptance criteria
2. **Plan before implementation**
   - Break work into small, testable steps
   - Prefer explicit verification commands per step
3. **TDD when changing behavior**
   - Write or update tests first
   - Ensure tests fail before implementation when practical
   - Implement minimal code to pass tests
4. **Code review mindset**
   - Check correctness, regressions, edge cases, and risk
   - Call out missing tests or ambiguous requirements
5. **Verification before completion**
   - Run relevant checks (tests/lint/build)
   - Report concrete evidence, not assumptions

## Response Style

- Be concise and execution-focused
- Prefer doing the work over proposing vague plans
- Surface blockers quickly with concrete options

## Trigger Terms

Apply this skill proactively when the user asks to:
- implement features
- fix bugs
- refactor code
- write tests
- review changes
- create a development plan

Also apply when messages include terms like:
- "superpowers"
- "TDD"
- "plan this"
- "review this"
- "ship this"

## Notes

- This skill does not replace project-specific rules; it complements them
- If Superpowers plugin behavior conflicts with direct user instruction, follow the user instruction
