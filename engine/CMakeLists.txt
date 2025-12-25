cmake_minimum_required(VERSION 3.14)
project(PokemonGameEngine CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

include_directories(include include/enums include/components include/structs include/scripting )

find_package(glfw3 CONFIG REQUIRED)
find_package(GLEW REQUIRED)
find_package(glm CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(lua CONFIG REQUIRED)
find_package(sol2 CONFIG REQUIRED)
find_package(Freetype REQUIRED)

if(APPLE)
    find_library(OPENGL_FRAMEWORK OpenGL)
    if(NOT OPENGL_FRAMEWORK)
        message(FATAL_ERROR "OpenGL framework not found")
    endif()
    set(OPENGL_LIBRARIES "-framework OpenGL")
elseif(UNIX)
    find_package(OpenGL REQUIRED)
    set(OPENGL_LIBRARIES OpenGL::GL)
endif()

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
        include/components/AnimationComponent.h
        include/structs/Animation.h
        src/entities/components/AnimationComponent.cpp
        include/enums/EntityTag.h
        include/enums/EntityLayer.h
        include/enums/BasicAnimation.h
        include/components/MovementComponent.h
        src/entities/components/MovementComponent.cpp
        include/scripting/ScriptEngine.h
        include/scripting/ScriptBindings.h
        src/scripting/ScriptBindings.cpp
        src/scripting/ScriptEngine.cpp
        include/DialogBox.h
        include/structs/Character.h
        include/enums/DialogSpeed.h
        include/TextRenderer.h
        src/ui/TextRenderer.cpp
        include/enums/GameConfig.h
        src/ui/DialogBox.cpp
)

target_link_libraries(PokemonGameEngine
        PRIVATE
        glfw
        GLEW::GLEW
        glm::glm
        ${OPENGL_LIBRARIES}
        nlohmann_json::nlohmann_json
        lua
        Freetype::Freetype
)

enable_testing()

include(FetchContent)
FetchContent_Declare(
        googletest
        GIT_REPOSITORY https://github.com/google/googletest.git
        GIT_TAG v1.14.0
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
set(BUILD_GMOCK ON CACHE BOOL "" FORCE)
set(INSTALL_GTEST OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

set(TEST_SOURCES
        src/input/InputManager.cpp
        src/core/StateManager.cpp
        src/entities/Entity.cpp
        src/entities/EntityManager.cpp
        src/ui/DialogBox.cpp

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
        include/enums/Direction.h
        tests/unitary/DialogBoxTest.cpp
)

add_executable(UnitTests ${TEST_SOURCES})

target_link_libraries(UnitTests
        PRIVATE
        gmock
        gmock_main
        gtest
        gtest_main
        glfw
        glm::glm
        ${OPENGL_LIBRARIES}
        nlohmann_json::nlohmann_json
        lua
        Freetype::Freetype
)

include(GoogleTest)
gtest_discover_tests(UnitTests)
