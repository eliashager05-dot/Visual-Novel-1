# Keeping characters consistent with a LoRA

A **LoRA** is a small add-on model (about 50–100 MB) trained on pictures of one character. Once it is
loaded, the image generator draws that same face in every shot. It is the most reliable way to stop Noor
looking slightly different in every scene.

The render studio does the preparation: you pick the pictures, it writes the training folder with a
caption for every picture and settings made for your RTX 2080. Training itself runs in a separate free
program, **kohya_ss**, on your PC.

Do one character first (whoever appears most) and see whether you like the result before doing the rest.

---

## 1. Pick the pictures

Open the render studio (`Render Studio.bat`) and open **Character consistency (LoRA)** at the top.

You need **at least 10 pictures, about 20 is good**, where the character looks *exactly* right. Two
sources:

- **Pictures you already have.** Under every picture that shows the character **alone** (their portrait
  versions and their solo shots) there is a **+ Training set** button.
- **Variations.** **Make 6 variations** generates new pictures of the character with different angles,
  moods, outfits and places. Click as often as you like; each batch is new.

Then be strict:

- **Only keep a picture if the face is unmistakably them.** One wrong face teaches the LoRA the wrong
  person. Ten perfect pictures beat thirty mixed ones.
- **Variety matters:** close-ups and some waist-up and full-body, different expressions, different
  outfits and light. If every picture is a smiling close-up, the LoRA will only do smiling close-ups.
- Skip pictures with bad hands, blur, heavy shadow across the face, or anyone else in frame.

The count next to each name turns gold at 10 and green at 20.

## 2. Build the training folder

Click **Build training folder**. The studio writes `lora-datasets\<character>\`:

| In the folder | What it is |
|---|---|
| `img\15_hlcnoor woman\` | Your pictures with a `.txt` caption each. The number is how often each picture is repeated per round; it is set from how many pictures you have. |
| `train.toml` | Training settings made for an 8 GB card. |
| `README.txt` | The exact commands for this character. |
| `output\` | Where the finished LoRA appears. Kept when you rebuild. |

**One setting first:** add the full path of your image model to `ai-render.config.json`, then build again:

```json
"trainingCheckpoint": "C:\\ComfyUI_windows_portable\\ComfyUI\\models\\checkpoints\\your-model.safetensors"
```

(Use your real folder and file name; in this file every `\` is written twice.) Or edit the first line of
`train.toml` by hand.

**About the captions:** each caption starts with the **trigger word** (`hlcnoor`, `hlcvera`, …) and then
describes only what changes between pictures: outfit, framing, expression, place, light. The face and hair
are deliberately *not* described, so the LoRA learns them as part of the trigger word. You can open the
`.txt` files and edit them, but you do not need to.

## 3. Install kohya_ss (once)

kohya_ss is a free training program. You need **Python 3.10 or 3.11** and **Git** installed (the same kind
of setup as ComfyUI's manual install). Then, in a terminal:

```
cd C:\
git clone --recursive https://github.com/bmaltais/kohya_ss.git
cd kohya_ss
setup.bat
```

Choose the option to install kohya_ss and accept the defaults. It downloads several GB. Its own README on
GitHub has the current steps if the menu looks different.

## 4. Train

**Close ComfyUI first.** Both need all of the graphics card's memory.

In a terminal:

```
cd C:\kohya_ss
venv\Scripts\activate
cd sd-scripts
accelerate launch sdxl_train_network.py --config_file "D:\diablo 1\VN\Visual-Novel-1\lora-datasets\noor\train.toml"
```

(The exact line for each character, with your path, is in its `README.txt`.)

It first prepares the pictures, then trains for 10 rounds and saves a file every 2 rounds. On an
RTX 2080 expect **one to a few hours**. You can use the PC for light work meanwhile.

**Prefer the window?** Run `gui.bat` in `C:\kohya_ss`, open the **LoRA** tab and enter:

| Setting | Value |
|---|---|
| Pretrained model | your SDXL model file, with **SDXL** ticked |
| Image folder | `lora-datasets\<character>\img` |
| Output folder / name | `lora-datasets\<character>\output` / the character id |
| Network rank (dim) / alpha | 16 / 8 |
| Train U-Net only | on |
| Optimizer / learning rate | AdamW8bit / 0.0001, scheduler cosine |
| Epochs / batch size / save every | 10 / 1 / 2 epochs |
| Resolution / buckets | 896,896 / on |
| Mixed precision / save precision | fp16 / fp16 (the 2080 has no bf16) |
| Gradient checkpointing, cache latents (to disk), cache text encoder outputs | on |
| No half VAE | on |

**Out of memory?** Lower the resolution to `768,768` (in `train.toml` or the window), and make sure
ComfyUI and games are closed.

## 5. Use it

1. Copy `lora-datasets\noor\output\noor.safetensors` into `ComfyUI\models\loras\`.
2. In `ai-render.config.json`:

   ```json
   "loras": { "noor": { "file": "noor.safetensors", "strength": 0.8 } }
   ```

3. Restart the studio. Noor's row says **LoRA in use**, her prompts now start with `hlcnoor`, and the LoRA
   is loaded for every image she is in.
4. Regenerate her portrait and a few of her shots to judge it.

**Judging the result:**

| You see | Try |
|---|---|
| Looks like her, but stiff: always the same pose or expression | `strength` 0.6, or use an earlier file (`noor-000006.safetensors`: saved after round 6) |
| Not enough like her | `strength` 1.0; or add more good pictures and train again |
| Her outfit or background shows up everywhere | Her pictures were too similar: add variety and train again |
| Other people in two-person shots start to look like her | Lower `strength` for those shots, or stage them as two single shots |

The files saved after rounds 2, 4, 6 and 8 are all in `output\`. The last is not always the best; try
round 6 or 8 if round 10 looks overcooked.

## 6. A second round (optional, worth it)

With the LoRA in use, **Make variations** now produces far more consistent pictures. Pick the best 20–30
of those, build the folder again (it replaces the old pictures, not your trained files) and train once
more. The second LoRA is usually clearly better than the first.

## Command line

Everything above also works without the studio:

```
npm.cmd run lora -- --character noor --variations 6   (make 6 variations)
npm.cmd run lora -- --character noor                  (build the training folder)
```

Picking which pictures go in the set is done in the studio.

## Rules

The same as for every image: every person is an adult and must look like one, and never use a real
person's name or likeness.
