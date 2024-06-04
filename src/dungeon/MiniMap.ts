import { Color } from "three";
import type { ChestData } from "./ChestData";
import { type MapData, MapTiles } from "./MapTypes";
import type { PartyState } from "./PartyState";
import { asDegrees } from "./directionUtils";
const minimapGridSize = 9; // This sets the grid size to 9x9

export class MiniMap {
  constructor(
    private map: MapData,
    private partyState: PartyState,
    private chestDatas: ChestData[],
    private gameContainer: HTMLElement,
  ) {
    //
  }
  render = () => {
    if (document.getElementById("mini-map")) {
      document.getElementById("mini-map")?.remove();
    }
    const halfSize = Math.floor(minimapGridSize / 2);
    const startX = Math.max(
      0,
      Math.min(
        this.partyState.x - halfSize,
        this.map[0].length - minimapGridSize,
      ),
    );
    const startY = Math.max(
      0,
      Math.min(this.partyState.y - halfSize, this.map.length - minimapGridSize),
    );
    const miniMap = document.createElement("div");
    miniMap.id = "mini-map";
    miniMap.className = "mini-map";
    for (let iy = startY; iy < startY + minimapGridSize; iy++) {
      const rowDiv = document.createElement("div");
      rowDiv.className = "row";
      for (let ix = startX; ix < startX + minimapGridSize; ix++) {
        const cell = this.map[iy][ix];
        const cellDiv = document.createElement("div");
        cellDiv.className = "cell";
        if (cell === MapTiles.wall) cellDiv.classList.add("obstacle");

        if (iy === this.partyState.y && ix === this.partyState.x) {
          const partyMarker = document.createElement("div");
          partyMarker.className = "party-marker";
          partyMarker.style.transform = `translate(-50%, -50%) rotate(${asDegrees(
            -this.partyState.direction,
          )}deg)`;
          cellDiv.appendChild(partyMarker);
        }
        const chestData = this.chestDatas.find(
          (loot) => loot.x === ix && loot.y === iy,
        );
        if (chestData) {
          const colorDiv = document.createElement("div");
          colorDiv.className = "color-marker";
          const dimHex = new Color(chestData.color)
            .multiplyScalar(0.1)
            .getHexString();
          colorDiv.style.backgroundColor = chestData.opened
            ? `#${dimHex}`
            : chestData.color;
          cellDiv.appendChild(colorDiv);
        }
        rowDiv.appendChild(cellDiv);
      }
      miniMap.appendChild(rowDiv);
    }

    this.gameContainer.innerHTML = "";
    this.gameContainer.appendChild(miniMap);
  };
}
