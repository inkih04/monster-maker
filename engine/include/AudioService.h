//
// Created by inkih on 27/1/26.
//

#ifndef POKEMONGAMEENGINE_AUDIOSERVICE_H
#define POKEMONGAMEENGINE_AUDIOSERVICE_H


#include "soloud.h"
#include "soloud_wavstream.h"
#include "soloud_bus.h"
#include <string>

class AudioService {
    public:
        static AudioService& getInstance() {
            static AudioService instance;
            return instance;
        }

        void init();
        void shutdown();

        ~AudioService();

        void setMasterVolume(float volume);
        void setMusicVolume(float volume);
        void setSfxVolume(float volume);

        void playMusic(const std::string& path, bool loop = true);
        void stopMusic();
        void pauseMusic(bool paused);

        void playSound(const std::string& path);

    private:
        AudioService() = default;

        SoLoud::Soloud m_soloud;

        SoLoud::Bus m_musicBus;
        SoLoud::Bus m_sfxBus;

        SoLoud::WavStream m_musicStream;
        int m_musicHandle = 0;

        AudioService(const AudioService&) = delete;
        AudioService& operator=(const AudioService&) = delete;
};

#endif //POKEMONGAMEENGINE_AUDIOSERVICE_H