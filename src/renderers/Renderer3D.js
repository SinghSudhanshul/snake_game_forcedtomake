// ============================================
// 3D RENDERER — Infinite WebGL
// ============================================

import * as THREE from 'three';

export class Renderer3D {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.foodMeshes = [];
    this.particleSystems = [];
    this.time = 0;
    this.clock = new THREE.Clock();
    this.initialized = false;
    
    // Instanced mesh for snake body
    this.snakeBodyMesh = null;
    this.maxSegments = 2000;
    this.dummy = new THREE.Object3D();
  }

  init(arenaSize = 10000) {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050510, 0.0015);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(60, this.container.clientWidth / this.container.clientHeight, 1, 2000);
    this.camera.position.set(0, 400, 200);

    const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(100, 500, 100);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    // Infinite Ground Grid
    const gridHelper = new THREE.GridHelper(10000, 100, 0x00ff88, 0x1a1a3e);
    gridHelper.position.y = -1;
    this.scene.add(gridHelper);

    // Star Box
    this.createStarfield();

    // Init instanced snake body
    const geo = new THREE.SphereGeometry(1, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness: 0.6, roughness: 0.2, emissive: 0x00ff88, emissiveIntensity: 0.2
    });
    this.snakeBodyMesh = new THREE.InstancedMesh(geo, mat, this.maxSegments);
    this.snakeBodyMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.snakeBodyMesh);

    this.snakeHeadLight = new THREE.PointLight(0x00ff88, 2, 400);
    this.scene.add(this.snakeHeadLight);

    this.initialized = true;
  }

  createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < 3000; i++) {
        // Dome distribution
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 5000 + Math.random() * 2000;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = Math.abs(r * Math.sin(phi) * Math.sin(theta)); // upper hemisphere only
        const z = r * Math.cos(phi);
        starPositions.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 4 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }

  resize() {
    if (!this.renderer) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  updateSnake(snake) {
    const segs = snake.getSegments();
    const stage = snake.stage;
    const c1 = new THREE.Color(stage.color1);
    const c2 = new THREE.Color(stage.color2);

    this.snakeHeadLight.color = c1;
    this.snakeHeadLight.position.set(snake.x, 20, snake.y);

    this.snakeBodyMesh.count = Math.min(segs.length, this.maxSegments);

    for (let i = 0; i < this.snakeBodyMesh.count; i++) {
      const seg = segs[i];
      const t = 1 - (i / this.snakeBodyMesh.count);
      const r = stage.radius * 2 * (0.4 + t * 0.6); // Scale radius up

      this.dummy.position.set(seg.x, r, seg.y);
      this.dummy.scale.set(r, r, r);
      this.dummy.updateMatrix();
      
      this.snakeBodyMesh.setMatrixAt(i, this.dummy.matrix);

      // Interpolate colors via emissive if possible, but instanced mesh colors are set differently 
      // It's faster to just use the base material color for the whole body, but we can animate instances!
      // For performance we leave instance color alone for now
    }
    this.snakeBodyMesh.instanceMatrix.needsUpdate = true;

    // Update material base color to snake current stage
    this.snakeBodyMesh.material.color = c2;
    this.snakeBodyMesh.material.emissive = c1;
  }

  updateFood(food) {
    // Basic sync logic (very simple, recreated mostly for demo)
    this.foodMeshes.forEach(m => { this.scene.remove(m); m.geometry.dispose(); m.material.dispose(); });
    this.foodMeshes = [];

    food.items.forEach(f => {
      const color = new THREE.Color(f.type.color);
      const rad = f.radius * 1.5;
      const geo = new THREE.SphereGeometry(rad, 16, 16);
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8 });
      const mesh = new THREE.Mesh(geo, mat);
      
      mesh.position.set(f.x, rad + Math.sin(f.pulse)*5, f.y);
      this.scene.add(mesh);
      this.foodMeshes.push(mesh);
    });
  }

  updateStory(story) {
    // If boss exists, render it
    if (story.activeBoss) {
        // Could expand this extensively later, keeping it minimal for overhaul stabilization
    }
  }

  updateCamera(snake) {
    // Camera rigidly follows snake, looking slightly ahead
    const lookDist = 150;
    const targetX = snake.x + Math.cos(snake.angle) * lookDist;
    const targetZ = snake.y + Math.sin(snake.angle) * lookDist;

    const camDist = 500;
    const camHeight = 450;
    
    // Lerp camera behind snake
    const dX = snake.x - Math.cos(snake.angle) * camDist;
    const dZ = snake.y - Math.sin(snake.angle) * camDist;

    this.camera.position.set(dX, camHeight, dZ);
    this.camera.lookAt(targetX, 0, targetZ);
  }

  addParticles(x, y, color, count) {
      // Stub
  }

  render(snake, food, arena, story) {
    if (!this.initialized) return;
    this.time += this.clock.getDelta();

    this.updateSnake(snake);
    this.updateFood(food);
    this.updateStory(story);
    this.updateCamera(snake);

    this.renderer.render(this.scene, this.camera);
  }

  show() { this.container.style.display = 'block'; }
  hide() { this.container.style.display = 'none'; }
  destroy() { if (this.renderer) this.renderer.dispose(); this.container.innerHTML = ''; }
}
