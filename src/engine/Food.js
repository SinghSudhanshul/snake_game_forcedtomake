// ============================================
// FOOD — Food types, spawning, collection
// ============================================

export const FOOD_TYPES = {
  NORMAL:  { name: 'Normal',  points: 10, color: '#ff4444', glow: '#ff0000', emoji: '🔴', chance: 0.65 },
  GOLDEN:  { name: 'Golden',  points: 25, color: '#ffd700', glow: '#ffaa00', emoji: '⭐', chance: 0.20 },
  COSMIC:  { name: 'Cosmic',  points: 15, color: '#b44aff', glow: '#9900ff', emoji: '🌀', chance: 0.10, evolution: true },
  POISON:  { name: 'Poison',  points: -5, color: '#00ff44', glow: '#00cc00', emoji: '☠️', chance: 0.05 }
};

export class Food {
  constructor(arenaSize) {
    this.arenaSize = arenaSize;
    this.items = [];
    this.maxItems = 3;
  }

  spawn(snakeSegments) {
    if (this.items.length >= this.maxItems) return;

    const occupied = new Set(snakeSegments.map(s => `${s.x},${s.y}`));
    this.items.forEach(f => occupied.add(`${f.x},${f.y}`));

    let x, y;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * this.arenaSize);
      y = Math.floor(Math.random() * this.arenaSize);
      attempts++;
    } while (occupied.has(`${x},${y}`) && attempts < 100);

    if (attempts >= 100) return;

    // Pick type by weighted chance
    const roll = Math.random();
    let cumulative = 0;
    let type = FOOD_TYPES.NORMAL;
    for (const ft of Object.values(FOOD_TYPES)) {
      cumulative += ft.chance;
      if (roll <= cumulative) { type = ft; break; }
    }

    this.items.push({
      x, y,
      type,
      spawnTime: Date.now(),
      pulse: Math.random() * Math.PI * 2
    });
  }

  checkCollision(headX, headY) {
    const idx = this.items.findIndex(f => f.x === headX && f.y === headY);
    if (idx === -1) return null;
    return this.items.splice(idx, 1)[0];
  }

  update() {
    // Animate pulse
    this.items.forEach(f => {
      f.pulse += 0.05;
    });
  }
}
