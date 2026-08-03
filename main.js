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
import { createPodium } from "./module/podium.js";
import { loadMonitorModel, addScreenImage } from "./module/loadScreen.js";
import { screenData } from "./module/screenData.js";

const { camera, controls, renderer, cssRenderer, composer } = setupScene();

const textureLoader = new THREE.TextureLoader();

const walls = createWalls(scene, textureLoader);
const floor = setupFloor(scene);
const ceiling = createCeiling(scene, textureLoader);
const lighting = setupLighting(scene);

createBoundingBoxes(walls);

setupPlayButton(controls, composer);
setupEventListeners(controls);

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
    // 3. Inject cssScene reference context and capture the created group reference
    const generatedPodium = createPodium(scene, cssScene, textureLoader);
    animationState.podiumGroupRef = generatedPodium;

    // 4. Hook closing/enter menu trigger event onto your actual play element wrapper
    const playBtn = document.getElementById("play_button");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        // Enable animation sink process flags
        animationState.isSinking = true;

        // Shut off click accessibility over components inside the space
        document.getElementById("menu").style.pointerEvents = "none";
      });
    }
  })
  .catch((err) => {
    console.error("Asset loading failed:", err);
  });

loadMonitorModel()
  .then(() => {
    screenData.forEach((config) => {
      try {
        const monitor = addScreenImage(scene, config);
      } catch (err) {
        console.error("Failed to create monitor instance:", err);
      }
    });
  })
  .catch((err) => console.error("Error preloading master GLB asset:", err));
