#pragma once
#include "raylib.h"
#include "Snake.h"
#include "Arena.h"
#include "Story.h"
#include "Renderer2D.h"
#include <vector>

// ============================================
// 3D Renderer using raylib 3D mode
// ============================================
class Renderer3D {
public:
    Camera3D camera = {};
    float time = 0;

    Renderer3D();
    void render(ContinuousSnake& snake, FoodManager& food, InfiniteArena& arena, StoryManager& story, int sw, int sh);
    void addParticles(float x, float y, Color color, int count = 10) {}

protected:
    void drawGrid3D(float snakeX, float snakeY);
    void drawFood3D(FoodManager& food);
    void drawBoss3D(StoryManager& story);
    void drawSnake3D(ContinuousSnake& snake);
    void updateCamera(ContinuousSnake& snake);
};
