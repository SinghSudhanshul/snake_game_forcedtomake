#include "Story.h"
#include <cmath>
#include <vector>

static std::vector<Milestone> milestones = {
    {100,  "THE SERPENT AWAKENS...",                          ""},
    {300,  "WARNING: GEOMETRIC ANOMALY DETECTED",            "geom"},
    {600,  "THE COSMIC VOID BECKONS. EVOLUTION IMMINENT.",   "serpent"},
};

StoryManager::StoryManager() {}
StoryManager::~StoryManager() { delete activeBoss; }

bool StoryManager::checkMilestone(int score, float hx, float hy) {
    if (currentMilestoneIndex >= (int)milestones.size()) return false;
    auto& next = milestones[currentMilestoneIndex];
    if (score >= next.score) {
        currentMilestoneIndex++;
        showCinematicText(next.text);
        if (!next.bossType.empty()) spawnBoss(next.bossType, hx, hy);
        return true;
    }
    return false;
}

void StoryManager::showCinematicText(const std::string& text) {
    cinematicText = text;
    cinematicTimer = 3.5f;
    cinematicAlpha = 0;
}

void StoryManager::spawnBoss(const std::string& type, float hx, float hy) {
    delete activeBoss;
    activeBoss = new Boss();
    activeBoss->x = hx + 500;
    activeBoss->y = hy + 500;
    activeBoss->type = type;
    activeBoss->health = (type == "geom") ? 10 : 30;
    activeBoss->maxHealth = activeBoss->health;
    activeBoss->radius = (type == "geom") ? 100.f : 40.f;
}

void StoryManager::update(float dt, float hx, float hy) {
    // Cinematic
    if (cinematicTimer > 0) {
        cinematicTimer -= dt;
        if (cinematicTimer > 3.0f) cinematicAlpha = (3.5f - cinematicTimer) * 2.f;
        else if (cinematicTimer < 0.5f) cinematicAlpha = cinematicTimer * 2.f;
        else cinematicAlpha = 1.f;
    }

    if (!activeBoss) return;
    activeBoss->pulse += dt;
    if (activeBoss->type == "serpent") {
        float dx = hx - activeBoss->x;
        float dy = hy - activeBoss->y;
        float a = atan2f(dy, dx);
        activeBoss->x += cosf(a) * 100.f * dt;
        activeBoss->y += sinf(a) * 100.f * dt;
    }
}

bool StoryManager::damageBoss(int amount) {
    if (!activeBoss) return false;
    activeBoss->health -= amount;
    if (activeBoss->health <= 0) {
        delete activeBoss;
        activeBoss = nullptr;
        showCinematicText("THREAT ELIMINATED. ABSORB THE REMNANTS.");
        return true;
    }
    return false;
}

void StoryManager::drawCinematic(int screenW, int screenH) {
    if (cinematicTimer <= 0) return;
    DrawRectangle(0, 0, screenW, screenH, {0, 0, 0, (unsigned char)(150 * cinematicAlpha)});
    int fontSize = screenW / 25;
    int textW = MeasureText(cinematicText.c_str(), fontSize);
    DrawText(cinematicText.c_str(), (screenW - textW)/2, screenH/2 - fontSize/2, fontSize, 
             {255, 45, 123, (unsigned char)(255 * cinematicAlpha)});
}
