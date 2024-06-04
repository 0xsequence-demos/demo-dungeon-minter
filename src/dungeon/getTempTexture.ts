import { DataTexture } from "three";

let tempTex: DataTexture | undefined;
export function getTempTexture() {
  if (!tempTex) {
    const s = 4;
    const total = s * s * 4;
    const data = new Float64Array(total);
    for (let i = 0; i < total; i++) {
      data[i] = 1;
    }
    tempTex = new DataTexture(data, s, s);
  }
  return tempTex;
}
