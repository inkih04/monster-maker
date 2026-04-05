//
// Created by inkih on 22/11/25.
//

#include "InputManager.h"
#include <vector>

InputManager* InputManager::instance = nullptr;

void InputManager::initialize(GLFWwindow* window) {
    if (!instance) {
        instance = new InputManager(window);
    }
}

InputManager::InputManager(GLFWwindow* window) : window(window) {
}

InputManager& InputManager::getInstance() {
    return *instance;
}


bool InputManager::isKeyDown(int key) const {
    return glfwGetKey(window, key) == GLFW_PRESS;
}

bool InputManager::isKeyPressed(int key) {
    return currentKeyState[key] && !previousKeyState[key];
}

bool InputManager::isKeyReleased(int key) {
    return !currentKeyState[key] && previousKeyState[key];
}

void InputManager::update() {
    previousKeyState = currentKeyState;

    updateKeyStates();
}

void InputManager::updateKeyStates() {
    static const std::vector<int> keysToTrack = {
        GLFW_KEY_A, GLFW_KEY_B, GLFW_KEY_C, GLFW_KEY_D, GLFW_KEY_E,
                GLFW_KEY_F, GLFW_KEY_G, GLFW_KEY_H, GLFW_KEY_I, GLFW_KEY_J,
                GLFW_KEY_K, GLFW_KEY_L, GLFW_KEY_M, GLFW_KEY_N, GLFW_KEY_O,
                GLFW_KEY_P, GLFW_KEY_Q, GLFW_KEY_R, GLFW_KEY_S, GLFW_KEY_T,
                GLFW_KEY_U, GLFW_KEY_V, GLFW_KEY_W, GLFW_KEY_X, GLFW_KEY_Y,
                GLFW_KEY_Z,
                GLFW_KEY_UP, GLFW_KEY_DOWN, GLFW_KEY_LEFT, GLFW_KEY_RIGHT,
                GLFW_KEY_LEFT_CONTROL, GLFW_KEY_RIGHT_CONTROL,
                GLFW_KEY_LEFT_SHIFT, GLFW_KEY_RIGHT_SHIFT,
                GLFW_KEY_SPACE, GLFW_KEY_ENTER, GLFW_KEY_ESCAPE
    };

    for (int key : keysToTrack) {
        currentKeyState[key] = (glfwGetKey(window, key) == GLFW_PRESS);
    }
}


glm::vec2 InputManager::getMousePosition() const {
    double x, y;
    glfwGetCursorPos(window, &x, &y);
    return glm::vec2(x, y);
}

glm::vec2 InputManager::getAxis2D(int up, int down, int left, int right, bool allowDiagonal) const {
    glm::vec2 direction(0.0f, 0.0f);

    if (isKeyDown(up))    direction.y -= 1.0f;
    if (isKeyDown(down))  direction.y += 1.0f;
    if (isKeyDown(left))  direction.x -= 1.0f;
    if (isKeyDown(right)) direction.x += 1.0f;

    if (direction.x != 0.0f && direction.y != 0.0f) {
        if (allowDiagonal) {
            direction = glm::normalize(direction);
        } else {
            direction.x = 0.0f;
        }
    }
    return direction;
}

bool InputManager::isMouseButtonDown(int button) const {
    return glfwGetMouseButton(window, button) == GLFW_PRESS;
}
