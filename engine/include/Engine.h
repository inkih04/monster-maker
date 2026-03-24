//
// Created by inkih on 22/11/25.
//

#ifndef POKEMONGAMEENGINE_ENGINE_H
#define POKEMONGAMEENGINE_ENGINE_H

#include <string>
#include <functional>
#include <memory>
#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include "Camera.h"

class Engine {
public:
    Engine(int width, int height, const std::string& title);
    ~Engine();

    void startLoop(std::function<void(int)> gameUpdate, std::function<void()> gameRender);

private:
    void initGLFW();
    void initGLEW();

    GLFWwindow* m_window{};
    void setUpShaders() const;
    void setUpCamera(int width, int height);
    static void framebuffer_size_callback(GLFWwindow* window, int width, int height);
    void onResize(int width, int height);

    int m_width;
    int m_height;
    std::unique_ptr<Camera> m_camera;
    std::string m_title;
};

#endif //POKEMONGAMEENGINE_ENGINE_H