import { byId } from '@/engine/content';
import type { MapDefinition } from '@/types';

/**
 * Maps for map choices. Coordinates are percent of a 16:9 map: x from the
 * left, y from the top. They match the map the game draws itself; if you add
 * an illustration (`image`), place the pins to match it.
 */
export const maps = byId<MapDefinition>(
  [
    {
      id: 'island',
      name: 'Halcyon Point',
      image: 'map_island',
      places: {
        hotel: { name: 'Hotel Halcyon', x: 67, y: 41, note: 'On the east cliff' },
        cove: { name: 'The cove', x: 76.5, y: 58, note: 'Below the hotel, down the cliff path' },
        low_tide: { name: 'The Low Tide', x: 52.5, y: 66, note: 'Bar on the harbour front' },
        harbour: { name: 'The harbour', x: 44, y: 73, note: 'Ferry pier and the town' },
        road: { name: 'The coast road', x: 30, y: 46, note: 'Loops the island in forty minutes' },
        causeway: { name: 'The causeway', x: 16.5, y: 53, note: 'Out to the Holm. Washed out by the storm' },
        factory: { name: 'Old fish factory', x: 42, y: 19, note: 'Derelict, at the north end' },
      },
    },
  ],
  'map',
);
