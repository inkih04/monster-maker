# Establecer la versión mínima de CMake.
cmake_minimum_required(VERSION 3.10)

# Políticas para compatibilidad
cmake_policy(SET CMP0072 NEW)

# Nombre del proyecto y lenguajes (C y C++ son necesarios)
project(PokemonGameEngine VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# =========================================================================
# 1. Rutas de Cabecera (Headers)
# =========================================================================
include_directories(include)

# Rutas de librerías externas locales (Source Code)
include_directories(
        ${PROJECT_SOURCE_DIR}/external/glm
        ${PROJECT_SOURCE_DIR}/external/freetype-2.3.5-1-bin/include
)

# =========================================================================
# 2. Configuración y Dependencias
# =========================================================================

# --- GLFW (Compilado desde código fuente local) ---
# Desactivamos Wayland explícitamente para evitar problemas de dependencias en local si no las tienes
set(GLFW_BUILD_WAYLAND OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_DOCS OFF CACHE BOOL "" FORCE)
set(GLFW_INSTALL OFF CACHE BOOL "" FORCE)
add_subdirectory(external/glfw)

# --- SOIL (Compilado desde código fuente local) ---
add_subdirectory(external/soil)

# --- GLEW (Buscado en el sistema operativo) ---
# En local es mejor buscar la instalación de apt-get
find_package(GLEW REQUIRED)

# --- DEPENDENCIAS DE SISTEMA (OpenGL y Threads) ---
find_package(OpenGL REQUIRED)
find_package(Threads REQUIRED)
# X11 suele ser encontrado automáticamente por GLFW, pero lo buscamos por si acaso
find_package(X11 REQUIRED)

# =========================================================================
# 3. Definición del Ejecutable
# =========================================================================

file(GLOB_RECURSE ENGINE_SOURCES
        src/*.cpp
        src/*/*.cpp
)

add_executable(${PROJECT_NAME} ${ENGINE_SOURCES})

# =========================================================================
# 4. Enlazado (Linking)
# =========================================================================

target_link_libraries(${PROJECT_NAME}
        # Librerías del sistema
        ${OPENGL_LIBRARIES}
        GLEW::GLEW             # Enlazamos el target moderno de GLEW
        ${CMAKE_THREAD_LIBS_INIT}
        ${X11_LIBRARIES}

        # Librerías internas compiladas
        glfw                   # Target de GLFW
        SOIL_lib               # Target de SOIL
)

# Configuración de RPATH para que encuentre librerías dinámicas si es necesario
set_target_properties(${PROJECT_NAME} PROPERTIES
        INSTALL_RPATH "${CMAKE_INSTALL_PREFIX}/lib"
        RUNTIME_OUTPUT_NAME "${PROJECT_NAME}"
)