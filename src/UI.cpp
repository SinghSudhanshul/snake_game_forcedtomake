#include "UI.h"
#include <cmath>

static void DrawGlassRect(int x, int y, int w, int h, Color tint, bool hovered) {
    unsigned char alpha = hovered ? 60 : 30;
    DrawRectangle(x, y, w, h, {tint.r, tint.g, tint.b, alpha});
    DrawRectangleLinesEx({(float)x, (float)y, (float)w, (float)h}, 2, {tint.r, tint.g, tint.b, (unsigned char)(hovered ? 180 : 80)});
}

void UI::drawMenu(int sw, int sh) {
    animTime += GetFrameTime();

    // Background
    DrawRectangleGradientV(0, 0, sw, sh, {8, 8, 24, 255}, {3, 3, 10, 255});

    // Stars
    for (int i = 0; i < 80; i++) {
        float sx = fmodf(i * 137.5f + animTime * (i % 3 + 1) * 5, (float)sw);
        float sy = fmodf(i * 89.3f + animTime * (i % 2 + 0.5f) * 3, (float)sh);
        float twinkle = (sinf(animTime * 2 + i) + 1) / 2;
        DrawCircle((int)sx, (int)sy, 1 + twinkle, {255, 255, 255, (unsigned char)(twinkle * 200)});
    }

    // Title
    const char* title = "SNAKE EVOLUTION";
    int titleSize = sw / 14;
    int titleW = MeasureText(title, titleSize);
    
    // Title glow pulse
    float pulse = (sinf(animTime * 2) + 1) / 2;
    unsigned char glowA = (unsigned char)(100 + pulse * 100);
    DrawText(title, (sw - titleW)/2 + 2, sh/6 + 2, titleSize, {0, 229, 255, 60}); // shadow
    DrawText(title, (sw - titleW)/2, sh/6, titleSize, {0, 229, 255, glowA});

    const char* subtitle = "CHOOSE YOUR DIMENSION";
    int subSize = sw / 40;
    int subW = MeasureText(subtitle, subSize);
    DrawText(subtitle, (sw - subW)/2, sh/6 + titleSize + 20, subSize, {200, 200, 220, 180});

    // Mode Cards
    const char* modes[] = {"2D", "3D", "4D"};
    const char* descs[] = {"Canvas Render", "Perspective 3D", "Time Warp"};
    Color colors[] = {{0, 229, 255, 255}, {0, 255, 136, 255}, {180, 74, 255, 255}};

    int cardW = sw / 5;
    int cardH = sh / 3;
    int gap = sw / 20;
    int totalW = cardW * 3 + gap * 2;
    int startX = (sw - totalW) / 2;
    int cardY = sh / 3 + 40;

    Vector2 mouse = GetMousePosition();
    hoveredMode = -1;

    for (int i = 0; i < 3; i++) {
        int cx = startX + i * (cardW + gap);
        bool hovered = (mouse.x >= cx && mouse.x <= cx + cardW && mouse.y >= cardY && mouse.y <= cardY + cardH);
        if (hovered) hoveredMode = i;

        float hoverScale = hovered ? 1.05f : 1.f;
        int drawW = (int)(cardW * hoverScale);
        int drawH = (int)(cardH * hoverScale);
        int drawX = cx - (drawW - cardW) / 2;
        int drawY = cardY - (drawH - cardH) / 2;

        DrawGlassRect(drawX, drawY, drawW, drawH, colors[i], hovered);

        int modeSize = drawW / 3;
        int modeW = MeasureText(modes[i], modeSize);
        DrawText(modes[i], drawX + (drawW - modeW)/2, drawY + drawH/3, modeSize, colors[i]);

        int descSize = drawW / 10;
        int descW = MeasureText(descs[i], descSize);
        DrawText(descs[i], drawX + (drawW - descW)/2, drawY + drawH/3 + modeSize + 15, descSize, {200, 200, 220, 180});

        if (hovered) {
            DrawText("CLICK TO PLAY", drawX + (drawW - MeasureText("CLICK TO PLAY", descSize))/2, drawY + drawH - descSize - 20, descSize, colors[i]);
        }
    }

    // Footer
    const char* footer = "Move with MOUSE | Space for Ability | ESC to Pause";
    int footerSize = sw / 60;
    int footerW = MeasureText(footer, footerSize);
    DrawText(footer, (sw - footerW)/2, sh - 60, footerSize, {100, 100, 120, 150});
}

int UI::handleMenuInput(int sw, int sh) {
    if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) && hoveredMode >= 0) {
        return hoveredMode;
    }
    // Keyboard shortcuts
    if (IsKeyPressed(KEY_ONE)) return 0;
    if (IsKeyPressed(KEY_TWO)) return 1;
    if (IsKeyPressed(KEY_THREE)) return 2;
    return -1;
}

void UI::drawHUD(ContinuousSnake& snake, int hs, int sw, int sh, bool paused) {
    // Score
    const char* scoreText = TextFormat("%d", snake.score);
    int scoreSize = sw / 18;
    DrawText(scoreText, 30, 25, scoreSize, WHITE);

    const char* bestText = TextFormat("BEST: %d", hs);
    DrawText(bestText, 30, 25 + scoreSize + 5, sw/50, {150, 150, 170, 200});

    // Evolution
    auto& s = snake.stage();
    const char* evoLabel = "EVOLUTION";
    int evoSize = sw / 55;
    int evoLabelW = MeasureText(evoLabel, evoSize);
    DrawText(evoLabel, (sw - evoLabelW)/2, 15, evoSize, {150, 150, 180, 200});

    const char* stageName = s.name.c_str();
    int stageSize = sw / 30;
    int stageW = MeasureText(stageName, stageSize);
    DrawText(stageName, (sw - stageW)/2, 15 + evoSize + 5, stageSize, s.color1);

    // Progress bar
    float prog = snake.evolutionProgress();
    int barW = sw / 4;
    int barX = (sw - barW) / 2;
    int barY = 15 + evoSize + stageSize + 15;
    DrawRectangle(barX, barY, barW, 6, {40, 40, 60, 200});
    DrawRectangle(barX, barY, (int)(barW * prog), 6, s.color1);

    // Ability indicator
    if (!s.ability.empty()) {
        const char* abilityText = s.abilityName.c_str();
        int abSize = sw / 50;
        DrawText(TextFormat("[SPACE] %s", abilityText), sw - 250, 30, abSize, {255, 255, 255, 200});
    }

    // Pause overlay
    if (paused) {
        DrawRectangle(0, 0, sw, sh, {0, 0, 0, 180});
        const char* pauseText = "PAUSED";
        int pauseSize = sw / 12;
        int pauseW = MeasureText(pauseText, pauseSize);
        DrawText(pauseText, (sw - pauseW)/2, sh/2 - pauseSize/2, pauseSize, {255, 255, 255, 220});
        const char* resumeText = "Press ESC to resume";
        int rSize = sw / 40;
        int rW = MeasureText(resumeText, rSize);
        DrawText(resumeText, (sw - rW)/2, sh/2 + pauseSize/2 + 20, rSize, {180, 180, 200, 180});
    }
}

void UI::drawGameOver(int sw, int sh) {
    animTime += GetFrameTime();

    DrawRectangle(0, 0, sw, sh, {0, 0, 0, 200});

    const char* goText = "GAME OVER";
    int goSize = sw / 10;
    int goW = MeasureText(goText, goSize);
    DrawText(goText, (sw - goW)/2, sh/4, goSize, {255, 45, 123, 255});

    int infoSize = sw / 30;
    DrawText(TextFormat("Score: %d", finalScore), (sw - MeasureText(TextFormat("Score: %d", finalScore), infoSize))/2, sh/4 + goSize + 30, infoSize, WHITE);
    DrawText(TextFormat("Best: %d", highScore), (sw - MeasureText(TextFormat("Best: %d", highScore), infoSize))/2, sh/4 + goSize + 30 + infoSize + 10, infoSize, {150, 150, 170, 200});
    DrawText(TextFormat("Stage: %s", finalStage.c_str()), (sw - MeasureText(TextFormat("Stage: %s", finalStage.c_str()), infoSize))/2, sh/4 + goSize + 30 + (infoSize + 10)*2, infoSize, {0, 229, 255, 255});

    // Buttons
    int btnW = sw / 4;
    int btnH = sh / 12;
    int btnY = sh * 2 / 3;
    int retryX = sw / 2 - btnW - 20;
    int menuX = sw / 2 + 20;

    Vector2 mouse = GetMousePosition();

    bool retryHov = (mouse.x >= retryX && mouse.x <= retryX + btnW && mouse.y >= btnY && mouse.y <= btnY + btnH);
    bool menuHov = (mouse.x >= menuX && mouse.x <= menuX + btnW && mouse.y >= btnY && mouse.y <= btnY + btnH);

    DrawGlassRect(retryX, btnY, btnW, btnH, {0, 255, 136, 255}, retryHov);
    DrawGlassRect(menuX, btnY, btnW, btnH, {255, 45, 123, 255}, menuHov);

    int btnText = sw / 40;
    const char* retry = "RETRY";
    const char* menu = "MAIN MENU";
    DrawText(retry, retryX + (btnW - MeasureText(retry, btnText))/2, btnY + (btnH - btnText)/2, btnText, {0, 255, 136, 255});
    DrawText(menu, menuX + (btnW - MeasureText(menu, btnText))/2, btnY + (btnH - btnText)/2, btnText, {255, 45, 123, 255});
}

int UI::handleGameOverInput(int sw, int sh) {
    int btnW = sw / 4;
    int btnH = sh / 12;
    int btnY = sh * 2 / 3;
    int retryX = sw / 2 - btnW - 20;
    int menuX = sw / 2 + 20;

    if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) {
        Vector2 mouse = GetMousePosition();
        if (mouse.x >= retryX && mouse.x <= retryX + btnW && mouse.y >= btnY && mouse.y <= btnY + btnH) return 0;
        if (mouse.x >= menuX && mouse.x <= menuX + btnW && mouse.y >= btnY && mouse.y <= btnY + btnH) return 1;
    }
    if (IsKeyPressed(KEY_ENTER) || IsKeyPressed(KEY_SPACE)) return 0;
    return -1;
}
