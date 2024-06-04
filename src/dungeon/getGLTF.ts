import { type GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";

const gltfBank = new Map<string, Promise<GLTF>>();

export function getGLTF(filePath: string) {
  if (!gltfBank.has(filePath)) {
    const l = new GLTFLoader();
    const gltfPromise = l.loadAsync(filePath);
    gltfBank.set(filePath, gltfPromise);
    return gltfPromise;
  }
  const gltfPromise = gltfBank.get(filePath);
  if (!gltfPromise) {
    throw new Error(`No GLTF by that path: ${filePath}`);
  }
  return gltfPromise;
}
