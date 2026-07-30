import * as THREE from 'three';
import { scene, setupScene } from "./module/scene.js";
import { createWalls } from './module/walls.js';
import { setupFloor } from './module/floor.js';
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

// Handle window resize
// window.addEventListener('resize', () => {
//     camera.aspect = window.innerWidth / window.innerHeight; // updates the camera aspect ratio
//     camera.updateProjectionMatrix(); // updates the camera projection matrix
//     renderer.setSize(window.innerWidth, window.innerHeight); // updates the renderer size
// });


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
    const paintingMaterial = new THREE.MeshBasicMaterial({ map: paintingTexture });
    const paintingGeometry = new THREE.PlaneGeometry(width, height);
    const paintingMesh = new THREE.Mesh(paintingGeometry, paintingMaterial);
    paintingMesh.position.set(position.x, position.y, position.z);
    return paintingMesh;
}

const painting1 = createPainting('/assets/painting1.jpg', 10, 5, new THREE.Vector3( -10,  5, -14.99));
const painting2 = createPainting('/assets/painting1.jpg', 10, 5, new THREE.Vector3( 10,  5, -14.99));

scene.add(painting1, painting2);

// Controls
const onKeyDown = (event) => {
    const keyName = event.key; // gets the name of the key pressed
    switch (keyName) {
        case 'ArrowUp':
            controls.moveForward(0.05); // moves the cube up along the y-axis
            break
        case 'ArrowDown':
            controls.moveForward(-0.05); // moves the cube down along the y-axis
            break;
        case 'ArrowLeft':
            controls.moveRight(-0.05); // moves the cube left along the x-axis
            break;
        case 'ArrowRight':
            controls.moveRight(0.05); // moves the cube right along the x-axis
            break;
    }
};
// Event Listener for when we press the keys
document.addEventListener('keydown', onKeyDown, false);
