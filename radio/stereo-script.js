const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 64;
const frequencyData = new Uint8Array(analyser.frequencyBinCount);

const bars = document.querySelectorAll(".bar");
const reels = document.querySelectorAll(".reel");
let audioSource;

const audio = new Audio();
audio.src = "http://radiosource.atacko.cc/radio.mp3"; 
audio.crossOrigin = "anonymous";
audio.loop = true;
audio.volume = 0.5;

// Create BiquadFilter nodes for bass and treble
const bassFilter = audioContext.createBiquadFilter();
bassFilter.type = "lowshelf";
bassFilter.frequency.value = 100;
bassFilter.gain.value = 0;

const trebleFilter = audioContext.createBiquadFilter();
trebleFilter.type = "highshelf";
trebleFilter.frequency.value = 5000;
trebleFilter.gain.value = 0;

audio.addEventListener("canplay", () => {
  if (!audioSource) {
    audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(bassFilter);
    bassFilter.connect(trebleFilter);
    trebleFilter.connect(analyser);
    analyser.connect(audioContext.destination);
  }
});

const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const powerButton = document.getElementById("power-button");

powerButton.addEventListener("click", () => {
  const stereoContainer = document.querySelector(".stereo-container");
  const volumeKnob = document.querySelector(".volume-knob");
  const stereoButtons = document.querySelectorAll(".stereo-button");
  const bassKnob = document.querySelector(".bass-knob");
  const trebleKnob = document.querySelector(".treble-knob");

  if (powerButton.src.includes("powerOFF.png")) {
    powerButton.src = "assets/img/powerON.png";

    document.querySelector(".reel-container").style.display = "flex";
    document.querySelectorAll(".bar").forEach((bar) => {
      bar.style.display = "block";
    });

    // Add 'powered-on' class
    stereoContainer.classList.add("powered-on");
    volumeKnob.classList.add("powered-on");
    bassKnob.classList.add("powered-on");
    trebleKnob.classList.add("powered-on");
    stereoButtons.forEach((button) => {
      button.classList.add("powered-on");
    });
  } else {
    powerButton.src = "assets/img/powerOFF.png";

    // Hide reel-container and bars
    document.querySelector(".reel-container").style.display = "none";
    document.querySelectorAll(".bar").forEach((bar) => {
      bar.style.display = "none";
    });

    // Remove 'powered-on' class
    stereoContainer.classList.remove("powered-on");
    volumeKnob.classList.remove("powered-on");
    bassKnob.classList.remove("powered-on");
    trebleKnob.classList.remove("powered-on");
    stereoButtons.forEach((button) => {
      button.classList.remove("powered-on");
    });
  }
});

playButton.addEventListener("click", async () => {
  try {
    await audioContext.resume();
    audio.play();

    reels.forEach((reel) => reel.classList.add("spin"));

    animateSpectrum();
  } catch (error) {
    console.error("Error playing audio:", error);
  }
});

pauseButton.addEventListener("click", () => {
  audio.pause();
  reels.forEach((reel) => reel.classList.remove("spin"));
});

function animateSpectrum() {
  analyser.getByteFrequencyData(frequencyData);

  const barCount = bars.length;
  const halfBarCount = Math.floor(barCount / 2);
  const frequencyStep = Math.floor(frequencyData.length / barCount);

  bars.forEach((bar, index) => {
    const freqIndex =
      index < halfBarCount
        ? index * frequencyStep
        : (barCount - 1 - index) * frequencyStep;

    const value = frequencyData[freqIndex];
    const scaledValue = Math.pow(value / 255, 0.7) * 80;
    const jitter = (Math.random() * 20 - 10) * (scaledValue / 100);
    const scaledHeight = Math.min(scaledValue + jitter, 100);

    bar.style.setProperty("--height", `${scaledHeight}%`);
  });

  requestAnimationFrame(animateSpectrum);
}

const volumeKnob = document.getElementById("volume-knob");
const bassKnob = document.getElementById("bass-knob");
const trebleKnob = document.getElementById("treble-knob");

let isDraggingVolume = false;
let isDraggingBass = false;
let isDraggingTreble = false;
let startYVolume = 0;
let startXVolume = 0; // Horizontal tracking for volume
let startYBass = 0;
let startXBass = 0; // Horizontal tracking for bass
let startYTreble = 0;
let startXTreble = 0; // Horizontal tracking for treble
let currentRotationVolume = 0;
let currentRotationBass = 0;
let currentRotationTreble = 0;

// calculate knob rotation
const calculateRotation = (start, end, currentRotation) => {
  const delta = start - end;
  return Math.min(Math.max(currentRotation + delta, -100), 100);
};

// handle scroll rotation
const handleScroll = (event, knob, setFunction, currentRotation) => {
  const scrollDelta = event.deltaY > 0 ? -5 : 5; // Scroll up or down
  currentRotation = Math.min(Math.max(currentRotation + scrollDelta, -100), 100);
  knob.style.transform = `rotate(${currentRotation}deg)`;
  setFunction(currentRotation);
  return currentRotation;
};

// Volume knob
volumeKnob.addEventListener("mousedown", (event) => {
  isDraggingVolume = true;
  startYVolume = event.clientY;
  startXVolume = event.clientX;
  volumeKnob.classList.add("active");
});

document.addEventListener("mousemove", (event) => {
  if (isDraggingVolume) {
    const deltaX = event.clientX - startXVolume; // Swiping right -> positive deltaX
    const deltaY = startYVolume - event.clientY; // Swiping up -> positive deltaY
    startYVolume = event.clientY;
    startXVolume = event.clientX;

    const delta = deltaX - deltaY; // Adjusted to match intuitive swiping
    currentRotationVolume = Math.min(Math.max(currentRotationVolume + delta, -100), 100);
    volumeKnob.style.transform = `rotate(${currentRotationVolume}deg)`;

    setVolume(currentRotationVolume);
  }
});

volumeKnob.addEventListener("wheel", (event) => {
  currentRotationVolume = handleScroll(event, volumeKnob, setVolume, currentRotationVolume);
});

document.addEventListener("mouseup", () => {
  isDraggingVolume = false;
  volumeKnob.classList.remove("active");
});

// Bass knob
bassKnob.addEventListener("mousedown", (event) => {
  isDraggingBass = true;
  startYBass = event.clientY;
  startXBass = event.clientX;
  bassKnob.classList.add("active");
});

document.addEventListener("mousemove", (event) => {
  if (isDraggingBass) {
    const deltaX = event.clientX - startXBass; // Swiping right -> positive deltaX
    const deltaY = startYBass - event.clientY; // Swiping up -> positive deltaY
    startYBass = event.clientY;
    startXBass = event.clientX;

    const delta = deltaX - deltaY; // Adjusted to match intuitive swiping
    currentRotationBass = Math.min(Math.max(currentRotationBass + delta, -100), 100);
    bassKnob.style.transform = `rotate(${currentRotationBass}deg)`;

    setBass(currentRotationBass);
  }
});

bassKnob.addEventListener("wheel", (event) => {
  currentRotationBass = handleScroll(event, bassKnob, setBass, currentRotationBass);
});

document.addEventListener("mouseup", () => {
  isDraggingBass = false;
  bassKnob.classList.remove("active");
});

// Treble knob
trebleKnob.addEventListener("mousedown", (event) => {
  isDraggingTreble = true;
  startYTreble = event.clientY;
  startXTreble = event.clientX;
  trebleKnob.classList.add("active");
});

document.addEventListener("mousemove", (event) => {
  if (isDraggingTreble) {
    const deltaX = event.clientX - startXTreble; // Swiping right -> positive deltaX
    const deltaY = startYTreble - event.clientY; // Swiping up -> positive deltaY
    startYTreble = event.clientY;
    startXTreble = event.clientX;

    const delta = deltaX - deltaY; // Adjusted to match intuitive swiping
    currentRotationTreble = Math.min(Math.max(currentRotationTreble + delta, -100), 100);
    trebleKnob.style.transform = `rotate(${currentRotationTreble}deg)`;

    setTreble(currentRotationTreble);
  }
});

trebleKnob.addEventListener("wheel", (event) => {
  currentRotationTreble = handleScroll(event, trebleKnob, setTreble, currentRotationTreble);
});

document.addEventListener("mouseup", () => {
  isDraggingTreble = false;
  trebleKnob.classList.remove("active");
});

function setVolume(value) {
  audio.volume = (value + 100) / 200;
}

function setBass(value) {
  bassFilter.gain.value = value / 10;
}

function setTreble(value) {
  trebleFilter.gain.value = value / 10;
}

const mp3Input = document.getElementById("mp3-source");
const updateSourceButton = document.getElementById("update-source");

updateSourceButton.addEventListener("click", () => {
  const newSource = mp3Input.value.trim();

  if (newSource) {
    audio.src = newSource; 
    audio.crossOrigin = "anonymous"; 
    audio.load(); 
    audio.play(); 

    // Resume reels animation if power is ON
    if (powerButton.src.includes("powerON.png")) {
      reels.forEach((reel) => reel.classList.add("spin"));
      animateSpectrum();
    }
  } else {
    alert("Please enter a valid MP3 URL.");
  }
});