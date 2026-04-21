#include "Game.h"
#include <cmath>

Game::Game() {
    // Load high score (simple file I/O)
    if (FileExists("highscore.dat")) {
        int size = 0;
        unsigned char* data = LoadFileData("highscore.dat", &size);
        if (data && size >= (int)sizeof(int)) {
            highScore = *(int*)data;
        }
        if (data) UnloadFileData(data);
    }
}

Game::~Game() {
    delete snake;
    delete food;
    audio.cleanup();
}

void Game::startGame(int selectedMode) {
    mode = selectedMode;
    state = GameState::PLAYING;

    delete snake;
    delete food;

    snake = new ContinuousSnake(0, 0);
    food = new FoodManager(arena.size);
    story = StoryManager(); // reset

    for (int i = 0; i < 30; i++) food->spawnNear(0, 0, 1500);

    audio.init();
    audio.playClick();
    audio.startMusic();
}

void Game::update(float dt) {
    if (!snake || !snake->alive) return;

    // Mouse steering
    Vector2 mouse = GetMousePosition();
    float cx = GetScreenWidth() / 2.f;
    float cy = GetScreenHeight() / 2.f;
    float angle = atan2f(mouse.y - cy, mouse.x - cx);
    snake->setTargetAngle(angle);

    // Keyboard steering
    if (IsKeyDown(KEY_LEFT) || IsKeyDown(KEY_A)) snake->steer(-1);
    if (IsKeyDown(KEY_RIGHT) || IsKeyDown(KEY_D)) snake->steer(1);

    // Ability
    if (IsKeyPressed(KEY_SPACE)) {
        int result = snake->useAbility();
        if (result > 0) audio.playClick();
        
        // Fireball hits boss
        if (result == 2 && story.activeBoss) {
            float dx = story.activeBoss->x - snake->x;
            float dy = story.activeBoss->y - snake->y;
            if (dx*dx + dy*dy < 400000) {
                bool killed = story.damageBoss(10);
                if (killed) snake->addScore(100);
            }
        }
    }

    snake->update(dt);
    food->update(dt, snake->x, snake->y);
    story.update(dt, snake->x, snake->y);

    // Ensure food
    while ((int)food->items.size() < 30) {
        food->spawnNear(snake->x, snake->y, 1500);
    }

    // Wall check
    if (arena.isWall(snake->x, snake->y)) {
        handleDeath();
        return;
    }

    // Self collision
    if (snake->checkSelfCollision()) {
        handleDeath();
        return;
    }

    // Food collision
    int eaten = food->checkCollision(snake->x, snake->y, snake->stage().radius);
    if (eaten >= 0) {
        auto& types = GetFoodTypes();
        FoodItem fi = food->items[eaten]; // already removed by checkCollision... wait
        // Actually checkCollision returns index but doesn't remove... let me fix
    }

    // Let me instead handle it directly:
    for (int i = 0; i < (int)food->items.size(); i++) {
        FoodItem& fi = food->items[i];
        float dx = fi.x - snake->x;
        float dy = fi.y - snake->y;
        float colDist = snake->stage().radius + fi.radius;
        if (dx*dx + dy*dy < colDist * colDist) {
            auto& types = GetFoodTypes();
            const FoodType& ft = types[fi.typeIndex];

            bool evolved = snake->addScore(ft.points);
            audio.playEat();

            food->items.erase(food->items.begin() + i);

            if (evolved) {
                audio.playEvolve();
            }

            story.checkMilestone(snake->score, snake->x, snake->y);

            if (snake->score > highScore) {
                highScore = snake->score;
                SaveFileData("highscore.dat", &highScore, sizeof(int));
            }
            break;
        }
    }

    audio.updateMusic();
}

void Game::render(int sw, int sh) {
    BeginDrawing();
    ClearBackground({5, 5, 10, 255});

    switch (state) {
        case GameState::MENU:
            ui.drawMenu(sw, sh);
            break;

        case GameState::PLAYING:
        case GameState::PAUSED:
            if (snake && food) {
                if (mode == 0) renderer2D.render(*snake, *food, arena, story, sw, sh);
                else if (mode == 1) renderer3D.render(*snake, *food, arena, story, sw, sh);
                else renderer4D.render(*snake, *food, arena, story, sw, sh);

                ui.drawHUD(*snake, highScore, sw, sh, state == GameState::PAUSED);
            }
            break;

        case GameState::GAME_OVER:
            if (snake && food) {
                if (mode == 0) renderer2D.render(*snake, *food, arena, story, sw, sh);
                else if (mode == 1) renderer3D.render(*snake, *food, arena, story, sw, sh);
                else renderer4D.render(*snake, *food, arena, story, sw, sh);
            }
            ui.drawGameOver(sw, sh);
            break;
    }

    // FPS
    DrawFPS(GetScreenWidth() - 100, 10);
    EndDrawing();
}

void Game::handleDeath() {
    if (!snake) return;
    snake->die();
    audio.playDie();
    audio.stopMusic();

    ui.finalScore = snake->score;
    ui.highScore = highScore;
    ui.finalStage = snake->stage().name;
    state = GameState::GAME_OVER;
}

void Game::run() {
    SetConfigFlags(FLAG_WINDOW_RESIZABLE | FLAG_MSAA_4X_HINT);
    InitWindow(1280, 800, "Snake Evolution — C++ Edition");
    SetTargetFPS(60);
    SetExitKey(KEY_NULL); // Prevent ESC from closing

    audio.init();

    while (!WindowShouldClose()) {
        int sw = GetScreenWidth();
        int sh = GetScreenHeight();
        float dt = GetFrameTime();

        switch (state) {
            case GameState::MENU: {
                int selected = ui.handleMenuInput(sw, sh);
                if (selected >= 0) startGame(selected);
                break;
            }

            case GameState::PLAYING:
                if (IsKeyPressed(KEY_ESCAPE)) state = GameState::PAUSED;
                else update(dt);
                break;

            case GameState::PAUSED:
                if (IsKeyPressed(KEY_ESCAPE)) state = GameState::PLAYING;
                break;

            case GameState::GAME_OVER: {
                int action = ui.handleGameOverInput(sw, sh);
                if (action == 0) startGame(mode);
                else if (action == 1) { state = GameState::MENU; }
                break;
            }
        }

        render(sw, sh);
    }

    CloseWindow();
}
