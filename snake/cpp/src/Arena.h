#pragma once
#include "raylib.h"
#include <vector>
#include <string>

// ============================================
// Food Types
// ============================================
struct FoodType {
    std::string name;
    int points;
    Color color;
    Color glow;
    float chance;
    bool evolution = false;
};

inline const std::vector<FoodType>& GetFoodTypes() {
    static std::vector<FoodType> types = {
        {"Energy",  10, {0,255,136,255},   {0,255,0,255},     0.65f, false},
        {"Star",    25, {255,215,0,255},    {255,170,0,255},   0.20f, false},
        {"Nebula",  15, {180,74,255,255},   {153,0,255,255},   0.10f, true},
        {"Toxic",  -10, {255,45,123,255},   {204,0,0,255},     0.05f, false},
    };
    return types;
}

// ============================================
// Food Item
// ============================================
struct FoodItem {
    float x, y;
    float radius;
    int typeIndex;
    float pulse;
};

// ============================================
// Infinite Arena
// ============================================
class InfiniteArena {
public:
    float size;

    InfiniteArena(float s = 10000.f) : size(s) {}
    bool isWall(float x, float y) const {
        return x < -size/2 || x > size/2 || y < -size/2 || y > size/2;
    }
};

// ============================================
// Food Manager
// ============================================
class FoodManager {
public:
    std::vector<FoodItem> items;
    int maxItems = 50;
    float arenaSize;

    FoodManager(float arenaSize = 10000.f);
    void spawnNear(float x, float y, float radius = 800.f);
    int checkCollision(float hx, float hy, float hr); // returns index or -1
    void update(float dt, float hx, float hy);
};
