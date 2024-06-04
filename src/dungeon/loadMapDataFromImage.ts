import { type MapData, MapTiles } from "./MapTypes";

const tileByColor = new Map<bigint, MapTiles>();
tileByColor.set(0x000000n, MapTiles.wall);
tileByColor.set(0xffffffn, MapTiles.floor);
tileByColor.set(0xffff00n, MapTiles.light);

export function loadMapDataFromImage(imagePath: string) {
  return new Promise<MapData>((resolve) => {
    const mini_map: MapData = [];
    // 2b) Load an image from which to get data
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const w = img.width;
      const h = img.height;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not start 2d context on canvas");
      }
      //@ts-ignore
      ctx.mozImageSmoothingEnabled = false;
      //@ts-ignore
      ctx.webkitImageSmoothingEnabled = false;
      //@ts-ignore
      ctx.msImageSmoothingEnabled = false;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, w, h);
      const arr = data.data;
      for (let iy = 0; iy < h; iy++) {
        const row: MapTiles[] = [];
        for (let ix = 0; ix < w; ix++) {
          const i = (iy * w + ix) * 4;
          const r = BigInt(arr[i]);
          const g = BigInt(arr[i + 1]);
          const b = BigInt(arr[i + 2]);
          const color = (r << 16n) + (g << 8n) + b;
          row[ix] = tileByColor.get(color) || MapTiles.unknown;
        }
        mini_map.push(row);
      }
      resolve(mini_map);
    };
    img.src = imagePath; // set this *after* onload
  });
}
