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

| Mode | Use | Asset |
|---|---|---|
| **Shot** (primary) | Almost every dialogue beat. A full-frame image with characters, camera and lighting baked in. A new shot whenever the expression, framing or action meaningfully changes. | `public/assets/shots/<id>.webp`, 1920×1080 |
| **Sprite** (secondary) | Group scenes or long conversations where re-rendering every line is too costly. A transparent character over a background. | `public/assets/characters/<id>/<pose>/<expression>.webp` |
| **Background** | Establishing shots and sprite scenes. | `public/assets/backgrounds/<id>.webp` |
| **CG / illustration** | Key moments, unlocked in the gallery. | `public/assets/cg/<id>.webp` |

Writers place shots in the script with `shot('id')`. Each shot is defined in `src/data/shots.ts` with a
camera, the characters, their expressions and a written brief. `npm run brief` turns that into
[`RENDER_BRIEF.md`](RENDER_BRIEF.md), the artist's to-do list with the status of every render.

**Delivering a render:** export the file and set `src` on the shot, or set `basePath` for a character's
sprites. No story file changes.

---

## 2. Recommended production pipeline

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
