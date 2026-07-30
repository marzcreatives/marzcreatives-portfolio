import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let mixer;
let catModel = null;

export const loadCatModel = (scene) => {
  const loader = new GLTFLoader();

  loader.load(
    "/models/cat/scene.gltf",
    (gltf) => {
      const cat = gltf.scene;
      cat.traverse((child) => {
        if (child.isMesh && !catModel) {
          catModel = child;
        }
      });

      cat.position.set(-12, -2.9, 19);
      cat.rotation.set(0, Math.PI / 3, 0);
      cat.scale.set(2, 2, 2);
      scene.add(cat);
      console.log("Animations:", gltf.animations);

      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(cat);
        const action = mixer.clipAction(gltf.animations[0]);
        action.setLoop(THREE.LoopRepeat);
        action.clampWhenFinished = false;
        action.play();
      }
    },
    undefined,
    (error) => {
      console.error("Failed to load cat model", error);
    },
  );
};

export const getCatModel = () => catModel;

export const updateCatAnimation = (delta) => {
  if (mixer) mixer.update(delta);
};
