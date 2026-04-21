// ============================================
// MAIN ENTRY POINT
// ============================================

import './styles/main.css';
import { GameEngine } from './engine/GameEngine.js';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  // Remove loading screen if present
  const loader = document.querySelector('.loading-screen');
  if (loader) loader.remove();

  // Start the game engine
  const game = new GameEngine();

  // Log for debugging
  console.log('%c🐍 Snake Evolution', 'font-size: 20px; font-weight: bold; color: #00ff88; text-shadow: 0 0 10px #00ff88;');
  console.log('%cHyper-Realistic 2D • 3D • 4D', 'font-size: 12px; color: #888;');
});
