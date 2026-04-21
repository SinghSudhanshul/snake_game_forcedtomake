// ============================================
// ARENA — Game world boundary & grid
// ============================================

export const ARENA_SIZE = 30; // 30x30 grid

export class Arena {
  constructor(size = ARENA_SIZE) {
    this.size = size;
    this.walls = [];
  }

  isWall(x, y) {
    return x < 0 || x >= this.size || y < 0 || y >= this.size;
  }

  getCenter() {
    return { x: Math.floor(this.size / 2), y: Math.floor(this.size / 2) };
  }
}
