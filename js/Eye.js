export class Eye {
  constructor(x, y, radius, color, context) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.context = context;

    this.speed = 2;

    this.visionRadius = 200;

    this.pupilRadius = radius / 3.5;
    this.corneaRadius = this.pupilRadius * 1.6;
    this.flashRadius = this.pupilRadius * 0.35;

    this.flashOffsetX = this.pupilRadius * 0.6;
    this.flashOffsetY = this.pupilRadius * 0.6;

    this.pupilX = x;
    this.pupilY = y;
    this.flashX = x - this.flashRadius;
    this.flashY = y - this.flashRadius;

    this.targetX = x;
    this.targetY = y;

    this.blinkProgress = 0;
    this.blinkCloseTime = 150;
    this.blinkOpenTime = 200;
    this.minBlinkInterval = 5000;
    this.maxBlinkInterval = 30000;
    this.blinkInterval = this.getRandomInterval();
    this.isBlinking = false;
    this.blinkPhase = null;
    this.lastBlinkTime = Date.now();
    this.blinkStartTime = 0;

    this.minRandomTargetInterval = 1000;
    this.maxRandomTargetInterval = 10000;
    this.randomTargetInterval = this.getRandomTargetInterval();
    this.lastRandomTargetTime = Date.now();
    this.hasRandomTarget = false;
  }

  isMouseInVision(mouseX, mouseY) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.radius + this.visionRadius;
  }

  getRandomTargetInterval() {
    return (
      this.minRandomTargetInterval +
      Math.random() *
        (this.maxRandomTargetInterval - this.minRandomTargetInterval)
    );
  }

  generateRandomTarget() {
    const maxDistance = this.radius;
    const distance = Math.random() * maxDistance;
    const angle = Math.random() * Math.PI * 2;
    return {
      x: this.x + Math.cos(angle) * distance,
      y: this.y + Math.sin(angle) * distance,
    };
  }

  updateRandomTarget(now) {
    if (
      now - this.lastRandomTargetTime >= this.randomTargetInterval &&
      !this.hasRandomTarget
    ) {
      const newTarget = this.generateRandomTarget();
      this.targetX = newTarget.x;
      this.targetY = newTarget.y;
      this.lastRandomTargetTime = now;
      this.hasRandomTarget = true;
      this.randomTargetInterval = this.getRandomTargetInterval();
    }

    if (this.hasRandomTarget && now - this.lastRandomTargetTime > 100) {
      this.hasRandomTarget = false;
    }
  }

  draw() {
    this.context.save();
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.context.clip();

    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.context.fillStyle = "#e1e1e1";
    this.context.fill();

    this.context.beginPath();
    this.context.arc(
      this.pupilX,
      this.pupilY,
      this.corneaRadius,
      0,
      Math.PI * 2,
    );
    this.context.fillStyle = this.color;
    this.context.fill();

    this.context.shadowBlur = this.pupilRadius;
    this.context.shadowColor = "#ffffff";
    const lineCount = 16;
    const lineLength = this.pupilRadius * 0.4;
    const lineWidth = this.pupilRadius * 0.1;

    for (let i = 0; i < lineCount; i++) {
      const angle = (Math.PI * 2 * i) / lineCount;
      const startX = this.pupilX + Math.cos(angle) * this.pupilRadius;
      const startY = this.pupilY + Math.sin(angle) * this.pupilRadius;
      const endX =
        this.pupilX + Math.cos(angle) * (this.pupilRadius + lineLength);
      const endY =
        this.pupilY + Math.sin(angle) * (this.pupilRadius + lineLength);

      this.context.beginPath();
      this.context.moveTo(startX, startY);
      this.context.lineTo(endX, endY);
      this.context.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(angle) * 0.1})`;
      this.context.lineWidth = lineWidth;
      this.context.lineCap = "round";
      this.context.stroke();
    }

    this.context.beginPath();
    this.context.arc(
      this.pupilX,
      this.pupilY,
      this.pupilRadius,
      0,
      Math.PI * 2,
    );
    this.context.fillStyle = "#000000";
    this.context.fill();

    this.context.shadowBlur = 0;

    this.context.beginPath();
    this.context.arc(
      this.flashX,
      this.flashY,
      this.flashRadius,
      0,
      Math.PI * 2,
    );
    this.context.fillStyle = "white";
    this.context.fill();

    const secondFlashRadius = this.flashRadius * 0.4;
    const secondFlashX = this.pupilX + this.flashOffsetX * 0.8;
    const secondFlashY = this.pupilY - this.flashOffsetY * 0.3;
    this.context.beginPath();
    this.context.arc(
      secondFlashX,
      secondFlashY,
      secondFlashRadius,
      0,
      Math.PI * 2,
    );
    this.context.fillStyle = "rgba(255, 255, 255, 0.8)";
    this.context.fill();

    if (this.blinkProgress > 0) {
      const blinkHeight = this.radius * 2 * this.blinkProgress;
      this.context.fillStyle = "#717171";
      this.context.fillRect(
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        blinkHeight,
      );
      this.context.fillRect(
        this.x - this.radius,
        this.y + this.radius - blinkHeight,
        this.radius * 2,
        blinkHeight,
      );
    }

    this.context.restore();
  }

  blink() {
    if (!this.isBlinking) {
      this.isBlinking = true;
      this.blinkPhase = "closing";
      this.blinkProgress = 0;
      this.blinkStartTime = Date.now();
    }
  }

  getRandomInterval() {
    return (
      this.minBlinkInterval +
      Math.random() * (this.maxBlinkInterval - this.minBlinkInterval)
    );
  }

  updateBlink() {
    const now = Date.now();

    if (!this.isBlinking && now - this.lastBlinkTime >= this.blinkInterval) {
      this.blink();
      return;
    }

    if (this.isBlinking && this.blinkPhase) {
      const elapsed = now - this.blinkStartTime;

      if (this.blinkPhase === "closing") {
        const closeProgress = Math.min(1, elapsed / this.blinkCloseTime);
        this.blinkProgress = closeProgress;
        if (closeProgress >= 1) {
          this.blinkPhase = "opening";
          this.blinkStartTime = now;
        }
      } else if (this.blinkPhase === "opening") {
        const openProgress = Math.min(1, elapsed / this.blinkOpenTime);
        this.blinkProgress = 1 - openProgress;
        if (openProgress >= 1) {
          this.blinkProgress = 0;
          this.isBlinking = false;
          this.blinkPhase = null;
          this.lastBlinkTime = now;
          this.blinkInterval = this.getRandomInterval();
        }
      }
    }
  }

  animate(mouseX, mouseY) {
    this.updateBlink();
    const now = Date.now();
    const canSeeMouse = this.isMouseInVision(mouseX, mouseY);

    if (canSeeMouse) {
      this.targetX = mouseX;
      this.targetY = mouseY;
      this.hasRandomTarget = false;
      this.lastRandomTargetTime = now;
    } else {
      this.updateRandomTarget(now);
    }

    const dx = this.targetX - this.pupilX;
    const dy = this.targetY - this.pupilY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.1) {
      let moveX = (dx / distance) * this.speed;
      let moveY = (dy / distance) * this.speed;

      if (distance < this.speed) {
        moveX = dx;
        moveY = dy;
      }

      let newPupilX = this.pupilX + moveX;
      let newPupilY = this.pupilY + moveY;

      const maxPupilMove = this.radius - this.pupilRadius;
      const fromCenterX = newPupilX - this.x;
      const fromCenterY = newPupilY - this.y;
      const distanceFromCenter = Math.sqrt(
        fromCenterX * fromCenterX + fromCenterY * fromCenterY,
      );

      if (distanceFromCenter > maxPupilMove) {
        const angle = Math.atan2(fromCenterY, fromCenterX);
        newPupilX = this.x + Math.cos(angle) * maxPupilMove;
        newPupilY = this.y + Math.sin(angle) * maxPupilMove;
      }

      this.pupilX = newPupilX;
      this.pupilY = newPupilY;
    }

    this.flashX = this.pupilX - this.flashRadius * 0.6;
    this.flashY = this.pupilY - this.flashRadius * 0.6;
  }
}
