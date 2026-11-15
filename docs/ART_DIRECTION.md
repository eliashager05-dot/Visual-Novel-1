# Art Direction: Realistic 3D

**Target look:** photoreal, cinematic 3D renders in the style of modern rendered visual novels. That means
natural skin with subsurface scattering, individually rendered hair, motivated practical lighting, a
shallow depth of field, and film-like framing. The images carry the story and the UI stays out of the way:
centred subtitles over the render, with no heavy text box.

The game code is finished for this style. It shows whatever renders are delivered and falls back to
procedural placeholders until then. The placeholders in the repository are **layout previews only**. They
show composition, framing and expression, never the final look.

---

## 1. How the game presents renders

| Mode | Use | Save the file as |
|---|---|---|
| **Shot** (primary) | Almost every dialogue beat. A full-frame image with characters, camera and lighting baked in. A new shot whenever the expression, framing or action meaningfully changes. | `src/assets/shots/<shotId>.webp`, 1920×1080 |
| **Background** | Establishing views and any scene staged with sprites. | `src/assets/backgrounds/<backgroundId>.webp` |
| **CG / illustration** | Key moments, unlocked in the gallery. | `src/assets/cg/<cgId>.webp` |
| **Sprite** (secondary) | Group scenes where re-rendering every line is too costly. A transparent character over a background. | `src/assets/characters/<id>/<pose>/<expression>.webp` |

**Delivering a render is drop-in.** Save the image under the id's name in the folder above (`.webp`,
`.avif`, `.jpg` or `.png`). The running game reloads and shows it; `npm run brief` then marks it as
rendered. No code or story file changes.

Writers place shots in the script with `shot('id')`. Each shot is defined in `src/data/shots/` with a
camera, the characters, their expressions and a written brief. `npm run brief` turns that into
[`RENDER_BRIEF.md`](RENDER_BRIEF.md), the artist's to-do list.

The interface is built for full-frame renders: outlined subtitles with a coloured name, thoughts in
parentheses, icon controls in the corners, and choices stacked on the right so they never cover a face.

---

## 2. Recommended production pipeline

### Which technology, and why

| Approach | Visual ceiling | Fit for this game | Verdict |
|---|---|---|---|
| **Pre-rendered stills from DAZ Studio (Iray)** | Photoreal skin, hair, eyes and cloth; this is the approach rendered visual novels of this kind use | Largest library of realistic adult figures, hair, clothing and interiors; rendered images may be sold | **Recommended** |
| **DAZ figures rendered in Blender (Cycles)** | Same or higher, with better compositing and lighting control | More setup per character (import, shader conversion) | Good second step once the DAZ workflow is running |
| **Unreal Engine + MetaHuman, rendered to stills** | Excellent faces in real time | Smaller wardrobe and hair range; check the MetaHuman licence for your content before committing | Viable alternative for faces; weaker for variety |
| **Real-time 3D inside the game** (Unreal or WebGL) | High in a native Unreal build, low in a browser | Means rebuilding the game as a native 3D application, with rigging, animation and large downloads | Not recommended |
| **AI-generated images** | Can look photoreal per image | Keeping one face, body and outfit identical across hundreds of images is the hard part | Only with a strict per-character model and manual QA |
| **Drawn, CSS or SVG characters** | Stylised only | Cannot reach this standard | Placeholders only, never final art |

The game engine is deliberately separate from how images are made: it displays 1920×1080 images. That
keeps performance trivial, at any render quality, and lets the art pipeline change without touching code.

### What it takes

- **Hardware:** an NVIDIA RTX graphics card with at least 8 GB of memory (12 GB or more is comfortable).
  Iray renders on the GPU; on a CPU alone, one image can take an hour or more.
- **Time per image:** roughly 5–20 minutes of render time for a lit interior with one or two characters,
  plus the time to pose it. Budget 20–40 finished images per working day once characters and sets exist.
- **Before the first scene:** build and approve each character (about a day each), and assemble each
  location (half a day to a day each). Chapter One uses 5 characters and about 12 locations.
- **Chapter One as currently briefed:** 89 shots and 7 illustrations. To match the benchmark's density of
  roughly one image per line or two, the shot list would grow to about 250–450.

### First render, step by step

1. Install DAZ Studio (free) and the Genesis 9 starter content.
2. Build **one** character from her description in `RENDER_BRIEF.md` (character reference sheets). Save
   her as a scene subset and never edit that file again.
3. Save the nine expressions as pose presets for her.
4. Load one location, light it from its real light sources, and save the lighting as a preset.
5. Pick a shot from `RENDER_BRIEF.md`. Set the camera to the listed framing and lens, pose from the brief.
6. Render with Iray at 2560×1440 with the denoiser on. Downscale to 1920×1080 and export as WebP.
7. Save it as `src/assets/shots/<shotId>.webp`. Start the game and play to that line.

### Tools
- **DAZ Studio + Iray** is the de-facto standard for this genre. It has realistic figures (Genesis 8/9),
  morph-based faces, strand-based hair and a huge clothing and environment library. Licensing: rendered
  images may be used commercially, but raw 3D assets may not be redistributed. Check each product's
  licence. Only rendered images ship with the game.
- **Blender + Cycles** is an alternative that's fully owned. Characters come from DAZ (via the Diffeomorphic
  plugin) or Character Creator. Its compositor is better and it has no licence ambiguity for scenes.
- A denoiser (Iray's built-in or Intel OIDN) and light post-processing (colour grade, subtle bloom, film
  grain) in a consistent preset.

### Character consistency (the most important rule)
1. **One locked master file per character**: figure, face morph values, skin, eyes, hair, body. It's
   version-controlled outside this repo and never edited per scene.
2. **A reference sheet before any scene work**: front, three-quarter and profile head renders, plus a
   full-body turnaround under neutral studio light. Approve it once and compare every render against it.
3. **An expression library** saved as presets (`neutral`, `happy`, `sad`, `angry`, `surprised`,
   `embarrassed`, `flirty`, `worried`, `laughing`), so "happy" is the same face everywhere.
4. **Outfit presets** per character and per chapter, so continuity holds within a day of story time.
5. **Ages** match the character bible. Every character is 21+ and should read clearly as an adult.

### Lighting and camera
- Light every shot from a **motivated source**: a window, a lamp, the sunset, a bar's backlights. Warm
  practical key light with a cooler fill is the house look.
- **Lens language:** 24–35 mm for establishing and wide shots, 50 mm for medium shots and two-shots, 85 mm
  for close-ups. Use the shot's `camera` field to pick.
- **Shallow depth of field** on close-ups (f/2–f/2.8 equivalent). Eyes in perfect focus.
- **Two-character dialogue:** shot/reverse-shot or an over-the-shoulder pair. Keep the 180° rule.
- **Keep the lower ~22% of the frame calm.** Subtitles sit there, so avoid putting faces or important
  detail in that band.

### Output specs
- 1920×1080, rendered at 2560×1440 or higher and downscaled (archive the master).
- WebP at quality 85 (or AVIF). Target 200–450 KB per shot.
- Sprites: transparent WebP, 1440 px tall, feet at the bottom edge, consistent scale across characters.
- Name files exactly after their ids (see `RENDER_BRIEF.md`).

### Volume estimate (Chapter 1)
A 20–30 minute chapter in this style typically needs **250–450 shots** (one render per 1–3 lines) plus
5–10 illustrations. Plan character setup first, then render scene by scene.

---

## 3. AI-assisted alternative (with caveats)

Image models (e.g. Stable Diffusion/Flux with per-character LoRAs, ControlNet for pose and composition)
can produce a realistic look faster. Keeping faces, bodies, outfits and locations consistent across
hundreds of images is significantly harder than with 3D, though. Expect a manual QA pass on every image.
Check the model's licence for commercial use, keep the 21+ requirement visually unambiguous, and never
train on or imitate a real person's likeness or an existing game's characters. The shot briefs in
`RENDER_BRIEF.md` work equally well as prompts.

---

## 4. What not to do
- Don't mix art styles or sources for the same character.
- Don't use stock photos or images from other games, not even temporarily.
- Don't re-pose a character by editing their face morphs per shot. Use the saved expression presets.
- Don't bake subtitle-like text or UI into renders.
