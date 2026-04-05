//
// Created by inkih on 22/11/25.
//

#ifndef POKEMONGAMEENGINE_INPUTMANAGER_H
#define POKEMONGAMEENGINE_INPUTMANAGER_H

#include <GLFW/glfw3.h>
#include <glm/glm.hpp>
#include <unordered_map>

class InputManager {
private:
    static InputManager* instance;
    GLFWwindow* window;

    std::unordered_map<int, bool> currentKeyState;
    std::unordered_map<int, bool> previousKeyState;

    InputManager(GLFWwindow* window);

public:
    static void initialize(GLFWwindow* window);
    static InputManager& getInstance();
    static void resetInstance() {
        if (instance) {
        delete instance;
        instance = nullptr;
    }};
    glm::vec2 getAxis2D(int up, int down, int left, int right, bool allowDiagonal) const;

    bool isKeyDown(int key) const;
    bool isKeyPressed(int key);
    bool isKeyReleased(int key);

    void update();

    glm::vec2 getMousePosition() const;
    bool isMouseButtonDown(int button) const;

private:
    void updateKeyStates();
};


#endif //POKEMONGAMEENGINE_INPUTMANAGER_H