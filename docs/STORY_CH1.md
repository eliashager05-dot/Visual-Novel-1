# Chapter One — "Low Tide"

**Premise.** The player (a laid-off sound engineer, named by the player) inherits 51% of the Halcyon, a
faded 1920s hotel on a small northern island. The previous owner, their great-aunt **Margit Halloran**,
vanished at sea in March. The other 49% belongs to **Vera**, the manager Margit took in at nineteen. Over
two days the player meets the island, and the island starts lying to them, out of love.

**Length:** about 22–24 minutes per playthrough at default text speed (340–390 lines), verified by the
content test. **Tone:** romance and slow-burn tension, mystery, dry humour, grief. There is no explicit
content in this chapter. Intimacy stays at the level of choice, consent and tension.

---

## Scene flow

```
Crossing ─ Harbour ─ The Halcyon ─ Room 7 ─ Dinner ─ The Low Tide ─ THE FIRST NIGHT (hub)
                                                                     ├─ Night Audit (Vera)
                                                                     ├─ After Hours (Noor)  ← locked unless invited / affinity 30+
                                                                     ├─ Bloom (June)
                                                                     └─ For When You Arrive (alone, Margit's letter)
Ninety Days (morning) ─ AFTERNOON ─┬─ Coast Road (Sienna)
                                   └─ Low Tide (June)
Before the Storm (whoever you didn't choose gets a scene) ─ THE STORM ─ Candles ─ Margit's Room ─ Stop Looking
```

## Characters' beats on every path

| Character | Guaranteed | Optional / exclusive |
|---|---|---|
| **Vera** | Harbour, hotel, dinner, morning decision, storm, Margit's room | Night Audit; the storm moment ("one more second", trust 20+); invited into Margit's room (trust 18+) |
| **Noor** | Ferry, dinner, bar, Before the Storm, the scarf | After Hours (piano; an almost-kiss at affinity 35+, which you *ask* for) |
| **June** | Room 7, dinner, the sensor data | Bloom (night cove), Low Tide (afternoon), or helping her before the storm |
| **Sienna** | Bar offer, the storm aftermath (+ the lights she saw) | Coast Road (her father's shed, bracelet, off the record), or the dusk folder |

## Decisions and consequences

| Choice id | Where | What it changes |
|---|---|---|
| `c1_ferry_upset` | Ferry | Noor affinity/trust; flags `noor_ferry_asked/joked/space` (later callbacks) |
| `c1_ferry_paper` | Ferry | Telling Noor → Vera knows the island knows (`told_noor_inheritance`) |
| `c1_vera_first` | Harbour | Vera trust; `player_leans_sell` (Sienna quotes it back); "dinner" flirt → Bram teases her |
| `c1_hotel_eastwing` | Hotel | `noticed_east_wing` (Chapter 2: the closed wing) |
| `c1_hotel_question` | Hotel | Vera trust; `asked_about_boat` → callback when the boat reappears |
| `c1_june_plumber` | Room 7 | June affinity/trust; plumber joke pays off at dinner and at low tide |
| `c1_dinner_seat` | Dinner | Sitting in Margit's chair costs Vera trust, earns Bram's respect |
| `c1_dinner_job` | Dinner | How the protagonist presents themself; trust with Vera/June |
| `c1_sienna_offer` | Bar | Sienna affinity/trust; `open_to_offer` / `refused_offer` / `flirted_sienna` (pays off later) |
| `c1_noor_sienna` | Bar | Gates the piano invitation (`noor_invited_piano`); milestone *A Real Laugh* |
| `c1_night_choice` | First night | One of four exclusive scenes, each with its own clue |
| `c1_hotel_stance` | Morning | **`hotel_stance` = keep / listen / together.** "Together" → milestone *First Truce*, changes Vera's lines in the storm and when Sienna needs a room |
| `c1_afternoon` | Morning | Sienna (her past, Aldane wants the seabed) vs June (the mud is warm, man-made theory) |
| `c1_storm_choice` | Storm | Chase the figure vs stay with Vera (catch her; romantic beat at high trust) |
| `c1_sienna_room` | Candles | Whether Sienna stays at the Halcyon; tension with Vera if you overrule a "together" pact |
| `c1_scarf` | Candles | Gentle → Noor confesses she helped Margit in March; accuse → she points at Vera's boathouse key |
| `c1_take_key` | Margit's room | Going in alone costs Vera trust |
| `c1_ledger` | Margit's room | Who holds the ledger going into Chapter Two |

## Mysteries opened (not solved)

- **Margit:** a boat that came back from police custody, an engine still warm, and a photo of her on the
  ferry the morning you arrived. *Stop looking. Don't sell.*
- **Under the tide:** monthly payments to "N.H.", "J.C.", and a final "S.M. — paid in full" in March.
- **The cove:** warm mud and a vibration at the old mooring, a temperature spike at 19:40 during the storm,
  boat lights seen at 19:30, and Aldane wants the seabed, not the hotel.
- **People:** the girl in Margit's photograph; the figure in the oilskin; Noor's March promise; Sienna's
  anonymous benefactor; why Vera "has a key to the boathouse".

## Flags carried into Chapter Two (selection)

`hotel_stance`, `vera_moment`, `vera_invited_room`, `vera_has_ledger`, `has_ledger`, `promised_vera`,
`noor_confessed_march`, `accused_noor`, `asked_to_kiss_noor`, `noor_tension`, `june_funding_revealed`,
`june_knows_boat`, `june_manmade_theory`, `felt_vibration`, `sienna_off_record`, `flirted_sienna`,
`gave_sienna_room`, `sienna_saw_lights`, `read_letter`, `has_shell`, `heard_engine_sound`, `saw_payments`,
`found_margit_ledger`, `chased_figure`, `knows_deadline`, plus every milestone and all affinity/trust values.
