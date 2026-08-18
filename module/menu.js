import { triggerPodiumSink, triggerPodiumRise } from "./rendering.js";
import { switchPodiumScreenTab, setScreenWrapperVisible } from "./podium.js";

const viewControls = document.getElementById("view-controls");

export const hideMenu = () => {
  viewControls.style.display = "block";
  triggerPodiumSink();
  setTimeout(() => {
    setScreenWrapperVisible(false);
  }, 1000);
};

export const showMenu = () => {
  viewControls.style.display = "none";
  setScreenWrapperVisible(true);
  switchPodiumScreenTab("menu");
  triggerPodiumRise();
};

export const startExperience = (controls) => {
  controls.lock();
  hideMenu();
};

export const setupPlayButton = (controls) => {
  const playButton = document.getElementById("play_button");
  if (playButton) {
    const handlePlay = (e) => {
      e.preventDefault();
      e.stopPropagation();
      startExperience(controls);
    };

    playButton.style.pointerEvents = "auto";
    playButton.addEventListener("click", handlePlay);
    playButton.addEventListener("pointerdown", handlePlay);
  }
};
