#include "Audio.h"
#include <cmath>
#include <cstdlib>

Wave AudioManager::generateTone(float freq, float duration, float volume) {
    int sampleRate = 44100;
    int sampleCount = (int)(sampleRate * duration);
    float* data = (float*)RL_MALLOC(sampleCount * sizeof(float));

    for (int i = 0; i < sampleCount; i++) {
        float t = (float)i / sampleRate;
        float envelope = 1.f - (t / duration); // Linear decay
        data[i] = sinf(2.f * PI * freq * t) * volume * envelope;
    }

    Wave wave = {};
    wave.frameCount = sampleCount;
    wave.sampleRate = sampleRate;
    wave.sampleSize = 32; // float
    wave.channels = 1;
    wave.data = data;
    return wave;
}

Wave AudioManager::generateNoise(float duration, float volume) {
    int sampleRate = 44100;
    int sampleCount = (int)(sampleRate * duration);
    float* data = (float*)RL_MALLOC(sampleCount * sizeof(float));

    for (int i = 0; i < sampleCount; i++) {
        float t = (float)i / sampleRate;
        float envelope = 1.f - (t / duration);
        data[i] = ((float)rand() / RAND_MAX * 2.f - 1.f) * volume * envelope;
    }

    Wave wave = {};
    wave.frameCount = sampleCount;
    wave.sampleRate = sampleRate;
    wave.sampleSize = 32;
    wave.channels = 1;
    wave.data = data;
    return wave;
}

void AudioManager::init() {
    if (initialized) return;
    InitAudioDevice();

    Wave eatWave = generateTone(880.f, 0.1f, 0.4f);
    eatSound = LoadSoundFromWave(eatWave);
    UnloadWave(eatWave);

    Wave evolveWave = generateTone(440.f, 0.5f, 0.5f);
    evolveSound = LoadSoundFromWave(evolveWave);
    UnloadWave(evolveWave);

    Wave dieWave = generateNoise(0.5f, 0.4f);
    dieSound = LoadSoundFromWave(dieWave);
    UnloadWave(dieWave);

    Wave clickWave = generateTone(1200.f, 0.05f, 0.3f);
    clickSound = LoadSoundFromWave(clickWave);
    UnloadWave(clickWave);

    // Generate a simple ambient drone for music
    int sampleRate = 44100;
    int dur = 10; // 10 seconds loop
    int sampleCount = sampleRate * dur;
    float* musicData = (float*)RL_MALLOC(sampleCount * sizeof(float));
    for (int i = 0; i < sampleCount; i++) {
        float t = (float)i / sampleRate;
        float s = sinf(2.f * PI * 55.f * t) * 0.1f;
        s += sinf(2.f * PI * 82.5f * t) * 0.05f;
        s += sinf(2.f * PI * 110.f * t + sinf(t * 0.5f) * 2.f) * 0.08f;
        musicData[i] = s;
    }

    Wave musicWave = {};
    musicWave.frameCount = sampleCount;
    musicWave.sampleRate = sampleRate;
    musicWave.sampleSize = 32;
    musicWave.channels = 1;
    musicWave.data = musicData;

    bool exported = ExportWave(musicWave, "/tmp/snake_music.wav");
    UnloadWave(musicWave);

    if (exported) {
        music = LoadMusicStream("/tmp/snake_music.wav");
        music.looping = true;
    }

    initialized = true;
}

void AudioManager::playEat() { if (!muted) PlaySound(eatSound); }
void AudioManager::playEvolve() { if (!muted) PlaySound(evolveSound); }
void AudioManager::playDie() { if (!muted) PlaySound(dieSound); }
void AudioManager::playClick() { if (!muted) PlaySound(clickSound); }

void AudioManager::startMusic() {
    if (!muted && music.frameCount > 0) PlayMusicStream(music);
}

void AudioManager::stopMusic() {
    if (music.frameCount > 0) StopMusicStream(music);
}

void AudioManager::updateMusic() {
    if (music.frameCount > 0) UpdateMusicStream(music);
}

void AudioManager::setMuted(bool m) {
    muted = m;
    if (m) stopMusic();
    else startMusic();
}

void AudioManager::cleanup() {
    UnloadSound(eatSound);
    UnloadSound(evolveSound);
    UnloadSound(dieSound);
    UnloadSound(clickSound);
    if (music.frameCount > 0) UnloadMusicStream(music);
    CloseAudioDevice();
}
