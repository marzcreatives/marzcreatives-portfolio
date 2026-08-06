import { triggerPodiumSink, triggerPodiumRise } from "./rendering.js";
import { switchPodiumScreenTab } from "./podium.js";

export const hideMenu = () => {
  // Instead of turning off display, initiate the sink physics loop
  triggerPodiumSink();
};

export const showMenu = () => {
  // Make sure the primary menu div layout is selected inside the CSS3D stack
  switchPodiumScreenTab("menu");
  // Bring the physical podium up out of the floor plane
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
