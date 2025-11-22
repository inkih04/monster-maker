//
// Created by inkih on 22/11/25.
//
#include "Application.h"
#include "GLFW/glfw3.h"


Application::Application(const char* title, int width, int height) {
    m_engine = std::make_unique<Engine>(width, height, title);

}

void Application::update(int deltaTime) {


}

void Application::run() {

    m_engine->startLoop([this](int deltaTime) {
        update(deltaTime);
    });
}