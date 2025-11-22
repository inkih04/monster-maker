#include "MockGLFW.h"

namespace MockGLFW {
    MockGLFWwindow* currentMockWindow = nullptr;
}


extern "C" {
    int glfwGetKey(GLFWwindow* window, int key) {
        return MockGLFW::glfwGetKey(window, key);
    }

    int glfwGetMouseButton(GLFWwindow* window, int button) {
        return MockGLFW::glfwGetMouseButton(window, button);
    }

    void glfwGetCursorPos(GLFWwindow* window, double* xpos, double* ypos) {
        MockGLFW::glfwGetCursorPos(window, xpos, ypos);
    }
}