/**
 * Generates the game's images with a local ComfyUI. Run with `npm run generate -- <what>`.
 *
 *   npm run generate -- --refs                 a reference portrait of each character (start here)
 *   npm run generate -- --milestone 1          every image in milestone 1
 *   npm run generate -- --scene c1_ferry       one scene
 *   npm run generate -- --shots a,b            specific images by name
 *   npm run generate -- --all                  the whole chapter
 *
 *   --variants 3   how many versions of each (default 2)
 *   --redo         also regenerate images that already have a chosen version
 *   --dry-run      print the prompts without generating anything
 */
import { ComfyError } from './comfy';
import { loadConfig } from './config';
import { generateVariants, openSession, promptFor, selectItems } from './run';
import { chosenFile } from './store';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const value = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

async function main() {
  const cfg = loadConfig();
  const variants = Math.max(1, Number(value('variants') ?? 2) || 2);
  const explicit = value('shots')?.split(',').map((s) => s.trim()).filter(Boolean);
  let items = selectItems({
    milestone: value('milestone') ? Number(value('milestone')) : undefined,
    scene: value('scene'),
    ids: explicit,
    all: flag('all'),
    refs: flag('refs'),
  });
  if (items.length === 0) {
    console.log('Say what to generate, for example:\n  npm run generate -- --refs\n  npm run generate -- --milestone 1\n  npm run generate -- --scene c1_ferry\n  npm run generate -- --shots c1_ferry_player_rail\nAdd --dry-run to see the prompts first.');
    return;
  }
  if (!explicit && !flag('redo')) {
    const before = items.length;
    items = items.filter((i) => !chosenFile(i));
    if (before !== items.length) console.log(`Skipping ${before - items.length} image(s) that already have a chosen version (use --redo to include them).`);
  }

  if (flag('dry-run')) {
    for (const item of items) {
      const p = promptFor(cfg, item);
      console.log(`\n${item.id}  [${item.sceneTitle}]  seed ${p.seed}\n  + ${p.positive}\n  - ${p.negative}`);
    }
    console.log(`\n${items.length} image(s). Nothing was generated.`);
    return;
  }
  if (items.length === 0) {
    console.log('Nothing to do: every selected image already has a chosen version.');
    return;
  }

  const session = await openSession(cfg);
  console.log(`ComfyUI: ${session.gpu ?? 'connected'} · model ${session.checkpoint}`);
  console.log(`Generating ${variants} version(s) of ${items.length} image(s).\n`);
  const started = Date.now();
  let made = 0;
  const total = items.length * variants;
  for (const [n, item] of items.entries()) {
    process.stdout.write(`[${n + 1}/${items.length}] ${item.id} `);
    await generateVariants(session, item, variants, {
      onImage: () => {
        made++;
        process.stdout.write('.');
      },
    });
    const perImage = (Date.now() - started) / made / 1000;
    const left = Math.round(((total - made) * perImage) / 60);
    console.log(` done (${perImage.toFixed(0)} s each, about ${left} min left)`);
  }
  console.log(`\nMade ${made} image(s) in the render-candidates folder.`);
  console.log('The first version of each is already in the game. To compare versions and choose, run:  npm run studio');
}

main().catch((e) => {
  console.error(e instanceof ComfyError ? `\n${e.message}` : e);
  process.exitCode = 1;
});
