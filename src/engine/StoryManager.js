// ============================================
// STORY & BOSS MANAGER
// ============================================

export class Boss {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.health = type === 'geom' ? 10 : 30; // geom = geometric shape, serpent = enemy snake
    this.maxHealth = this.health;
    this.radius = type === 'geom' ? 100 : 40;
    this.angle = 0;
    this.pulse = 0;
    this.alive = true;
  }
}

export class StoryManager {
  constructor(overlay) {
    this.overlay = overlay;
    this.milestones = [
      { score: 100, text: "THE SERPENT AWAKENS...", bossType: null },
      { score: 300, text: "WARNING: A GEOMETRIC ANOMALY DETECTED IN YOUR SECTOR", bossType: 'geom' },
      { score: 600, text: "THE COSMIC VOID BECKONS. EVOLUTION IMMINENT.", bossType: 'serpent' }
    ];
    this.currentMilestoneIndex = 0;
    this.activeBoss = null;
    this.popupEl = null;
  }

  checkMilestone(score, headX, headY) {
    if (this.currentMilestoneIndex >= this.milestones.length) return null;
    
    const next = this.milestones[this.currentMilestoneIndex];
    if (score >= next.score) {
      this.currentMilestoneIndex++;
      this.showCinematicText(next.text);
      if (next.bossType) {
        this.spawnBoss(next.bossType, headX, headY);
      }
      return true; // Cinematica triggered
    }
    return false;
  }

  showCinematicText(text) {
    if (this.popupEl) this.popupEl.remove();
    this.popupEl = document.createElement('div');
    this.popupEl.className = 'story-cinematic';
    this.popupEl.innerHTML = `<h1>${text}</h1>`;
    // Styles added dynamically for ease
    this.popupEl.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; justify-content: center; align-items: center;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(5px);
        z-index: 100; pointer-events: none; opacity: 0; transition: opacity 0.5s;
    `;
    this.popupEl.querySelector('h1').style.cssText = `
        font-family: var(--font-display); font-size: clamp(1.5rem, 4vw, 3rem);
        color: #ff2d7b; text-shadow: 0 0 20px #ff2d7b; letter-spacing: 4px;
        text-transform: uppercase; text-align: center; max-width: 80%;
    `;
    this.overlay.appendChild(this.popupEl);

    setTimeout(() => { this.popupEl.style.opacity = '1'; }, 50);
    setTimeout(() => { this.popupEl.style.opacity = '0'; }, 3000);
    setTimeout(() => { this.popupEl.remove(); this.popupEl = null; }, 3500);
  }

  spawnBoss(type, headX, headY) {
    // Spawn ahead of the player
    this.activeBoss = new Boss(headX + 500, headY + 500, type);
  }

  update(dt, snakeHead) {
    if (!this.activeBoss) return;
    
    this.activeBoss.pulse += dt;
    // Simple follow logic
    if (this.activeBoss.type === 'serpent') {
        const dx = snakeHead.x - this.activeBoss.x;
        const dy = snakeHead.y - this.activeBoss.y;
        const angle = Math.atan2(dy, dx);
        this.activeBoss.x += Math.cos(angle) * 100 * dt;
        this.activeBoss.y += Math.sin(angle) * 100 * dt;
    }
  }

  damageBoss(amount) {
    if (!this.activeBoss) return false;
    this.activeBoss.health -= amount;
    if (this.activeBoss.health <= 0) {
        this.activeBoss.alive = false;
        this.activeBoss = null;
        this.showCinematicText("THREAT ELIMINATED. ABSORB THE REMNANTS.");
        return true;
    }
    return false;
  }
}
