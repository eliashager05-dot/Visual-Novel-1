# Halcyon

An original, choice-driven, 3D-rendered visual novel for adults (all characters 21+), built with React,
TypeScript, Vite, Tailwind CSS, Zustand and Framer Motion.

**On Windows, double-click `Play Halcyon.bat`.** It installs what is needed, starts the game and opens your
browser. `Render Studio.bat` does the same for the render studio.

From a terminal:

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # engine unit tests + content validation + every-branch playthrough
npm run typecheck
npm run build
```

- Architecture, roadmap and art pipeline: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Realistic 3D art direction and production pipeline: [`docs/ART_DIRECTION.md`](docs/ART_DIRECTION.md)
- Generating the images with a local AI image generator: [`docs/AI_RENDER_GUIDE.md`](docs/AI_RENDER_GUIDE.md)
  (`npm run generate -- --milestone 1`, then `npm run studio` to compare and choose)
- Building them in DAZ Studio instead: [`docs/DAZ_GUIDE.md`](docs/DAZ_GUIDE.md)
- Same face in every image: train a character LoRA; the studio prepares the training folder:
  [`docs/LORA_GUIDE.md`](docs/LORA_GUIDE.md)
- Music and sound effects: drop files into `src/assets/music` and `src/assets/sounds`: [`docs/AUDIO_GUIDE.md`](docs/AUDIO_GUIDE.md)
- Animated clips: the render studio's **Animate** button makes them from your chosen stills with your own
  ComfyUI video workflow (`ai-workflows/animate.json`), or save `<shotId>.mp4` (loops) /
  `<shotId>.once.mp4` (plays once) next to the still yourself. Section 10 of the AI guide.
- Character looks and wardrobe: [`docs/CHARACTER_SHEETS.md`](docs/CHARACTER_SHEETS.md)
- Render checklist and production order (generated with `npm run brief`): [`docs/RENDER_BRIEF.md`](docs/RENDER_BRIEF.md)
- Check your renders' names and sizes: `npm run renders` (add `-- --optimize` to convert them to WebP)
- Story content: `src/data/` (characters, scenes, chapters, asset manifest)
- Engine (pure TypeScript, UI-agnostic): `src/engine/`

**Status:** Phases 1–4 are complete. Chapter One, "Low Tide", is fully playable: about 22–24 minutes,
19 scenes, 30+ choices, four exclusive first-night scenes, a storm, and a cliffhanger. It runs on the
cinematic engine with saves, rollback, relationships and gallery. Placeholder art is procedural until the
100 briefed shots in `docs/RENDER_BRIEF.md` are rendered. Next is Phase 5: audio and polish. Story bible:
[`docs/STORY_CH1.md`](docs/STORY_CH1.md).

**Controls:** Click, Space or Enter to continue · Backspace to go back · A auto · S or hold Ctrl to skip
read text · H or right-click to hide the interface · L or wheel up for history · R for relationships ·
F5 / F9 for quick save / load · Esc for the menu · backtick for the debug panel (dev builds only).

| Main menu | Dialogue | Expressions & relationship notice |
|---|---|---|
| ![Main menu](docs/screenshots/main-menu.png) | ![Dialogue](docs/screenshots/dialogue.png) | ![Expression](docs/screenshots/expression-and-toast.png) |

*Placeholder art is procedural and only previews composition. The target look is photoreal 3D renders (see ART_DIRECTION.md). Renders are drop-in: save an image as `src/assets/shots/<shotId>.webp` and the game shows it, with no code changes.*
