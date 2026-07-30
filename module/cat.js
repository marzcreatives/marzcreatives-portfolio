import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let mixer;

export const loadCatModel = (scene) => {
  const loader = new GLTFLoader();

  loader.load(
    "/models/cat/scene.gltf",
    (gltf) => {
      const cat = gltf.scene;
      cat.position.set(-12, -2.9, 19);
      cat.rotation.set(0, Math.PI / 3, 0);
      cat.scale.set(3, 3, 3);
      scene.add(cat);
      console.log("Animations:", gltf.animations);
      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(cat);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
      }
    },
    undefined,
    (error) => {
      console.error("Failed to load cat model", error);
    },
  );
};
export const updateCatAnimation = (delta) => {
  if (mixer) mixer.update(delta);
};
