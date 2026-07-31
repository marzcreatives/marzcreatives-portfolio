import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { globalUniforms } from "./rendering.js";

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// Cache the master model so we only download it once from the network
let masterModel = null;

/**
 * Preloads the monitor GLB model once.
 * @returns {Promise<THREE.Group>}
 */
export function initMonitorModel() {
  return new Promise((resolve, reject) => {
    loader.load(
      "/models/screen/tv_screen.glb",
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
 * Calculates the bounding dimensions of the 3D screen mesh
 * and crops the image texture cleanly to fit inside it.
 */
function rebuildMeshUVs(mesh, imageWidth, imageHeight) {
  // 1. Reset wrapping and matrix states to standard defaults
  mesh.material.map.wrapS = THREE.ClampToEdgeWrapping;
  mesh.material.map.wrapT = THREE.ClampToEdgeWrapping;
  mesh.material.map.matrixAutoUpdate = true;

  // 2. Lock the target monitor screen ratio we calculated earlier
  const screenAspect = 1.403;
  const imageAspect = imageWidth / imageHeight;

  // 3. Compute the proper aspect crop factors
  let scaleX = 1;
  let scaleY = 1;

  if (imageAspect > screenAspect) {
    // Image is wider than the monitor -> match height, crop left/right sides
    scaleX = screenAspect / imageAspect;
  } else {
    // Image is taller than the monitor -> match width, crop top/bottom sides
    scaleY = imageAspect / screenAspect;
  }

  const positionAttribute = mesh.geometry.attributes.position;
  const uvAttribute = mesh.geometry.attributes.uv;

  if (positionAttribute && uvAttribute) {
    // We need to look up raw 2D bounding boxes to scale the coordinates accurately
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }
    const localBox = mesh.geometry.boundingBox;

    // Scan all three axes to find the two representing the flat display plane
    const sizeX = localBox.max.x - localBox.min.x;
    const sizeY = localBox.max.y - localBox.min.y;
    const sizeZ = localBox.max.z - localBox.min.z;

    const dimensions = [
      { axis: "x", size: sizeX, min: localBox.min.x },
      { axis: "y", size: sizeY, min: localBox.min.y },
      { axis: "z", size: sizeZ, min: localBox.min.z },
    ].sort((a, b) => b.size - a.size);

    const widthData = dimensions[0];
    const heightData = dimensions[1];

    for (let i = 0; i < positionAttribute.count; i++) {
      // Map raw spatial vertex structure to a standard 0 to 1 frame
      const rawX =
        positionAttribute[
          widthData.axis === "x"
            ? "getX"
            : widthData.axis === "y"
              ? "getY"
              : "getZ"
        ](i);
      const rawY =
        positionAttribute[
          heightData.axis === "x"
            ? "getX"
            : heightData.axis === "y"
              ? "getY"
              : "getZ"
        ](i);

      let u = (rawX - widthData.min) / widthData.size;
      // Keeps the orientation calculation right-side up
      let v = 1 - (rawY - heightData.min) / heightData.size;

      // 4. Center-frame the bounding box scales cleanly
      u = (u - 0.5) * scaleX + 0.5;
      v = (v - 0.5) * scaleY + 0.5;

      uvAttribute.setXY(i, u, v);
    }

    uvAttribute.needsUpdate = true;
  }
}

const noiseMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: globalUniforms.uTime,
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;

    float random(vec2 p) {
      return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uvNoise = vUv + vec2(0.0, uTime * 15.0); 
      float noise = random(uvNoise);

      // FIX: Dim the noise particles. Instead of full 0.0-1.0 white, we squash it to 0.1-0.45 gray.
      float dimmedNoise = 0.1 + noise * 0.35;
      vec3 noiseColor = vec3(dimmedNoise);

      // Add horizontal scanline shadows for a vintage CRT feel
      float scanline = sin(vUv.y * 600.0) * 0.05;
      noiseColor -= scanline;

      gl_FragColor = vec4(noiseColor, 1.0);
    }
  `,
});

/**
 * Creates a unique monitor instance, applies a custom texture, and positions it.
 * @param {Object} props - Configuration properties
 * @param {string} props.imagePath - Path to the screen image texture
 * @param {Array} props.position - [x, y, z] coordinates
 * @param {Array} [props.rotation] - Optional [x, y, z] rotation in radians
 * @returns {THREE.Group} The configured monitor mesh group
 */

export function addScreenImage(scene, props) {
  if (!masterModel) {
    throw new Error(
      "Master monitor model not initialized. Call initMonitorModel first.",
    );
  }

  // Destructure with safe default fallbacks for missing properties
  const { imagePath, position, rotation = [0, 0, 0] } = props;

  // Clone the master model so each monitor behaves independently
  const monitorInstance = masterModel.clone();

  // Load and configure the unique texture for this screen
  const screenTexture = textureLoader.load(imagePath, (loadedTex) => {
    monitorInstance.traverse((child) => {
      if (child.isMesh && child.name.endsWith("_2")) {
        rebuildMeshUVs(child, loadedTex.image.width, loadedTex.image.height);
        child.material.needsUpdate = true;
      }
    });
  });
  screenTexture.colorSpace = THREE.SRGBColorSpace;
  screenTexture.flipY = false;

  monitorInstance.traverse((child) => {
    if (child.isMesh && child.name.endsWith("_2")) {
      if (imagePath === "noise") {
        child.material = noiseMaterial;
      } else {
        child.material = new THREE.MeshStandardMaterial({
          map: screenTexture,
          roughness: 0.2,
          metalness: 0.1,
          emissive: new THREE.Color(0xffffff),
          emissiveMap: screenTexture,
          emissiveIntensity: 0.4,
        });
      }
    }
  });

  monitorInstance.scale.set(0.05, 0.05, 0.05);

  // Set physical transformation properties using the safe destructured variables
  monitorInstance.position.set(...position);
  monitorInstance.rotation.set(...rotation);

  // Directly inject the instance into your global loop layout scene
  scene.add(monitorInstance);

  return monitorInstance;
}
