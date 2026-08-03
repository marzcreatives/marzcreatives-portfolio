import * as THREE from "three";
import { PointerLockControls } from "three-stdlib";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export const scene = new THREE.Scene(); // create a scene
let camera;
let controls;
let renderer;
let composer;

export const setupScene = () => {
  // PerspectiveCamera is a type of camera that mimics the way the human eye sees things. It takes 4 parameters: field of view, aspect ratio, near clipping plane, and far clipping plane. The field of view is the extent of the scene that is seen on the display at any given moment. The aspect ratio should be the width of the element divided by the height (in this case, the screen width and height). The camera will not render objects that are closer to the camera than the near clipping plane or further away than the far clipping plane. Objects that are exactly on the clipping plane will not be rendered.
  camera = new THREE.PerspectiveCamera(
    60, // fov = field of view
    window.innerWidth / window.innerHeight, // aspect ratio
    0.1, // near clipping plane
    1000, // far clipping plane
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

  //  3. NOW Initialize the Composer (renderer is defined)
  composer = new EffectComposer(renderer);

  // 4. Add the Passes
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

  controls = new PointerLockControls(camera, renderer.domElement); // create a PointerLockControls object that takes the camera and the renderer's domElement as arguments. PointerLockControls is a class that allows the camera to be controlled by the mouse and keyboard.
  scene.add(controls.getObject()); // add the PointerLockControls object to the scene

  window.addEventListener("resize", onWindowResize, false); // add an event listener to the window that calls the onWindowResize function when the window is resized. Its work is to update the camera's aspect ratio and the renderer's size. The third parameter is set to false to indicate that the event listener should be triggered in the bubbling phase instead of the capturing phase. The bubbling phase is when the event bubbles up from the target element to the parent elements. The capturing phase is when the event trickles down from the parent elements to the target element. The default value is false, so we don't need to include it, but I included it for clarity. The capturing phase is rarely used, so you can ignore it for now. You can read more about the capturing and bubbling phases here: https://javascript.info/bubbling-and-capturing

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight; // update the camera's aspect ratio
    camera.updateProjectionMatrix(); // update the camera's projection matrix. The projection matrix is used to determine how 3D points are mapped to the 2D space of the screen. It is used to calculate the frustum of the camera which is a truncated pyramid that represents the camera's field of view. Anything outside the frustum is not rendered. The projection matrix is used to calculate the frustum every time the window is resized.
    renderer.setSize(window.innerWidth, window.innerHeight); // update the size of the renderer
    // keep postprocessing composer in sync with renderer size
    if (composer && typeof composer.setSize === "function") {
      composer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  return { camera, controls, renderer, composer }; // return the camera, controls, renderer and composer so that they can be used in other modules
};
