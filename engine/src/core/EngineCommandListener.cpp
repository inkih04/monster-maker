//
// Created by inkih on 7/4/26.
//

#include "EngineCommandListener.h"
#include <iostream>

std::atomic<bool> EngineCommandListener::s_paused{false};
std::atomic<bool> EngineCommandListener::s_running{false};
std::thread       EngineCommandListener::s_thread;

void EngineCommandListener::start() {
    if (s_running.exchange(true)) return;

    s_thread = std::thread([]() {
        listenLoop();
    });
    s_thread.detach();
}

void EngineCommandListener::stop() {
    s_running = false;
}

bool EngineCommandListener::isPaused() {
    return s_paused.load();
}

void EngineCommandListener::listenLoop() {
    std::string line;
    while (s_running && std::getline(std::cin, line)) {
        if (line == "PAUSE") {
            s_paused = true;
            std::cout << "[ENGINE] Update loop paused." << std::endl;
        } else if (line == "RESUME") {
            s_paused = false;
            std::cout << "[ENGINE] Update loop resumed." << std::endl;
        }
    }
    s_running = false;
}