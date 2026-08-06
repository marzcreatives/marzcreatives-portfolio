import * as THREE from "three";

export const setupLighting = (scene) => {
  // Ambient light (moderate intensity)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Hemisphere light to give more natural diffuse lighting (helps MeshStandardMaterial)
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.65);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  function createSpotlight(x, y, z, intensity, targetPosition) {
    const spotlight = new THREE.SpotLight(0xffffff, intensity);
    spotlight.position.set(x, y, z);
    spotlight.target.position.copy(targetPosition);
    spotlight.castShadow = true;
    spotlight.angle = 1.57079;
    spotlight.penumbra = 0.2;
    spotlight.decay = 1;
    spotlight.distance = 40;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;

    // Add spotlight and its target to the scene
    scene.add(spotlight);
    scene.add(spotlight.target);

    // Add a helper for this spotlight
    // const spotlightHelper = new THREE.SpotLightHelper(spotlight);
    // scene.add(spotlightHelper);

    return spotlight;
  }

  const frontWallSpotlight = createSpotlight(
    0,
    6.7,
    -13,
    0.948,
    new THREE.Vector3(0, 0, -20),
  );

  const backWallSpotlight = createSpotlight(
    0,
    6.7,
    13,
    0.948,
    new THREE.Vector3(0, 0, 20),
  );

  const leftWallSpotlight = createSpotlight(
    -13,
    6.7,
    0,
    0.948,
    new THREE.Vector3(-20, 0, 0),
  );

  const rightWallSpotlight = createSpotlight(
    13,
    6.7,
    0,
    0.948,
    new THREE.Vector3(20, 0, 0),
  );

  // Return created lights in case caller wants to tweak them
  return {
    ambientLight,
    hemiLight,
    frontWallSpotlight,
    backWallSpotlight,
    leftWallSpotlight,
    rightWallSpotlight,
  };
};
