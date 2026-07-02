# Rule: Code Quality

## DRY — single source of truth
- Board size, piece shapes, colors, speed table, difficulty→level map, and API paths
  are each defined **once** and imported everywhere.
- Shared shapes (e.g. the score object) are defined in one place; client and server agree
  on the same field names from `plan.md`.
- If you copy-paste a block, stop and extract a function or constant instead.

## Small, focused units
- One responsibility per file/function. Files that mix concerns get split.
- Prefer pure functions in the engine; pass state in, return new state / values out.
- Functions short enough to hold in your head; extract helpers when logic nests deeply.

## Naming & consistency
- Descriptive names: `clearLines`, `gravityMs`, `topScores` — not `doStuff`, `handle2`.
- Match the surrounding style. Consistent quotes, semicolons, and import ordering across files.
- Constants `UPPER_SNAKE`, functions/vars `camelCase`, components `PascalCase`.

## Cleanliness
- No dead code, no commented-out blocks, no unused imports/vars.
- No leftover debug logging.
- Comments explain **why**, not what the code already says.

## Tests
- Pure engine and DB layer have Vitest coverage per `plan.md` Phase 1 & 4.
- A change to engine rules updates or adds a test in the same step.
