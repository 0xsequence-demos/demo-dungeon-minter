import { Mesh } from "three";
import { getGLTF } from "./getGLTF";

export async function getProtoObject(gltfName: string, name: string) {
  const tileset = await getGLTF(`assets/models/${gltfName}.glb`);
  const obj = tileset.scene.getObjectByName(name);
  if (!obj) {
    throw new Error(`Could not find object named ${name}`);
  }
  return obj;
}
export async function getProtoMesh(gltfName: string, name: string) {
  const obj = await getProtoObject(gltfName, name);
  if (!(obj instanceof Mesh)) {
    throw new Error(`object named ${name} is not a mesh`);
  }
  return obj;
}
