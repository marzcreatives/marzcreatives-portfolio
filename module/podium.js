import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { getComputerModel } from "./loadComputer.js";

// Save references to toggle display styles over the screens later
export let podiumUIObjects = {
  menu: null,
  about: null,
  info: null,
};

/**
 * Changes active visible tab within the 3D computer screen geometry layout context
 */
export function switchPodiumScreenTab(activeTabId) {
  Object.keys(podiumUIObjects).forEach((key) => {
    const cssObj = podiumUIObjects[key];
    if (cssObj) {
      cssObj.element.style.display = key === activeTabId ? "block" : "none";
    }
  });
}

export function createPodium(scene, cssScene) {
  const masterModel = getComputerModel();
  if (!masterModel) {
    console.error("Error: Computer model has not been preloaded yet!");
    return null;
  }

  const podiumGroup = new THREE.Group();

  // 1. Create the Podium Mesh
  const podiumGeometry = new THREE.BoxGeometry(2.5, 1.5, 2.5);
  const podiumMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
  podium.position.set(0, 0, 0);
  podiumGroup.add(podium);

  // 2. Clone and place the computer model on top of podium surface
  const computer = masterModel.clone();
  computer.scale.set(0.4, 0.4, 0.4);
  computer.position.set(0, 0.75, -0.2);
  podiumGroup.add(computer);

  computer.traverse((child) => {
    if (
      child.isMesh &&
      (child.name.endsWith("_2") || child.name.endsWith("002"))
    ) {
      child.material.transparent = true;
      child.material.opacity = 0.0;
      child.material.blending = THREE.NoBlending; // Clears backing artifacts
    }
  });

  // 4. Wrap HTML DOM elements as CSS3DObjects
  const menuEl = document.getElementById("menu");
  const aboutEl = document.getElementById("about-overlay");
  const infoEl = document.getElementById("info-panel");

  // Mount them cleanly into our tracking layout dictionary
  if (menuEl) podiumUIObjects.menu = new CSS3DObject(menuEl);
  if (aboutEl) podiumUIObjects.about = new CSS3DObject(aboutEl);
  if (infoEl) podiumUIObjects.info = new CSS3DObject(infoEl);

  // Common scaling and positioning offset alignments matching monitor frame
  Object.keys(podiumUIObjects).forEach((key) => {
    const cssObj = podiumUIObjects[key];
    if (!cssObj) return;

    // Convert pixel scale to fit perfectly on the 3D monitor screen
    cssObj.scale.set(0.0022, 0.0022, 0.0022);
    cssObj.position.set(0, 2.18, 0.05); // Aligned cleanly with monitor geometry position
    cssObj.rotation.set(0, 0, 0);

    // Initial display states
    cssObj.element.style.display = key === "menu" ? "block" : "none";

    // Add to the dedicated CSS3D scene graph loop
    cssScene.add(cssObj);
  });

  // Position base group container at ground origin
  podiumGroup.position.set(0, 0, 0);
  scene.add(podiumGroup);

  return podiumGroup;
}
