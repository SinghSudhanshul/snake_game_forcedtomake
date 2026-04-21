#include "raylib.h"
#include "Snake.h"

ContinuousSnake::ContinuousSnake(float startX, float startY)
    : x(startX), y(startY) {}

const EvolutionStage& ContinuousSnake::stage() const {
    return GetEvolutionStages()[evolutionStage];
}

const EvolutionStage* ContinuousSnake::nextStage() const {
    auto& stages = GetEvolutionStages();
    if (evolutionStage + 1 < (int)stages.size()) return &stages[evolutionStage + 1];
    return nullptr;
}

float ContinuousSnake::evolutionProgress() const {
    int current = stage().threshold;
    const EvolutionStage* ns = nextStage();
    int next = ns ? ns->threshold : current;
    if (next == current) return 1.f;
    return std::min(1.f, std::max(0.f, (float)(score - current) / (float)(next - current)));
}

void ContinuousSnake::setTargetAngle(float rad) { targetAngle = rad; }

void ContinuousSnake::steer(float dir) { targetAngle += dir * 0.08f; }

bool ContinuousSnake::addScore(int points) {
    score = std::max(0, score + points);
    if (points > 0) length += 2;
    return checkEvolution();
}

bool ContinuousSnake::checkEvolution() {
    auto& stages = GetEvolutionStages();
    int newStage = 0;
    for (int i = 0; i < (int)stages.size(); i++) {
        if (score >= stages[i].threshold) newStage = i;
    }
    if (newStage > evolutionStage) {
        evolutionStage = newStage;
        return true;
    }
    return false;
}

int ContinuousSnake::useAbility() {
    const auto& s = stage();
    if (s.ability.empty()) return 0;

    if (s.ability == "dash" && dashCooldown <= 0) {
        dashing = true;
        dashCooldown = 3.f;
        dashTimer = 0.8f;
        speed = baseSpeed * 2.5f;
        return 1;
    }
    if (s.ability == "fireball" && fireballCooldown <= 0) {
        fireballCooldown = 4.f;
        return 2;
    }
    if (s.ability == "blackhole" && blackholeCooldown <= 0) {
        blackholeCooldown = 10.f;
        return 3;
    }
    return 0;
}

void ContinuousSnake::update(float dt) {
    // Smooth angle interpolation
    float diff = targetAngle - angle;
    diff = atan2f(sinf(diff), cosf(diff));
    float turnRate = 4.0f - (stage().radius * 0.05f);
    angle += diff * turnRate * dt;

    // Cooldowns
    if (dashCooldown > 0) dashCooldown -= dt;
    if (fireballCooldown > 0) fireballCooldown -= dt;
    if (blackholeCooldown > 0) blackholeCooldown -= dt;

    // Dash timer
    if (dashing) {
        dashTimer -= dt;
        if (dashTimer <= 0) {
            dashing = false;
            speed = baseSpeed;
        }
    }

    // Move
    x += cosf(angle) * speed * dt;
    y += sinf(angle) * speed * dt;

    // Record history
    history.insert(history.begin(), {x, y});
    int requiredHistory = (int)ceilf((length * bodyDistance) / (speed * dt)) + 50;
    if ((int)history.size() > requiredHistory) {
        history.resize(requiredHistory);
    }
}

std::vector<Vec2> ContinuousSnake::getSegments() const {
    std::vector<Vec2> segments;
    segments.push_back({x, y});

    float distAcc = 0;
    int histIdx = 0;

    for (int i = 1; i < length; i++) {
        bool found = false;
        while (histIdx < (int)history.size() - 1) {
            Vec2 p1 = history[histIdx];
            Vec2 p2 = history[histIdx + 1];
            float dx = p2.x - p1.x;
            float dy = p2.y - p1.y;
            float d = sqrtf(dx*dx + dy*dy);

            if (distAcc + d >= bodyDistance) {
                float excess = bodyDistance - distAcc;
                float ratio = (d > 0.001f) ? excess / d : 0;
                segments.push_back({p1.x + dx * ratio, p1.y + dy * ratio});
                histIdx++;
                distAcc = d - excess;
                found = true;
                break;
            } else {
                distAcc += d;
                histIdx++;
            }
        }
        if (!found) break;
    }
    return segments;
}

bool ContinuousSnake::checkSelfCollision() const {
    if (dashing) return false;
    auto segs = getSegments();
    if ((int)segs.size() < 10) return false;
    float r = stage().radius;
    for (int i = 10; i < (int)segs.size(); i++) {
        float dx = segs[i].x - x;
        float dy = segs[i].y - y;
        if (dx*dx + dy*dy < r*r) return true;
    }
    return false;
}

void ContinuousSnake::die() { alive = false; }
