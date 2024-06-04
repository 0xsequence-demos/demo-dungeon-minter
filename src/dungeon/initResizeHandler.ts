import type { PerspectiveCamera, WebGLRenderer } from "three";

export function initResizeHandler(
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
) {
  // Resize handler
  function onWindowResize() {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onWindowResize);
}
