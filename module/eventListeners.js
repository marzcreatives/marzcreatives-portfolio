import { keysPressed } from "./movement.js";
import { showMenu, hideMenu } from "./menu.js";
import { switchPodiumScreenTab } from "./podium.js";
// import { startAudio, stopAudio } from "../modules/audioGuide.js";

let lockPointer = true;
let showMenuOnUnlock = false;

// add the controls parameter which is the pointer lock controls and is passed from main.js where setupEventListeners is called
export const setupEventListeners = (controls, camera, scene) => {
  // add the event listeners to the document which is the whole page
  document.addEventListener(
    "keydown",
    (event) => onKeyDown(event, controls),
    false,
  );
  document.addEventListener(
    "keyup",
    (event) => onKeyUp(event, controls),
    false,
  );

  controls.addEventListener("unlock", () => {
    if (showMenuOnUnlock) {
      showMenu();
    }
    showMenuOnUnlock = false;
  });

  // Add event listeners for the audio guide buttons
  // document.getElementById("start_audio").addEventListener("click", startAudio);
  // document.getElementById("stop_audio").addEventListener("click", stopAudio);
};

// toggle the pointer lock
function togglePointerLock(controls) {
  if (lockPointer) {
    controls.lock();
  } else {
    showMenuOnUnlock = false;
    controls.unlock();
  }
  lockPointer = !lockPointer; // toggle the lockPointer variable
}

function onKeyDown(event, controls) {
  const key = event.key.toLowerCase();
  // event is the event object that has the key property
  if (key in keysPressed) {
    // check if the key pressed by the user is in the keysPressed object
    keysPressed[key] = true; // if yes, set the value of the key pressed to true
  }

  if (key === "escape") {
    // if the "ESC" key is pressed
    showMenu(); // show the menu
    showMenuOnUnlock = true;
    controls.unlock(); // unlock the pointer
    lockPointer = false;
  }

  // if key prssed is enter or return for mac
  if (key === "enter" || key === "return") {
    // if the "ENTER" key is pressed
    hideMenu(); // hide the menu
    controls.lock(); // lock the pointer
    lockPointer = true;
  }

  if (key === " ") {
    // if the "SPACE" key is pressed
    togglePointerLock(controls); // toggle the pointer lock
  }

  // if (event.key === "a") {
  //   // if the "a" key is pressed
  //   startAudio(); // start the audio guide
  // }

  // if (event.key === "p") {
  //   // if the "p" key is pressed
  //   stopAudio(); // stop the audio guide
  // }

  if (key === "r") {
    // if the "r" key is pressed
    location.reload(); // reload the page
  }
}

function onKeyUp(event, controls) {
  // same but for keyup
  const key = event.key.toLowerCase();
  if (key in keysPressed) {
    keysPressed[key] = false; // set to false when the key is released
  }
}

document.querySelectorAll(".toggle-about").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    switchPodiumScreenTab("about");
  });
});

document.querySelectorAll(".toggle-controls").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    switchPodiumScreenTab("controls");
  });
});

document.querySelectorAll(".toggle-menu").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    switchPodiumScreenTab("menu");
  });
});

// document.getElementById("about_button").addEventListener("click", function () {
//   document.getElementById("about-overlay").classList.add("show");
// });

// document.getElementById("close-about").addEventListener("click", function () {
//   document.getElementById("about-overlay").classList.remove("show");
// });
