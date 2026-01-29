cmake_minimum_required(VERSION 3.14)
project(MonsterMakerEngine C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

include_directories(include include/enums include/components include/structs include/scripting)

include(FetchContent)
FetchContent_Declare(
        soloud
        GIT_REPOSITORY https://github.com/jarikomppa/soloud.git
        GIT_TAG        master
)
FetchContent_MakeAvailable(soloud)


file(GLOB SOLOUD_CORE_SOURCES "${soloud_SOURCE_DIR}/src/core/*.cpp")
file(GLOB SOLOUD_WAV_SOURCES
        "${soloud_SOURCE_DIR}/src/audiosource/wav/*.cpp"
        "${soloud_SOURCE_DIR}/src/audiosource/wav/*.c"
)


if(APPLE)
    file(GLOB SOLOUD_BACKEND_SOURCES "${soloud_SOURCE_DIR}/src/backend/coreaudio/*.cpp")
    set(SOLOUD_BACKEND_DEF WITH_COREAUDIO)
    message(STATUS "Mac M-Series detectado: Usando backend CoreAudio Nativo")
else()
    file(GLOB SOLOUD_BACKEND_SOURCES "${soloud_SOURCE_DIR}/src/backend/miniaudio/*.cpp")
    set(SOLOUD_BACKEND_DEF WITH_MINIAUDIO)
endif()

set(SOLOUD_ALL_SOURCES
        ${SOLOUD_CORE_SOURCES}
        ${SOLOUD_WAV_SOURCES}
        ${SOLOUD_BACKEND_SOURCES}
)

add_library(SoloudStatic STATIC ${SOLOUD_ALL_SOURCES})
target_include_directories(SoloudStatic PUBLIC ${soloud_SOURCE_DIR}/include)
target_compile_definitions(SoloudStatic PUBLIC ${SOLOUD_BACKEND_DEF})
target_compile_options(SoloudStatic PRIVATE -w)


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

add_executable(MonsterMakerEngine ${GAME_SOURCES}
        include/EntityManager.h
        src/entities/EntityManager.cpp
        include/AudioService.h
        src/audio/AudioService.cpp
)


target_link_libraries(MonsterMakerEngine
        PRIVATE
        glfw
        GLEW::GLEW
        glm::glm
        ${OPENGL_LIBRARIES}
        nlohmann_json::nlohmann_json
        lua
        Freetype::Freetype
        SoloudStatic
)


if(APPLE)
    find_library(COREAUDIO_FRAMEWORK CoreAudio)
    find_library(AUDIOTOOLBOX_FRAMEWORK AudioToolbox)
    find_library(COREFOUNDATION_FRAMEWORK CoreFoundation)
    find_library(AUDIOUNIT_FRAMEWORK AudioUnit)

    target_link_libraries(MonsterMakerEngine
            PRIVATE
            ${COREAUDIO_FRAMEWORK}
            ${AUDIOTOOLBOX_FRAMEWORK}
            ${COREFOUNDATION_FRAMEWORK}
            ${AUDIOUNIT_FRAMEWORK}
    )
endif()


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

add_executable(UnitTests
        src/input/InputManager.cpp
        src/core/StateManager.cpp
        src/entities/Entity.cpp
        src/entities/EntityManager.cpp
        src/ui/DialogBox.cpp
        src/entities/CollisionService.cpp
        tests/unitary/InputManagerTest.cpp
        tests/mocks/MockGLFW.cpp
        tests/unitary/StateManagerTest.cpp
        tests/unitary/EntityTest.cpp
        tests/unitary/EntityManagerTest.cpp
        tests/unitary/StateManagerTest.cpp
        tests/unitary/DialogBoxTest.cpp
        tests/unitary/CollisionServiceTest.cpp
)

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