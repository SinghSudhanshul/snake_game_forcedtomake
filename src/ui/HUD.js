// ============================================
// HUD — In-game heads-up display
// ============================================

import { EVOLUTION_STAGES } from '../engine/Snake.js';

export class HUD {
  constructor(overlay) {
    this.overlay = overlay;
    this.element = null;
    this.onPause = null;
    this.onMute = null;
    this.muted = false;
  }

  show(onPause, onMute) {
    this.onPause = onPause;
    this.onMute = onMute;

    this.element = document.createElement('div');
    this.element.className = 'hud';
    this.element.innerHTML = `
      <div class="hud-left">
        <div class="hud-score" id="hud-score">0</div>
        <div class="hud-high-score" id="hud-high-score">BEST: 0</div>
      </div>
      <div class="hud-center">
        <div class="hud-evolution-label">EVOLUTION</div>
        <div class="hud-evolution-name" id="hud-evo-name">🪱 WORM</div>
        <div class="hud-evolution-bar">
          <div class="hud-evolution-fill" id="hud-evo-fill" style="width: 0%"></div>
        </div>
        <div class="hud-evolution-label" id="hud-ability" style="margin-top: 6px; font-size: 0.65rem; color: var(--neon-cyan);"></div>
      </div>
      <div class="hud-right">
        <button class="hud-btn" id="hud-ability-btn" title="Use Ability (Space)">⚡</button>
        <button class="hud-btn" id="hud-mute-btn" title="Toggle Sound">🔊</button>
        <button class="hud-btn" id="hud-pause-btn" title="Pause (Esc)">⏸</button>
      </div>
    `;

    this.overlay.appendChild(this.element);

    document.getElementById('hud-pause-btn').addEventListener('click', () => {
      if (this.onPause) this.onPause();
    });

    document.getElementById('hud-mute-btn').addEventListener('click', () => {
      this.muted = !this.muted;
      document.getElementById('hud-mute-btn').textContent = this.muted ? '🔇' : '🔊';
      if (this.onMute) this.onMute(this.muted);
    });
  }

  update(snake, highScore) {
    const scoreEl = document.getElementById('hud-score');
    const highScoreEl = document.getElementById('hud-high-score');
    const evoNameEl = document.getElementById('hud-evo-name');
    const evoFillEl = document.getElementById('hud-evo-fill');
    const abilityEl = document.getElementById('hud-ability');

    if (!scoreEl) return;

    scoreEl.textContent = snake.score;
    highScoreEl.textContent = `BEST: ${highScore}`;

    const stage = snake.stage;
    evoNameEl.textContent = `${stage.emoji} ${stage.name.toUpperCase()}`;
    evoNameEl.style.color = stage.color1;

    // Evolution progress
    const progress = snake.evolutionProgress * 100;
    evoFillEl.style.width = `${progress}%`;
    evoFillEl.style.background = `linear-gradient(90deg, ${stage.color1}, ${stage.color2})`;

    // Ability
    if (stage.ability) {
      abilityEl.textContent = `[SPACE] ${stage.abilityName}`;
    } else {
      abilityEl.textContent = '';
    }
  }

  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
