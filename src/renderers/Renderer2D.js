// ============================================
// 2D RENDERER — Continuous Slither version
// ============================================

export class Renderer2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.screenShake = { x: 0, y: 0, intensity: 0 };
    this.time = 0;
    this.backgroundStars = [];

    for (let i = 0; i < 200; i++) {
        this.backgroundStars.push({
            x: (Math.random() - 0.5) * 4000,
            y: (Math.random() - 0.5) * 4000,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.1,
            brightness: Math.random()
        });
    }
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  addParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
        life: 1, decay: Math.random() * 0.03 + 0.02, size: Math.random() * 6 + 3, color
      });
    }
  }

  shakeScreen(intensity = 5) { this.screenShake.intensity = intensity; }

  updateParticles() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.95; p.vy *= 0.95;
      p.life -= p.decay;
      return p.life > 0;
    });
    if (this.screenShake.intensity > 0) {
      this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
      this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
      this.screenShake.intensity *= 0.9;
      if (this.screenShake.intensity < 0.3) this.screenShake.intensity = 0;
    }
  }

  render(snake, food, arena, story) {
    this.time += 0.016;
    this.updateParticles();

    const ctx = this.ctx;
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;

    ctx.save();
    ctx.translate(this.screenShake.x, this.screenShake.y);

    // Dynamic Deep space gradient centered on screen
    const bg = ctx.createRadialGradient(cw/2, ch/2, 0, cw/2, ch/2, Math.max(cw, ch)*0.7);
    bg.addColorStop(0, '#0d0d1a'); bg.addColorStop(1, '#050508');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, cw, ch);

    // CAMERA OFFSET - Center on snake head
    const camX = cw/2 - snake.x;
    const camY = ch/2 - snake.y;
    ctx.translate(camX, camY);

    // Draw Stars
    ctx.fillStyle = '#ffffff';
    this.backgroundStars.forEach(s => {
        // Parallax effect
        const dx = (s.x + snake.x * 0.2);
        const dy = (s.y + snake.y * 0.2);
        // wrap stars infinitely
        const rx = ((dx % 4000) + 4000) % 4000 - 2000 + snake.x;
        const ry = ((dy % 4000) + 4000) % 4000 - 2000 + snake.y;

        const twinkle = (Math.sin(this.time * s.speed + s.brightness * 10) + 1) / 2;
        ctx.globalAlpha = 0.1 + twinkle * 0.6 * s.brightness;
        ctx.beginPath(); ctx.arc(rx, ry, s.size, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Arena Bounds
    ctx.strokeStyle = 'rgba(255, 0, 100, 0.5)';
    ctx.lineWidth = 10;
    ctx.strokeRect(-arena.size/2, -arena.size/2, arena.size, arena.size);

    // Grid (Subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    const gridSize = 200;
    const startX = Math.floor((snake.x - cw/2) / gridSize) * gridSize;
    const startY = Math.floor((snake.y - ch/2) / gridSize) * gridSize;
    for (let x = startX; x < startX + cw + gridSize; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, snake.y - ch/2); ctx.lineTo(x, snake.y + ch/2); ctx.stroke();
    }
    for (let y = startY; y < startY + ch + gridSize; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(snake.x - cw/2, y); ctx.lineTo(snake.x + cw/2, y); ctx.stroke();
    }

    this.drawFood(ctx, food);
    this.drawBoss(ctx, story);
    this.drawSnake(ctx, snake);
    this.drawParticles(ctx);

    ctx.restore();
  }

  drawFood(ctx, food) {
    food.items.forEach(f => {
      const pulse = Math.sin(f.pulse) * 0.15 + 0.85;
      const r = f.radius * pulse;

      // Glow
      ctx.shadowColor = f.type.glow;
      ctx.shadowBlur = 20;

      const grad = ctx.createRadialGradient(f.x - r*0.3, f.y - r*0.3, 0, f.x, f.y, r);
      grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.3, f.type.color); grad.addColorStop(1, f.type.glow);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  drawBoss(ctx, story) {
      if (!story.activeBoss) return;
      const boss = story.activeBoss;
      ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 30;
      ctx.fillStyle = '#ff2d7b';
      
      if (boss.type === 'geom') {
          ctx.save();
          ctx.translate(boss.x, boss.y);
          ctx.rotate(this.time);
          ctx.beginPath();
          ctx.moveTo(0, -boss.radius);
          ctx.lineTo(boss.radius, boss.radius);
          ctx.lineTo(-boss.radius, boss.radius);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
      } else {
          ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI*2); ctx.fill();
      }
      ctx.shadowBlur = 0;
      
      // Healthbar
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(boss.x - 50, boss.y - boss.radius - 30, 100 * (boss.health / boss.maxHealth), 10);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(boss.x - 50, boss.y - boss.radius - 30, 100, 10);
  }

  drawSnake(ctx, snake) {
    const segs = snake.getSegments();
    if (segs.length === 0) return;

    const baseRadius = snake.stage.radius;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = snake.stage.color1;
    ctx.shadowBlur = 20;

    // Draw Continuous Body as a thick glowing line
    for (let i = 0; i < segs.length - 1; i++) {
        const s1 = segs[i];
        const s2 = segs[i+1];
        const t = 1 - (i / segs.length); // 1 at head, 0 at tail
        
        ctx.strokeStyle = snake.stage.color2; 
        ctx.lineWidth = baseRadius * 1.5 * t + (baseRadius * 0.5); // Tapering
        
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.stroke();
    }
    
    // Draw Head
    ctx.shadowBlur = 30;
    const hx = snake.x; const hy = snake.y;
    ctx.fillStyle = snake.stage.color1;
    ctx.beginPath(); ctx.arc(hx, hy, baseRadius, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // Eyes relative to angle
    const eyeD = baseRadius * 0.6;
    const ex1 = hx + Math.cos(snake.angle - 0.5) * eyeD;
    const ey1 = hy + Math.sin(snake.angle - 0.5) * eyeD;
    const ex2 = hx + Math.cos(snake.angle + 0.5) * eyeD;
    const ey2 = hy + Math.sin(snake.angle + 0.5) * eyeD;

    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ex1, ey1, baseRadius*0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex2, ey2, baseRadius*0.3, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(ex1 + Math.cos(snake.angle)*2, ey1 + Math.sin(snake.angle)*2, baseRadius*0.15, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex2 + Math.cos(snake.angle)*2, ey2 + Math.sin(snake.angle)*2, baseRadius*0.15, 0, Math.PI*2); ctx.fill();
  }

  drawParticles(ctx) {
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  show() { this.canvas.style.display = 'block'; }
  hide() { this.canvas.style.display = 'none'; }
  destroy() { this.particles = []; }
}
