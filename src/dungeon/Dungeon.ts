import {
  BoxGeometry,
  Mesh,
  MeshPhongMaterial,
  NearestFilter,
  type Object3D,
  PlaneGeometry,
  PointLight,
  RepeatWrapping,
  SphereGeometry,
  type Texture,
  TextureLoader,
} from "three";
import { type MapData, MapTiles } from "./MapTypes";
import { createErrorXGeometry } from "./createErrorXGeometry";
import { getTempTexture } from "./getTempTexture";

export class Dungeon {
  constructor(
    private pivot: Object3D,
    map: MapData,
  ) {
    const texLoader = new TextureLoader();

    // texLoader.load('./js/app/portal-3.gif', function (texture) {

    const wallMaterial = new MeshPhongMaterial({
      map: getTempTexture(),
      normalMap: getTempTexture(),
      // shininiess: 1
    });

    function processTexture(texture: Texture) {
      texture.magFilter = NearestFilter;
      texture.minFilter = NearestFilter;
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(1, 1);
    }

    texLoader.load("assets/textures/brick/diffuse.png", (diffuse) => {
      processTexture(diffuse);
      wallMaterial.map = diffuse;
    });

    texLoader.load("assets/textures/brick/normal.png", (normal) => {
      processTexture(normal);
      wallMaterial.normalMap = normal;
    });

    const basicWallGeom = new BoxGeometry(1, 1, 1);
    const basicTileGeom = new PlaneGeometry(1, 1, 1);

    const bulbGeo = new SphereGeometry(0.05, 32, 16);
    const bulbMaterial = new MeshPhongMaterial({
      color: 0xffffcc,
      emissive: 0xffffcc,
    });

    const errorGeom = createErrorXGeometry();
    const errorMaterial = new MeshPhongMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
    });
    for (let y = 0; y < map.length; y++) {
      const row = map[y];
      for (let x = 0; x < row.length; x++) {
        const type = row[x];

        if (type === MapTiles.wall) {
          const mesh = new Mesh(basicWallGeom, wallMaterial);
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          mesh.position.x = x;
          mesh.position.y = 0.5;
          mesh.position.z = y;
          this.pivot.add(mesh);
        } else {
          const floorMesh = new Mesh(basicTileGeom, wallMaterial);
          floorMesh.castShadow = false;
          floorMesh.receiveShadow = true;

          floorMesh.position.x = x;
          floorMesh.position.y = 0;
          floorMesh.position.z = y;
          floorMesh.rotation.x = Math.PI * -0.5;
          this.pivot.add(floorMesh);

          const ceilMesh = new Mesh(basicTileGeom, wallMaterial);
          ceilMesh.castShadow = false;
          ceilMesh.receiveShadow = true;

          ceilMesh.position.x = x;
          ceilMesh.position.y = 1;
          ceilMesh.position.z = y;
          ceilMesh.rotation.x = Math.PI * 0.5;
          this.pivot.add(ceilMesh);

          if (type === MapTiles.light) {
            const bulb = new Mesh(bulbGeo, bulbMaterial);
            bulb.position.x = x;
            bulb.position.z = y;
            bulb.position.y = 0.871;
            const bulbLight = new PointLight(0xfff0dd, 0.8, 4);
            // bulbLight.castShadow = true;
            bulbLight.shadow.mapSize.setScalar(512);
            bulbLight.shadow.camera.near = 0.075;
            bulbLight.shadow.camera.far = 0.13;
            bulb.add(bulbLight);
            this.pivot.add(bulb);
          } else if (type === MapTiles.unknown) {
            const errorMesh = new Mesh(errorGeom, errorMaterial);
            errorMesh.position.x = x;
            errorMesh.position.y = 0.5;
            errorMesh.position.z = y;
            this.pivot.add(errorMesh);
          }
        }
      }
    }
  }
}
