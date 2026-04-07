//
// Created by inkih on 22/11/25.
//
#include "Engine.h"
#include <iostream>
#include <memory>
#include <stb_image.h>

#include "DebugHelper.h"
#include "EditorConfig.h"
#include "InputManager.h"
#include "Renderer.h"
#include "GameConfig.h"
#include "Position.h"
#include "UiManager.h"

#define TARGET_FRAMERATE 60.0f

Engine::Engine(int width, int height, const std::string& title)
    : m_width(width), m_height(height), m_title(title) {
    initGLFW();
    InputManager::initialize(m_window);
    EditorConfig::getInstance().setVirtualResolution();
    setUpShaders();
    setUpCamera(width, height);
    UiManager::getInstance().init(m_width, m_height, m_dpiScale, EditorConfig::getInstance().getDefaultFontPath());

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

    if (!DebugHelper::getInstance().getCurrentMap().empty()) {
        glfwWindowHint(GLFW_FLOATING, GLFW_TRUE);
    }

    m_window = glfwCreateWindow(m_width, m_height, m_title.c_str(), nullptr, nullptr);
    if (!m_window) {
        glfwTerminate();
        exit(-1);
    }

    int widthMM, heightMM;
    glfwGetMonitorPhysicalSize(glfwGetPrimaryMonitor(), &widthMM, &heightMM);
    const GLFWvidmode* mode = glfwGetVideoMode(glfwGetPrimaryMonitor());
    double dpi = mode->width / (widthMM / 25.4);
    m_dpiScale = dpi / 96.0;

    std::cout << "[ENGINE] dpiScale: " << m_dpiScale << "\n";

    glfwMakeContextCurrent(m_window);
    glfwSetWindowUserPointer(m_window, this);
    glfwSetFramebufferSizeCallback(m_window, framebuffer_size_callback);

    const std::string& iconPath = EditorConfig::getInstance().getImageIconPath();
    if (!iconPath.empty()) {
        int iconWidth, iconHeight, iconChannels;
        unsigned char* pixels = stbi_load(iconPath.c_str(), &iconWidth, &iconHeight, &iconChannels, 4);
        if (pixels) {
            GLFWimage icon{ iconWidth, iconHeight, pixels };
            glfwSetWindowIcon(m_window, 1, &icon);
            stbi_image_free(pixels);
        } else {
            std::cout << "[ENGINE] Could not load window icon: " << iconPath << "\n";
        }
    }

    glewExperimental = GL_TRUE;
    if (glewInit() != GLEW_OK) exit(-1);

    int bufferWidth, bufferHeight;
    glfwGetFramebufferSize(m_window, &bufferWidth, &bufferHeight);
    onResize(bufferWidth, bufferHeight);
}

void Engine::startLoop(std::function<void(int)> gameUpdate, std::function<void()> gameRender) {
    constexpr double timePerFrame = 1.f / TARGET_FRAMERATE;
    double timePreviousFrame = glfwGetTime();

    while (!glfwWindowShouldClose(m_window)) {
        double currentTime = glfwGetTime();
        if (currentTime - timePreviousFrame >= timePerFrame) {
            int deltaTime = static_cast<int>(1000.0f * (currentTime - timePreviousFrame));

            InputManager::getInstance().update();
            UiManager::getInstance().update();
            if (gameUpdate) gameUpdate(deltaTime);

            glViewport(0, 0, m_width, m_height);
            glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
            glClear(GL_COLOR_BUFFER_BIT);

            int scaleX = m_width  / GameConfig::Width;
            int scaleY = m_height / GameConfig::Height;
            int scale;

            if (!EditorConfig::getInstance().getLetterboxing()) {
                scale  = std::max(1, std::max(scaleX, scaleY));
            } else {
                scale  = std::max(1, std::min(scaleX, scaleY));
            }

            int viewportWidth  = GameConfig::Width  * scale;
            int viewportHeight = GameConfig::Height * scale;

            int viewportX = (m_width  - viewportWidth)  / 2;
            int viewportY = (m_height - viewportHeight) / 2;

            glViewport(viewportX, viewportY, viewportWidth, viewportHeight);
            Renderer::getInstance().setUniformFloat("u_time", static_cast<float>(currentTime));
            if (gameRender) gameRender();
            glViewport(0, 0, m_width, m_height);
            UiManager::getInstance().render();

            timePreviousFrame = currentTime;
            glfwSwapBuffers(m_window);
        }
        glfwPollEvents();
    }
}

void Engine::setUpShaders() const {
    Renderer::getInstance().loadShader("sprite", "resources/shaders/sprite.vert", "resources/shaders/sprite.frag");
    Renderer::getInstance().setShader("sprite");
}

void Engine::framebuffer_size_callback(GLFWwindow* window, int width, int height) {
    auto* engine = static_cast<Engine*>(glfwGetWindowUserPointer(window));
    if (engine) {
        engine->onResize(width, height);
    }
}

void Engine::onResize(int width, int height) {
    m_width = width;
    m_height = height;
    if (m_camera) {
        m_camera->setViewportSize(static_cast<float>(GameConfig::Width), static_cast<float>(GameConfig::Height));
        Renderer::getInstance().setCamera(*m_camera);
    }
    UiManager::getInstance().resize(width, height);
}

void Engine::setUpCamera(int width, int height)  {
    m_camera = std::make_unique<Camera>(GameConfig::Width, GameConfig::Height);
    m_camera->setPosition(glm::vec2(GameConfig::Width / 2.0f, GameConfig::Height / 2.0f));
    Renderer::getInstance().setCamera(*m_camera);
}
