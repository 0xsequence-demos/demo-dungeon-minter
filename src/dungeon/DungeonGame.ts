import {
  AmbientLight,
  type Object3D,
  type PerspectiveCamera,
  Raycaster,
  Vector2,
} from "three";
import { update } from "three/examples/jsm/libs/tween.module.js";
import type { ChestData } from "./ChestData";
import { Dungeon } from "./Dungeon";
import type { InteractiveChest } from "./InteractiveChest";
import type { MapData } from "./MapTypes";
import { MiniMap } from "./MiniMap";
import { PartyController } from "./PartyController";
import { PartyState } from "./PartyState";
import { STARTING_DIRECTION, STARTING_X, STARTING_Y } from "./constants";
import { generateChestDatas } from "./generateChestDatas";
import { isFacingLoot } from "./isFacingLoot";
import { loadMapDataFromImage } from "./loadMapDataFromImage";
import { makeChestVisuals } from "./makeChestVisuals";
import { Signal } from "./Signal";

// Array of button labels
const buttonLabels = ["Q", "W", "E", "A", "S", "D"];
const buttonKeyMap = {
  Q: 81,
  W: 87,
  E: 69,
  S: 83,
  A: 65,
  D: 68,
};

export class DungeonGame {
  map: MapData | undefined
  party: PartyController | undefined
  dungeon: Dungeon | undefined
  buttonsContainer: HTMLDivElement | undefined
  navButtons = new Map<string, HTMLElement>();
  partyState: PartyState | undefined
  minimap: MiniMap | undefined
  private _activeChest: InteractiveChest | undefined;
  private _onEachChestSignal = new Signal<ChestData>();
  listenForEachChestData(listener: (chestData: ChestData) => void) {
    this._onEachChestSignal.listen((listener))
    for (const chestData of this.chestDatas) {
      this._onEachChestSignal.emit(chestData)
    }
  }
  stopListeningForEachChestData(listener: (chestData: ChestData) => void) {
    this._onEachChestSignal.stopListening((listener))
  }
  public get activeChest(): InteractiveChest | undefined {
    return this._activeChest;
  }
  public set activeChest(value: InteractiveChest | undefined) {
    if (this._activeChest) {
      this._activeChest.deactivate();
    }
    this._activeChest = value;
    if (this._activeChest) {
      this._activeChest.activate();
    }
  }

  constructor(
    private pivot: Object3D,
    private camera: PerspectiveCamera,
  ) {
    const gameContainer = document.getElementById("gameContainer");

    if (!gameContainer) {
      throw new Error("Could not find dev named gameContainer");
    }
    this.gameContainer = gameContainer;
    loadMapDataFromImage("assets/textures/mini_map.png").then((map) => {
      this.map = map;
      this.init();
    });
  }
  private async init() {
    if (!this.map) {
      throw new Error("not ready")
    }
    this.dungeon = new Dungeon(this.pivot, this.map);
    const partyState = new PartyState(
      STARTING_X,
      STARTING_Y,
      STARTING_DIRECTION,
    );
    this.party = new PartyController(
      this.pivot,
      this.camera,
      partyState,
      this.map,
      this.chestDatas,
    );

    this.minimap = new MiniMap(
      this.map,
      partyState,
      this.chestDatas,
      this.gameContainer,
    );

    this.party.locationChangeSignal.listen(this.minimap.render);
    this.partyState = partyState;

    // Create a container for the buttons
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("buttons");
    this.buttonsContainer = buttonsContainer;
    // Create and append buttons
    for (const label of buttonLabels) {
      const button = document.createElement("button");
      button.classList.add("navigationButton");
      button.textContent = label;
      button.setAttribute("data-key", label);
      this.navButtons.set(label, button);

      button.onclick = this.onClickNavigationButton;

      buttonsContainer.appendChild(button);
    }

    generateChestDatas(this.map, this.chestDatas);
    for (const chestData of this.chestDatas) {
      chestData.openSignal.listen(this.minimap.render);
      this._onEachChestSignal.emit(chestData)
    }

    makeChestVisuals(this.chestDatas, this.pivot, this.chests, this.camera);

    const map = this.map
    this.party.locationChangeSignal.listen(() => {
      const chestData = isFacingLoot(
        partyState.x,
        partyState.y,
        partyState.direction,
        map,
        this.chestDatas,
      );
      this.activeChest = this.chests.find((c) => c.chestData === chestData);
    });

    if (import.meta.hot) {
      import.meta.hot.accept("./makeChestVisuals", (mod) => {
        if (!mod) {
          return
        }
        for (const chest of this.chests) {
          this.pivot.remove(chest.visuals);
        }
        this.chests.length = 0;
        const currentActiveChestData = this.activeChest?.chestData;
        mod.makeChestVisuals(
          this.chestDatas,
          this.pivot,
          this.chests,
          this.camera,
        );
        if (currentActiveChestData) {
          this.activeChest = this.chests.find(
            (c) => c.chestData === currentActiveChestData,
          );
        }
      });
    }

    this.minimap.render();

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);

    // Append the container to the body
    document.body.appendChild(buttonsContainer);

    const ambientLight = new AmbientLight(0x08131c);
    this.pivot.add(ambientLight);

    // this.party.light.shadow.mapSize.setScalar(1024);
    // party.light.castShadow = true
  }

  chests: InteractiveChest[] = [];
  raycaster = new Raycaster();
  mouse = new Vector2();
  chestDatas: ChestData[] = [];

  gameContainer: HTMLElement;

  onClickNavigationButton = (event: MouseEvent) => {
    const el = event.target
    if (!el || !(el instanceof HTMLElement)) {
      throw new Error("no element!")
    }
    const keyLabel = el.textContent;

    if (keyLabel && keyLabel in buttonKeyMap) {
      //@ts-ignore
      const key_code = buttonKeyMap[keyLabel];
      if (this.party) {
        this.party.handleKey(key_code);
      }

      const keyChar = String.fromCharCode(key_code);
      const button = this.navButtons.get(keyChar);
      if (button) {
        button.style.background = "grey";
        setTimeout(() => {
          button.style.background = "black";
        }, 200);
      }
    }
  };

  onKeyDown = (e: KeyboardEvent) => {
    const key = e.keyCode ? e.keyCode : e.which;
    if (this.party) {
      this.party.handleKey(key);
    }
    const keyChar = String.fromCharCode(key);
    const button = this.navButtons.get(keyChar);
    if (button) {
      button.style.background = "grey";
    }
  };
  onKeyUp = (e: KeyboardEvent) => {
    const key = e.keyCode ? e.keyCode : e.which;
    const keyChar = String.fromCharCode(key);
    const button = this.navButtons.get(keyChar);
    if (button) {
      button.style.background = "black";
    }
  };

  time = 0;
  simulate = (dt: number) => {
    update(); //TWEENER
    this.time += dt;
    if (this.party) {
      this.party.tick();
    }
  };
  cleanup = () => {
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);
    if (this.buttonsContainer) {
      document.body.removeChild(this.buttonsContainer);
    }
  };
}
