import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
let masterModel = null;

/**
 * Preloads the monitor GLB model once.
 * @returns {Promise<THREE.Group>}
 */
export function loadComputerModel() {
  return new Promise((resolve, reject) => {
    if (masterModel) {
      resolve(masterModel);
      return;
    }

    loader.load(
      "/models/computer/computer.glb",
      (gltf) => {
        masterModel = gltf.scene;
        resolve(masterModel);
      },
      undefined,
      (error) => reject(error),
    );
  });
}

/**
 * Safe getter to retrieve the preloaded model from other files.
 * @returns {THREE.Group|null}
 */
export function getComputerModel() {
  return masterModel;
}
