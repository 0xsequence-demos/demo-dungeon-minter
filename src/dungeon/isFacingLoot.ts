import type { ChestData } from "./ChestData";
import { type MapData, MapTiles } from "./MapTypes";
import { anglesMatch } from "./utils";

export function isFacingLoot(
  x: number,
  y: number,
  direction: number,
  map: MapData,
  chestDatas: ChestData[],
) {
  const isLootHere = map[y][x] === MapTiles.loot;
  if (isLootHere)
    return chestDatas.find(
      (c) => c.x === x && c.y === y && anglesMatch(c.direction, direction),
    );
}
