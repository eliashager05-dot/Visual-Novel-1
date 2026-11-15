# Generating the Images with AI on Your PC

This route makes the game's images with a free image generator running on your own graphics card. The
game builds the prompt for every image from the story, sends it to the generator, and puts the result
where the game will show it. You choose between versions on a review page.

**What to expect.** Individual images can look realistic. The hard part is keeping each character
looking like the same person across a hundred images: expect to generate several versions of each and
reject many. Two people in one image is harder than one. Section 7 covers what helps.

**What was tested.** Everything on the game's side was tested against a stand-in for the generator:
prompts, requests, waiting, downloading, sizing, file names, the review page, and error messages. It has
not been run against a real ComfyUI, because that needs a graphics card. If the first real run fails, send
me the error text.

---

## 1. What you need

- **Graphics card:** your RTX 2080 (8 GB) is enough for the model recommended below.
- **Disk:** about 15 GB free, for the generator and one model.
- **Time:** generation speed depends on the card and settings. Measure it on your first run; the
  generator prints seconds per image and a time remaining.

---

## 2. Install the generator (ComfyUI)

1. **Update your NVIDIA driver** with the NVIDIA app or from nvidia.com (Game Ready or Studio, either
   works). Current ComfyUI builds need a recent driver; an old one is the most common reason it will not
   start.
2. Open the official ComfyUI repository on GitHub (`Comfy-Org/ComfyUI`) and go to **Releases**.
3. Under the newest release, download the **Windows portable package for NVIDIA**. It is a `.7z` file of
   a few GB, named like `ComfyUI_windows_portable_nvidia.7z`. Your RTX 2080 uses this standard build.
   (A separate build marked `cu126` exists for GTX 10-series and older cards; you do not need it.)
4. If Windows blocks the file: right-click it → **Properties** → tick **Unblock** → OK.
5. Extract it with 7-Zip (or Windows 11's built-in **Extract All**) to a short path with no spaces, for
   example `D:\AI\`. Avoid OneDrive, Desktop and Program Files.

You now have a folder like `D:\AI\ComfyUI_windows_portable\`. It contains its own Python, so nothing else
needs installing. The real program lives in the **`ComfyUI`** folder inside it.

**Desktop app instead?** ComfyUI also has an installer-based desktop app. It works too, but it normally
listens on port **8000** rather than 8188. If you use it, set `"comfyUrl": "http://127.0.0.1:8000"` in
`ai-render.config.json` (section 8).

## 3. Download a model

The model is the file that knows how to draw. Start with **Stable Diffusion XL base 1.0**:

1. On Hugging Face, open `stabilityai/stable-diffusion-xl-base-1.0` → **Files and versions**.
2. Download `sd_xl_base_1.0.safetensors` (about 7 GB). Only that file; ignore the rest.
3. Move it to:
   `D:\AI\ComfyUI_windows_portable\ComfyUI\models\checkpoints\`
   (note the `ComfyUI` folder inside the portable folder).

**Before you sell a game made with any model, read that model's licence page** and confirm it allows
commercial use of the images. Community "photorealistic" versions of this model often look better for
people, but each has its own licence, so check before you rely on one.

## 4. Start it and test it

1. Double-click **`run_nvidia_gpu.bat`** in `ComfyUI_windows_portable`. A black window opens. The first
   start takes a few minutes.
2. When it prints `To see the GUI go to: http://127.0.0.1:8188`, it is ready. Your browser may open that
   page by itself.
3. **Test it once by hand.** On that page, the default workflow is already loaded. In the
   *Load Checkpoint* box, pick `sd_xl_base_1.0.safetensors`, then press **Run** (or **Queue**). An image of
   the default prompt should appear after a short wait. If it does, the generator works.
4. **Leave the black window open** while you generate. Closing it stops ComfyUI.

The game's commands talk to that window directly; you do not need the browser page for them.

---

## 5. First run: the character portraits

Do this before any scene. It shows you what the generator makes of each character's description, and it
gives you a face to compare everything else against.

In a terminal in the game folder:

```powershell
npm.cmd run generate -- --refs --variants 4
```

This makes four portraits of each of the six characters. Then open the review page:

```powershell
npm.cmd run studio
```

and go to **http://127.0.0.1:5180**. Scroll to "Character references" at the bottom.

- If a character looks right, click **Use this** on the best one. It is saved in `art-refs\`.
- If a character looks wrong (too young, wrong hair, wrong build), **send me a screenshot**. I will adjust
  that character's description in the game data, which changes every prompt that includes them.
- **Every character must look clearly adult.** If one does not, do not use it; tell me.

---

## 6. Generating the game's images

Work one milestone at a time. Start with the opening (16 images and 1 illustration).

**On the review page** (`npm.cmd run studio`):

1. Choose **Versions per image** at the top (2 is a good start).
2. Click **Generate missing: 1. The opening**. The page shows which image is being made and how many
   are waiting.
3. For each image you now see its versions side by side. Click one to enlarge it.
   - **Use this** makes it the image the game shows, and marks the image as confirmed.
   - **Keep this one** confirms the version that was installed automatically.
   - **Generate 2 more** makes new versions with new random seeds.
   - **Add to the prompt** lets you steer one image: type, for example, `she looks out to sea, heavier
     fog`, click **Save note**, then generate more.
4. The filter at the top shows what is still **to do**: everything you have not confirmed.

The first version of every image goes into the game straight away, so you can play while you are still
choosing.

**Or from the terminal**, without the page:

```powershell
npm.cmd run generate -- --milestone 1
npm.cmd run generate -- --scene c1_ferry --variants 3
npm.cmd run generate -- --shots c1_ferry_player_rail,c1_harbour_sign
npm.cmd run generate -- --milestone 1 --dry-run     # print the prompts only
```

**When a milestone is confirmed**, shrink the files for the game and update the checklist:

```powershell
npm.cmd run renders -- --optimize
npm.cmd run brief
```

Every version you generated is kept in `render-candidates\` until you delete that folder.

---

## 7. Keeping characters consistent

In rough order of effort:

1. **Choose against the portrait.** Keep the character's chosen portrait open and only confirm versions
   that look like the same person. This alone gets you a long way for close-ups.
2. **Generate more versions** of the shots that drift. It is cheap.
3. **Steer with a note** when one detail keeps going wrong ("hair pinned up", "no hat").
4. **Prefer single-person framing when a two-person image keeps failing.** Tell me which shots fail and I
   will re-stage them as a close-up and its reverse.
5. **A per-character add-on model (a "LoRA").** This is the real fix for consistency. You train a small
   file per character from 15–30 good images of them, and the generator then draws that exact person. Put
   the file in `ComfyUI\models\loras\` and name it in the settings (section 8). Training is a project of
   its own; ask me for a guide once the portraits are right.
6. **Your own workflow.** If you build a ComfyUI workflow that uses a reference face, export it in API
   format and point `workflow` at it (section 8).

Things image models are bad at, so you know it is not you:

- **Lettering.** Signs and clocks come out as gibberish. Either pick a version where it is unreadable or
  fix it in an image editor. No image may show a name for the protagonist.
- **Hands**, and **exact counts** of people.
- **The same room twice.** The lobby will look a little different in every image. Wide shots drift most.

---

## 8. Settings

The first run creates `ai-render.config.json` in the game folder. Edit it in any text editor.

| Setting | Default | What it does |
|---|---|---|
| `comfyUrl` | `http://127.0.0.1:8188` | Where the generator is listening. |
| `checkpoint` | empty | The model file name. Leave empty if only one model is installed. |
| `steps` | 30 | More steps: slower, slightly cleaner. 25–35 is the useful range. |
| `cfg` | 6 | How strictly the prompt is followed. 5–7 looks most natural. |
| `sampler`, `scheduler` | `dpmpp_2m`, `karras` | The drawing method. Leave unless you know why. |
| `width`, `height` | 1344 × 768 | The size the model draws at. The result is resized to 1920×1080. |
| `hires` | false | A second pass at full size: sharper, but slower and heavier on video memory. Try it once everything else works. |
| `style` | empty | Replaces the style wording at the start of every prompt. |
| `negative` | empty | Extra things to avoid, added to the built-in list. |
| `loras` | `{}` | Per-character add-on models, for example `{ "noor": { "file": "noor.safetensors", "strength": 0.8 } }`. |
| `workflow` | empty | Path to your own workflow in API format. Placeholders: `%POSITIVE%`, `%NEGATIVE%`, `%CHECKPOINT%` inside strings, and `"%SEED%"`, `"%WIDTH%"`, `"%HEIGHT%"`, `"%STEPS%"`, `"%CFG%"` as whole values. |

The built-in list of things to avoid always includes minors, nudity, non-photographic styles, text and
watermarks. `negative` adds to it; it cannot remove from it.

---

## 9. When something goes wrong

| Message or symptom | What to do |
|---|---|
| `Cannot reach ComfyUI` | The generator is not running. Start `run_nvidia_gpu.bat` and wait for the `http://127.0.0.1:8188` line. With the desktop app, set `comfyUrl` to port 8000. |
| The black window closes straight away, or mentions CUDA or the driver | Update the NVIDIA driver and restart the PC. If it still fails, re-download the `.7z` (a broken download is the next most common cause). |
| `ComfyUI has no model installed` | The model file is not in `ComfyUI_windows_portable\ComfyUI\models\checkpoints\`, or ComfyUI was started before you put it there. Restart it. |
| `ComfyUI has several models` | Put the file name you want in `checkpoint`. |
| `CUDA out of memory` | Close other programs that use the graphics card (games, video). Set `hires` to false. If it persists, lower the size to 1216 × 704. |
| Everything is very slow | Check the black window: if it says it is using the CPU, the NVIDIA version was not installed. |
| People look drawn or plastic | Try a photorealistic version of the model (check its licence), or tell me and I will adjust the style wording. |
| Wrong number of people, swapped hair colours | Generate more versions; add a note; or ask me to re-stage the shot. |
| The game still shows the placeholder | Run `npm.cmd run renders` to check the file is in the right place with the right name. |

---

## 10. Rules

- Every person in every image is an adult and must look like one.
- Do not use the name or likeness of a real person in a prompt or a note.
- Do not imitate characters from another game.
- Chapter One has no explicit scenes, so the built-in settings keep everyone clothed.
- Read the licence of every model and add-on you use before you publish.

---

## 11. What to send me

I cannot see your results. After the portraits, and again after the first scene, send screenshots of the
review page. From those I can tune the character descriptions, the style wording, the framing words and
the things-to-avoid list, and each change improves every image generated afterwards.
