// ============================================
// ARENA & FOOD — Infinite Mechanics
// ============================================

export const ARENA_SIZE = 10000;

export class InfiniteArena {
  constructor(size = ARENA_SIZE) {
    this.size = size;
  }

  isWall(x, y) {
    return x < -this.size / 2 || x > this.size / 2 || y < -this.size / 2 || y > this.size / 2;
  }

  getCenter() {
    return { x: 0, y: 0 };
  }
}

export const FOOD_TYPES = {
  NORMAL:  { name: 'Energy',  points: 10, color: '#00ff88', glow: '#00ff00', emoji: '🟢', chance: 0.65 },
  GOLDEN:  { name: 'Star',    points: 25, color: '#ffd700', glow: '#ffaa00', emoji: '⭐', chance: 0.20 },
  COSMIC:  { name: 'Nebula',  points: 15, color: '#b44aff', glow: '#9900ff', emoji: '🌀', chance: 0.10, evolution: true },
  POISON:  { name: 'Toxic',   points: -10, color: '#ff2d7b', glow: '#cc0000', emoji: '☠️', chance: 0.05 }
};

export class ContinuousFood {
  constructor(arenaSize) {
    this.arenaSize = arenaSize;
    this.items = [];
    this.maxItems = 50; 
  }

  spawnNear(x, y, radius = 800) {
    if (this.items.length >= this.maxItems) return;

    // Spawn food around the current player position
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radius + 200; // between 200 and max radius
    
    let fx = x + Math.cos(angle) * dist;
    let fy = y + Math.sin(angle) * dist;

    // Constrain to arena
    fx = Math.max(-this.arenaSize/2 + 50, Math.min(this.arenaSize/2 - 50, fx));
    fy = Math.max(-this.arenaSize/2 + 50, Math.min(this.arenaSize/2 - 50, fy));

    const roll = Math.random();
    let cumulative = 0;
    let type = FOOD_TYPES.NORMAL;
    for (const ft of Object.values(FOOD_TYPES)) {
      cumulative += ft.chance;
      if (roll <= cumulative) { type = ft; break; }
    }

    this.items.push({
      x: fx, y: fy,
      radius: type === FOOD_TYPES.NORMAL ? 10 : 15,
      type,
      spawnTime: Date.now(),
      pulse: Math.random() * Math.PI * 2
    });
  }

  checkCollision(headX, headY, headRadius) {
    for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        const dx = item.x - headX;
        const dy = item.y - headY;
        const distSq = dx*dx + dy*dy;
        const colDist = headRadius + item.radius;
        if (distSq < colDist*colDist) {
            return this.items.splice(i, 1)[0];
        }
    }
    return null;
  }

  update(dt, headX, headY) {
    // Animate pulse & cleanse items too far away
    this.items = this.items.filter(f => {
      f.pulse += dt * 5;
      const dx = f.x - headX;
      const dy = f.y - headY;
      return (dx*dx + dy*dy) < 4000000; // remove if > 2000px away 
    });
  }
}
