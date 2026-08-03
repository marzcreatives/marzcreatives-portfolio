import * as THREE from "three";
import { scene, setupScene } from "./module/scene.js";
import { createWalls } from "./module/walls.js";
import { setupFloor } from "./module/floor.js";
import { setupLighting } from "./module/lighting.js";
import { createCeiling } from "./module/ceiling.js";
import { createBoundingBoxes } from "./module/boundingBox.js";
import { setupEventListeners } from "./module/eventListeners.js";
import { setupRendering } from "./module/rendering.js";
import { setupPlayButton } from "./module/menu.js";
import { loadCatModel } from "./module/loadCat.js";
import { loadComputerModel } from "./module/loadComputer.js";
import { createPodium } from "./module/podium.js";
import { loadMonitorModel, addScreenImage } from "./module/loadScreen.js";
import { screenData } from "./module/screenData.js";

const { camera, controls, renderer, composer } = setupScene();

const textureLoader = new THREE.TextureLoader();

const walls = createWalls(scene, textureLoader);
const floor = setupFloor(scene);
const ceiling = createCeiling(scene, textureLoader);
const lighting = setupLighting(scene);

createBoundingBoxes(walls);

setupPlayButton(controls, composer);

setupEventListeners(controls);

setupRendering(scene, camera, renderer, controls, walls, composer);

loadCatModel(scene);

loadComputerModel()
  .then(() => {
    createPodium(scene, textureLoader);
    console.log("Scene successfully constructed across split modules!");
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

// Paintings
// const createPainting = (imageURL, width, height, position) => {
//   const textureLoader = new THREE.TextureLoader();
//   const paintingTexture = textureLoader.load(imageURL);
//   const paintingMaterial = new THREE.MeshBasicMaterial({
//     map: paintingTexture,
//   });
//   const paintingGeometry = new THREE.PlaneGeometry(width, height);
//   const paintingMesh = new THREE.Mesh(paintingGeometry, paintingMaterial);
//   paintingMesh.position.set(position.x, position.y, position.z);
//   return paintingMesh;
// };

// const painting1 = createPainting(
//   "/assets/painting1.jpg",
//   10,
//   5,
//   new THREE.Vector3(-10, 5, -22.4),
// );
// const painting2 = createPainting(
//   "/assets/painting1.jpg",
//   10,
//   5,
//   new THREE.Vector3(10, 5, -22.4),
// );

// scene.add(painting1, painting2);
