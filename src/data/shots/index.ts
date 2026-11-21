import { byId } from '@/engine/content';
import { c1BarShots } from './c1_bar';
import { c1DayShots, c1DuskShots } from './c1_day';
import { c1EndingShots } from './c1_ending';
import { c1CorridorShots, c1DinnerShots } from './c1_dinner';
import { c1HotelShots } from './c1_hotel';
import { c1NightShots } from './c1_night';
import { c1AftermathShots, c1StormExtraShots, c1StormShots } from './c1_storm';
import { c1OpeningShots } from './c1_opening';
import { c2EastWingShots, c2EveningShots, c2JuneShots, c2LateShots, c2MorningShots, c2NoorShots, c2SiennaShots, c2SlackWaterShots, c2VeraRoofShots } from './c2';

/**
 * Shot list registry. Each entry is one full-frame render; see
 * docs/ART_DIRECTION.md and `npm run brief`.
 */
export const shots = byId([...c1OpeningShots, ...c1HotelShots, ...c1CorridorShots, ...c1DinnerShots, ...c1BarShots, ...c1NightShots, ...c1DayShots, ...c1StormShots, ...c1AftermathShots, ...c1EndingShots, ...c1DuskShots, ...c1StormExtraShots,
  ...c2MorningShots, ...c2EastWingShots, ...c2NoorShots, ...c2JuneShots, ...c2SiennaShots, ...c2VeraRoofShots, ...c2EveningShots, ...c2LateShots, ...c2SlackWaterShots], 'shot');
