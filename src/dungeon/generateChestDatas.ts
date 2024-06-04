import { ChestData } from "./ChestData";
import { type MapData, MapTiles } from "./MapTypes";
import { colors } from "./colors";
import { STARTING_X, STARTING_Y } from "./constants";

export function generateChestDatas(map: MapData, chestDatas: ChestData[]) {
  const alreadyTriedLocations = new Array<number>();
  const successfulLocations = new Array<number>();

  let counter = 0;
  const tilesAround: MapTiles[] = [];
  let attemptsLeft = 300;

  placeNextChest: while (chestDatas.length < 12) {
    attemptsLeft--;
    if (attemptsLeft === 0) {
      break;
    }
    const x = ~~(Math.random() * map[0].length);
    const y = ~~(Math.random() * map.length);

    // const x = STARTING_X - 2 + ~~(Math.random() * 5);
    // const y = STARTING_Y - 2 + ~~(Math.random() * 5);
    const xy = x << (16 + y);

    if (alreadyTriedLocations.includes(xy)) {
      continue;
    }
    alreadyTriedLocations.push(xy);

    if (STARTING_X === x && STARTING_Y === y) {
      continue;
    }

    if (map[y][x] === MapTiles.wall) {
      continue;
    }

    tilesAround.length = 0;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const dx = Math.round(x + Math.cos(a));
      const dy = Math.round(y + Math.sin(a));
      const dxy = dx << (16 + dy);
      if (successfulLocations.includes(dxy)) {
        continue placeNextChest;
      }
      tilesAround.push(map[dy][dx]);
    }
    let wallChanges = 0;
    let wallCount = 0;
    let lastWallCardinal = -1;
    for (let i = 0, l = tilesAround.length; i < l; i++) {
      if (
        (tilesAround[i] === MapTiles.wall) !==
        (tilesAround[(i + 1) % l] === MapTiles.wall)
      ) {
        wallChanges++;
      }
      if (tilesAround[i] === MapTiles.wall) {
        wallCount++;
        lastWallCardinal = i;
      }
    }

    //prevent case where a chest is not up against a wall, but near a corner
    if (wallCount === 1 && lastWallCardinal % 2 === 1) {
      continue;
    }

    //prevent chests in middle of hallways
    if (wallChanges > 3) {
      continue;
    }
    //prevent chests in middle of rooms
    if (wallChanges === 0) {
      continue;
    }

    //find direction away from wall
    let startOpen = -1;
    let stopOpen = -1;
    for (let i = 0, l = tilesAround.length, l2 = l * 2; i < l2; i++) {
      if (startOpen === -1) {
        if (
          tilesAround[i % l] === MapTiles.wall &&
          tilesAround[(i + 1) % l] !== MapTiles.wall
        ) {
          startOpen = i + 1;
        }
      } else if (stopOpen === -1) {
        if (
          tilesAround[i % l] !== MapTiles.wall &&
          tilesAround[(i + 1) % l] === MapTiles.wall
        ) {
          stopOpen = i;
          break;
        }
      }
    }
    const openCardinal =
      Math.round((startOpen + stopOpen + (Math.random() - 0.5) * 0.1) * 0.25) *
      2;

    const direction = (-openCardinal / 8) * Math.PI * 2 + Math.PI * 0.5;
    const colorIndex = Math.floor(Math.random() * colors.length);

    const color = colors[colorIndex];

    const id = counter;
    counter++;

    chestDatas.push(new ChestData(x, y, direction, color, id));
    map[y][x] = MapTiles.loot;
    successfulLocations.push(xy);
  }
  console.log(`placed ${chestDatas.length} chests`);
}
