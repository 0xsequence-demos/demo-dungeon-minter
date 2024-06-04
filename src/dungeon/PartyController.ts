import { type Object3D, type PerspectiveCamera, PointLight } from "three";
import { Easing, Tween } from "three/examples/jsm/libs/tween.module.js";
import {
  CAMERA_HEIGHT,
  DRAMATIC_LOOT_APPROACH_SPEED,
  HEAD_TILT_ANGLE,
  KEYBINDINGS,
  PARTY,
} from "./constants";

import type { ChestData } from "./ChestData";
import { type MapData, MapTiles } from "./MapTypes";
import type { PartyAction } from "./PartyAction";
import type { PartyState } from "./PartyState";
import { Signal } from "./Signal";
import { isFacingLoot } from "./isFacingLoot";

export class PartyController {
  locationChangeSignal = new Signal<void>();
  busy = false;
  nextAction: PartyAction | undefined;

  light: PointLight;
  constructor(
    pivot: Object3D,
    private camera: PerspectiveCamera,
    private partyState: PartyState,
    private map: MapData,
    private chestDatas: ChestData[],
  ) {
    this.camera.position.set(partyState.x, CAMERA_HEIGHT, partyState.y);
    this.camera.rotation.y = partyState.direction;
    this.light = new PointLight(
      PARTY.LIGHT.COLOR,
      PARTY.LIGHT.INTENSITY,
      PARTY.LIGHT.RADIUS,
    );
    pivot.add(this.light);

    this.light.shadow.bias = 0.01; // Prevents shadow lines at seams in walls. Not sure why. Side-effects?
    this.light.shadow.camera.near = 0.05;

    this.updatePosition();
    this.updateRotation();
  }
  private updatePosition() {
    this.locationChangeSignal.emit();
  }

  private updateRotation() {
    this.locationChangeSignal.emit();
  }

  private moveTo(x: number, y: number) {
    x = Math.round(x);
    y = Math.round(y);
    this.busy = true;

    if (this.map[y][x] === MapTiles.wall) {
      new Tween(this.camera.position)
        .to({ x, z: y }, PARTY.BUMP_TIME)
        .easing((v) => 0.3 * Easing.Sinusoidal.InOut(v * (1 - v)))
        .onComplete(() => {
          this.busy = false;
          this.tryNextAction();
        })
        .start();
    } else {
      this.partyState.x = x;
      this.partyState.y = y;
      this.updatePosition();
      new Tween(this.camera.position)
        .to(
          { x, z: y },
          isFacingLoot(
            x,
            y,
            this.partyState.direction,
            this.map,
            this.chestDatas,
          )
            ? PARTY.MOVE_TIME / DRAMATIC_LOOT_APPROACH_SPEED
            : PARTY.MOVE_TIME,
        )
        .easing(Easing.Sinusoidal.InOut)
        .onComplete(() => {
          this.busy = false;
          this.tryNextAction();
        })
        .start();
      this.adjustHeadTilt(
        x,
        y,
        this.partyState.direction,
        DRAMATIC_LOOT_APPROACH_SPEED,
      );
    }
  }

  private adjustHeadTilt(x: number, y: number, direction: number, speed = 1) {
    const tiltHead = !!isFacingLoot(x, y, direction, this.map, this.chestDatas);

    if (tiltHead !== this.partyState.tiltHead) {
      this.partyState.tiltHead = tiltHead;
      new Tween(this.camera.rotation)
        .to({ x: tiltHead ? HEAD_TILT_ANGLE : 0 }, PARTY.ROTATE_TIME / speed)
        .easing(Easing.Sinusoidal.InOut)
        .start();
    }
  }

  private rotateTo(dir: number) {
    this.busy = true;

    this.partyState.direction = dir;
    this.updateRotation();
    new Tween(this.camera.rotation)
      .to({ y: dir }, PARTY.ROTATE_TIME)
      .easing(Easing.Sinusoidal.InOut)
      .onComplete(() => {
        this.busy = false;
        this.tryNextAction();
      })
      .start();

    this.adjustHeadTilt(this.partyState.x, this.partyState.y, dir);
  }

  private performAction(action: PartyAction) {
    let angle = this.partyState.direction;
    let moveAngle = angle;
    let shouldMove = false;
    let shouldTurn = false;
    switch (action) {
      case "moveForward":
        moveAngle += Math.PI * -0.5;
        shouldMove = true;
        break;
      case "moveBackward":
        moveAngle += Math.PI * 0.5;
        shouldMove = true;
        break;
      case "strafeLeft":
        shouldMove = true;
        break;
      case "strafeRight":
        moveAngle += Math.PI;
        shouldMove = true;
        break;
      case "turnLeft":
        angle += Math.PI * 0.5;
        shouldTurn = true;
        break;
      case "turnRight":
        angle += Math.PI * -0.5;
        shouldTurn = true;
        break;
    }
    if (shouldMove) {
      this.moveTo(
        this.partyState.x - Math.cos(moveAngle),
        this.partyState.y + Math.sin(moveAngle),
      );
    }
    if (shouldTurn) {
      this.rotateTo(angle);
    }
  }

  private tryNextAction() {
    if (this.nextAction) {
      const a = this.nextAction;
      this.nextAction = undefined;
      this.performAction(a);
    }
  }

  handleKey(key: number) {
    const action = KEYBINDINGS.get(key);
    if (!action) {
      return;
    }
    this.submitAction(action)
  }
  private submitAction(action:PartyAction) {
    if (this.busy) {
      this.nextAction = action;
    } else {
      this.performAction(action);
    }
  }

  stepBack() {
    this.submitAction("moveBackward")
  }

  tick() {
    const time = performance.now();
    const p = this.light.position;
    p.copy(PARTY.LIGHT.OFFSET);
    p.x += Math.sin(time * 0.01) * 0.025;
    p.y += Math.cos(time * 0.013) * 0.025;
    p.z += Math.cos(time * 0.0082) * 0.025;
    p.applyMatrix4(this.camera.matrix);
  }
}
