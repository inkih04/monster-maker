//
// Created by inkih on 22/11/25.
//
#include "Engine.h"
#include <iostream>
#include <memory>

#include "InputManager.h"
#include "Renderer.h"
#include <iostream>

#define TARGET_FRAMERATE 60.0f

Engine::Engine(int width, int height, const std::string& title)
    : m_width(width), m_height(height), m_title(title) {
    initGLFW();
    InputManager::initialize(m_window);
    setUpShaders();
    setUpCamera(width, height);
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

void Engine::startLoop(std::function<void(int)> gameUpdate, std::function<void()> gameRender) {
    constexpr double timePerFrame = 1.f / TARGET_FRAMERATE;
    double timePreviousFrame = glfwGetTime();

    while (!glfwWindowShouldClose(m_window)) {
        double currentTime = glfwGetTime();
        if (currentTime - timePreviousFrame >= timePerFrame) {
            int deltaTime = static_cast<int>(1000.0f * (currentTime - timePreviousFrame));
            InputManager::getInstance().update();
            if (gameUpdate) gameUpdate(deltaTime);

            glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
            glClear(GL_COLOR_BUFFER_BIT);

            if (gameRender) gameRender();

            timePreviousFrame = currentTime;
            glfwSwapBuffers(m_window);
        }
        glfwPollEvents();
    }
}

void Engine::setUpShaders() const {
    Renderer::getInstance().loadShader("sprite", "../src/graphics/Shader/sprite.vert", "../src/graphics/Shader/sprite.frag");
}

void Engine::setUpCamera(int width, int height)  {
    m_camera = std::make_unique<Camera>(64, 64);
    Renderer::getInstance().setCamera(*m_camera);
}
