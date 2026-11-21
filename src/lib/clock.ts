import type { GameClock, TimeOfDay } from '@/types';

const LABELS: Record<TimeOfDay, string> = {
  dawn: 'Dawn',
  morning: 'Morning',
  midday: 'Midday',
  afternoon: 'Afternoon',
  dusk: 'Dusk',
  evening: 'Evening',
  night: 'Night',
  late: 'Small hours',
};

/** A believable clock time per part of the day, for the phone's status bar. */
const PHONE_TIMES: Record<TimeOfDay, string> = {
  dawn: '05:52',
  morning: '08:14',
  midday: '12:31',
  afternoon: '14:47',
  dusk: '19:26',
  evening: '21:08',
  night: '23:54',
  late: '02:17',
};

const DAY_WORDS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

export function periodLabel(period: TimeOfDay): string {
  return LABELS[period];
}

export function dayLabel(day: number): string {
  return `Day ${DAY_WORDS[day - 1] ?? day}`;
}

export function clockLabel(clock: GameClock): string {
  return `${dayLabel(clock.day)} · ${periodLabel(clock.period)}`;
}

export function phoneTime(clock: GameClock | null): string {
  return clock ? PHONE_TIMES[clock.period] : '';
}
