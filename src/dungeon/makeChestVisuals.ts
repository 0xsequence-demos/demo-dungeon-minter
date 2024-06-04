import type { Object3D, PerspectiveCamera } from "three";
import type { ChestData } from "./ChestData";
import { InteractiveChest } from "./InteractiveChest";

export async function makeChestVisuals(
  chestDatas: ChestData[],
  pivot: Object3D,
  chests: InteractiveChest[],
  camera: PerspectiveCamera,
) {
  for (const chestData of chestDatas) {
    const chest = new InteractiveChest(chestData, camera);
    const v = chest.visuals;
    pivot.add(v);
    v.position.x = chestData.x;
    v.position.z = chestData.y;
    v.rotation.y = chestData.direction;
    v.updateMatrix();
    v.translateZ(-0.3);
    chests.push(chest);
  }
}
