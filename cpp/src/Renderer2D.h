#pragma once
#include "raylib.h"
#include "Snake.h"
#include "Arena.h"
#include "Story.h"
#include <vector>

// ============================================
// Particle
// ============================================
struct Particle {
    float x, y, vx, vy;
    float life, decay, size;
    Color color;
};

// ============================================
// Background Star
// ============================================
struct Star {
    float x, y, size, speed, brightness;
};

// ============================================
// 2D Renderer
// ============================================
class Renderer2D {
public:
    std::vector<Particle> particles;
    std::vector<Star> stars;
    float shakeIntensity = 0;
    float shakeX = 0, shakeY = 0;
    float time = 0;

    Renderer2D();

    void addParticles(float x, float y, Color color, int count = 10);
    void shakeScreen(float intensity);
    void render(ContinuousSnake& snake, FoodManager& food, InfiniteArena& arena, StoryManager& story, int screenW, int screenH);

private:
    void updateParticles();
    void drawStars(float camX, float camY, float snakeX, float snakeY, int screenW, int screenH);
    void drawGrid(float camX, float camY, float snakeX, float snakeY, int screenW, int screenH);
    void drawFood(FoodManager& food, float camX, float camY);
    void drawBoss(StoryManager& story, float camX, float camY);
    void drawSnake(ContinuousSnake& snake, float camX, float camY);
    void drawParticles(float camX, float camY);
};
