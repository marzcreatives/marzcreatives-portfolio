import * as THREE from "three";
import { updateMovement } from "./movement.js";
import { getCatModel, updateCatAnimation } from "./cat.js";

export const setupRendering = (
  scene,
  camera,
  renderer,
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
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    composer.render();
    requestAnimationFrame(render);
  };

  render();
};
