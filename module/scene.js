import * as THREE from "three";
import { PointerLockControls } from "three-stdlib";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";

export const scene = new THREE.Scene(); // create a scene
export const cssScene = new THREE.Scene(); // 1. Create the CSS3D Scene

let camera;
let controls;
let renderer;
let cssRenderer; // 2. Declare cssRenderer variable
let composer;

export const setupScene = () => {
  // PerspectiveCamera is a type of camera that mimics the way the human eye sees things. It takes 4 parameters: field of view, aspect ratio, near clipping plane, and far clipping plane. The field of view is the extent of the scene that is seen on the display at any given moment. The aspect ratio should be the width of the element divided by the height (in this case, the screen width and height). The camera will not render objects that are closer to the camera than the near clipping plane or further away than the far clipping plane. Objects that are exactly on the clipping plane will not be rendered.
  camera = new THREE.PerspectiveCamera(
    60, // fov = field of view
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  scene.add(camera); // add the camera to the scene
  camera.position.set(0, 2, 3); // move the camera up 2 units in the Y axis, 3 back in the Z axis
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic look
  renderer.toneMappingExposure = 0.5; // Darkens over-brightness
  document.body.appendChild(renderer.domElement); // adds the renderer to the HTML document
  renderer.shadowMap.enabled = true; // enable shadow mapping
  renderer.shadowMap.type = THREE.PCFShadowMap; // `renderer.shadowMap.type` is a property that defines the type of shadow map used by the renderer. THREE.PCFSoftShadowMap is one of the available shadow map types and stands for Percentage-Closer Filtering Soft Shadow Map. This type of shadow map uses an algorithm to smooth the edges of shadows and make them appear softer

  // 3. Setup CSS3D Renderer over the WebGL Canvas
  cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position = "absolute";
  cssRenderer.domElement.style.top = "0px";
  cssRenderer.domElement.style.left = "0px";
  cssRenderer.domElement.style.pointerEvents = "auto";
  cssRenderer.domElement.style.zIndex = "10";
  cssRenderer.domElement.style.background = "transparent";
  document.body.appendChild(cssRenderer.domElement);

  composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const filmPass = new FilmPass(0.35, 0.025, 648, false);
  composer.addPass(filmPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.01,
    0.4,
    0.85,
  );
  composer.addPass(bloomPass);

  controls = new PointerLockControls(camera, renderer.domElement);
  scene.add(controls.getObject());

  window.addEventListener("resize", onWindowResize, false);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Keep CSS Renderer in sync
    cssRenderer.setSize(window.innerWidth, window.innerHeight);

    if (composer && typeof composer.setSize === "function") {
      composer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  // Return cssRenderer and cssScene to be consumed by main and rendering engine loops
  return { camera, controls, renderer, cssRenderer, composer, cssScene };
};
