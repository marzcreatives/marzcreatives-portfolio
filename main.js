import * as THREE from "three";
import { setupRendering, animationState } from "./module/rendering.js";
import { scene, setupScene, cssScene } from "./module/scene.js";
import { createWalls } from "./module/walls.js";
import { setupFloor } from "./module/floor.js";
import { setupLighting } from "./module/lighting.js";
import { createCeiling } from "./module/ceiling.js";
import { createBoundingBoxes } from "./module/boundingBox.js";
import { setupEventListeners } from "./module/eventListeners.js";
import { setupPlayButton } from "./module/menu.js";
import { loadCatModel } from "./module/loadCat.js";
import { loadComputerModel } from "./module/loadComputer.js";
import { createPodium, switchPodiumScreenTab } from "./module/podium.js";
import { loadMonitorModel, addScreenImage } from "./module/loadScreen.js";
import { screenData } from "./module/screenData.js";

const { camera, controls, renderer, cssRenderer, composer } = setupScene();
const textureLoader = new THREE.TextureLoader();

const walls = createWalls(scene, textureLoader);
const floor = setupFloor(scene);
const ceiling = createCeiling(scene, textureLoader);
const lighting = setupLighting(scene);

createBoundingBoxes(walls);

setupPlayButton(controls);
setupEventListeners(controls, camera, scene);

setupRendering(
  scene,
  camera,
  renderer,
  cssRenderer,
  cssScene,
  controls,
  walls,
  composer,
);
loadCatModel(scene);

loadComputerModel()
  .then(() => {
    const deskGroup = createPodium(scene, cssScene);
    animationState.podiumGroupRef = deskGroup;
  })
  .catch((err) => console.error("Asset loading failed:", err));

window.addEventListener("keydown", (e) => {
  if (animationState.isSinking || animationState.isRising) return;

  const key = e.key.toLowerCase();
  if (key === "a") {
    switchPodiumScreenTab("about-overlay");
  } else if (key === "i") {
    switchPodiumScreenTab("info-panel");
  }
});

loadMonitorModel().then(() => {
  screenData.forEach((config) => {
    try {
      addScreenImage(scene, config);
    } catch (e) {}
  });
});
