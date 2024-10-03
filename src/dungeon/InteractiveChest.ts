import { Easing } from "@tweenjs/tween.js";
import {
  Color,
  type Intersection,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  type Object3DEventMap,
  type PerspectiveCamera,
  PointLight,
  Raycaster,
  Vector2,
} from "three";
import { lerp, randInt } from "three/src/math/MathUtils.js";
import type { ChestData } from "./ChestData";
import { clamp } from "./clamp";
import { clamp01 } from "./clamp01";
import { getRandomIntInRange } from "./getRandomIntInRange";
import { getProtoMesh } from "./gltfUtils";
import { getChildMesh, getChildObj } from "./threeUtils";
import { anglesMatch } from "./utils";

const TAU = Math.PI * 2;
function nearestNotchAngle(v: number) {
  return (Math.round((v / TAU) * 16) * TAU) / 16;
}

const tempIntersections: Intersection<Object3D<Object3DEventMap>>[] = [];
export class InteractiveChest {
  visuals: Object3D;
  rollers: Object3D[] = [];
  intervalID: NodeJS.Timeout | undefined;
  isPointerDown = false;
  raycaster: Raycaster;
  pointer: Vector2;
  activeRoller: Object3D<Object3DEventMap> | undefined;
  solved = false;
  lid: Object3D<Object3DEventMap> | undefined;
  light: PointLight | undefined;
  glowMaterial: MeshPhongMaterial | undefined;
  private _openness = 0;
  glowMaterialOff: MeshPhongMaterial | undefined;
  powerLineToLock: Mesh | undefined;
  public get openness() {
    return this._openness;
  }
  public set openness(openness) {
    if (this._openness === openness) {
      return;
    }
    if (!this.light || !this.glowMaterial || !this.lid) {
      throw new Error("visuals not ready");
    }
    this._openness = openness;
    this.light.intensity = Math.min(
      1 + Math.min(50, openness * 0.5),
      clamp01((1 - openness) * 64),
    );
    this.glowMaterial.emissive
      .set(this.chestData.color)
      .multiplyScalar(Math.min(1 + openness * 10, (1 - openness) * 70 + 0.1));
    const shake =
      (Math.random() - 0.5) *
      Math.min(0.0125, openness * 0.5) *
      clamp01((1 - openness) * 4);
    const shake2 =
      (Math.random() - 0.5) *
      Math.min(0.0125, openness * 0.5) *
      clamp01((1 - openness) * 4);
    this.visuals.position.y = shake * 0.1;
    this.visuals.rotation.z = shake2;
    this.lid.rotation.x =
      -0.8 * Easing.Elastic.Out(clamp01(this.openness * 3 - 2));
  }
  constructor(
    public chestData: ChestData,
    private camera: PerspectiveCamera,
  ) {
    this.visuals = new Object3D();
    this.raycaster = new Raycaster();
    this.pointer = new Vector2();
    this.init();
  }
  async init() {
    const protoChest = await getProtoMesh("chest", "chest");
    const chest = protoChest.clone();
    const glow = getChildMesh(chest, "glow");
    const lid = getChildObj(chest, "lid");
    const powerLineToLock = getChildMesh(lid, "power-out");
    this.lid = lid;
    this.powerLineToLock = powerLineToLock;
    const protoRoller = await getProtoMesh("chest", "roller-prototype");
    if (!protoRoller) {
      throw new Error("could not find roller prototype");
    }
    const pr = protoRoller;
    function getGlow(suffix: string) {
      const r = pr.getObjectByName(`roller-glow-${suffix}`);
      if (!r) {
        throw new Error("could not find roller glow");
      }
      return r;
    }

    chest.traverse((m) => {
      if (m.name.startsWith("roller") && m.name.length === 7) {
        this.rollers.push(m);
      }
    });

    const rollerGlows = [
      getGlow("d2"),
      getGlow("d1"),
      getGlow("0"),
      getGlow("u1"),
      getGlow("u2"),
    ];

    for (let i = 0; i < rollerGlows.length; i++) {
      const rollerGlow = rollerGlows[i];
      rollerGlow.userData.relativeAngle = ((i - 2) / 16) * TAU;
    }

    this.rollers.sort((a, b) => a.name.localeCompare(b.name));

    let cursor = 0;
    const t = this.rollers.length;
    const notchesAbs: number[] = new Array(t);
    notchesAbs[0] = 0;
    for (let i = 0; i < t - 1; i++) {
      cursor = getRandomIntInRange(
        Math.max(-2, cursor - 2),
        Math.min(2, cursor + 2),
      );
      notchesAbs[i + 1] = cursor;
    }
    notchesAbs[t] = 0;

    const notchesRel: number[] = new Array(t);
    for (let i = 0; i < t; i++) {
      notchesRel[i] = notchesAbs[i + 1] - notchesAbs[i];
    }

    for (let i = 0; i < this.rollers.length; i++) {
      const roller = this.rollers[i];
      const realV = notchesRel[i] + 2;
      for (let j = 0; j < 3; j++) {
        const a = (j * 16) / 3;
        let v = j === 0 ? realV : randInt(0, 4);
        if (j > 0 && realV === v) {
          v = (v + 1) % 5;
        }
        const fakeNotchGlow = rollerGlows[v].clone();
        fakeNotchGlow.rotation.x = nearestNotchAngle(
          ((a + v * 0.5) / 16) * TAU,
        );
        roller.add(fakeNotchGlow);
      }
      roller.userData.virtualY = nearestNotchAngle(Math.random() * TAU);
      roller.userData.initialSpinSpeed =
        lerp((i % 2) - 0.5, 0, Math.random() * 0.5) * 2.5;
      roller.rotation.x = roller.userData.virtualY;
    }

    const originalGlowMaterial = glow.material;
    const glowMat = new MeshPhongMaterial({
      color: new Color(this.chestData.color)
        .multiplyScalar(0.001)
        .addScalar(0.005),
      emissive: this.chestData.color,
      shininess: 100,
    });
    chest.traverse((m) => {
      if (m instanceof Mesh && m.material === originalGlowMaterial) {
        m.material = glowMat;
      }
    });
    this.glowMaterial = glowMat;
    this.glowMaterialOff = glowMat.clone();
    this.glowMaterialOff.emissive.multiplyScalar(0.3);
    this.powerLineToLock.material = this.glowMaterialOff;

    chest.userData.loot_id = this.chestData.id;

    chest.name = "loot"; //portal
    chest.userData.color = this.chestData.color;
    const chestLight = new PointLight(this.chestData.color, 0.6, 3);
    this.light = chestLight;
    chest.add(chestLight);
    this.visuals.add(chest);
  }

  private updateIntersections(x: number, y: number) {
    this.pointer.x = (x / window.innerWidth) * 2 - 1;
    this.pointer.y = -(y / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    tempIntersections.length = 0;
    this.raycaster.intersectObjects(this.rollers, false, tempIntersections);
  }

  private onTouchStart = (event: TouchEvent) => {
    if (this._openness > 0) return;
    this.isPointerDown = true;

    this.updateIntersections(
      event.touches[0].clientX,
      event.touches[0].clientY,
    );

    if (tempIntersections.length > 0) {
      this.activeRoller = tempIntersections[0].object;
    }
    this.lastTouchY = event.touches[0].clientY;
  };

  private onMouseDown = (event: MouseEvent) => {
    if (this._openness > 0) return;
    this.isPointerDown = true;

    this.updateIntersections(event.clientX, event.clientY);

    if (tempIntersections.length > 0) {
      this.activeRoller = tempIntersections[0].object;
    }
    this.lastMouseY = event.y;
  };

  private lastTouchY = 0;
  private onTouchMove = (event: TouchEvent) => {
    if (this._openness > 0) {
      return;
    }
    const deltaY = event.touches[0].clientY - this.lastTouchY;
    if (this.activeRoller) {
      this.activeRoller.userData.virtualY += (deltaY / window.innerHeight) * 10;
    } else {
      this.updateIntersections(
        event.touches[0].clientX,
        event.touches[0].clientY,
      );
    }
    this.lastTouchY = event.touches[0].clientY;
  };

  private lastMouseY = 0;
  private onMouseMove = (event: MouseEvent) => {
    if (this._openness > 0) {
      document.body.style.cursor = "default";
      return;
    }
    const deltaY = event.y - this.lastMouseY;
    if (this.activeRoller) {
      this.activeRoller.userData.virtualY += (deltaY / window.innerHeight) * 10;
      // this.activeRoller.rotation.x = this.activeRoller.userData.virtualY;
    } else {
      this.updateIntersections(event.clientX, event.clientY);
      document.body.style.cursor =
        tempIntersections.length > 0 ? "ns-resize" : "default";
    }
    this.lastMouseY = event.y;
  };

  private onTouchEnd = (event: TouchEvent) => {
    void event;
    if (this.activeRoller) {
      this.activeRoller.userData.virtualY = nearestNotchAngle(
        this.activeRoller.userData.virtualY,
      );
    }
    this.activeRoller = undefined;
    this.isPointerDown = false;
  };

  private onMouseUp = (event: MouseEvent) => {
    this.updateIntersections(event.clientX, event.clientY);
    if (this.activeRoller) {
      this.activeRoller.userData.virtualY = nearestNotchAngle(
        this.activeRoller.userData.virtualY,
      );
    }
    this.activeRoller = undefined;
    this.isPointerDown = false;
  };

  tick = () => {
    if (!this.glowMaterialOff || !this.glowMaterial || !this.powerLineToLock) {
      // throw new Error("visuals not ready")
      return;
    }
    this.glowMaterialOff.emissive
      .copy(this.glowMaterial.emissive)
      .multiplyScalar(Math.sin(performance.now() * 0.01) * 0.2 + 0.7);
    let stillLocked = false;
    if (this.solved) {
      for (let i = 0; i < this.rollers.length; i++) {
        const roller = this.rollers[i];
        roller.rotation.x +=
          Math.sin(performance.now() * (0.0002 * ((i * 17 + 3) % 6.3)) - 0.02) *
          0.1;
      }
    } else {
      let angleCursor = 0;
      for (let i = 0; i < this.rollers.length; i++) {
        const roller = this.rollers[i];
        if (Math.abs(roller.userData.initialSpinSpeed) > 0.07) {
          roller.userData.virtualY += roller.userData.initialSpinSpeed;
          roller.userData.initialSpinSpeed *= 0.96;
        }
        const nearest = nearestNotchAngle(roller.userData.virtualY);
        const oldAngle = roller.rotation.x;
        const newAngle = lerp(
          roller.userData.virtualY,
          roller.rotation.x - (roller.rotation.x - nearest) * 0.5,
          this.isPointerDown ? 0.9 : 1,
        );
        roller.rotation.x = newAngle;
        const grow = Math.min(0.1, Math.abs(oldAngle - newAngle)) * 0.6;
        roller.scale.set(1 + grow * 2, 1 + grow, 1 + grow);
        if (Math.abs(roller.userData.initialSpinSpeed) <= 0.07 && grow > 0.05) {
          try {
            window.navigator.vibrate(10);
          } catch (e) {
            //
          }
        }
        let foundNextOne = false;
        for (const rollerGlow of roller.children) {
          if (rollerGlow instanceof Mesh) {
            const a = rollerGlow.rotation.x + roller.rotation.x;
            if (!stillLocked && anglesMatch(angleCursor, a, 0.1)) {
              rollerGlow.material = this.glowMaterial;
              angleCursor -= rollerGlow.userData.relativeAngle;
              foundNextOne = true;
            } else {
              rollerGlow.material = this.glowMaterialOff;
            }
          }
        }
        if (!foundNextOne) {
          stillLocked = true;
        }
      }
      if (!stillLocked && !anglesMatch(angleCursor, 0, 0.1)) {
        stillLocked = true;
      }
      if (!stillLocked && !this.solved) {
        for (let i = 0; i < this.rollers.length; i++) {
          const roller = this.rollers[i];
          for (const rollerGlow of roller.children) {
            if (rollerGlow instanceof Mesh) {
              rollerGlow.material = this.glowMaterial;
            }
          }
        }
        this.powerLineToLock.material = this.glowMaterial;
        this.solved = true;
        this.chestData.open();
      }
    }
    // stillLocked = false
    this.openness = clamp(
      0,
      this.chestData.looted ? 1 : 0.8,
      this.openness + (stillLocked ? -0.005 : 0.005),
    );
  };

  activate() {
    this.intervalID = setInterval(this.tick, 1000 / 60);
    document.addEventListener("touchstart", this.onTouchStart);
    document.addEventListener("touchmove", this.onTouchMove);
    document.addEventListener("touchend", this.onTouchEnd);
    document.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
    console.log("activate interactive chest");
    this.chestData.approach();
  }

  stopTickLoop = () => {
    if (this.intervalID !== undefined) {
      clearInterval(this.intervalID);
      this.intervalID = undefined;
    }
  };

  deactivate() {
    if (this.solved && !this.chestData.looted) {
      this.chestData.loot();
      setTimeout(this.stopTickLoop, 2000);
    } else {
      this.stopTickLoop();
    }
    document.removeEventListener("touchstart", this.onTouchStart);
    document.removeEventListener("touchmove", this.onTouchMove);
    document.removeEventListener("touchend", this.onTouchEnd);
    document.removeEventListener("mousedown", this.onMouseDown);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    console.log("deactivate interactive chest");
    this.chestData.abandon();
  }
}
