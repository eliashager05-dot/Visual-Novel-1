# Chapter Two — "Slack Water"

**Day three.** The storm is over, the ferry is cancelled and the causeway is gone: nobody can leave the
island. The photograph on the protagonist's phone says Margit was on the ferry the morning they arrived.
By midnight they find out where she has been since.

*Slack water* is the still moment at the turn of the tide, when no current runs. Everyone on the island is
holding still, waiting to see which way things go.

**Length:** about 15 minutes per playthrough (200–260 lines), verified by the content test; tighter than
Chapter One. **Tone:** the same mix of romance, mystery and dry humour, with more warmth: the household
starts acting like one. There is no explicit content. Intimacy stays at the level of choice, consent and
tension, and every romantic gesture is asked for first.

The chapter continues from the end card of Chapter One (**Continue to Chapter Two**), keeping every
relationship, flag and phone message. It also plays correctly from a fresh state.

---

## Scene flow

```
The Morning After (room 12 → lobby → breakfast) ─ The East Wing (the baths, the hatch)
  ─ AFTERNOON (map) ─┬─ Bailing Out (Noor, the flooded bar)
                     ├─ The Mooring (June, slack water at the pipe)
                     ├─ The Causeway (Sienna, the Holm)
                     └─ The Missing C (Vera, the roof)
  ─ Seven Plates (texts from the others, dinner, Bram's kitchen)
  ─ BEFORE MIDNIGHT ─┬─ The Terrace (Vera) ─┬─ Low Water (the message, who comes)
                     ├─ Wrong Notes (Noor)  │    ─ Slack Water (the cave, Margit)
                     ├─ Room Seven (June)   │
                     ├─ The Lounge (Sienna) │
                     └─ stay in ────────────┘
```

The day has a clock: Day Three morning, midday, afternoon, dusk, evening, night, and the small hours at
the cave. The afternoon is a map choice (the causeway is a new place on the island chart).

## The phone

- Morning: the unknown number's thread is open. Reply **"Margit?"** (three dots, no answer), **"Who is
  this?"**, or nothing. Halcyon Ferries cancels every sailing. Sienna's thread finally gets her name.
- Dusk: whoever you did not spend the afternoon with texts you (quietly: notices and unread badges).
- Night: *Low water 23:40. The cove path. Bring a torch.* If you asked "Margit?": *You asked who this was.
  Come and see.*
- After the reveal, the unknown number is renamed **Margit**.

## Decisions and consequences

| Choice id | Where | What it changes |
|---|---|---|
| `c2_reply` | Morning | `asked_margit_text` (achievement, and the night message changes) / `photo_unanswered` |
| `c2_photo` | Lobby | Show Vera (`vera_saw_photo`, trust; lets you bring her tonight) / show everyone (Bram walks out, Vera hurt) / keep it |
| `c2_breakfast` | Breakfast | Ferry and the bank / put Sienna on the spot (Vera approves, Sienna doesn't) / praise Bram's eggs |
| `c2_lido` | East wing | **The Deep End** (Vera milestone, CG) / police / try to break the lock |
| `c2_afternoon` | Map | Noor, June, Sienna or Vera. Decides the afternoon scene, the dusk texts and who can come at midnight |
| `c2_noor_door` | Bar | Only if you accused Noor in Chapter One: apologise or don't |
| `c2_noor_mix` | Bar | Promise to record her songs (`promised_to_record_noor`) / admit you're not sure you're good any more |
| `c2_noor_truth` | Bar | The N.H. payments (`noor_told_payments`) / her song (**March**, CG, and a kiss she asks for) / return the scarf |
| `c2_june_water` | Cove | Go under with her (**Cold Water**, CG) / hold the line / ask whether Margit paid her (`june_told_why`) |
| `c2_june_reason` | Cove | Invite her into the hotel tonight / urge caution |
| `c2_sienna_truth` | Causeway | Tell her about the photo: S.M. is her mother, Saoirse (**Her Mother's Daughter**, CG) / Aldane's cable (`knows_aldane_cable`) / the jumper |
| `c2_sienna_side` | Causeway | Ask her side / trust her (`sienna_trusted`) / ask her to help find the pump first |
| `c2_vera_future` | Roof | Reopen the baths / a studio in the cellar / let her decide |
| `c2_neon` | Roof | Fix the C (**The Missing C**, CG) / leave it |
| `c2_dinner` | Dinner | Rally the table / ask Sienna whose side she is on (`sienna_with_us` at trust 16+) / watch, and notice Bram watching the clock |
| `c2_bram` | Kitchen | Ask about the seventh plate (`bram_told`) / follow the basket (see a yellow sleeve at the hatch) / wash up (Saoirse's story) |
| `c2_late` | Night | One of four short scenes, or stay in |
| `c2_late_*` | Night | Small choices per scene: Vera's hand (asked for, affinity 35+), playing the right chord with Noor, June's graph, Sienna's mother |
| `c2_who_comes` | Night | Go alone, or bring Vera (trust 22+, or you spent time with her, or showed her the photo) or whoever you spent the afternoon or evening with. Sets `companion` |
| `c2_cave` | The cave | Call her name / wait in the dark / shut the pump off (not with June there) |
| `c2_margit` | The cave | Confront her (`margit_confronted`) / ask why you (`margit_why`) / ask what she needs (`margit_ally`). Margit's stance toward you in Chapter Three |

## What is revealed

- **Margit is alive**, living in the sea cave under the east wing, reached through the pump room hatch or
  from the cove at the lowest tides. Bram has fed her every night since April.
- **Why:** Aldane offered a fortune for the cove in February. She refused; they bought her bank loan; the
  ELIN's lines were cut and her brakes failed. Dead, her will splits the hotel 51/49 between two people who
  must both sign before anything is sold: a deliberate deadlock.
- **The pump:** her grandfather's 1926 seawater baths pump keeps the cove warm, which keeps June's unusual
  bloom alive. June's report goes to the marine board on 1 September; protected water means no cable.
  Twenty-six days.
- **The payments:** N.H. is Noor (her label debt, for keeping the ELIN fuelled), J.C. is June (the research),
  **S.M. is Saoirse Marlowe**, Sienna's mother and the young woman in Margit's thirty-year-old photo, who
  sold Margit the cove's mooring licence in March with money from the baths fund.
- **Aldane** wants the seabed for a subsea cable from a wind farm; an engineering team and a lawyer are on
  the first ferry.

## Mysteries still open

- How Margit took the photograph of herself on the ferry, and who sent it.
- Who cut the ELIN's lines, and who on the island reports to Aldane.
- Whether Saoirse is still alive and why she and Margit fell out thirty years ago.
- What Aldane's team will do when they find the pump, and what happens when the island learns Margit is alive.

## Flags carried into Chapter Three (selection)

`companion` (vera / noor / june / sienna / none), `margit_confronted`, `margit_why`, `margit_ally`,
`vera_met_margit`, `noor_met_margit`, `june_met_margit`, `sienna_met_margit`, `shut_pump`, `bram_told`,
`followed_bram`, `knows_saoirse`, `knows_aldane_cable`, `sienna_with_us`, `sienna_trusted`,
`sienna_will_call_mother`, `kissed_noor`, `noor_waiting`, `promised_to_record_noor`, `held_vera_hand`,
`promised_vera_tonight`, `dream_baths`, `dream_studio`, `june_plans_cove`, `june_invited_in`,
`asked_margit_text`, plus the Chapter Two milestones and all affinity/trust values.
