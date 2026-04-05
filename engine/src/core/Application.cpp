//
// Created by inkih on 22/11/25.
//
#include "Application.h"
#include <memory>

#include "AudioService.h"
#include "EditorConfig.h"
#include "EditorConfigLoader.h"
#include "ExplorationState.h"
#include "LocalizationManager.h"
#include "ScriptEngine.h"

class Engine;

Application::Application(int width, int height) {
    EditorConfigLoader::loadFromFile(".engineConfig.json");
    LocalizationManager::getInstance().load(EditorConfig::getInstance().getDefaultLanguagePath());
    m_engine = std::make_unique<Engine>(width, height, EditorConfig::getInstance().getGameName());
    m_stateManager = StateManager();
    AudioService::getInstance().init();
    ScriptEngine::getInstance().init();

    ScriptEngine::getInstance().setupBindingsStatic(SessionManager::getInstance(), SaveManager::getInstance(), DataManager::getInstance());
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