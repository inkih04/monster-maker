//
// Created by inkih on 27/1/26.
//

#include "AudioService.h"
#include "ResourceManager.h"
#include <iostream>
#include <filesystem>

namespace fs = std::filesystem;

void AudioService::init() {
    auto res = m_soloud.init();
    if (res != 0) {
        std::cerr << "[AudioService] ERROR: SoLoud init failed: " << res << std::endl;
        return;
    }

    m_soloud.play(m_musicBus);
    m_soloud.play(m_sfxBus);

    setMasterVolume(1.0f);
    setMusicVolume(1.0f);
    setSfxVolume(1.0f);
}

void AudioService::shutdown() {
    m_soloud.deinit();
}

AudioService::~AudioService() {
    shutdown();
}

void AudioService::setMasterVolume(float volume) {
    m_soloud.setGlobalVolume(volume);
}

void AudioService::setMusicVolume(float volume) {
    m_musicBus.setVolume(volume);
}

void AudioService::setSfxVolume(float volume) {
    m_sfxBus.setVolume(volume);
}

void AudioService::playMusic(const std::string& path, bool loop) {
    if (!fs::exists(path)) {
        std::cerr << "[AudioService] ERROR: file not found: " << path << std::endl;
        return;
    }

    auto res = m_musicStream.load(path.c_str());
    if (res != 0) {
        std::cerr << "[AudioService] ERROR: SoLoud failed to load the file (invalid format?). Error code: " << res << std::endl;
        return;
    }

    if (m_musicHandle != 0) {
        m_soloud.stop(m_musicHandle);
    }
    m_musicStream.setLooping(loop);
    m_musicHandle = m_musicBus.play(m_musicStream);
}

void AudioService::stopMusic() {
    if (m_musicHandle != 0) {
        m_soloud.stop(m_musicHandle);
        m_musicHandle = 0;
    }
}

void AudioService::pauseMusic(bool paused) {
    if (m_musicHandle != 0) {
        m_soloud.setPause(m_musicHandle, paused);
    }
}

void AudioService::playSound(const std::string& path) {
    SoLoud::Wav* sfx = ResourceManager::loadSound(path);
    if (sfx) {
        m_sfxBus.play(*sfx);
    }
}