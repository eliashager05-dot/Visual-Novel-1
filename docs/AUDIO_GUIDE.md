# Music and Sound

The game plays music and sound effects from files you add. Nothing else is needed: no code, no settings.

## Where files go

| What | Save as | Notes |
|---|---|---|
| Music | `src/assets/music/<id>.ogg` | Loops while the scene lasts and cross-fades to the next track. |
| Sound effects | `src/assets/sounds/<id>.mp3` | Plays once at its moment in the story. |

- `.ogg`, `.mp3`, `.wav`, `.m4a` and `.opus` all work. Prefer `.ogg` or `.mp3`: much smaller than `.wav`.
- The list of every track and effect, what each should sound like and where it is used, is under
  **Music and sound effects** in [RENDER_BRIEF.md](RENDER_BRIEF.md). Run `npm.cmd run brief` to update it.
- `npm.cmd run renders` checks the names (and suggests the right one for a typo).
- The track `halcyon_theme` also plays on the title screen.

Until a music track is added, that part of the story is silent. Sound effects without a file use a simple
synthesised placeholder, so you hear *something* at the right moment.

## In the game

- **Settings → Audio:** music volume, sound-effects volume, mute all.
- **Speaker icon** (top right) or the **M** key mutes and unmutes.
- Sound effects are skipped while you fast-forward with skip mode.
- Browsers only allow sound after the first click or key press, so the title music starts after you
  confirm the age notice.

## Getting music and sounds

Since the game is only for you, you can use almost anything you have. Some good sources:

**Free sound libraries.** Sites such as Freesound and Pixabay have large collections of free sound
effects and music. Many are free to use; each file lists its own licence.

**Make them on your PC with ComfyUI.** Recent ComfyUI versions include audio models. Look under
**Templates → Audio** in ComfyUI for templates that generate sound effects or music from a text
description (names vary between versions; Stable Audio Open and ACE-Step are two models these
templates have used). Use the "What it should sound like" text from the brief as the prompt.

- Sound effects and short ambiences (rain, waves, a door) work well.
- Music works best as instrumental background. Generate a longer piece and trim it so the end flows back
  into the start, since tracks loop.
- Your RTX 2080 has enough memory for these; expect a short wait per clip.

**Your own music library** works too: any file renamed to the track's id.

## Tips

- **Loop cleanly.** Trim music so the end flows into the start, or fade the last second; a free editor
  like Audacity does both.
- **Keep levels even.** If one track is much louder than the others, lower it in an editor (Audacity:
  *Effect → Volume and Compression → Normalize*).
- **Short effects.** One to five seconds is plenty; the game does not cut them off.
