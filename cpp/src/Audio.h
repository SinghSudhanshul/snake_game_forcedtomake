#pragma once
#include "raylib.h"
#include "Snake.h"
#include <string>

// ============================================
// Audio Manager (using raylib audio)
// ============================================
class AudioManager {
public:
    Sound eatSound = {};
    Sound evolveSound = {};
    Sound dieSound = {};
    Sound clickSound = {};
    Music music = {};
    bool initialized = false;
    bool muted = false;

    void init();
    void playEat();
    void playEvolve();
    void playDie();
    void playClick();
    void startMusic();
    void stopMusic();
    void updateMusic();
    void setMuted(bool m);
    void cleanup();

private:
    // Generate simple wave data for sound effects
    Wave generateTone(float freq, float duration, float volume = 0.5f);
    Wave generateNoise(float duration, float volume = 0.3f);
};
