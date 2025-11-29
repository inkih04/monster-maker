//
// Created by inkih on 22/11/25.
//
#include "Application.h"
#include "GLFW/glfw3.h"


Application::Application(const char* title, int width, int height) {
    m_engine = std::make_unique<Engine>(width, height, title);
    m_stateManager = StateManager();

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