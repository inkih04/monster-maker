//
// Created by inkih on 22/11/25.
//
#include "Application.h"
#include <memory>

#include "GLFW/glfw3.h"


class Engine;

Application::Application(const char* title, int width, int height) {
    m_engine = std::make_unique<Engine>(width, height, title);

}

void Application::update(int deltaTime) {
 //Aqui deberia llamar al stateManager para que renderice lo que le toque
    //todo: m_stateManager->update(deltaTime);
}

void Application::render() {

}

void Application::run() {

    m_engine->startLoop([this](int deltaTime) {
        update(deltaTime);
    });
}