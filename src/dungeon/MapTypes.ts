export enum MapTiles {
  unknown = 0,
  floor = 1,
  wall = 2,
  light = 3,
  loot = 4,
}

export type MapData = MapTiles[][];
