import * as THREE from "three";
import { getComputerModel } from "./loadComputer.js";

/**
 * Creates the podium setup using the preloaded model.
 * Make sure loadComputerModel() has resolved before calling this.
 */
export function createPodium(scene, textureLoader) {
  const masterModel = getComputerModel();

  if (!masterModel) {
    console.error("Error: Computer model has not been preloaded yet!");
    return;
  }

  const podiumGroup = new THREE.Group();

  // 1. Create the Podium Mesh
  const podiumGeometry = new THREE.BoxGeometry(2.5, 1.5, 2.5);
  const podiumMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
  });
  const podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
  podium.position.set(0, 0, 0);
  podiumGroup.add(podium);

  // 2. Clone the preloaded computer model
  const computer = masterModel.clone();
  computer.scale.set(0.4, 0.4, 0.4);
  computer.position.set(0, 0.75, -0.2); // Positioned on top of the podium
  podiumGroup.add(computer);

  // 3. Add a screen image to the computer monitor
  const screenTexture = textureLoader.load("/assets/painting1.jpg");
  const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture });
  const screenGeometry = new THREE.PlaneGeometry(1.5, 1);
  const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
  screenMesh.position.set(0, 2.0, 0.51);
  //   podiumGroup.add(screenMesh);

  // 4. Add to scene
  podiumGroup.position.set(0, 0, 0);
  scene.add(podiumGroup);
}
