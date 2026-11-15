# Halcyon — Architecture & Roadmap

Working title: **Halcyon**. An original, choice-driven 3D-rendered visual novel for adults.
Every character is 21 or older, and the content validator enforces that at test time.

---

## 1. Premise (summary)

The player (default name *Rowan*, renameable) is a sound engineer whose studio in the city has just closed.
A great-aunt they met once as a child, **Margit Halloran**, has been declared presumed dead after her boat
was found empty off Halcyon Point. She left the player **51%** of the Halcyon, a faded 1920s seaside hotel
on a small northern island. The other **49%** went to the woman who runs it.

The player arrives for one summer to decide whether to sell. Four central threads run through the story:

| Thread | Question |
|---|---|
| The hotel | Keep it, sell it to the Aldane Group, or find a third option? |
| Margit | Did she really drown? What was she doing in her last weeks? |
| The cove | Why is a resort developer so interested in one small, strange bay? |
| The people | Who do you trust, and who do you let close? |

### Major cast

| | Age | Role | Core tension |
|---|---|---|---|
| **Vera Lindqvist** | 29 | Hotel manager, owns the other 49% | Control vs. partnership. Hiding Margit's second set of books. |
| **Noor Haddad** | 26 | Bartender and songwriter | Performance vs. honesty. Saw Margit the night she vanished. |
| **Dr. June Castell** | 31 | Marine ecologist, long-term guest | Observation vs. participation. Secretly funded by Margit. |
| **Sienna Marlowe** | 33 | Acquisitions lead, Aldane Group | Transaction vs. loyalty. Grew up on the island and owes Margit a debt she never knew about. |
| Bram Okafor | 61 | Cook (supporting) | The island's memory. |

The full writer's bibles live in `src/data/characters/*.ts`. Fields such as `arcNotes` are for writers
only; the UI never renders them.

---

## 2. Architecture

```
┌────────────────────────── Content (pure data) ──────────────────────────┐
│ data/characters  data/scenes  data/story/chapters  data/assets (manifest) │
│              written with data/story/dsl.ts helpers (or raw JSON)         │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ GameContent
┌───────────────────────────────▼─────────────────────────────────────────┐
│ Engine (pure TypeScript, no React, no DOM; fully unit-tested)             │
│  sceneCompiler → flattens nested steps into a linear instruction list     │
│  sceneManager  → caches compiled scenes, resolves cross-scene jumps       │
│  dialogueEngine→ interpreter: (state, input) → (new state, events)        │
│  choiceEngine · conditions · effects · relationshipEngine · text          │
│  validator     → static checks: references, ages, fall-through, reach     │
│  storyWalker   → plays every branch automatically (CI "test all branches")│
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ GameState + EngineEvent[]
┌───────────────────────────────▼─────────────────────────────────────────┐
│ Store (Zustand)                                                           │
│  gameStore       → current playthrough; newGame / advance / choose / load │
│  persistentStore → per-player data: read lines, gallery, scenes, endings │
│  (Phase 3) saveManager, settingsStore                                     │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────────┐
│ Presentation (React + Tailwind + Framer Motion)                           │
│  Stage (Background, CharacterRenderer, CG layer, transitions)             │
│  DialogueBox · ChoiceMenu · Menus (Main, Save/Load, Settings, Gallery,    │
│  Relationships, History) · AudioDirector                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Key decisions

**1. Steps compile to a flat program.** Writers author nested structures (`if`/`else`, choice options with
inline branches, labels, jumps). The compiler flattens them into a linear instruction list using
`branchUnless`, `goto` and `jump`. The whole play position is then one serialisable pointer,
`{ scene, index }`, so you can save on any line and restore exactly. Structural errors such as unknown
labels, duplicate choice ids or empty choices are caught at compile time.

**2. The engine is pure and immutable.** `advance`, `choose` and `createNewGame` take a state and return a
*new* state plus a list of `EngineEvent`s (sound effects, music, transitions, unlocks, relationship deltas).
The engine never touches the DOM, timers or storage. This gives us:
- tests without a browser;
- rollback/undo for free (keep previous states);
- an automated walker that plays every branch.

**3. Game state is plain JSON.** It contains no `Set`, `Map` or class instances, so a save file is just
`JSON.stringify(state)`. The stage state (background, sprites, CG, music) is part of it, so loading redraws
the screen exactly. `schemaVersion` is there for save migrations.

**4. Per-save and per-player data are separate.** Read lines (for skip-read), gallery unlocks, replayable
scenes and endings belong to the *player* and persist across new games. Affinity, flags and choices belong
to a *save*.

**5. Choices and options have authored, stable ids.** `choicesMade` records `choiceId → optionId`, and
`C.chose('c1_ferry_paper', 'truth')` references them. Because ids are authored rather than derived from
array positions, rewording or reordering options never breaks existing saves.

**6. Read-tracking keys are content hashes.** Each line's key is `scene:hash(speaker+text)`, not its index,
so inserting a line doesn't mark other lines unread. Editing a line's text marks it unread, which is the
correct behaviour.

**7. Assets are referenced by logical id only.** Scenes say `bg('harbour_dusk')`. The manifest maps that id
to a file, or to a procedural placeholder if there is no file yet. Swapping placeholders for final renders
never touches story files.

### Content model cheat-sheet

```ts
const vera = speaker('vera');
scene('c1_harbour', 'ch1', 'The Harbour', [
  bg('harbour_dusk'),
  show('vera', { position: 'center', pose: 'arms_crossed', expression: 'neutral' }),
  vera('Vera Lindqvist. I manage the Halcyon.'),
  when(C.flag('told_noor_inheritance'),
    [vera('Noor has already told the harbourmaster who you are.', 'worried')],
    [vera('You will be the most interesting thing to happen here this week.')]),
  choice('c1_vera_first', [
    option('undecided', '"I haven\'t decided anything yet."', { effects: [trust('vera', 4)] }),
    option('sell', '"Honestly? I\'ll probably sell."', {
      effects: [affinity('vera', -3), setFlag('player_leans_sell')],
      steps: [vera('Thank you for not pretending.')],
    }),
    option('dinner', '…', { goto: { label: 'walk' } }),
    option('secret', '…', { condition: C.affinity('vera', { gte: 40 }), showWhenLocked: true }),
  ]),
  label('walk'),
  jump('c1_hotel'),            // or end({ nextChapter: 'ch2' })
]);
```

Conditions: `affinity`, `trust`, `var`, `flag`, `milestone`, `chose`, `visited`, `met`, `all`, `any`, `not`.
Effects: `affinity`, `trust`, `flag`, `var` (`set`/`add`), `milestone`.
Text tokens: `{player}`, `{var:name}`.

The DSL produces plain `Step` objects, so a scene can equally be a `.json` file matching `SceneDefinition`.

### Adding content (no engine changes)
- **Scene:** create `src/data/scenes/chapterN/xx_name.ts` and add it to `src/data/scenes/index.ts`.
- **Character:** create `src/data/characters/name.ts` and add it to `src/data/characters/index.ts`.
- **Chapter:** add an entry to `src/data/story/chapters.ts`.
- **Art or audio:** add an id to `src/data/assets.ts`, with `src` set once the file exists.
- **Character renders:** set `basePath` for the character in `src/data/characterArt.ts` and export files as
  `<basePath>/<pose>/<expression>.webp`. Any file that is missing falls back to the placeholder.
- Run `npm test`. The validator and branch walker will flag mistakes.

---

## 3. Technical challenges and mitigations

| Challenge | Mitigation |
|---|---|
| **Save compatibility as content changes.** Index-based pointers break if a scene is edited under an existing save. | Stable choice ids and hash-based read keys already limit the damage. In Phase 3, saves also record a scene content hash. If it no longer matches on load, the game rewinds to the nearest label or scene start and replays the stage state. `schemaVersion` drives migrations. |
| **Combinatorial explosion of branches.** | Prefer *state-driven* branching (flags and affinity read later) over deeply forked scene trees. Branches reconverge after choices. `storyWalker` runs every path in CI and reports unreachable options. The walker caps at 5,000 paths; later chapters are walked from representative checkpoint states. |
| **Asset weight.** A 3D VN with 9 expressions × 3 poses × 5 characters, plus backgrounds and CGs, runs to hundreds of large images. | AVIF/WebP at 1920×1080, preloading only the *next* scene's manifest, lazy-loaded gallery thumbnails, and a separate low-res tier for mobile. |
| **Sprite and background lighting mismatch.** 3D sprites rendered under neutral light look pasted onto moody backgrounds. | See §5: render sprites per lighting set (day/dusk/night/interior-warm), or use full-scene renders for key beats. The engine supports both. |
| **Character consistency across hundreds of renders.** | One locked master scene file per character, a fixed camera rig, and a naming convention enforced by the manifest validator (Phase 5 adds a missing-file check). |
| **Typewriter text, auto, skip and transitions interacting.** | One central "advance gate" in the UI. Skip and auto are just input sources calling `advance()`. Skip-read checks `persistentStore.isRead(line.key)`. Transitions block input for their duration. |
| **Audio autoplay policies.** | Music starts after the first user gesture (the main menu click). An `AudioDirector` component plays engine `music`/`sfx` events and handles cross-fades. |
| **Adult content and consent.** | Intimate scenes are gated by explicit player choice *and* character trust or affinity. They use fade-to-black and an `intimate` scene tag that can be hidden in the gallery. An age gate sits on first launch. The validator enforces the 21+ age rule. |
| **Performance on long sessions.** | History is capped at 400 entries. State cloning is cheap (a few KB). Compiled scenes are cached. |

---

## 4. Implementation roadmap

### Phase 1: Foundation ✅
- Vite + React 18 + TypeScript (strict) + Tailwind v4 + Zustand + Framer Motion, with Vitest for tests.
- Type system for characters, scenes, conditions, effects, game state, assets and engine events.
- Scene compiler, scene manager and interpreter (`dialogueEngine`): lines, thoughts, narration, title
  cards, backgrounds, sprite show/hide/expression/move, CGs, music/sfx events, effects, conditions,
  labels, local and cross-scene jumps, choices with inline branches, locked options, endings.
- Relationship engine (affinity and trust clamped 0–100, tiers, milestones, progressive profile reveal).
- Content validator and exhaustive story walker.
- Authoring DSL, the four major characters plus Bram, and two opening scenes (18 branch paths).
- A Zustand game store and a persistent store (read lines, gallery, endings).
- A temporary engine harness UI that drives the real engine.

### Phase 2: Visual novel interface ✅
Delivered:
- A fixed 1920×1080 design canvas, uniformly scaled and letterboxed (`GameViewport`).
- An age gate and content notice on first launch.
- A cinematic main menu with name entry and a fullscreen toggle. Continue, Load, Gallery and Settings
  are added in Phase 3, when they actually work.
- The stage: drifting backgrounds that cross-dissolve, sprites with enter/exit, slot movement, speaker
  focus (the others dim) and an idle "breathing" motion, and a full-scene image layer.
- Fade, black and white transitions that hold the old frame until the screen is covered (`useDeferredView`),
  plus a flash.
- Dialogue box: speaker name plate and accent line, a typewriter with punctuation pauses that finishes on
  click, a "next" indicator, serif narration, and an italic "thinking" style for inner thoughts.
- Choice menu: mouse, number keys and arrows + Enter, locked options with hints, timed choices, and the
  previous line kept visible.
- History/backlog, auto mode, skip mode (read text only; stops at unread lines and choices), hide UI,
  and a pause menu.
- Relationship and milestone notices phrased in story terms ("Noor will remember that.").
- An error boundary, plus a dev-only debug panel (backtick) and the `window.__halcyon` store handles.
- Procedural placeholders: deterministic painted backgrounds per id, and a stylised figure per character
  (hair, skin, outfit, height and build locked in `characterArt.ts`) showing all nine expressions and
  pose props. `assetResolver` plus `ImageWithFallback` swap in real renders automatically.

Originally planned scope:
- A cinematic main menu (new game with name entry, continue, load, gallery, settings, quit to title).
- The Stage: layered background, CG and sprite layers with Framer Motion enter/exit, screen transitions
  (fade, dissolve, black, white, flash) driven by engine events.
- A `CharacterRenderer` that resolves `character/pose/expression` through the asset manifest, with a
  fallback chain and consistent procedural placeholders per character.
- A `DialogueBox`: translucent panel, name plate in the character's colour, typewriter text that completes
  on click, a "next" indicator, and a quick menu (history, auto, skip, save, load, settings).
- A `ChoiceMenu` with keyboard navigation (1–9, arrows, Enter) and an optional timer.
- Layout tuned for 1920×1080 that scales to any 16:9 viewport and adapts to portrait later.

### Realistic 3D presentation ✅ (between Phases 2 and 3)
- Full-frame **shots** (`shot('id')`, `src/data/shots.ts`) are the primary presentation, as in rendered 3D
  visual novels. A shot's definition doubles as the render brief.
- A **cinematic subtitle** dialogue style (the default); the panel style is still available in Settings.
- `npm run brief` generates `docs/RENDER_BRIEF.md`. See `docs/ART_DIRECTION.md` for the photoreal pipeline.

### Phase 3: Gameplay systems ✅
Delivered:
- `engine/saveManager.ts`, pure and unit-tested:
  - save records hold the full state, preview metadata, a stage thumbnail descriptor and a scene
    fingerprint;
  - a schema migration path (v1 → v2);
  - after a story update, a save is relocated to the same line or choice by its stable key, or rewound to
    the scene start (and the player is told);
  - corrupt slots are ignored safely.
- 18 manual slots (3 pages), 3 rotating autosaves (on every new scene and after every decision), a quick
  save (F5) and quick load (F9), timestamps, and Continue on the title screen. Overwrite, delete and
  load-over-progress all ask for confirmation.
- Save thumbnails are re-rendered from save data rather than captured, so they automatically show final
  renders once delivered.
- Rollback (Backspace / PageUp / "Back"), up to 80 steps, including back across choices.
- Settings: text speed with a live preview, auto speed, dialogue style, text background, skip unread,
  relationship notices, fullscreen, reset settings, and erase all progress. *Volume sliders arrive with
  audio playback in Phase 5, so no non-functional controls ship now.*
- Relationship menu (R): only characters you've met, tier, affinity and trust out of 100, profile entries
  as they unlock, and milestones reached. Unreached milestones appear only as a count.
- Gallery: illustrations with a full-screen viewer, profiles of characters you've met, and replayable
  scenes. Unlocks persist across playthroughs. Replays are sandboxed: no saves, they stop at the scene
  boundary, and they return to the gallery.

Originally planned scope:
- `saveManager`: 12 manual slots, autosave on scene entry and choice, quicksave/quickload, timestamps,
  scene title, chapter and a thumbnail (a small render of the current stage), versioned with migrations.
  IndexedDB for slots (thumbnails are large) and localStorage for settings.
- Settings: text speed, auto speed, music and SFX volume, fullscreen, skip-unread toggle, dialogue box
  opacity. Persisted.
- History/backlog screen (scrollable, with the choices made).
- Auto mode, skip mode (read-only by default) and rollback by one line (states are immutable).
- Relationship menu: characters revealed so far, tier label, affinity and trust bars, unlocked profile
  entries and milestones. No hidden info is leaked.
- Gallery: CGs, character profiles and a replayable scene list, all unlocked through play.

### Phase 4: Content ✅
Chapter One, "Low Tide", is complete: 20 scenes, 89 briefed shots and 7 illustrations. It takes about
22–24 minutes per playthrough at default text speed (340–390 lines), with 30+ decision points and four
exclusive first-night scenes. See [`STORY_CH1.md`](STORY_CH1.md) for the scene flow, every decision and
its consequences, and the flags that carry into Chapter Two.

Testing: the content test runs 1,200 seeded random playthroughs. It requires zero errors, every option of
every choice to be reachable, every scene to be reached, and every path to fall within the length target.

### Phase 5: Polish
- Audio: music cross-fades, SFX, UI sounds, per-channel volume.
- Animation refinement (sprite breathing idle, subtle camera drift on backgrounds, name-plate transitions).
- An asset preloader and a missing-asset validator.
- Playwright end-to-end tests (new game → choice → save → load → verify).
- Branch QA with the walker, a performance pass, an accessibility pass (focus states, font scaling).

Each phase ends with typecheck, tests, a browser run of the app, and fixes before moving on.

---

## 5. Recommendation: 3D character renders and backgrounds

**Use pre-rendered stills from a 3D package, not real-time 3D in the browser.**
Real-time WebGL characters (three.js) can't match offline-rendered skin, hair and lighting at a reasonable
download size. They also put the project in uncanny-valley territory and multiply engineering cost. Every
commercially successful 3D-rendered VN uses offline renders.

### Toolchain
- **DAZ Studio (Iray)** is the genre standard. It has huge libraries of figures, morphs, hair and clothing
  with redistribution-friendly licences for rendered output. Check each asset's licence: rendered images
  are generally fine, but redistributing raw models is not.
- **Blender (Cycles)** is a fully owned pipeline. It is more work per character but has no licence
  ambiguity and better compositing. Characters can be built in DAZ or Character Creator and exported.

### Two rendering modes (the engine supports both)
1. **Sprite mode**, for everyday dialogue. The character is rendered on a transparent background, full
   body or knees-up, at 1440 px tall, per `pose × expression`, and layered over a background.
   - Render **per lighting set** (`day`, `dusk`, `night`, `interior_warm`) so sprites match backgrounds.
     The manifest key becomes `character/pose/expression@lighting`, and backgrounds declare their
     lighting set. That turns the biggest weakness of 3D sprites into a solved problem.
   - Cost-saving variant: render the body per pose plus a separate *face layer* per expression,
     composited at runtime. This works only if head position is locked per pose. The manifest supports
     an optional `faceLayer` (Phase 2).
2. **Shot (CG) mode**, for key moments. These are full-frame cinematic renders with characters, camera
   angle and lighting baked in: `cg('cg_ferry_noor')`. Use them generously for emotional beats, intimate
   scenes (with fade to black) and reveals. This is where the "premium" look comes from.

### Keeping characters consistent
- One **locked master file** per character: base figure, morph values, skin, hair, eye colour. It is
  version-controlled outside the repo and never edited per shot. Outfits are separate presets.
- A **camera and lighting rig library**: the same focal lengths (e.g. 50 mm dialogue, 85 mm close-up,
  35 mm establishing), the same three-point setups per lighting set.
- An **expression library** saved as pose presets, so "happy" is the same face in every render.
- **File naming** that matches the manifest: `vera/standing/happy@dusk.webp`.

### Formats and budgets
- Backgrounds and CGs: 1920×1080 (with a 2560×1440 master archived), AVIF with WebP fallback, about
  200–400 KB each.
- Sprites: WebP with alpha, 1440 px tall, about 150–250 KB.
- Placeholders until then: procedural gradients and silhouettes generated from the manifest palettes and
  each character's colour. They are consistent and recognisable, never random stock images.
