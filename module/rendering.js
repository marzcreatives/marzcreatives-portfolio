import * as THREE from "three";
import { updateMovement } from "./movement.js";
import { getCatModel, updateCatAnimation } from "./loadCat.js";

export const globalUniforms = { uTime: { value: 0 } };

export const animationState = {
  isSinking: false,
  podiumGroupRef: null,
};

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

  let render = function () {
    const delta = clock.getDelta();

    updateMovement(delta, controls, camera, walls);

    // 3. Sinking animation evaluation loop
    if (animationState.isSinking && animationState.podiumGroupRef) {
      if (animationState.podiumGroupRef.position.y > -3.0) {
        animationState.podiumGroupRef.position.y -= 3.5 * delta; // Framerate independent drop speed
      } else {
        animationState.isSinking = false; // Kill logic cycles when out of view bounds
      }
    }

    const distanceThreshold = 8;
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

    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    composer.render();
    cssRenderer.render(cssScene, camera);

    requestAnimationFrame(render);
  };

  render();
};
