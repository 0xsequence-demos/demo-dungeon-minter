import { BoxGeometry, Euler, Quaternion } from "three";
import { BufferGeometryUtils } from "three/examples/jsm/Addons.js";

export function createErrorXGeometry() {
  const errorSubGeom = new BoxGeometry(1.3, 0.02, 0.02);
  function cloneAngled(x: number, y: number, z: number) {
    const q = new Quaternion().setFromEuler(new Euler(x, y, z));
    return errorSubGeom.clone().applyQuaternion(q);
  }
  return BufferGeometryUtils.mergeGeometries([
    cloneAngled(0, Math.PI * -0.25, Math.PI * -0.21),
    cloneAngled(0, Math.PI * -0.25, Math.PI * 0.21),
    cloneAngled(0, Math.PI * 0.25, Math.PI * -0.21),
    cloneAngled(0, Math.PI * 0.25, Math.PI * 0.21),
  ]);
}
