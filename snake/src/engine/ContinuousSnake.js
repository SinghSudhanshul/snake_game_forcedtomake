// ============================================
// CONTINUOUS SNAKE ENGINE
// Replaces grid-based logic with smooth vectors
// ============================================

import { EVOLUTION_STAGES } from './Snake.js'; 
// We will reuse the stages from the original file, or wait, I will redefine them here.

export const NEW_EVOLUTION_STAGES = [
  { name: 'Spawn',         emoji: '💧', threshold: 0,   color1: '#00e5ff', color2: '#0055ff', radius: 12, ability: null,           abilityName: '' },
  { name: 'Serpent',       emoji: '🐍', threshold: 100, color1: '#00ff88', color2: '#00cc66', radius: 16, ability: 'dash',         abilityName: 'Dash' },
  { name: 'Neon Dragon',   emoji: '🐉', threshold: 300, color1: '#ff2d7b', color2: '#cc0044', radius: 22, ability: 'fireball',     abilityName: 'Fireball' },
  { name: 'Cosmic Entity', emoji: '🌌', threshold: 600, color1: '#b44aff', color2: '#5500aa', radius: 30, ability: 'blackhole',    abilityName: 'Singularity' }
];

export class ContinuousSnake {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0; // standard mathematical angle
    this.targetAngle = 0;
    this.speed = 180; // pixels per second
    this.baseSpeed = 180;
    
    // Path history for body segments: store a dense history of past positions
    this.history = [];
    this.bodyDistance = 15; // px distance between visual segments
    this.length = 20; // number of segments (starting length)
    
    this.evolutionStage = 0;
    this.score = 0;
    this.alive = true;

    this.cooldowns = { dash: 0, fireball: 0, blackhole: 0 };
    this.activeAbilities = { dashing: false };
  }

  get head() { return { x: this.x, y: this.y }; }
  get stage() { return NEW_EVOLUTION_STAGES[this.evolutionStage]; }
  get nextStage() { return NEW_EVOLUTION_STAGES[this.evolutionStage + 1] || null; }

  get evolutionProgress() {
    const current = this.stage.threshold;
    const next = this.nextStage ? this.nextStage.threshold : this.stage.threshold;
    if (next === current) return 1;
    return Math.min(1, Math.max(0, (this.score - current) / (next - current)));
  }

  setTargetAngle(rad) {
    this.targetAngle = rad;
  }

  steer(dir) {
    // dir is -1 (left) or 1 (right)
    this.targetAngle += dir * 0.08;
  }

  addScore(points) {
    this.score = Math.max(0, this.score + points);
    this.length += points > 0 ? 2 : 0;
    return this.checkEvolution();
  }

  checkEvolution() {
    let newStage = 0;
    for (let i = 0; i < NEW_EVOLUTION_STAGES.length; i++) {
        if (this.score >= NEW_EVOLUTION_STAGES[i].threshold) newStage = i;
    }
    if (newStage > this.evolutionStage) {
      this.evolutionStage = newStage;
      return true; // Evolved
    }
    return false;
  }

  useAbility() {
    const ability = this.stage.ability;
    if (!ability) return false;

    if (this.cooldowns[ability] > 0) return false;

    switch (ability) {
      case 'dash':
        this.activeAbilities.dashing = true;
        this.cooldowns.dash = 3;
        this.speed = this.baseSpeed * 2.5;
        setTimeout(() => { 
          this.activeAbilities.dashing = false; 
          this.speed = this.baseSpeed; 
        }, 800);
        return true;
      case 'fireball':
        this.cooldowns.fireball = 4;
        return { type: 'fireball', x: this.x, y: this.y, angle: this.angle };
      case 'blackhole':
        this.cooldowns.blackhole = 10;
        return { type: 'blackhole', x: this.x, y: this.y };
    }
    return false;
  }

  update(dt) {
    // Smooth angle interpolation
    let diff = this.targetAngle - this.angle;
    // Normalize diff to -PI, PI
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    
    // Turn speed depends on size, smaller snake = faster turn
    const turnRate = 4.0 - (this.stage.radius * 0.05); 
    this.angle += diff * turnRate * dt;

    // Update cooldowns
    for (let key in this.cooldowns) {
      if (this.cooldowns[key] > 0) this.cooldowns[key] -= dt;
    }

    // Move
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;

    // Record history
    this.history.unshift({ x: this.x, y: this.y });

    // Truncate history to what's needed = length * bodyDistance pixels approx
    const requiredHistory = Math.ceil((this.length * this.bodyDistance) / (this.speed * dt)) + 50;
    if (this.history.length > requiredHistory) {
      this.history.length = requiredHistory;
    }
  }

  // Returns array of equidistant points along the path history representing the continuous body
  getSegments() {
    const segments = [];
    let distAcc = 0;
    let histIdx = 0;

    // Head is segment 0
    segments.push({ x: this.x, y: this.y });

    for (let i = 1; i < this.length; i++) {
        let searched = false;
        while (histIdx < this.history.length - 1) {
            const p1 = this.history[histIdx];
            const p2 = this.history[histIdx + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            
            if (distAcc + d >= this.bodyDistance) {
                // Found the exact spot between p1 and p2
                const excess = this.bodyDistance - distAcc;
                const ratio = excess / d;
                const segX = p1.x + dx * ratio;
                const segY = p1.y + dy * ratio;
                segments.push({ x: segX, y: segY });
                
                // Adjust for next segment
                histIdx++;
                distAcc = d - excess; 
                searched = true;
                break;
            } else {
                distAcc += d;
                histIdx++;
            }
        }
        if (!searched) break; // Not enough history yet (started recently)
    }
    return segments;
  }

  checkSelfCollision() {
    if (this.activeAbilities.dashing) return false;
    const segs = this.getSegments();
    if (segs.length < 10) return false;
    
    // Check head against segments from 10 onwards
    const hx = this.x;
    const hy = this.y;
    const r = this.stage.radius;

    for (let i = 10; i < segs.length; i++) {
        const sx = segs[i].x;
        const sy = segs[i].y;
        const dx = sx - hx;
        const dy = sy - hy;
        if (dx*dx + dy*dy < r*r) {
            return true;
        }
    }
    return false;
  }

  die() {
    this.alive = false;
  }
}
