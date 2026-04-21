// ============================================
// GAME ENGINE — Central orchestrator (Overhauled)
// ============================================

import { ContinuousSnake } from './ContinuousSnake.js';
import { ContinuousFood, FOOD_TYPES } from './InfiniteArena.js';
import { InfiniteArena, ARENA_SIZE } from './InfiniteArena.js';
import { StoryManager } from './StoryManager.js';
import { Renderer2D } from '../renderers/Renderer2D.js';
import { Renderer3D } from '../renderers/Renderer3D.js';
import { Renderer4D } from '../renderers/Renderer4D.js';
import { MainMenu } from '../ui/MainMenu.js';
import { HUD } from '../ui/HUD.js';
import { GameOver } from '../ui/GameOver.js';
import { AudioManager } from '../audio/AudioManager.js';

const STATES = { MENU: 'menu', PLAYING: 'playing', PAUSED: 'paused', GAME_OVER: 'gameover' };

export class GameEngine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.threeContainer = document.getElementById('three-container');
    this.overlay = document.getElementById('ui-overlay');

    this.state = STATES.MENU;
    this.mode = null; 
    this.renderer = null;

    this.arena = new InfiniteArena();
    this.snake = null;
    this.food = null;
    this.story = new StoryManager(this.overlay);

    this.audio = new AudioManager();
    this.menu = new MainMenu(this.overlay);
    this.hud = new HUD(this.overlay);
    this.gameOver = new GameOver(this.overlay);

    this.highScore = parseInt(localStorage.getItem('snakeEvoHighScore') || '0');
    this.lastTime = 0;
    this.animFrameId = null;

    this.keys = { left: false, right: false };

    this.init();
  }

  init() {
    this.bindInput();
    this.showMenu();
    this.gameLoop(0);
  }

  bindInput() {
    document.addEventListener('keydown', (e) => {
      this.audio.init(); this.audio.resume();
      if (this.state === STATES.PLAYING) {
        if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
        if (e.key === ' ') { e.preventDefault(); this.useAbility(); }
        if (e.key === 'Escape') this.togglePause();
      } else if (this.state === STATES.PAUSED && e.key === 'Escape') {
        this.togglePause();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
    });

    // Mouse steering
    document.addEventListener('mousemove', (e) => {
        if (this.state === STATES.PLAYING && this.snake) {
            // Find angle from screen center (assuming snake is always centered)
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
            this.snake.setTargetAngle(angle);
        }
    });

    window.addEventListener('resize', () => { if (this.renderer) this.renderer.resize(); });
  }

  showMenu() {
    this.state = STATES.MENU;
    this.hud.hide();
    if (this.renderer) { this.renderer.hide(); this.renderer = null; }
    this.menu.show((mode) => this.startGame(mode), () => {});
  }

  startGame(mode) {
    this.audio.init(); this.audio.playClick();
    this.menu.hide();
    this.mode = mode;
    this.state = STATES.PLAYING;

    this.snake = new ContinuousSnake(0, 0);
    this.food = new ContinuousFood(this.arena.size);
    for(let i=0; i<30; i++) this.food.spawnNear(0, 0, 1500);

    this.initRenderer(mode);
    this.hud.show(() => this.togglePause(), (m) => this.audio.setMuted(m));
    this.audio.startMusic();
  }

  initRenderer(mode) {
    if (mode === '2d') {
      this.renderer = new Renderer2D(this.canvas);
      this.renderer.show(); this.renderer.resize();
    } else if (mode === '3d') {
      this.renderer = new Renderer3D(this.threeContainer);
      this.renderer.init(); this.renderer.show(); this.renderer.resize();
    } else {
      this.renderer = new Renderer4D(this.threeContainer);
      this.renderer.init(); this.renderer.show(); this.renderer.resize();
    }
  }

  gameLoop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    if (this.state === STATES.PLAYING && this.snake && this.snake.alive) {
      this.update(dt);
    }
    if (this.state === STATES.PLAYING || this.state === STATES.PAUSED) {
      if (this.renderer) this.renderer.render(this.snake, this.food, this.arena, this.story);
      this.hud.update(this.snake, this.highScore);
    }

    this.animFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    // Keyboard steering override
    if (this.keys.left) this.snake.steer(-1);
    if (this.keys.right) this.snake.steer(1);

    this.snake.update(dt);
    this.food.update(dt, this.snake.x, this.snake.y);
    this.story.update(dt, this.snake.head);

    // Ensure food exists nearby
    while (this.food.items.length < 30) {
      this.food.spawnNear(this.snake.x, this.snake.y, 1500);
    }

    // Checking collision
    if (this.arena.isWall(this.snake.x, this.snake.y)) {
      this.handleDeath(); return;
    }
    if (this.snake.checkSelfCollision()) {
      this.handleDeath(); return;
    }

    const eaten = this.food.checkCollision(this.snake.x, this.snake.y, this.snake.stage.radius);
    if (eaten) {
      const evolved = this.snake.addScore(eaten.type.points);
      this.audio.playEat();
      
      // Boss hit?
      if (eaten.type === FOOD_TYPES.POISON) {
         // Sub score
      }

      if (this.renderer.addParticles) {
        this.renderer.addParticles(eaten.x, eaten.y, eaten.type.color, 15);
      }
      
      if (evolved) {
        this.audio.playEvolve();
        if (this.renderer.shakeScreen) this.renderer.shakeScreen(10);
      }

      // Check Story
      if (this.story.checkMilestone(this.snake.score, this.snake.x, this.snake.y)) {
         this.audio.playEvolve();
         if (this.renderer.shakeScreen) this.renderer.shakeScreen(20);
      }

      if (this.snake.score > this.highScore) {
        this.highScore = this.snake.score;
        localStorage.setItem('snakeEvoHighScore', this.highScore);
      }
    }
  }

  useAbility() {
    const effect = this.snake.useAbility();
    if (effect) {
      this.audio.playClick();
      // Handle effect logic (like shooting fireball)
      if (typeof effect === 'object' && effect.type === 'fireball') {
          // shoot fireball logic -> simplified to hitting boss in front
          if (this.story.activeBoss) {
              const dx = this.story.activeBoss.x - effect.x;
              const dy = this.story.activeBoss.y - effect.y;
              if (dx*dx+dy*dy < 400000) { // within range
                  const killed = this.story.damageBoss(10);
                  if (killed) this.snake.addScore(100);
              }
          }
      }
    }
  }

  handleDeath() {
    this.snake.die();
    this.audio.playDie();
    this.audio.stopMusic();
    if (this.mode === '2d' && this.renderer.shakeScreen) this.renderer.shakeScreen(15);
    setTimeout(() => {
      this.state = STATES.GAME_OVER;
      this.hud.hide();
      this.gameOver.show(this.snake.score, this.highScore, this.snake.stage, () => this.startGame(this.mode), () => this.showMenu());
    }, 800);
  }

  togglePause() {
    this.state = this.state === STATES.PLAYING ? STATES.PAUSED : STATES.PLAYING;
  }
}
