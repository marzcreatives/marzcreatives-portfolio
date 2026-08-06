import * as THREE from "three";
import { updateMovement } from "./movement.js";
import { getCatModel, updateCatAnimation } from "./loadCat.js";
import { switchPodiumScreenTab, syncPodiumScreenOverlay } from "./podium.js";

export const globalUniforms = { uTime: { value: 0 } };

export const animationState = {
  isSinking: false,
  isRising: false,
  podiumGroupRef: null,
  cameraRef: null,
  controlsRef: null,
};

const SHOWN_Y = 0;
const SUNK_Y = -7;

export const setupRendering = (
  scene,
  camera,
  renderer,
  cssRenderer,
  cssScene,
  controls,
  walls,
  composer,
) => {
  const clock = new THREE.Clock();
  const frustum = new THREE.Frustum();
  const projScreenMatrix = new THREE.Matrix4();

  animationState.cameraRef = camera;
  animationState.controlsRef = controls;

  let render = function () {
    const delta = clock.getDelta();

    // Allow user movement only when the podium is fully hidden underground
    if (
      !animationState.isRising &&
      animationState.podiumGroupRef?.position.y <= SUNK_Y + 0.1
    ) {
      if (walls && walls.children) {
        updateMovement(delta, controls, camera, walls);
      }
    }

    // --- SINKING ANIMATION LOOP ---
    if (animationState.isSinking && animationState.podiumGroupRef) {
      if (animationState.podiumGroupRef.position.y > SUNK_Y) {
        const fallAmount = 4.5 * delta;
        animationState.podiumGroupRef.position.y -= fallAmount;
      } else {
        animationState.podiumGroupRef.position.y = SUNK_Y;
        animationState.isSinking = false;
      }
    }

    // --- RISING ANIMATION LOOP ---
    if (animationState.isRising && animationState.podiumGroupRef) {
      // Smoothly lerp camera position and looking direction back to the desk view frame
      camera.position.lerp(new THREE.Vector3(0, 2, 3), 5.0 * delta);
      controls
        .getObject()
        .quaternion.slerp(new THREE.Quaternion(), 5.0 * delta);

      if (animationState.podiumGroupRef.position.y < SHOWN_Y) {
        const riseAmount = 4.75 * delta;
        animationState.podiumGroupRef.position.y += riseAmount;
      } else {
        animationState.podiumGroupRef.position.y = SHOWN_Y;
        animationState.isRising = false;
      }
    }

    // Cat geometry tracker checks
    const cat = getCatModel();
    if (cat) {
      camera.updateMatrixWorld();
      projScreenMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse,
      );
      frustum.setFromProjectionMatrix(projScreenMatrix);
      if (frustum.intersectsObject(cat)) {
        updateCatAnimation(delta);
      }
    }

    globalUniforms.uTime.value = clock.getElapsedTime();

    syncPodiumScreenOverlay();

    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;

    composer.render();
    cssRenderer.render(cssScene, camera);
    requestAnimationFrame(render);
  };

  render();
};

/**
 * Commands the podium to sink out of the way smoothly
 */
export function triggerPodiumSink() {
  animationState.isRising = false;
  animationState.isSinking = true;
}

/**
 * Commands the podium to rise back up and snap camera orientation
 */
export function triggerPodiumRise() {
  animationState.isSinking = false;
  animationState.isRising = true;
}
