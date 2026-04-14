// ============================================
// 4D RENDERER — Infinite Time-Warp Dimension
// ============================================

import * as THREE from 'three';
import { Renderer3D } from './Renderer3D.js';

export class Renderer4D extends Renderer3D {
  constructor(container) {
    super(container);
    this.ghostTrails = [];
    this.ghostMeshes = [];
    this.maxGhostTrails = 30;
  }

  init(arenaSize = 10000) {
    super.init(arenaSize);

    this.scene.fog = new THREE.FogExp2(0x080020, 0.002);
    const temporalLight = new THREE.AmbientLight(0x4400aa, 0.5);
    this.scene.add(temporalLight);
  }

  recordGhostTrail(snake) {
    if (Math.random() > 0.05) return; // Only snapshot rarely
    const segs = snake.getSegments().map(s => ({ x: s.x, y: s.y }));
    this.ghostTrails.push({
      segments: segs,
      time: this.time,
      color1: snake.stage.color1,
      color2: snake.stage.color2,
      radius: snake.stage.radius
    });
    if (this.ghostTrails.length > this.maxGhostTrails) {
      this.ghostTrails.shift();
    }
  }

  updateGhostTrails() {
    this.ghostMeshes.forEach(m => {
      this.scene.remove(m);
      if (m.geometry) m.geometry.dispose();
      if (m.material) m.material.dispose();
    });
    this.ghostMeshes = [];

    this.ghostTrails.forEach(trail => {
      const age = (this.time - trail.time);
      const alpha = Math.max(0, 0.4 - age * 0.1);
      if (alpha <= 0) return;

      trail.segments.forEach((seg, i) => {
        if (i % 2 !== 0) return; 
        const t = 1 - (i / trail.segments.length);
        const radius = trail.radius * 2 * (0.4 + t * 0.6);

        const geo = new THREE.SphereGeometry(radius, 8, 8);
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(trail.color1),
          emissive: new THREE.Color(trail.color2),
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: alpha,
          metalness: 1, roughness: 0
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(seg.x, radius + Math.sin(this.time * 5 + i) * 10, seg.y);
        this.scene.add(mesh);
        this.ghostMeshes.push(mesh);
      });
    });
  }

  render(snake, food, arena, story) {
    if (!this.initialized) return;
    this.time += this.clock.getDelta();

    this.recordGhostTrail(snake);
    this.updateGhostTrails();

    this.updateSnake(snake);
    this.updateFood(food);
    this.updateStory(story);

    // Dynamic Camera
    const lookDist = 150;
    const targetX = snake.x + Math.cos(snake.angle) * lookDist;
    const targetZ = snake.y + Math.sin(snake.angle) * lookDist;

    const camDist = 500 + Math.sin(this.time)*100; // breathing camera
    const camHeight = 450 + Math.cos(this.time)*50;
    
    // Lerp camera behind snake
    const dX = snake.x - Math.cos(snake.angle) * camDist;
    const dZ = snake.y - Math.sin(snake.angle) * camDist;

    this.camera.position.set(dX, camHeight, dZ);
    this.camera.lookAt(targetX, 0, targetZ);

    // Hue shift
    const hue = (this.time * 0.05) % 1;
    this.scene.fog.color.setHSL(hue, 0.8, 0.1);

    this.renderer.render(this.scene, this.camera);
  }
}
