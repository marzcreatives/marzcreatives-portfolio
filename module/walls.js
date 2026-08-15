import * as THREE from "three";

const ROOM_WIDTH = 30;
const ROOM_DEPTH = 45;
const ROOM_HEIGHT = 20;

export function createWalls(scene, textureLoader) {
  let wallGroup = new THREE.Group();
  scene.add(wallGroup);

  const diffuseTexture = textureLoader.load(
    "/assets/concrete_tile_facade_4k/textures/concrete_tile_facade_diff_4k.jpg",
  );
  const displacementTexture = textureLoader.load(
    "/assets/concrete_tile_facade_4k/textures/concrete_tile_facade_disp_4k.png",
  );

  diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
  displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;

  const wallMaterial = new THREE.MeshStandardMaterial({
    map: diffuseTexture,
    displacementMap: displacementTexture,
    side: THREE.DoubleSide,
  });
  wallMaterial.needsUpdate = true;
  wallMaterial.map.repeat.set(10, 4);

  // Front Wall
  const frontWall = new THREE.Mesh(
    new THREE.BoxGeometry(50, 20, 0.001),
    wallMaterial,
  );

  frontWall.position.z = -ROOM_DEPTH / 2;

  // Left Wall
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(45, 20, 0.001),
    wallMaterial,
  );

  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.x = -ROOM_WIDTH / 2;

  // Right Wall
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(45, 20, 0.001),
    wallMaterial,
  );

  rightWall.position.x = ROOM_WIDTH / 2;
  rightWall.rotation.y = Math.PI / 2;

  // Back Wall
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(50, 20, 0.001),
    wallMaterial,
  );
  backWall.position.z = ROOM_DEPTH / 2;

  wallGroup.add(frontWall, backWall, leftWall, rightWall);

  return wallGroup;
}
