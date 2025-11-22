#include <iostream>
#include <cstdlib> // Para getenv
#include <GL/glew.h>
#include <GLFW/glfw3.h>

#define SCREEN_WIDTH 800
#define SCREEN_HEIGHT 600

void error_callback(int error, const char* description) {
    std::cerr << "🔴 ERROR GLFW [" << error << "]: " << description << std::endl;
}

// Callbacks vacíos para evitar crashes si se llaman
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods) {
    if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS) glfwSetWindowShouldClose(window, GL_TRUE);
}
void cursor_position_callback(GLFWwindow* window, double xpos, double ypos) {}
void mouse_button_callback(GLFWwindow* window, int button, int action, int mods) {}

int main(void)
{
    std::cout << "=========================================" << std::endl;
    std::cout << ">>> DEBUG: Iniciando PokemonGameEngine" << std::endl;

    // 1. Diagnóstico de Variables de Entorno
    const char* env_display = std::getenv("DISPLAY");
    const char* env_xauth = std::getenv("XAUTHORITY");

    std::cout << ">>> [ENV] DISPLAY: " << (env_display ? env_display : "(NULL)") << std::endl;
    std::cout << ">>> [ENV] XAUTHORITY: " << (env_xauth ? env_xauth : "(NULL)") << std::endl;

    // 2. Inicialización
    glfwSetErrorCallback(error_callback);

    std::cout << ">>> Llamando a glfwInit()..." << std::endl;
    if (!glfwInit()) {
        std::cerr << "❌ FALLO CRÍTICO: glfwInit() falló." << std::endl;
        return -1;
    }
    std::cout << "✅ glfwInit() correcto." << std::endl;

    // 3. Ventana
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_VISIBLE, GLFW_TRUE);

    std::cout << ">>> Creando ventana..." << std::endl;
    GLFWwindow* window = glfwCreateWindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Metal Pokemon", NULL, NULL);
    if (!window) {
        std::cerr << "❌ FALLO CRÍTICO: No se pudo crear la ventana." << std::endl;
        glfwTerminate();
        return -1;
    }
    std::cout << "✅ Ventana creada." << std::endl;

    glfwMakeContextCurrent(window);

    // 4. GLEW
    glewExperimental = GL_TRUE;
    if (glewInit() != GLEW_OK) {
        std::cerr << "❌ FALLO GLEW" << std::endl;
        return -1;
    }
    std::cout << "✅ GLEW OK. GPU: " << glGetString(GL_RENDERER) << std::endl;

    // Callbacks
    glfwSetKeyCallback(window, key_callback);
    glfwSetCursorPosCallback(window, cursor_position_callback);
    glfwSetMouseButtonCallback(window, mouse_button_callback);

    // Bucle
    while (!glfwWindowShouldClose(window)) {
        glClearColor(0.2f, 0.8f, 0.2f, 1.0f); // Verde brillante para confirmar éxito
        glClear(GL_COLOR_BUFFER_BIT);
        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;
}