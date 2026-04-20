import { Eye } from "./Eye.js";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let animationId = null;
let eyes = [];

const CONFIG = {
  MIN_EYES: 5,
  MAX_EYES: 15,
  MIN_RADIUS: 20,
  MAX_RADIUS: 60,
  GAP: 10,
  MAX_ATTEMPTS: 100,
};

function getRandomColor() {
  const hue = Math.random() * 360;
  const saturation = 50 + Math.random() * 30;
  const lightness = 40 + Math.random() * 30;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
  const eyeCount = randomInt(CONFIG.MIN_EYES, CONFIG.MAX_EYES);

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
  }

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  eyes = generateEyes();

  animate();
}

function animate() {
  eyes.forEach((eye) => eye.animate());
  draw();
  animationId = requestAnimationFrame(animate);
}

function draw() {
  context.fillStyle = "rgb(16, 16, 16)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  eyes.forEach((eye) => eye.draw());
}

function getMouse(e) {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  eyes.forEach((eye) => {
    eye.setTarget(mouseX, mouseY);
  });
}

function clickMouse(e) {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  eyes.forEach((eye) => {
    const dx = mouseX - eye.x;
    const dy = mouseY - eye.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= eye.radius) {
      eye.blink();
    }
  });
}

window.addEventListener("load", init);
window.addEventListener("resize", init);
window.addEventListener("mousemove", (e) => getMouse(e));
window.addEventListener("click", (e) => clickMouse(e));
