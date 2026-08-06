import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { getComputerModel } from "./loadComputer.js";

// Save references to toggle display styles over the screens later
export let podiumUIObjects = {
  screen: null,
  menu: null,
  about: null,
  info: null,
  screenMesh: null,
  computerRef: null,
  podiumGroupRef: null,
};

/**
 * Keeps the CSS overlay aligned with the computer screen mesh as the podium moves.
 */
export function syncPodiumScreenOverlay() {
  const screenObject = podiumUIObjects.screen;
  const screenMesh = podiumUIObjects.screenMesh;
  const screenWrapperEl = document.getElementById("screen-html-wrapper");

  if (!screenObject || !screenMesh || !screenWrapperEl) {
    return;
  }

  const computer = podiumUIObjects.computerRef;
  if (computer) {
    computer.updateMatrixWorld(true);
  }

  if (podiumUIObjects.podiumGroupRef) {
    podiumUIObjects.podiumGroupRef.updateMatrixWorld(true);
  }

  const geometryBox = new THREE.Box3().setFromBufferAttribute(
    screenMesh.geometry.attributes.position,
  );

  const worldScale = new THREE.Vector3();
  screenMesh.getWorldScale(worldScale);
  const screenWidth = (geometryBox.max.x - geometryBox.min.x) * worldScale.x;
  const screenHeight = (geometryBox.max.y - geometryBox.min.y) * worldScale.y;

  const targetPosition = new THREE.Vector3();
  const targetQuaternion = new THREE.Quaternion();
  const geometryCenter = geometryBox.getCenter(new THREE.Vector3());
  targetPosition.copy(screenMesh.localToWorld(geometryCenter.clone()));
  screenMesh.getWorldQuaternion(targetQuaternion);

  const cssPixelsPerWorldUnit = 140;
  screenWrapperEl.style.width = `${Math.max(240, Math.round(screenWidth * cssPixelsPerWorldUnit))}px`;
  screenWrapperEl.style.height = `${Math.max(180, Math.round(screenHeight * cssPixelsPerWorldUnit))}px`;

  const offset = new THREE.Vector3(0, 0, 0.002).applyQuaternion(
    targetQuaternion,
  );
  targetPosition.add(offset);

  screenObject.position.copy(targetPosition);
  screenObject.quaternion.copy(targetQuaternion);
  screenObject.scale.set(
    1 / cssPixelsPerWorldUnit,
    1 / cssPixelsPerWorldUnit,
    1,
  );
}

/**
 * Changes active visible tab within the 3D computer screen geometry layout context
 */
export function switchPodiumScreenTab(activeTabId) {
  const tabElements = {
    menu: document.getElementById("menu"),
    about: document.getElementById("about-overlay"),
    info: document.getElementById("info-panel"),
  };

  Object.keys(tabElements).forEach((key) => {
    const el = tabElements[key];
    if (el) {
      el.style.display = key === activeTabId ? "block" : "none";
    }
  });

  const wrapper = document.getElementById("screen-html-wrapper");
  if (wrapper) {
    wrapper.style.display = "block";
  }
}

export function createPodium(scene, cssScene) {
  const masterModel = getComputerModel();
  if (!masterModel) {
    console.error("Error: Computer model has not been preloaded yet!");
    return null;
  }

  const podiumGroup = new THREE.Group();
  let screenMesh = null;

  // 1. Create the Podium Mesh
  const podiumGeometry = new THREE.BoxGeometry(2.5, 1.5, 2.5);
  const podiumMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
  podium.position.set(0, 0, 0);
  podiumGroup.add(podium);

  // 2. Clone and place the computer model on top of podium surface
  const computer = masterModel.clone();
  computer.scale.set(0.4, 0.4, 0.4);
  computer.position.set(0, 0.75, -0.2);
  podiumGroup.add(computer);

  computer.traverse((child) => {
    if (
      child.isMesh &&
      (child.name.endsWith("_2") || child.name.endsWith("002"))
    ) {
      screenMesh = child;
      podiumUIObjects.screenMesh = child;
      child.visible = false;
    }
  });

  // 4. Wrap the full monitor panel as a single CSS3DObject
  const screenWrapperEl = document.getElementById("screen-html-wrapper");

  if (screenWrapperEl) {
    screenWrapperEl.style.display = "block";
    screenWrapperEl.style.pointerEvents = "auto";
    screenWrapperEl.style.position = "relative";
    screenWrapperEl.style.background = "#000000";
    screenWrapperEl.style.border = "1px solid rgba(255,255,255,0.16)";
    screenWrapperEl.style.borderRadius = "12px";
    screenWrapperEl.style.boxShadow =
      "0 0 30px rgba(0,0,0,0.8), 0 0 60px rgba(255,255,255,0.08)";
    screenWrapperEl.style.overflow = "hidden";
    screenWrapperEl.style.transformOrigin = "center center";
  }

  podiumUIObjects.screen = screenWrapperEl
    ? new CSS3DObject(screenWrapperEl)
    : null;

  if (podiumUIObjects.screen) {
    podiumUIObjects.screen.element.style.pointerEvents = "auto";

    podiumUIObjects.computerRef = computer;
    podiumUIObjects.podiumGroupRef = podiumGroup;

    if (screenMesh) {
      syncPodiumScreenOverlay();
    } else {
      podiumUIObjects.screen.position.set(0, 2.18, 0.05);
      podiumUIObjects.screen.rotation.set(0, 0, 0);
      podiumUIObjects.screen.scale.set(0.8, 0.6, 1);
    }

    cssScene.add(podiumUIObjects.screen);
  }

  switchPodiumScreenTab("menu");

  // Position base group container at ground origin
  podiumGroup.position.set(0, 0, 0);
  scene.add(podiumGroup);

  return podiumGroup;
}
