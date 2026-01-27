//
// Created by inkih on 22/11/25.
//
#include "Application.h"
#include <memory>

#include "AudioService.h"
#include "ExplorationState.h"
#include "ScriptEngine.h"

class Engine;

Application::Application(const char* title, int width, int height) {
    m_engine = std::make_unique<Engine>(width, height, title);
    m_stateManager = StateManager();
    AudioService::getInstance().init();
    ScriptEngine::getInstance().init();
    ScriptEngine::getInstance().setupBindingsStatic();
    m_stateManager.pushState( std::make_unique<ExplorationState>());
}

void Application::update(int deltaTime) {
    m_stateManager.updateCurrentState(deltaTime);
}

void Application::render() {
    m_stateManager.renderCurrentState();
}

void Application::run() {
    m_engine->startLoop([this](int deltaTime) {
        update(deltaTime);
    }, [this]() {
        render();
    });
}