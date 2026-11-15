# Making the Renders in DAZ Studio

A start-to-finish guide for producing this game's images yourself. It assumes you have never used DAZ
Studio. Menu names are from DAZ Studio 4; newer versions may place a few things slightly differently.

Companion documents:
- [RENDER_BRIEF.md](RENDER_BRIEF.md): what to render, in which order, with the status of each image.
- [CHARACTER_SHEETS.md](CHARACTER_SHEETS.md): exactly what each character looks like and wears.
- [ART_DIRECTION.md](ART_DIRECTION.md): the style rules.

---

## 1. What you need

| | Requirement | Why |
|---|---|---|
| **Graphics card** | NVIDIA RTX with at least 8 GB of video memory; 12 GB or more is comfortable | DAZ's realistic renderer (Iray) runs on NVIDIA cards. On other cards it falls back to the processor and one image can take an hour or more. |
| **Memory** | 16 GB of RAM minimum, 32 GB recommended | Characters and sets are large. |
| **Disk** | 50–100 GB free | The content library grows quickly. |
| **Software** | DAZ Studio (free) | |

To check your card: Task Manager → Performance → GPU. The name is at the top right, the memory under
"Dedicated GPU memory".

**An RTX 2080 (8 GB) is enough.** It sits at the minimum, so read section 5 on working within 8 GB before
your first group shot.

**If you do not have an NVIDIA card,** tell me before buying anything. The realistic route is then to
export the characters to Blender and render with Cycles, which supports other cards; the rest of this
guide still applies.

### What it costs

DAZ Studio and the base Genesis 9 figure are free. To reach the quality of your reference, expect to buy
some content from the DAZ store: realistic skins, hair, clothing and a few interiors. Items are typically
priced like a paperback each and are often heavily discounted. Five characters and fifteen sets is a
budget of a few hundred, spread over the project, and you can start with one character and one set to see
whether you like the work before spending more. There are also free items on the DAZ store and community
sites.

**Licence:** the standard DAZ licence lets you sell 2D images you render, which is all this game ships.
It does not let you distribute the 3D models themselves. Read the licence on each item you buy, and the
current DAZ terms, before you publish.

---

## 2. Install

1. Create a free account at daz3d.com.
2. Download and run **Daz Install Manager**. Sign in.
3. In the Install Manager, install **DAZ Studio** and **Genesis 9 Starter Essentials** (and the default
   lights and shaders it lists as required).
4. Start DAZ Studio. If it asks which layout to use, pick the default.

Then, once: **Render Settings** pane → **Advanced** tab → **Hardware**. Tick your NVIDIA card under
*Photoreal Devices*. Untick the CPU unless your card is weak; mixing both usually slows things down.

---

## 3. Set up a project folder (once)

Keep the 3D work **outside** the game folder. Create this next to it:

```
Halcyon-DAZ/
  characters/    one saved file per character (the locked masters)
  outfits/       one wearable preset per outfit
  expressions/   nine face presets per character
  sets/          one scene file per set, with its lighting states
  shots/         one scene file per shot, named after the shot id
  renders/       2560×1440 originals, named after the shot id
```

The game only ever receives finished images, copied into `src/assets/shots/`.

---

## 4. Render settings for this project (once)

Open the **Render Settings** pane and set:

| Section | Setting | Value |
|---|---|---|
| General | Engine | NVIDIA Iray |
| General | Dimension | 2560 × 1440 (16:9). Render large, shrink later; it hides noise. |
| Progressive Rendering | Max Samples | 3000 to start |
| Progressive Rendering | Max Time | 1200 seconds (20 minutes) as a ceiling |
| Filtering | Post Denoiser Available / Enable | On, start at iteration 200 or so |
| Tone Mapping | — | Leave at default, then adjust *Exposure Value* per set if images are too dark or bright |
| Environment | Environment Mode | *Dome and Scene* outdoors, *Scene Only* for interiors lit by their own lamps |

Then **File → Save As → Render Settings Preset** and call it `Halcyon`. Load it at the start of every
session so every image is rendered the same way.

---

## 5. Working within 8 GB of video memory

Iray is fast only while the whole scene fits in the graphics card's memory. If it does not fit, DAZ
silently switches to the processor and a 10-minute render becomes an hour. With 8 GB:

- **One or two characters per shot is comfortable.** Most shots in the brief are exactly that.
- **Group shots** (the dinner table, the candle-lit lobby) are the risk. For those:
  - give background characters smaller textures, since they are out of focus anyway;
  - or render the wide shot with fewer people in frame and let the close-ups carry the scene.
- **Hide everything the camera cannot see** before rendering: rooms behind the camera, furniture out of
  frame, the back half of a set. In the *Scene* pane, click the eye icon next to an item.
- **Lower texture memory:** *Render Settings → Advanced → Texture Compression*. Lowering the thresholds
  makes DAZ compress more textures, which saves memory at a small cost in fine detail.
- **Close the Iray preview** in the viewport before a final render, and switch the viewport back to
  *Texture Shaded*. The preview holds memory of its own.
- **Restart DAZ Studio** if renders that used to be quick turn slow: memory is not always released
  between renders.
- **How to tell it happened:** the render window's progress text stops mentioning your graphics card and
  the image resolves very slowly. Cancel, simplify the scene, and start again.

---

## 6. Build your first character

Start with **the protagonist**. He is in more shots than anyone else, and the first image of the game
is of him, so he is worth the most care. Then build **Noor**, the first person he meets. Open the
character's section in [CHARACTER_SHEETS.md](CHARACTER_SHEETS.md) and keep it beside you. The steps
below use Noor as the example; they are the same for everyone.

For the protagonist, start from the Genesis 9 base with a masculine shape. Players name him themselves,
so nothing in any render may show a name for him.

1. **Load the base figure.** *Smart Content* pane → Figures → Genesis 9. Double-click it.
2. **Shape.** With the figure selected, open the *Shaping* pane. Adjust the face and body dials toward
   the sheet: face shape, cheeks, brows, mouth, height, build. Small values look more real than large
   ones. Characters must read clearly as adults.
3. **Skin.** Apply a realistic skin (a *Material Preset*) that matches the sheet's tone. This matters more
   than any other choice: a good skin has pores, slight unevenness and visible texture. Avoid skins that
   look airbrushed.
4. **Eyes.** Set the iris colour from the sheet. Check that the eyes have a moist highlight when lit.
5. **Hair.** Add a hair that matches the sheet's style and set its colour. Prefer strand-based or
   high-detail hair; flat "helmet" hair is the fastest way to lose realism.
6. **Signature details.** Add every item under "Always visible when in frame" on her sheet: for Noor, the
   single gold hoop in the left ear and the ink smudges on her fingers.
7. **Save the master.** *File → Save As → Scene Subset*, with the figure and hair selected, into
   `characters/noor.duf`. From now on you only ever **load** this file. You never edit it.
8. **Make the reference renders** listed at the top of the character sheets (face front, three-quarter,
   profile, body front and back) under plain, even light. Keep them open whenever you work on her.

### Outfits

For each row in her wardrobe table: dress the figure, fix any clipping, then *File → Save As → Wearable(s)
Preset* into `outfits/`, named after the outfit (for example `noor_ferry`). If clothing looks stiff or
pokes through the body, run the cloth simulation (*Simulation Settings* pane → *Simulate*) or add a
smoothing modifier to the garment.

### Expressions

The game uses nine expressions: **neutral, happy, sad, angry, surprised, embarrassed, flirty, worried,
laughing**. For each one:

1. Select the figure. In the *Parameters* pane open *Pose Controls → Head → Expressions*.
2. Dial in the expression. Read the "Acting" row on the character sheet first: Vera's smile is one corner
   of her mouth; Noor's is her whole face. Keep dials modest; real faces are asymmetric and understated.
3. *File → Save As → Pose Preset*, ticking only the head and face, into `expressions/noor_happy.duf`.

Doing this once per character is what keeps "Noor, happy" identical in every scene.

---

## 7. Build your first set

The first set in the production order is the **car ferry deck**; its description and lighting are under
"Sets and lighting" in [RENDER_BRIEF.md](RENDER_BRIEF.md).

1. Load an environment that fits the description, or assemble one from props.
2. **Light it from what would really be there.** For the ferry at dusk: an environment (dome) image of an
   evening sky for the ambient light, plus one warm, low spotlight from screen right standing in for the
   sun. For interiors: put the light where the lamps and windows are, not where it is convenient.
3. Check the light with the viewport set to **NVIDIA Iray** preview (the sphere icon at the top right of
   the viewport). It is slow but shows the real result.
4. *File → Save As → Scene* into `sets/ferry.duf`.
5. If the same set appears in several lighting states (the lobby has three), save the lights for each
   state with *File → Save As → Light(s) Preset*.

---

## 8. Render your first shot

Pick the first shot under "Shots" in the brief: `c1_ferry_establish`, the empty deck. Then the first
with a character: `c1_ferry_player_rail`, the protagonist alone at the rail. The steps below use the
first two-person shot, `c1_ferry_noor_call`, as the example.

1. **Open the set** (`sets/ferry.duf`).
2. **Bring in the character:** *File → Merge*, choose `characters/noor.duf`. Apply the outfit the shot
   lists (`noor_ferry`).
3. **Pose her** from the brief's description. Start from a ready-made pose close to it and adjust in the
   *Posing* pane. Give the body some asymmetry: weight on one leg, a tilted head, hands doing something.
4. **Apply the expression** the shot lists, from her saved presets.
5. **Create the camera:** *Create → New Camera*, and name it after the shot. Set its *Focal Length* from
   the framing:

   | Framing in the brief | Focal length | What is in frame |
   |---|---|---|
   | wide | 24–35 mm | The room or place; people small |
   | medium | 50 mm | Waist or knees up |
   | close | 85 mm | Head and shoulders |
   | extreme close | 100 mm or more | The face fills the frame |
   | over shoulder | 50 mm | Past the protagonist's shoulder (soft, in the foreground) to the person he is facing (sharp) |

6. **Depth of field:** in the camera's parameters turn *Depth of Field* on, set the *Focal Distance* to
   the character's eyes, and lower the *F/Stop* until the background softens. Close-ups want a soft
   background; wide shots want everything sharp.
7. **Compose for the subtitles.** The game draws the name and dialogue over the **bottom quarter** of the
   image. Keep faces and anything important above that band, and avoid busy detail inside it.
8. **Render:** `Ctrl+R`. When it finishes, save the image as PNG into `renders/`, named **exactly** after
   the shot id: `c1_ferry_noor_call.png`.
9. *File → Save As → Scene* into `shots/c1_ferry_noor_call.duf`, so you can re-render it later.

---

## 9. Put it in the game

1. Copy the PNG into the game's `src/assets/shots/` folder.
2. In a terminal in the game folder, check your files:
   ```powershell
   npm.cmd run renders
   ```
   It reports misspelled names (with the closest correct name), wrong shapes, and how many are done.
3. Shrink them for the game. This converts to 1920×1080 WebP and moves your originals to a
   `render-masters` folder so nothing is lost:
   ```powershell
   npm.cmd run renders -- --optimize
   ```
4. Start the game (`npm.cmd run dev`) and play to that line. The render replaces the placeholder.
5. Update the checklist: `npm.cmd run brief`.

Illustrations work the same way, in `src/assets/cg/`.

---

## 10. How to work through the chapter

Follow the **Production order** table in the brief, one row per sitting. Every shot in a row shares a set,
its lighting and the characters' outfits, so you set those up once and then only move the camera, the pose
and the expression.

The **Milestones** table at the top of [RENDER_BRIEF.md](RENDER_BRIEF.md) groups the rows into five
stages and lists, for each, which characters and sets you need to build first and how many images it
contains. It is regenerated from the story, so it is always current.

Finish milestone 1 completely before starting milestone 2. It needs three characters (the protagonist,
Noor and Vera) and two sets, gives you a playable opening that looks like the finished game, and will
tell you how long the rest will take.

For conversations, alternate the camera the way films do: a shot of one person, then the reverse shot of
the other, with an occasional two-shot to show where they are standing. The brief is already written
that way.

---

## 11. Consistency checklist

Before saving any render, check it against the character's reference renders:

- Same face shape, eye colour, skin tone and hair as the reference?
- Every signature detail present (the protagonist's stubble and, outdoors on day one, his headphones;
  Vera's eyebrow scar; Noor's single earring; Sienna's bracelet; June's watch; Bram's burn scars)?
- The outfit this scene calls for, and no other?
- Noor's orange scarf: on for the ferry, dinner and bar; **gone** from the piano scene onward.
- Expression in character? (Check the "Acting" row.)
- Does anyone look under twenty-one? If so, fix the face and proportions before continuing.
- Is the bottom quarter of the frame calm enough for text?

---

## 12. When something looks wrong

| Problem | Likely cause and fix |
|---|---|
| A render takes an hour | The scene no longer fits in the card's memory, so DAZ switched to the processor. Hide or delete everything the camera cannot see, use one or two characters per shot, and reduce texture sizes on background objects. |
| Grainy image | Too few samples, or too little light. Raise *Max Samples*, keep the denoiser on, and add light rather than raising exposure. Interiors lit only by small lamps are the slowest to clean up. |
| Skin looks like plastic | The skin texture is too smooth or the light is flat. Use a more detailed skin, and light from the side so pores and contours show. |
| Eyes look dead | No highlight. Make sure a light source is in front of and slightly above the face. |
| Hair looks like a helmet | Use a strand-based or higher-detail hair, and light it from behind to separate it from the background. |
| Clothes cut through the body | Simulate the cloth, add a smoothing modifier, or adjust the pose. |
| Character looks pasted in | The character is lit differently from the set. Light both from the same sources, and make sure they cast a shadow on the floor. |
| Too dark or too bright | Adjust *Tone Mapping → Exposure Value* a little, or change the lights. Save the corrected lighting back into the set file. |
| The game shows the placeholder, not my render | The file name does not match the shot id, or it is in the wrong folder. Run `npm.cmd run renders`. |

---

## 13. When you have your first render

Send me a screenshot of it in the game. I can then adjust the subtitle size and position, the framing
guidance and the brief to fit how your renders actually look.
