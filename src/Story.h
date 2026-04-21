#pragma once
#include "raylib.h"
#include <string>

// ============================================
// Boss
// ============================================
struct Boss {
    float x, y;
    std::string type; // "geom" or "serpent"
    int health, maxHealth;
    float radius;
    float pulse = 0;
    bool alive = true;
};

// ============================================
// Story Milestone
// ============================================
struct Milestone {
    int score;
    std::string text;
    std::string bossType; // empty = no boss
};

// ============================================
// Story Manager
// ============================================
class StoryManager {
public:
    Boss* activeBoss = nullptr;
    int currentMilestoneIndex = 0;
    std::string cinematicText;
    float cinematicTimer = 0;
    float cinematicAlpha = 0;

    StoryManager();
    ~StoryManager();

    bool checkMilestone(int score, float hx, float hy);
    void showCinematicText(const std::string& text);
    void spawnBoss(const std::string& type, float hx, float hy);
    void update(float dt, float hx, float hy);
    bool damageBoss(int amount);
    void drawCinematic(int screenW, int screenH);
};
