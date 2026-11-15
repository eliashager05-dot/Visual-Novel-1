import { useEffect, useState } from 'react';
import { AUTO_SLOTS, MANUAL_SLOTS, type SaveRecord, type SlotId } from '@/engine';
import { useGameStore } from '@/store/gameStore';
import { saveRepo, useSaves } from '@/store/saveStore';
import { Panel } from '../Overlays/Panel';
import { StageThumbnail } from '../Stage/StageThumbnail';
import { ConfirmBar, Tabs } from '../ui/controls';

type Tab = 'manual' | 'auto' | 'quick';
const PER_PAGE = 6;

function formatTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/**
 * Save & load slots. In 'save' mode only manual slots are writable; auto and
 * quick saves are written by the game. Every action that destroys data asks first.
 */
export function SaveLoadScreen({ mode, onClose, onLoaded }: { mode: 'save' | 'load'; onClose: () => void; onLoaded?: () => void }) {
  const records = useSaves((s) => s.records);
  const refresh = useSaves((s) => s.refresh);
  const save = useGameStore((s) => s.save);
  const load = useGameStore((s) => s.load);
  const inGame = useGameStore((s) => s.game !== null);
  const [tab, setTab] = useState<Tab>('manual');
  const [page, setPage] = useState(0);
  const [pending, setPending] = useState<{ action: 'overwrite' | 'delete' | 'load'; slot: SlotId } | null>(null);

  useEffect(refresh, [refresh]);

  const slots: SlotId[] =
    tab === 'manual'
      ? Array.from({ length: PER_PAGE }, (_, i) => `manual-${page * PER_PAGE + i + 1}` as SlotId)
      : tab === 'auto'
        ? Array.from({ length: AUTO_SLOTS }, (_, i) => `auto-${i + 1}` as SlotId)
        : ['quick'];

  const doLoad = (slot: SlotId) => {
    if (load(slot)) {
      onLoaded?.();
      onClose();
    }
  };

  const onSlot = (slot: SlotId, rec: SaveRecord | undefined) => {
    if (mode === 'save') {
      if (!slot.startsWith('manual')) return;
      if (rec) setPending({ action: 'overwrite', slot });
      else save(slot);
    } else if (rec) {
      if (inGame) setPending({ action: 'load', slot });
      else doLoad(slot);
    }
  };

  const confirm = () => {
    if (!pending) return;
    if (pending.action === 'overwrite') save(pending.slot);
    if (pending.action === 'delete') {
      saveRepo.remove(pending.slot);
      refresh();
    }
    if (pending.action === 'load') doLoad(pending.slot);
    setPending(null);
  };

  const tabs: { value: Tab; label: string }[] =
    mode === 'save'
      ? [{ value: 'manual', label: 'Save slots' }]
      : [
          { value: 'manual', label: 'Saves' },
          { value: 'auto', label: 'Autosaves' },
          { value: 'quick', label: 'Quick save' },
        ];

  return (
    <Panel title={mode === 'save' ? 'Save game' : 'Load game'} onClose={onClose} width={1560}>
      <Tabs
        value={tab}
        tabs={tabs}
        onChange={(t) => {
          setTab(t);
          setPending(null);
        }}
        right={
          tab === 'manual' && (
            <div className="flex items-center gap-2">
              <span className="mr-2 text-[14px] uppercase tracking-[0.25em] text-white/35">Page</span>
              {Array.from({ length: MANUAL_SLOTS / PER_PAGE }, (_, p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPage(p);
                    setPending(null);
                  }}
                  className={['h-10 w-10 rounded-full text-[16px] tabular-nums', p === page ? 'bg-[#e8c88f] text-black' : 'text-white/50 hover:bg-white/10'].join(' ')}
                >
                  {p + 1}
                </button>
              ))}
            </div>
          )
        }
      />
      <div className="px-12 pb-7 pt-6">
        <div className="grid grid-cols-3 gap-6">
          {slots.map((slot, i) => {
            const rec = records[slot];
            const label = tab === 'manual' ? `Slot ${page * PER_PAGE + i + 1}` : tab === 'auto' ? `Autosave ${i + 1}` : 'Quick save';
            const clickable = mode === 'save' ? tab === 'manual' : !!rec;
            return (
              <div
                key={slot}
                role="button"
                tabIndex={clickable ? 0 : -1}
                onClick={() => clickable && onSlot(slot, rec)}
                onKeyDown={(e) => e.key === 'Enter' && clickable && onSlot(slot, rec)}
                className={[
                  'group relative overflow-hidden rounded-2xl border text-left transition-colors',
                  pending?.slot === slot ? 'border-[#e8c88f]/70' : 'border-white/[0.08]',
                  clickable ? 'cursor-pointer hover:border-[#e8c88f]/50' : 'cursor-default opacity-60',
                ].join(' ')}
              >
                {rec ? (
                  <StageThumbnail thumb={rec.thumb} width={472} />
                ) : (
                  <div className="flex h-[265.5px] w-full items-center justify-center bg-white/[0.02] pb-16 text-[18px] uppercase tracking-[0.3em] text-white/25">
                    {mode === 'save' && tab === 'manual' ? 'Save here' : 'Empty'}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 space-y-0.5 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-5 pb-3 pt-10">
                  <div className="flex justify-between text-[15px] uppercase tracking-[0.2em] text-white/40">
                    <span>{label}</span>
                    {rec && <span className="normal-case tracking-normal">{formatTime(rec.createdAt)}</span>}
                  </div>
                  {rec && (
                    <>
                      <div className="truncate text-[20px] text-white/90">
                        {rec.chapterTitle} · {rec.sceneTitle}
                      </div>
                      <div className="truncate text-[16px] italic text-white/55">
                        {rec.preview.speakerName ? `${rec.preview.speakerName}: ` : ''}
                        {rec.preview.text}
                      </div>
                    </>
                  )}
                </div>
                {rec && tab === 'manual' && (
                  <button
                    aria-label={`Delete ${label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPending({ action: 'delete', slot });
                    }}
                    className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[13px] uppercase tracking-[0.2em] text-white/50 opacity-0 transition-opacity hover:text-red-200 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-5 h-[60px]">
          {pending && (
            <ConfirmBar
              text={
                pending.action === 'overwrite'
                  ? 'Overwrite this save?'
                  : pending.action === 'delete'
                    ? 'Delete this save permanently?'
                    : 'Load this save? Progress since your last save will be lost.'
              }
              confirmLabel={pending.action === 'delete' ? 'Delete' : pending.action === 'load' ? 'Load' : 'Overwrite'}
              onConfirm={confirm}
              onCancel={() => setPending(null)}
            />
          )}
        </div>
      </div>
    </Panel>
  );
}
