cmake_minimum_required(VERSION 3.14)
project(PokemonGameEngine CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)


include_directories(include)

find_package(glfw3 CONFIG REQUIRED)
find_package(GLEW REQUIRED)
find_package(glm CONFIG REQUIRED)


file(GLOB_RECURSE GAME_SOURCES "src/*.cpp")

add_executable(PokemonGameEngine ${GAME_SOURCES})


target_link_libraries(PokemonGameEngine
        PRIVATE
        glfw
        GLEW::GLEW
        glm::glm
        GL
)



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



set(TEST_SOURCES
        src/input/InputManager.cpp
        tests/unitary/InputManagerTest.cpp
        tests/mocks/MockGLFW.cpp
)

add_executable(UnitTests ${TEST_SOURCES})

target_link_libraries(UnitTests
        PRIVATE
        gtest
        gtest_main
        glfw
        glm::glm
)

include(GoogleTest)
gtest_discover_tests(UnitTests)