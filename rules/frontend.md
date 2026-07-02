# Rule: Frontend (React + Tailwind + shadcn)

## Styling
- **Tailwind CSS for all layout and styling.** No hand-written CSS files except:
  - `index.css` for Tailwind directives + a few CSS variables (theme tokens).
- **shadcn/ui for UI primitives** — use its components instead of building our own:
  `Button`, `Input`, `Label`, `Select`, `Table`, `Card`, `Dialog`.
  Install only the components we actually use.
- shadcn components live in `client/src/components/ui/`. Do not edit generated
  primitives except for intentional theming.
- No inline `style={}` except for values that must be dynamic at runtime
  (e.g. computed canvas cell sizing). Everything static goes through Tailwind classes.

## The play field is Canvas, not DOM
- The board, active piece, ghost, and next-piece preview are drawn on `<canvas>`.
  Do **not** try to render the grid with divs/Tailwind — it's a canvas.
- Tailwind/shadcn styles the *chrome* around the canvas (panels, buttons, tables, screens).

## React conventions
- Function components + hooks only. One component per file, named after the file.
- Keep components focused and small. If a component grows past ~150 lines or mixes
  concerns (input + drawing + network), split it.
- Side effects (RAF loop, key listeners, fetches) go in `useEffect` with proper cleanup.
- Derive from state; avoid duplicating engine state into React state — read
  `engine.getState()` per frame and store the snapshot needed for rendering.

## Engine purity (hard invariant)
- `client/src/engine/` imports **nothing** from React, the DOM, or the network.
- If you're tempted to import React into the engine, the logic belongs in a component instead.
