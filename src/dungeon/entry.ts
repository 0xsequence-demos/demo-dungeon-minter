import {
	PCFSoftShadowMap,
	WebGLRenderer,
} from "three";
import { PerspectiveCamera } from "three";
import { Scene } from "three";
import { Object3D } from "three";
import type { } from "vite";
import { DungeonGame } from "./DungeonGame";
import { initResizeHandler } from "./initResizeHandler";

let game: DungeonGame | undefined
export function getDungeonGame() {
	if (game) {
		return game
	}
	// Create a scene
	const scene = new Scene();

	// Create a camera
	const camera = new PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.02,
		50,
	);
	camera.rotation.order = "YXZ";

	scene.add(camera);
	camera.position.set(0, 0, 5);
	camera.frustumCulled;

	const renderer = new WebGLRenderer();
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = PCFSoftShadowMap;

	renderer.autoClear = true;
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	function rafRender() {
		requestAnimationFrame(rafRender);
		renderer.render(scene, camera);
	}
	rafRender();

	let simulate: ((dt: number) => void) | undefined;
	let lastNow = performance.now();
	function rafSimulate() {
		requestAnimationFrame(rafSimulate);
		const now = performance.now();
		if (simulate) {
			simulate((now - lastNow) * 0.001);
		}
		lastNow = now;
	}
	rafSimulate();
	initResizeHandler(camera, renderer);

	const gamePivot = new Object3D();

	scene.add(gamePivot);

	if (import.meta.hot) {
		import.meta.hot.accept("./DungeonGame", (mod) => {
			if (!mod) {
				return
			}
			while (gamePivot.children.length > 0) {
				gamePivot.remove(gamePivot.children[0]);
			}
			if (game) {
				game.cleanup();
			}
			const g = new mod.DungeonGame(gamePivot, camera);
			simulate = g.simulate;
			game = g
		});
	}
	game = new DungeonGame(gamePivot, camera);
	simulate = game.simulate;
	return game
}
