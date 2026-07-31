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
import { loadCatModel } from "./module/cat.js";

const { camera, controls, renderer, composer } = setupScene();

const textureLoader = new THREE.TextureLoader();

const walls = createWalls(scene, textureLoader);
const floor = setupFloor(scene);
const ceiling = createCeiling(scene, textureLoader); // Reusing the floor setup for the ceiling
const lighting = setupLighting(scene);

createBoundingBoxes(walls);

setupPlayButton(controls, composer);

setupEventListeners(controls);

setupRendering(scene, camera, renderer, controls, walls, composer);

loadCatModel(scene);

// Loop through each wall and create a bounding box
// for (let i = 0; i < wallGroup.children.length; i++) {
//     const wall = wallGroup.children[i];
//     const wallBox = new THREE.Box3().setFromObject(wall); // creates a bounding box from the wall object
//     // wall.userData.boundingBox = wallBox; // stores the bounding box in the userData property of the wall object
// }

// Paintings
const createPainting = (imageURL, width, height, position) => {
  const textureLoader = new THREE.TextureLoader();
  const paintingTexture = textureLoader.load(imageURL);
  const paintingMaterial = new THREE.MeshBasicMaterial({
    map: paintingTexture,
  });
  const paintingGeometry = new THREE.PlaneGeometry(width, height);
  const paintingMesh = new THREE.Mesh(paintingGeometry, paintingMaterial);
  paintingMesh.position.set(position.x, position.y, position.z);
  return paintingMesh;
};

const painting1 = createPainting(
  "/assets/painting1.jpg",
  10,
  5,
  new THREE.Vector3(-10, 5, -22.4),
);
const painting2 = createPainting(
  "/assets/painting1.jpg",
  10,
  5,
  new THREE.Vector3(10, 5, -22.4),
);

scene.add(painting1, painting2);
