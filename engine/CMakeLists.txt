cmake_minimum_required(VERSION 3.14)
project(PokemonGameEngine CXX)

# Configuración del estándar C++
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# ==============================================================================
# 1. CONFIGURACIÓN DE DEPENDENCIAS (PATHS y COMPILACIÓN DE LIBRERÍAS)
# ==============================================================================

# Incluir cabeceras del proyecto
include_directories(include)

# Incluir cabeceras de librerías externas
include_directories(external/glm)
include_directories(external/glfw/include)
include_directories(external/glew/include)

# ✅ GLFW: Desactivar explícitamente el soporte a Wayland y compilar GLFW
set(GLFW_BUILD_WAYLAND FALSE CACHE BOOL "Disable Wayland support")
add_subdirectory(external/glfw)

# ❌ GLEW: Se elimina 'add_subdirectory(external/glew)' porque no tiene CMakeLists.txt.
# GLEW debe ser compilado manualmente o enlazado por ruta.


# ==============================================================================
# 2. TARGET PRINCIPAL: EL JUEGO (PokemonGameEngine)
# ==============================================================================

# Descubre dinámicamente todos los archivos .cpp en la carpeta src
file(GLOB_RECURSE GAME_SOURCES "src/*.cpp")

add_executable(PokemonGameEngine ${GAME_SOURCES})

# ----------------------------------------------------------------------
# ENLAZADO MULTIPLATAFORMA
# ----------------------------------------------------------------------

# ✅ INDICAR LA RUTA DONDE SE ESPERAN LAS LIBRERÍAS COMPILADAS
# (Necesario para GLEW, ya que no se usa add_subdirectory para él)
target_link_directories(PokemonGameEngine PRIVATE
        external/glew/lib
        # Se incluye glfw/lib por si acaso, aunque add_subdirectory suele hacerlo
        external/glfw/lib
)

# Enlazar con los targets principales
target_link_libraries(PokemonGameEngine
        PRIVATE
        glfw # Target creado por add_subdirectory
        GLEW # Nombre de la librería binaria (libGLEW.a o libGLEW.so)
        GL
)

# Dependencias de bajo nivel SOLO para Linux/UNIX.
if (UNIX)
    message(STATUS "Linking Linux/UNIX-specific system libraries (X11, pthread, dl, rt).")
    target_link_libraries(PokemonGameEngine
            PRIVATE
            X11
            pthread
            dl
            rt
    )
endif()

# ==============================================================================
# 3. CONFIGURACIÓN DE TESTS Y GOOGLE TEST (FETCHCONTENT)
# ==============================================================================

enable_testing()

include(FetchContent)
FetchContent_Declare(
        googletest
        GIT_REPOSITORY https://github.com/google/googletest.git
        GIT_TAG v1.14.0
)
# Forzamos librerías estáticas de GTest
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
set(BUILD_GMOCK OFF CACHE BOOL "" FORCE)
set(INSTALL_GTEST OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# ==============================================================================
# 4. TARGET DE TESTS: UNIT TESTS (UnitTests)
# ==============================================================================

# Fuentes del código que se quiere testear + Test files + Mocks
set(TEST_SOURCES
        src/input/InputManager.cpp
        tests/unitary/InputManagerTest.cpp
        tests/mocks/MockGLFW.cpp
)

add_executable(UnitTests ${TEST_SOURCES})

# Incluimos los directorios necesarios para las cabeceras
target_include_directories(UnitTests PRIVATE
        include
        external/glm
        external/glfw/include
)

# Enlazamos con los targets de Google Test
target_link_libraries(UnitTests PRIVATE gtest gtest_main)

# ==============================================================================
# 5. DESCUBRIMIENTO DE TESTS
# ==============================================================================
include(GoogleTest)
gtest_discover_tests(UnitTests)