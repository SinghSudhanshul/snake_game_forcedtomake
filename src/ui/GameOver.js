// ============================================
// GAME OVER UI
// ============================================

export class GameOver {
  constructor(overlay) {
    this.overlay = overlay;
    this.element = null;
  }

  show(score, highScore, stage, onRestart, onMenu) {
    this.element = document.createElement('div');
    this.element.className = 'game-over';
    this.element.innerHTML = `
      <h2>GAME OVER</h2>
      <div class="game-over-stats">
        <div class="stat-box">
          <div class="stat-value">${score}</div>
          <div class="stat-label">Score</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${highScore}</div>
          <div class="stat-label">Best</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stage.emoji}</div>
          <div class="stat-label">${stage.name}</div>
        </div>
      </div>
      <div class="game-over-actions">
        <button class="action-btn primary" id="go-restart">PLAY AGAIN</button>
        <button class="action-btn secondary" id="go-menu">MAIN MENU</button>
      </div>
    `;

    this.overlay.appendChild(this.element);

    document.getElementById('go-restart').addEventListener('click', () => {
      this.hide();
      if (onRestart) onRestart();
    });

    document.getElementById('go-menu').addEventListener('click', () => {
      this.hide();
      if (onMenu) onMenu();
    });
  }

  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
