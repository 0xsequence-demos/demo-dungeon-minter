import { Mesh, type Object3D } from "three";

export function getChildObj(base: Object3D, name: string) {
  const obj = base.getObjectByName(name);
  if (!obj) {
    throw new Error(`object does not have a child named ${name}`);
  }
  return obj;
}

export function getChildMesh(base: Object3D, name: string) {
  const obj = getChildObj(base, name);
  if (!(obj instanceof Mesh)) {
    throw new Error(`object ${name} is not a mesh`);
  }
  return obj;
}
