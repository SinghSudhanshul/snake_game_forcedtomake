#include "Renderer4D.h"
#include <cmath>

Renderer4D::Renderer4D() : Renderer3D() {}

void Renderer4D::recordGhostTrail(ContinuousSnake& snake) {
    if (GetRandomValue(0, 100) > 5) return;
    auto segs = snake.getSegments();
    GhostTrail trail;
    trail.segments = segs;
    trail.time = time4d;
    trail.color1 = snake.stage().color1;
    trail.color2 = snake.stage().color2;
    trail.radius = snake.stage().radius;
    ghostTrails.push_back(trail);
    if ((int)ghostTrails.size() > maxGhostTrails) {
        ghostTrails.erase(ghostTrails.begin());
    }
}

void Renderer4D::drawGhostTrails3D() {
    for (auto& trail : ghostTrails) {
        float age = time4d - trail.time;
        float alpha = std::max(0.f, 0.4f - age * 0.1f);
        if (alpha <= 0) continue;

        unsigned char a = (unsigned char)(alpha * 255);
        for (int i = 0; i < (int)trail.segments.size(); i += 2) {
            float t = 1.f - ((float)i / (float)trail.segments.size());
            float r = trail.radius * 2.f * (0.4f + t * 0.6f);
            float bob = sinf(time4d * 5 + i) * 10.f;
            DrawSphere({trail.segments[i].x, r + bob, trail.segments[i].y}, r,
                       {trail.color1.r, trail.color1.g, trail.color1.b, a});
        }
    }
}

void Renderer4D::render(ContinuousSnake& snake, FoodManager& food, InfiniteArena& arena, StoryManager& story, int sw, int sh) {
    time4d += GetFrameTime();
    time = time4d; // sync parent time

    recordGhostTrail(snake);
    updateCamera(snake);

    // Breathing camera
    float camDist = 500 + sinf(time4d) * 100;
    float camHeight = 450 + cosf(time4d) * 50;
    float dX = snake.x - cosf(snake.angle) * camDist;
    float dZ = snake.y - sinf(snake.angle) * camDist;
    camera.position = {dX, camHeight, dZ};

    ClearBackground({8, 0, 32, 255});

    BeginMode3D(camera);
        drawGrid3D(snake.x, snake.y);
        drawGhostTrails3D();
        drawFood3D(food);
        drawBoss3D(story);
        drawSnake3D(snake);
    EndMode3D();

    story.drawCinematic(sw, sh);

    // Temporal HUD label
    DrawText("[ TEMPORAL DIMENSION ]", sw/2 - 120, sh - 40, 20, {180, 74, 255, 150});
}
