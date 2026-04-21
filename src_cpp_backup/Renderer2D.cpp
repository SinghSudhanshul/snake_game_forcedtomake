#include "Renderer2D.h"
#include <cmath>

Renderer2D::Renderer2D() {
    for (int i = 0; i < 200; i++) {
        stars.push_back({
            ((float)GetRandomValue(-2000, 2000)),
            ((float)GetRandomValue(-2000, 2000)),
            (float)GetRandomValue(1, 4),
            (float)GetRandomValue(1, 5) / 10.f,
            (float)GetRandomValue(0, 100) / 100.f
        });
    }
}

void Renderer2D::addParticles(float px, float py, Color color, int count) {
    for (int i = 0; i < count; i++) {
        particles.push_back({
            px, py,
            (float)GetRandomValue(-50, 50) / 10.f,
            (float)GetRandomValue(-50, 50) / 10.f,
            1.f,
            (float)GetRandomValue(2, 5) / 100.f,
            (float)GetRandomValue(3, 9),
            color
        });
    }
}

void Renderer2D::shakeScreen(float intensity) { shakeIntensity = intensity; }

void Renderer2D::updateParticles() {
    for (int i = (int)particles.size() - 1; i >= 0; i--) {
        auto& p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.95f; p.vy *= 0.95f;
        p.life -= p.decay;
        if (p.life <= 0) {
            particles.erase(particles.begin() + i);
        }
    }
    if (shakeIntensity > 0) {
        shakeX = (float)GetRandomValue(-100, 100) / 100.f * shakeIntensity;
        shakeY = (float)GetRandomValue(-100, 100) / 100.f * shakeIntensity;
        shakeIntensity *= 0.9f;
        if (shakeIntensity < 0.3f) shakeIntensity = 0;
    } else {
        shakeX = shakeY = 0;
    }
}

void Renderer2D::drawStars(float camX, float camY, float snakeX, float snakeY, int sw, int sh) {
    for (auto& s : stars) {
        float rx = fmodf((s.x + snakeX * 0.2f), 4000.f);
        if (rx < 0) rx += 4000.f;
        rx = rx - 2000.f + snakeX;
        float ry = fmodf((s.y + snakeY * 0.2f), 4000.f);
        if (ry < 0) ry += 4000.f;
        ry = ry - 2000.f + snakeY;

        float twinkle = (sinf(time * s.speed + s.brightness * 10.f) + 1.f) / 2.f;
        unsigned char alpha = (unsigned char)((0.1f + twinkle * 0.6f * s.brightness) * 255);
        DrawCircle((int)(rx + camX), (int)(ry + camY), s.size, {255, 255, 255, alpha});
    }
}

void Renderer2D::drawGrid(float camX, float camY, float snakeX, float snakeY, int sw, int sh) {
    int gridSize = 200;
    int startX = ((int)floorf((snakeX - sw/2.f) / gridSize)) * gridSize;
    int startY = ((int)floorf((snakeY - sh/2.f) / gridSize)) * gridSize;
    Color gridColor = {255, 255, 255, 8};
    for (int x = startX; x < startX + sw + gridSize; x += gridSize) {
        DrawLine((int)(x + camX), 0, (int)(x + camX), sh, gridColor);
    }
    for (int y = startY; y < startY + sh + gridSize; y += gridSize) {
        DrawLine(0, (int)(y + camY), sw, (int)(y + camY), gridColor);
    }
}

void Renderer2D::drawFood(FoodManager& food, float camX, float camY) {
    auto& types = GetFoodTypes();
    for (auto& f : food.items) {
        float pulse = sinf(f.pulse) * 0.15f + 0.85f;
        float r = f.radius * pulse;
        int sx = (int)(f.x + camX);
        int sy = (int)(f.y + camY);
        Color c = types[f.typeIndex].color;
        Color glow = types[f.typeIndex].glow;

        // Glow
        DrawCircle(sx, sy, r + 8, {glow.r, glow.g, glow.b, 40});
        DrawCircle(sx, sy, r + 4, {glow.r, glow.g, glow.b, 80});
        // Core
        DrawCircleGradient(sx, sy, r, WHITE, c);
    }
}

void Renderer2D::drawBoss(StoryManager& story, float camX, float camY) {
    if (!story.activeBoss) return;
    Boss& b = *story.activeBoss;
    int sx = (int)(b.x + camX);
    int sy = (int)(b.y + camY);

    // Glow
    DrawCircle(sx, sy, b.radius + 15, {255, 0, 0, 30});

    if (b.type == "geom") {
        // Rotating triangle
        float a = time;
        Vector2 v1 = {sx + cosf(a) * b.radius, sy + sinf(a) * b.radius};
        Vector2 v2 = {sx + cosf(a + 2.094f) * b.radius, sy + sinf(a + 2.094f) * b.radius};
        Vector2 v3 = {sx + cosf(a + 4.189f) * b.radius, sy + sinf(a + 4.189f) * b.radius};
        DrawTriangle(v1, v2, v3, {255, 45, 123, 200});
    } else {
        DrawCircle(sx, sy, b.radius, {255, 45, 123, 200});
    }

    // Health bar
    int barW = 100;
    float hp = (float)b.health / (float)b.maxHealth;
    DrawRectangle(sx - barW/2, sy - (int)b.radius - 30, (int)(barW * hp), 8, RED);
    DrawRectangleLines(sx - barW/2, sy - (int)b.radius - 30, barW, 8, WHITE);
}

void Renderer2D::drawSnake(ContinuousSnake& snake, float camX, float camY) {
    auto segs = snake.getSegments();
    if (segs.empty()) return;

    float baseR = snake.stage().radius;
    Color c1 = snake.stage().color1;
    Color c2 = snake.stage().color2;

    // Body segments (back to front)
    for (int i = (int)segs.size() - 2; i >= 0; i--) {
        float t = 1.f - ((float)i / (float)segs.size());
        float r = baseR * (0.4f + t * 0.6f);
        int sx = (int)(segs[i].x + camX);
        int sy = (int)(segs[i].y + camY);

        // Glow
        DrawCircle(sx, sy, r + 5, {c1.r, c1.g, c1.b, (unsigned char)(t * 40)});
        // Body
        unsigned char lr = (unsigned char)(c2.r + (c1.r - c2.r) * t);
        unsigned char lg = (unsigned char)(c2.g + (c1.g - c2.g) * t);
        unsigned char lb = (unsigned char)(c2.b + (c1.b - c2.b) * t);
        DrawCircle(sx, sy, r, {lr, lg, lb, 255});
    }

    // Head
    int hx = (int)(snake.x + camX);
    int hy = (int)(snake.y + camY);
    DrawCircle(hx, hy, baseR + 6, {c1.r, c1.g, c1.b, 60}); // glow
    DrawCircleGradient(hx, hy, baseR, WHITE, c1);

    // Eyes
    float eyeD = baseR * 0.6f;
    int ex1 = hx + (int)(cosf(snake.angle - 0.5f) * eyeD);
    int ey1 = hy + (int)(sinf(snake.angle - 0.5f) * eyeD);
    int ex2 = hx + (int)(cosf(snake.angle + 0.5f) * eyeD);
    int ey2 = hy + (int)(sinf(snake.angle + 0.5f) * eyeD);

    DrawCircle(ex1, ey1, baseR * 0.3f, WHITE);
    DrawCircle(ex2, ey2, baseR * 0.3f, WHITE);
    DrawCircle(ex1 + (int)(cosf(snake.angle)*2), ey1 + (int)(sinf(snake.angle)*2), baseR * 0.15f, BLACK);
    DrawCircle(ex2 + (int)(cosf(snake.angle)*2), ey2 + (int)(sinf(snake.angle)*2), baseR * 0.15f, BLACK);
}

void Renderer2D::drawParticles(float camX, float camY) {
    for (auto& p : particles) {
        unsigned char alpha = (unsigned char)(p.life * 255);
        Color c = {p.color.r, p.color.g, p.color.b, alpha};
        DrawCircle((int)(p.x + camX), (int)(p.y + camY), p.size * p.life, c);
    }
}

void Renderer2D::render(ContinuousSnake& snake, FoodManager& food, InfiniteArena& arena, StoryManager& story, int sw, int sh) {
    time += GetFrameTime();
    updateParticles();

    float camX = sw / 2.f - snake.x + shakeX;
    float camY = sh / 2.f - snake.y + shakeY;

    // Background
    DrawRectangleGradientV(0, 0, sw, sh, {13, 13, 26, 255}, {5, 5, 8, 255});

    drawStars(camX, camY, snake.x, snake.y, sw, sh);
    drawGrid(camX, camY, snake.x, snake.y, sw, sh);

    // Arena border
    DrawRectangleLinesEx({
        -arena.size/2 + camX, -arena.size/2 + camY,
        arena.size, arena.size
    }, 10, {255, 0, 100, 80});

    drawFood(food, camX, camY);
    drawBoss(story, camX, camY);
    drawSnake(snake, camX, camY);
    drawParticles(camX, camY);
    story.drawCinematic(sw, sh);
}
