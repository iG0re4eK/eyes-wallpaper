import { Eye } from "./Eye.js";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const CONFIG = {
  TARGET_FPS: 60,
  COUNT_EYES: 15,
  MIN_RADIUS: 20,
  MAX_RADIUS: 60,
  GAP: 20,
  MAX_ATTEMPTS: 100,
};
const FRAME_INTERVAL = 1000 / CONFIG.TARGET_FPS;

let lastFrame = 0;
let animationId = null;
let eyes = [];
let currentMouseX = canvas.width / 2;
let currentMouseY = canvas.height / 2;
let isPageVisible = true;

let lastMouseUpdate = 0;
const MOUSE_UPDATE_INTERVAL = 16;

function getRandomColor() {
  const hue = Math.random() * 360;
  const saturation = 50 + Math.random() * 30;
  const lightness = 40 + Math.random() * 30;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function isColliding(newX, newY, newRadius, existingEyes) {
  for (const eye of existingEyes) {
    const dx = newX - eye.x;
    const dy = newY - eye.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = newRadius + eye.radius + CONFIG.GAP;

    if (distance < minDistance) {
      return true;
    }
  }
  return false;
}

function isWithinBounds(x, y, radius) {
  const margin = 20;
  return (
    x - radius >= margin &&
    x + radius <= canvas.width - margin &&
    y - radius >= margin &&
    y + radius <= canvas.height - margin
  );
}

function generateEyes() {
  const newEyes = [];
  const eyeCount = CONFIG.COUNT_EYES;

  for (let i = 0; i < eyeCount; i++) {
    let attempts = 0;
    let eyePlaced = false;

    while (!eyePlaced && attempts < CONFIG.MAX_ATTEMPTS) {
      const radius = randomRange(CONFIG.MIN_RADIUS, CONFIG.MAX_RADIUS);
      const x = randomRange(radius + 10, canvas.width - radius - 10);
      const y = randomRange(radius + 10, canvas.height - radius - 10);

      if (isWithinBounds(x, y, radius) && !isColliding(x, y, radius, newEyes)) {
        const eye = new Eye(x, y, radius, getRandomColor(), context);
        newEyes.push(eye);
        eyePlaced = true;
      }

      attempts++;
    }
  }

  return newEyes;
}

function init() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  currentMouseX = Math.min(currentMouseX, canvas.width);
  currentMouseY = Math.min(currentMouseY, canvas.height);

  eyes = generateEyes();
  lastFrame = 0;

  if (isPageVisible) {
    animationId = requestAnimationFrame(animate);
  }
}

function animate(currentTime) {
  if (!isPageVisible) {
    animationId = null;
    return;
  }

  const timeSinceLastFrame = currentTime - lastFrame;
  if (timeSinceLastFrame > FRAME_INTERVAL * 2) {
    lastFrame = currentTime - FRAME_INTERVAL;
  }

  if (currentTime - lastFrame < FRAME_INTERVAL) {
    animationId = requestAnimationFrame(animate);
    return;
  }

  lastFrame = currentTime;

  if (isPageVisible) {
    eyes.forEach((eye) => eye.animate(currentMouseX, currentMouseY));
    draw();
  }

  animationId = requestAnimationFrame(animate);
}

function draw() {
  context.fillStyle = "rgb(16, 16, 16)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  eyes.forEach((eye) => eye.draw());
}

function getMouse(e) {
  const now = performance.now();
  if (now - lastMouseUpdate < MOUSE_UPDATE_INTERVAL) {
    return;
  }
  lastMouseUpdate = now;

  currentMouseX = e.clientX;
  currentMouseY = e.clientY;
}

function clickMouse(e) {
  if (!isPageVisible) return;

  eyes.forEach((eye) => {
    const dx = currentMouseX - eye.x;
    const dy = currentMouseY - eye.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= eye.radius) {
      eye.blink();
    }
  });
}

function handleVisibilityChange() {
  isPageVisible = !document.hidden;

  if (isPageVisible) {
    lastFrame = 0;

    if (!animationId) {
      animationId = requestAnimationFrame(animate);
    }

    currentMouseX = Math.min(currentMouseX, canvas.width);
    currentMouseY = Math.min(currentMouseY, canvas.height);
  } else {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }
}

window.addEventListener("load", () => {
  isPageVisible = !document.hidden;
  init();
});

window.addEventListener("resize", () => {
  clearTimeout(window._resizeTimer);
  window._resizeTimer = setTimeout(() => {
    init();
  }, 100);
});

window.addEventListener("mousemove", getMouse, { passive: true });
window.addEventListener("click", clickMouse);

document.addEventListener("visibilitychange", handleVisibilityChange);

window.addEventListener("beforeunload", () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
});
