# Halcyon

An original, choice-driven, 3D-rendered visual novel for adults (all characters 21+), built with React,
TypeScript, Vite, Tailwind CSS, Zustand and Framer Motion.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # engine unit tests + content validation + every-branch playthrough
npm run typecheck
npm run build
```

- Architecture, roadmap and art pipeline: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Realistic 3D art direction and production pipeline: [`docs/ART_DIRECTION.md`](docs/ART_DIRECTION.md)
- Render checklist for the artist (generated with `npm run brief`): [`docs/RENDER_BRIEF.md`](docs/RENDER_BRIEF.md)
- Story content: `src/data/` (characters, scenes, chapters, asset manifest)
- Engine (pure TypeScript, UI-agnostic): `src/engine/`

**Status:** Phases 1 and 2 are complete: the narrative engine and the cinematic interface (main menu,
stage, dialogue, choices, history, auto, skip, transitions). Placeholder art is procedural until final 3D
renders are integrated. Next is Phase 3: saving and loading, settings, relationship menu and gallery.

**Controls:** Click, Space or Enter to continue · A auto · S or hold Ctrl to skip read text · H or
right-click to hide the interface · L or wheel up for history · Esc for the menu · backtick for the debug
panel (dev builds only).

| Main menu | Dialogue | Expressions & relationship notice |
|---|---|---|
| ![Main menu](docs/screenshots/main-menu.png) | ![Dialogue](docs/screenshots/dialogue.png) | ![Expression](docs/screenshots/expression-and-toast.png) |

*Placeholder art is procedural and only previews composition. The target look is photoreal 3D renders (see ART_DIRECTION.md), which drop in through `src/data/shots.ts`, `characterArt.ts` and `assets.ts` without story changes.*
