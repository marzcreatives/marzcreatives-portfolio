import * as THREE from "three";

export const setupFloor = (scene) => {
  const textureLoader = new THREE.TextureLoader();

  // Load the textures
  const colorTexture = textureLoader.load(
    "/assets/plastic_4K/plastic_4K_Color.jpg",
  );
  const displacementTexture = textureLoader.load(
    "/assets/plastic_4K/plastic_4K_Displacement.jpg",
  );
  const normalTexture = textureLoader.load(
    "/assets/plastic_4K/plastic_4K_NormalGL.jpg",
  );
  const roughnessTexture = textureLoader.load(
    "/assets/plastic_4K/plastic_4K_Roughness.jpg",
  );

  // Set texture parameters
  colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
  displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
  normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
  roughnessTexture.wrapS = roughnessTexture.wrapT = THREE.RepeatWrapping;

  const planeGeometry = new THREE.PlaneGeometry(30, 45);
  const planeMaterial = new THREE.MeshStandardMaterial({
    map: colorTexture,
    displacementMap: displacementTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    displacementScale: 0.1,
    side: THREE.DoubleSide,
  });
  planeMaterial.map.repeat.set(5, 5);

  const floorPlane = new THREE.Mesh(planeGeometry, planeMaterial);

  floorPlane.rotation.x = Math.PI / 2;
  floorPlane.position.y = -Math.PI;
  floorPlane.position.z = 0;

  scene.add(floorPlane);
};
