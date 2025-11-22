//
// Created by inkih on 22/11/25.
//
#include "Engine.h"
#include <iostream>
#include "InputManager.h"

#define TARGET_FRAMERATE 60.0f

Engine::Engine(int width, int height, const std::string& title)
    : m_width(width), m_height(height), m_title(title) {
    initGLFW();
    InputManager::initialize(m_window);
}

Engine::~Engine() {
    glfwDestroyWindow(m_window);
    glfwTerminate();
}

void Engine::initGLFW() {
    if (!glfwInit()) exit(-1);

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    m_window = glfwCreateWindow(m_width, m_height, m_title.c_str(), nullptr, nullptr);
    if (!m_window) {
        glfwTerminate();
        exit(-1);
    }
    glfwMakeContextCurrent(m_window);

    glewExperimental = GL_TRUE;
    if (glewInit() != GLEW_OK) exit(-1);
}

void Engine::startLoop(std::function<void(int)> gameUpdate) {
    constexpr double timePerFrame = 1.f / TARGET_FRAMERATE;
    double timePreviousFrame = glfwGetTime();

    while (!glfwWindowShouldClose(m_window)) {
        double currentTime = glfwGetTime();
        if (currentTime - timePreviousFrame >= timePerFrame) {
            int deltaTime = static_cast<int>(1000.0f * (currentTime - timePreviousFrame));

            InputManager::getInstance().update();

            glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
            glClear(GL_COLOR_BUFFER_BIT);

            if (gameUpdate) gameUpdate(deltaTime);

            timePreviousFrame = currentTime;
            glfwSwapBuffers(m_window);
        }
        glfwPollEvents();
    }
}
