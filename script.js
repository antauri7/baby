const eventDate = new Date("2026-07-11T15:00:00-06:00");

const countdownParts = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
};

const song = document.querySelector("#song");
const heroMusicButton = document.querySelector("#musicToggle");
const playerButton = document.querySelector("#playerButton");
const playerTrack = document.querySelector(".player__track");
let unlockArmed = false;

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  const difference = Math.max(0, eventDate - now);
  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownParts.days.textContent = pad(days);
  countdownParts.hours.textContent = pad(hours);
  countdownParts.minutes.textContent = pad(minutes);
  countdownParts.seconds.textContent = pad(seconds);
}

function setButtons(isPlaying) {
  const label = isPlaying ? "Pausar canción" : "Escuchar canción";
  const playerLabel = isPlaying ? "Pausar" : "Reproducir";
  heroMusicButton.textContent = label;
  playerButton.textContent = playerLabel;
}

async function startMusic() {
  try {
    song.volume = 0.82;
    await song.play();
    setButtons(true);
    return true;
  } catch {
    setButtons(false);
    return false;
  }
}

function armGestureStart() {
  if (unlockArmed) {
    return;
  }

  unlockArmed = true;
  const events = ["pointerdown", "touchstart", "click", "keydown"];

  const unlock = async (event) => {
    const target = event.target;
    const isControl =
      target instanceof Element &&
      target.closest("#musicToggle, #playerButton, a");

    if (isControl) {
      return;
    }

    const started = await startMusic();
    if (started) {
      events.forEach((name) => document.removeEventListener(name, unlock));
    }
  };

  events.forEach((name) => {
    document.addEventListener(name, unlock, { passive: true });
  });
}

async function toggleMusic() {
  if (song.paused) {
    await startMusic();
  } else {
    song.pause();
    setButtons(false);
  }
}

function updateProgress() {
  if (!song.duration) {
    playerTrack.style.setProperty("--progress", "0%");
    return;
  }

  const progress = Math.min(100, (song.currentTime / song.duration) * 100);
  playerTrack.style.setProperty("--progress", `${progress}%`);
}

heroMusicButton.addEventListener("click", toggleMusic);
playerButton.addEventListener("click", toggleMusic);
song.addEventListener("play", () => setButtons(true));
song.addEventListener("pause", () => setButtons(false));
song.addEventListener("ended", () => setButtons(false));
song.addEventListener("timeupdate", updateProgress);

updateCountdown();
setInterval(updateCountdown, 1000);

startMusic().then((started) => {
  if (!started) {
    armGestureStart();
  }
});
