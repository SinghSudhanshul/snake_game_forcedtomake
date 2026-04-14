// ============================================
// SNAKE — Snake model, movement, evolution
// ============================================

export const EVOLUTION_STAGES = [
  { name: 'Worm',          emoji: '🪱', threshold: 0,   color1: '#88cc44', color2: '#669933', ability: null,           abilityName: '' },
  { name: 'Serpent',        emoji: '🐍', threshold: 50,  color1: '#00ff88', color2: '#00cc66', ability: 'speed',        abilityName: 'Speed Boost' },
  { name: 'Viper',          emoji: '🐉', threshold: 150, color1: '#00e5ff', color2: '#0099cc', ability: 'phase',        abilityName: 'Wall Phase' },
  { name: 'Dragon',         emoji: '🔥', threshold: 300, color1: '#ff6b35', color2: '#cc4400', ability: 'fireball',     abilityName: 'Fireball' },
  { name: 'Cosmic Entity',  emoji: '🌌', threshold: 500, color1: '#b44aff', color2: '#7700cc', ability: 'timeslow',     abilityName: 'Time Warp' }
];

export class Snake {
  constructor(startX, startY) {
    this.segments = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.directionQueue = [];
    this.speed = 8; // moves per second
    this.baseSpeed = 8;
    this.growing = 0;
    this.evolutionStage = 0;
    this.score = 0;
    this.alive = true;

    // Ability states
    this.speedBoostTimer = 0;
    this.phaseWallActive = false;
    this.phaseWallTimer = 0;
    this.fireballCooldown = 0;
    this.timeSlowActive = false;
    this.timeSlowTimer = 0;

    // Visual trail
    this.trail = [];
    this.maxTrail = 30;
  }

  get head() {
    return this.segments[0];
  }

  get stage() {
    return EVOLUTION_STAGES[this.evolutionStage];
  }

  get nextStage() {
    return EVOLUTION_STAGES[this.evolutionStage + 1] || null;
  }

  get evolutionProgress() {
    const current = this.stage.threshold;
    const next = this.nextStage ? this.nextStage.threshold : this.stage.threshold;
    if (next === current) return 1;
    return Math.min(1, (this.score - current) / (next - current));
  }

  setDirection(dx, dy) {
    // Prevent 180-degree turns
    if (this.direction.x === -dx && this.direction.y === -dy) return;
    if (this.direction.x === dx && this.direction.y === dy) return;
    this.directionQueue.push({ x: dx, y: dy });
  }

  addScore(points) {
    this.score = Math.max(0, this.score + points);
    this.checkEvolution();
  }

  checkEvolution() {
    const newStage = EVOLUTION_STAGES.reduce((stage, s, i) => {
      return this.score >= s.threshold ? i : stage;
    }, 0);

    if (newStage > this.evolutionStage) {
      this.evolutionStage = newStage;
      return true; // evolved!
    }
    return false;
  }

  grow(amount = 1) {
    this.growing += amount;
  }

  useAbility() {
    const ability = this.stage.ability;
    if (!ability) return false;

    switch (ability) {
      case 'speed':
        if (this.speedBoostTimer > 0) return false;
        this.speedBoostTimer = 3;
        this.speed = this.baseSpeed * 1.8;
        return true;
      case 'phase':
        if (this.phaseWallTimer > 0) return false;
        this.phaseWallActive = true;
        this.phaseWallTimer = 2;
        return true;
      case 'fireball':
        if (this.fireballCooldown > 0) return false;
        this.fireballCooldown = 5;
        return true;
      case 'timeslow':
        if (this.timeSlowTimer > 0) return false;
        this.timeSlowActive = true;
        this.timeSlowTimer = 4;
        return true;
      default:
        return false;
    }
  }

  update(dt, arena) {
    // Process direction queue
    if (this.directionQueue.length > 0) {
      const next = this.directionQueue.shift();
      if (!(this.direction.x === -next.x && this.direction.y === -next.y)) {
        this.direction = next;
      }
    }

    // Update ability timers
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= dt;
      if (this.speedBoostTimer <= 0) {
        this.speed = this.baseSpeed;
        this.speedBoostTimer = 0;
      }
    }
    if (this.phaseWallTimer > 0) {
      this.phaseWallTimer -= dt;
      if (this.phaseWallTimer <= 0) {
        this.phaseWallActive = false;
        this.phaseWallTimer = 0;
      }
    }
    if (this.fireballCooldown > 0) this.fireballCooldown -= dt;
    if (this.timeSlowTimer > 0) {
      this.timeSlowTimer -= dt;
      if (this.timeSlowTimer <= 0) {
        this.timeSlowActive = false;
        this.timeSlowTimer = 0;
      }
    }

    // Trail
    this.trail.unshift({ x: this.head.x, y: this.head.y });
    if (this.trail.length > this.maxTrail) this.trail.pop();
  }

  move() {
    const newHead = {
      x: this.head.x + this.direction.x,
      y: this.head.y + this.direction.y
    };

    this.segments.unshift(newHead);

    if (this.growing > 0) {
      this.growing--;
    } else {
      this.segments.pop();
    }
  }

  checkWallCollision(arena) {
    if (this.phaseWallActive) {
      // Wrap around
      if (this.head.x < 0) this.head.x = arena.size - 1;
      if (this.head.x >= arena.size) this.head.x = 0;
      if (this.head.y < 0) this.head.y = arena.size - 1;
      if (this.head.y >= arena.size) this.head.y = 0;
      return false;
    }
    return arena.isWall(this.head.x, this.head.y);
  }

  checkSelfCollision() {
    for (let i = 1; i < this.segments.length; i++) {
      if (this.segments[i].x === this.head.x && this.segments[i].y === this.head.y) {
        return true;
      }
    }
    return false;
  }

  die() {
    this.alive = false;
  }

  reset(startX, startY) {
    this.segments = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.directionQueue = [];
    this.speed = this.baseSpeed;
    this.growing = 0;
    this.evolutionStage = 0;
    this.score = 0;
    this.alive = true;
    this.speedBoostTimer = 0;
    this.phaseWallActive = false;
    this.phaseWallTimer = 0;
    this.fireballCooldown = 0;
    this.timeSlowActive = false;
    this.timeSlowTimer = 0;
    this.trail = [];
  }
}
