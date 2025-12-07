cmake_minimum_required(VERSION 3.14)
project(PokemonGameEngine CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)


include_directories(include include/enums include/components include/structs )

find_package(glfw3 CONFIG REQUIRED)
find_package(GLEW REQUIRED)
find_package(glm CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)


file(GLOB_RECURSE GAME_SOURCES "src/*.cpp")

add_executable(PokemonGameEngine ${GAME_SOURCES}
        include/EntityManager.h
        src/entities/EntityManager.cpp
        include/Entity.h
        src/entities/Entity.cpp
        include/enums/ComponentsType.h
        src/core/StateManager.cpp
        include/StateManager.h
        include/StateManager.h
        include/Texture.h
        src/graphics/Texture.cpp
        include/Shader.h
        src/graphics/Shader.cpp
        include/Renderer.h
        src/graphics/Renderer.cpp
        include/Camera.h
        src/graphics/Camera.cpp
        include/ResourceManager.h
        src/graphics/ResourceManager.cpp
        include/structs/ShaderPath.h
        include/EntityLoader.h
        src/entities/EntityLoader.cpp
        include/components/PositionComponent.h
        include/structs/SpriteRect.h
        include/structs/Position.h
        src/entities/components/RenderComponent.cpp
        include/ExplorationState.h
        src/states/ExplorationState.cpp
)


target_link_libraries(PokemonGameEngine
        PRIVATE
        glfw
        GLEW::GLEW
        glm::glm
        GL
        nlohmann_json::nlohmann_json
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
        src/core/StateManager.cpp
        src/entities/Entity.cpp
        src/entities/EntityManager.cpp

        tests/unitary/InputManagerTest.cpp
        tests/mocks/MockGLFW.cpp
        tests/mocks/MockState.h
        tests/unitary/StateManagerTest.cpp
        include/components/Component.h
        tests/mocks/MockComponent.h
        tests/unitary/EntityTest.cpp
        tests/unitary/EntityManagerTest.cpp
        tests/mocks/MockState.h
        tests/mocks/MockState.h
        tests/unitary/StateManagerTest.cpp
        include/components/RenderComponent.h
        include/components/ColliderComponent.h
)

add_executable(UnitTests ${TEST_SOURCES})

target_link_libraries(UnitTests
        PRIVATE
        gtest
        gtest_main
        glfw
        glm::glm
        nlohmann_json::nlohmann_json
)

include(GoogleTest)
gtest_discover_tests(UnitTests)