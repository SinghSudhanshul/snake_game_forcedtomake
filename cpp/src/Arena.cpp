#include "Arena.h"
#include <cmath>
#include <algorithm>

FoodManager::FoodManager(float as) : arenaSize(as) {}

void FoodManager::spawnNear(float x, float y, float radius) {
    if ((int)items.size() >= maxItems) return;

    float angle = (float)GetRandomValue(0, 6283) / 1000.f;
    float dist = (float)GetRandomValue(200, (int)radius);

    float fx = x + cosf(angle) * dist;
    float fy = y + sinf(angle) * dist;
    fx = std::max(-arenaSize/2 + 50, std::min(arenaSize/2 - 50, fx));
    fy = std::max(-arenaSize/2 + 50, std::min(arenaSize/2 - 50, fy));

    float roll = (float)GetRandomValue(0, 1000) / 1000.f;
    auto& types = GetFoodTypes();
    float cumulative = 0;
    int typeIdx = 0;
    for (int i = 0; i < (int)types.size(); i++) {
        cumulative += types[i].chance;
        if (roll <= cumulative) { typeIdx = i; break; }
    }

    float r = (typeIdx == 0) ? 10.f : 15.f;
    items.push_back({fx, fy, r, typeIdx, (float)GetRandomValue(0, 6283) / 1000.f});
}

int FoodManager::checkCollision(float hx, float hy, float hr) {
    for (int i = 0; i < (int)items.size(); i++) {
        float dx = items[i].x - hx;
        float dy = items[i].y - hy;
        float colDist = hr + items[i].radius;
        if (dx*dx + dy*dy < colDist*colDist) {
            return i;
        }
    }
    return -1;
}

void FoodManager::update(float dt, float hx, float hy) {
    for (auto& f : items) f.pulse += dt * 5.f;
    items.erase(std::remove_if(items.begin(), items.end(), [&](const FoodItem& f) {
        float dx = f.x - hx;
        float dy = f.y - hy;
        return (dx*dx + dy*dy) > 4000000.f;
    }), items.end());
}
