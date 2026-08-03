import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { getComputerModel } from "./loadComputer.js";

export function createPodium(scene, cssScene, textureLoader) {
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

  // 2. Clone the computer model
  const computer = masterModel.clone();
  computer.scale.set(0.4, 0.4, 0.4);
  computer.position.set(0, 0.75, -0.2);
  podiumGroup.add(computer);

  // 3. Hide target underlying screen mesh to clear space for clean rendering overlays
  computer.traverse((child) => {
    if (
      child.isMesh &&
      (child.name.endsWith("_2") || child.name.endsWith("002"))
    ) {
      child.material.transparent = true;
      child.material.opacity = 0.0;
    }
  });

  // 4. Transform DOM UI containers into active 3D items inside our space
  const element = document.getElementById("menu");
  element.style.display = "block"; // Make visible to CSS renderer pipeline execution

  const cssObject = new CSS3DObject(element);

  // Scale factor adjustments map pixel coordinates to 3D matrix space sizes
  cssObject.scale.set(0.0035, 0.0035, 0.0035);
  cssObject.position.set(0, 1.45, 0.12); // Positioned directly over the physical monitor boundaries

  podiumGroup.add(cssObject);

  podiumGroup.position.set(0, 0, 0);
  scene.add(podiumGroup);

  return podiumGroup; // Pass reference out to main configuration loops
}
