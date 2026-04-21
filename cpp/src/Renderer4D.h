#pragma once
#include "Renderer3D.h"
#include <vector>

// ============================================
// Ghost Trail (past snake states)
// ============================================
struct GhostTrail {
    std::vector<Vec2> segments;
    float time;
    Color color1, color2;
    float radius;
};

// ============================================
// 4D Renderer (extends 3D with temporal effects)
// ============================================
class Renderer4D : public Renderer3D {
public:
    std::vector<GhostTrail> ghostTrails;
    int maxGhostTrails = 30;
    float time4d = 0;

    Renderer4D();
    void render(ContinuousSnake& snake, FoodManager& food, InfiniteArena& arena, StoryManager& story, int sw, int sh);

private:
    void recordGhostTrail(ContinuousSnake& snake);
    void drawGhostTrails3D();
};
