cmake_minimum_required(VERSION 3.14)
project(PokemonGameEngine CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# ==============================================================================
# 1. CONFIGURACIÓN DE DEPENDENCIAS (VCPKG)
# ==============================================================================

include_directories(include)

# Buscamos los paquetes instalados por vcpkg
find_package(glfw3 CONFIG REQUIRED)
find_package(GLEW REQUIRED)
find_package(glm CONFIG REQUIRED)

# ==============================================================================
# 2. TARGET PRINCIPAL: EL JUEGO (PokemonGameEngine)
# ==============================================================================

file(GLOB_RECURSE GAME_SOURCES "src/*.cpp")

add_executable(PokemonGameEngine ${GAME_SOURCES})

# ✅ CORREGIDO: Usamos 'glfw' en lugar de 'glfw3::glfw3'
target_link_libraries(PokemonGameEngine
        PRIVATE
        glfw        # <--- CAMBIO AQUÍ
        GLEW::GLEW
        glm::glm
        GL
)

# ==============================================================================
# 3. CONFIGURACIÓN DE TESTS (GOOGLE TEST)
# ==============================================================================

enable_testing()

include(FetchContent)
FetchContent_Declare(
        googletest
        GIT_REPOSITORY https://github.com/google/googletest.git
        GIT_TAG v1.14.0
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
set(BUILD_GMOCK OFF CACHE BOOL "" FORCE)
set(INSTALL_GTEST OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# ==============================================================================
# 4. TARGET DE TESTS: UNIT TESTS (UnitTests)
# ==============================================================================

set(TEST_SOURCES
        src/input/InputManager.cpp
        tests/unitary/InputManagerTest.cpp
        tests/mocks/MockGLFW.cpp
)

add_executable(UnitTests ${TEST_SOURCES})

# ✅ CORREGIDO: Usamos 'glfw' aquí también
target_link_libraries(UnitTests
        PRIVATE
        gtest
        gtest_main
        glfw        # <--- CAMBIO AQUÍ
        glm::glm
)

# ==============================================================================
# 5. DESCUBRIMIENTO DE TESTS
# ==============================================================================
include(GoogleTest)
gtest_discover_tests(UnitTests)