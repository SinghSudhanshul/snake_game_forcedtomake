#pragma once
#include "raylib.h"
#include "Snake.h"
#include <string>
#include <functional>

// ============================================
// UI Manager - Menu, HUD, GameOver
// ============================================
enum class UIState { MENU, HUD, GAME_OVER };

class UI {
public:
    UIState state = UIState::MENU;
    int selectedMode = 0; // 0=2D, 1=3D, 2=4D
    int hoveredMode = -1;
    float animTime = 0;
    bool showPaused = false;

    // Game Over data
    int finalScore = 0;
    int highScore = 0;
    std::string finalStage;

    void drawMenu(int sw, int sh);
    void drawHUD(ContinuousSnake& snake, int highScore, int sw, int sh, bool paused);
    void drawGameOver(int sw, int sh);

    int handleMenuInput(int sw, int sh); // Returns: -1 = no click, 0/1/2 = mode selected
    int handleGameOverInput(int sw, int sh); // Returns: -1 = nothing, 0 = retry, 1 = menu
};
