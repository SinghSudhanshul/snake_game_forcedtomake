#pragma once
#include "raylib.h"
#include <vector>
#include <cmath>
#include <string>

// ============================================
// Evolution Stages
// ============================================
struct EvolutionStage {
    std::string name;
    const char* emoji;
    int threshold;
    Color color1;
    Color color2;
    float radius;
    std::string ability;
    std::string abilityName;
};

inline const std::vector<EvolutionStage>& GetEvolutionStages() {
    static std::vector<EvolutionStage> stages = {
        {"Spawn",         "💧", 0,   {0,229,255,255}, {0,85,255,255},   12.f, "",         ""},
        {"Serpent",       "🐍", 100, {0,255,136,255}, {0,204,102,255},  16.f, "dash",     "Dash"},
        {"Neon Dragon",   "🐉", 300, {255,45,123,255},{204,0,68,255},   22.f, "fireball", "Fireball"},
        {"Cosmic Entity", "🌌", 600, {180,74,255,255},{85,0,170,255},   30.f, "blackhole","Singularity"},
    };
    return stages;
}

// ============================================
// Point
// ============================================
struct Vec2 {
    float x = 0, y = 0;
};

// ============================================
// Continuous Snake
// ============================================
class ContinuousSnake {
public:
    float x = 0, y = 0;
    float angle = 0;
    float targetAngle = 0;
    float speed = 180.f;
    float baseSpeed = 180.f;

    std::vector<Vec2> history;
    float bodyDistance = 15.f;
    int length = 20;

    int evolutionStage = 0;
    int score = 0;
    bool alive = true;

    // Cooldowns
    float dashCooldown = 0;
    float fireballCooldown = 0;
    float blackholeCooldown = 0;
    bool dashing = false;
    float dashTimer = 0;

    ContinuousSnake(float startX = 0, float startY = 0);

    const EvolutionStage& stage() const;
    const EvolutionStage* nextStage() const;
    float evolutionProgress() const;

    void setTargetAngle(float rad);
    void steer(float dir);
    bool addScore(int points);
    bool checkEvolution();
    int useAbility(); // Returns: 0=none, 1=dash, 2=fireball, 3=blackhole
    void update(float dt);
    std::vector<Vec2> getSegments() const;
    bool checkSelfCollision() const;
    void die();
};
