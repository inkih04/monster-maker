#ifndef MOCKGLFW_H
#define MOCKGLFW_H

#include <GLFW/glfw3.h>
#include <unordered_map>

// Mock de GLFWwindow para testing
class MockGLFWwindow {
public:
    std::unordered_map<int, int> keyStates;
    std::unordered_map<int, int> mouseButtonStates;
    double mouseX = 0.0;
    double mouseY = 0.0;

    MockGLFWwindow() {
        // Inicializar todos los estados a GLFW_RELEASE
        keyStates.clear();
        mouseButtonStates.clear();
    }

    void setKeyState(int key, int state) {
        keyStates[key] = state;
    }

    void setMouseButtonState(int button, int state) {
        mouseButtonStates[button] = state;
    }

    void setMousePosition(double x, double y) {
        mouseX = x;
        mouseY = y;
    }

    int getKeyState(int key) const {
        auto it = keyStates.find(key);
        return (it != keyStates.end()) ? it->second : GLFW_RELEASE;
    }

    int getMouseButtonState(int button) const {
        auto it = mouseButtonStates.find(button);
        return (it != mouseButtonStates.end()) ? it->second : GLFW_RELEASE;
    }
};

// Funciones stub de GLFW para testing
// Estas sobrescriben las funciones reales de GLFW en el contexto de testing
namespace MockGLFW {
    extern MockGLFWwindow* currentMockWindow;

    inline int glfwGetKey(GLFWwindow* window, int key) {
        if (currentMockWindow) {
            return currentMockWindow->getKeyState(key);
        }
        return GLFW_RELEASE;
    }

    inline int glfwGetMouseButton(GLFWwindow* window, int button) {
        if (currentMockWindow) {
            return currentMockWindow->getMouseButtonState(button);
        }
        return GLFW_RELEASE;
    }

    inline void glfwGetCursorPos(GLFWwindow* window, double* xpos, double* ypos) {
        if (currentMockWindow) {
            *xpos = currentMockWindow->mouseX;
            *ypos = currentMockWindow->mouseY;
        } else {
            *xpos = 0.0;
            *ypos = 0.0;
        }
    }

    inline void setMockWindow(MockGLFWwindow* mockWindow) {
        currentMockWindow = mockWindow;
    }
}

#endif // MOCKGLFW_H