#include "Renderer3D.h"
#include <cmath>

Renderer3D::Renderer3D() {
    camera.position = {0, 400, 200};
    camera.target = {0, 0, 0};
    camera.up = {0, 1, 0};
    camera.fovy = 60.f;
    camera.projection = CAMERA_PERSPECTIVE;
}

void Renderer3D::drawGrid3D(float sx, float sy) {
    // Draw a large grid plane
    int gridSize = 200;
    int halfGrid = 2500;
    int cx = ((int)sx / gridSize) * gridSize;
    int cy = ((int)sy / gridSize) * gridSize;

    for (int x = cx - halfGrid; x <= cx + halfGrid; x += gridSize) {
        Color c = {0, 255, 136, 15};
        DrawLine3D({(float)x, 0, (float)(cy - halfGrid)}, {(float)x, 0, (float)(cy + halfGrid)}, c);
    }
    for (int z = cy - halfGrid; z <= cy + halfGrid; z += gridSize) {
        Color c = {0, 255, 136, 15};
        DrawLine3D({(float)(cx - halfGrid), 0, (float)z}, {(float)(cx + halfGrid), 0, (float)z}, c);
    }
}

void Renderer3D::drawFood3D(FoodManager& food) {
    auto& types = GetFoodTypes();
    for (auto& f : food.items) {
        Color c = types[f.typeIndex].color;
        float r = f.radius * 1.5f;
        float bob = sinf(f.pulse) * 5.f;
        DrawSphere({f.x, r + bob, f.y}, r, c);
        // Glow ring
        DrawCircle3D({f.x, 1, f.y}, r * 2, {1,0,0}, 0, {c.r, c.g, c.b, 40});
    }
}

void Renderer3D::drawBoss3D(StoryManager& story) {
    if (!story.activeBoss) return;
    Boss& b = *story.activeBoss;
    if (b.type == "geom") {
        // Rotating cube
        DrawCubeWires({b.x, b.radius, b.y}, b.radius*2, b.radius*2, b.radius*2, {255, 45, 123, 200});
        DrawCube({b.x, b.radius, b.y}, b.radius*1.5f, b.radius*1.5f, b.radius*1.5f, {255, 45, 123, 100});
    } else {
        DrawSphere({b.x, b.radius, b.y}, b.radius, {255, 45, 123, 200});
    }
    // Health bar in 3D - simplified as a flat plane
    float hp = (float)b.health / (float)b.maxHealth;
    DrawCube({b.x, b.radius * 3, b.y}, 100.f * hp, 5, 5, RED);
}

void Renderer3D::drawSnake3D(ContinuousSnake& snake) {
    auto segs = snake.getSegments();
    if (segs.empty()) return;

    float baseR = snake.stage().radius * 2.f;
    Color c1 = snake.stage().color1;
    Color c2 = snake.stage().color2;

    for (int i = (int)segs.size() - 1; i >= 0; i--) {
        float t = 1.f - ((float)i / (float)segs.size());
        float r = baseR * (0.4f + t * 0.6f);

        unsigned char lr = (unsigned char)(c2.r + (c1.r - c2.r) * t);
        unsigned char lg = (unsigned char)(c2.g + (c1.g - c2.g) * t);
        unsigned char lb = (unsigned char)(c2.b + (c1.b - c2.b) * t);

        DrawSphere({segs[i].x, r, segs[i].y}, r, {lr, lg, lb, 255});
    }

    // Head glow
    DrawSphere({snake.x, baseR + 2, snake.y}, baseR * 1.2f, {c1.r, c1.g, c1.b, 60});

    // Eyes
    float eyeD = baseR * 0.6f;
    float ex1 = snake.x + cosf(snake.angle - 0.5f) * eyeD;
    float ey1 = snake.y + sinf(snake.angle - 0.5f) * eyeD;
    float ex2 = snake.x + cosf(snake.angle + 0.5f) * eyeD;
    float ey2 = snake.y + sinf(snake.angle + 0.5f) * eyeD;
    DrawSphere({ex1, baseR*1.5f, ey1}, baseR*0.25f, WHITE);
    DrawSphere({ex2, baseR*1.5f, ey2}, baseR*0.25f, WHITE);
}

void Renderer3D::updateCamera(ContinuousSnake& snake) {
    float lookDist = 150.f;
    float camDist = 500.f;
    float camHeight = 450.f;

    float targetX = snake.x + cosf(snake.angle) * lookDist;
    float targetZ = snake.y + sinf(snake.angle) * lookDist;

    float dX = snake.x - cosf(snake.angle) * camDist;
    float dZ = snake.y - sinf(snake.angle) * camDist;

    camera.position = {dX, camHeight, dZ};
    camera.target = {targetX, 0, targetZ};
}

void Renderer3D::render(ContinuousSnake& snake, FoodManager& food, InfiniteArena& arena, StoryManager& story, int sw, int sh) {
    time += GetFrameTime();
    updateCamera(snake);

    ClearBackground({5, 5, 16, 255});

    BeginMode3D(camera);
        drawGrid3D(snake.x, snake.y);
        drawFood3D(food);
        drawBoss3D(story);
        drawSnake3D(snake);
    EndMode3D();

    story.drawCinematic(sw, sh);
}
