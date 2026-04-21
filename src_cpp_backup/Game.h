#pragma once
#include "Snake.h"
#include "Arena.h"
#include "Story.h"
#include "Renderer2D.h"
#include "Renderer3D.h"
#include "Renderer4D.h"
#include "Audio.h"
#include "UI.h"

// ============================================
// Game States
// ============================================
enum class GameState { MENU, PLAYING, PAUSED, GAME_OVER };

// ============================================
// Game - Main orchestrator
// ============================================
class Game {
public:
    GameState state = GameState::MENU;
    int mode = 0; // 0=2D, 1=3D, 2=4D

    ContinuousSnake* snake = nullptr;
    InfiniteArena arena;
    FoodManager* food = nullptr;
    StoryManager story;

    Renderer2D renderer2D;
    Renderer3D renderer3D;
    Renderer4D renderer4D;
    AudioManager audio;
    UI ui;

    int highScore = 0;

    Game();
    ~Game();

    void run();

private:
    void startGame(int selectedMode);
    void update(float dt);
    void render(int sw, int sh);
    void handleDeath();
};
