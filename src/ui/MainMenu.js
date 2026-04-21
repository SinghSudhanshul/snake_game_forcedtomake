// ============================================
// MAIN MENU UI
// ============================================

export class MainMenu {
  constructor(overlay) {
    this.overlay = overlay;
    this.element = null;
    this.onModeSelect = null;
    this.onSettings = null;
  }

  show(onModeSelect, onSettings) {
    this.onModeSelect = onModeSelect;
    this.onSettings = onSettings;

    this.element = document.createElement('div');
    this.element.className = 'main-menu';
    this.element.innerHTML = `
      <div class="menu-content">
        <div class="menu-title">
          <h1>Snake Evolution</h1>
          <div class="subtitle">Choose Your Dimension</div>
        </div>

        <div class="mode-cards">
          <div class="mode-card card-2d" data-mode="2d" id="mode-card-2d">
            <div class="card-glow"></div>
            <div class="card-icon">🐍</div>
            <div class="card-label">2D</div>
            <div class="card-desc">Classic hyper-realistic canvas with particle effects & bloom</div>
          </div>
          <div class="mode-card card-3d" data-mode="3d" id="mode-card-3d">
            <div class="card-glow"></div>
            <div class="card-icon">🌐</div>
            <div class="card-label">3D</div>
            <div class="card-desc">Full WebGL with PBR materials, real-time shadows & skybox</div>
          </div>
          <div class="mode-card card-4d" data-mode="4d" id="mode-card-4d">
            <div class="card-glow"></div>
            <div class="card-icon">🌌</div>
            <div class="card-label">4D</div>
            <div class="card-desc">Time-warp dimension with ghost trails & dimensional rifts</div>
          </div>
        </div>

        <div class="menu-footer">
          <button class="menu-btn" id="menu-settings-btn">⚙ Settings</button>
          <button class="menu-btn" id="menu-highscores-btn">🏆 High Scores</button>
        </div>
      </div>
    `;

    this.overlay.appendChild(this.element);

    // Mode card clicks
    this.element.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        const mode = card.dataset.mode;
        if (this.onModeSelect) this.onModeSelect(mode);
      });
    });

    // Settings
    const settingsBtn = this.element.querySelector('#menu-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        if (this.onSettings) this.onSettings();
      });
    }
  }

  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
