cmake_minimum_required(VERSION 3.14)
project(MonsterMakerEngine C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

include_directories(include include/enums include/components include/structs include/scripting include/service include/ui include/memory)

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
else()
    file(GLOB SOLOUD_BACKEND_SOURCES "${soloud_SOURCE_DIR}/src/backend/miniaudio/*.cpp")
    set(SOLOUD_BACKEND_DEF WITH_MINIAUDIO)
endif()

set(SOLOUD_ALL_SOURCES
        ${SOLOUD_CORE_SOURCES}
        ${SOLOUD_WAV_SOURCES}
        ${SOLOUD_BACKEND_SOURCES}
        include/ui/UiDocument.h
        include/ui/RmlFileInterface.h
)

add_library(SoloudStatic STATIC ${SOLOUD_ALL_SOURCES})
target_include_directories(SoloudStatic PUBLIC ${soloud_SOURCE_DIR}/include)
target_compile_definitions(SoloudStatic PUBLIC ${SOLOUD_BACKEND_DEF})
target_compile_options(SoloudStatic PRIVATE -w)

if(APPLE)
    set(CMAKE_FIND_LIBRARY_SUFFIXES ".a")
    add_compile_definitions(GLEW_STATIC)
endif()

find_package(glfw3 CONFIG REQUIRED)
find_package(GLEW REQUIRED)
find_package(glm CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(lua CONFIG REQUIRED)
find_package(sol2 CONFIG REQUIRED)
find_package(Freetype REQUIRED)
find_package(RmlUi CONFIG REQUIRED)

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
        include/service/InteractionService.h
        src/entities/service/InteractionService.cpp
        include/components/InteractionComponent.h
        include/structs/DebugHelper.h
        src/entities/service/BordersMapService.cpp
        include/service/BordersMapService.h
        include/EditorConfig.h
        src/core/EditorConfig.cpp
        include/EditorConfigLoader.h
        src/core/EditorConfigLoader.cpp
        include/ui/RmlSystemInterface.h
        include/ui/RmlRenderInterface.h
        src/ui/RmlSystemInterface.cpp
        include/ui/UiManager.h
        src/ui/UiManager.cpp
        include/ui/UiDocumentLoader.h
        src/ui/UiDocumentLoader.cpp
        src/ui/UiDocument.cpp
        src/memory/SessionManager.cpp
        include/memory/SessionManager.h
)

add_custom_command(TARGET MonsterMakerEngine POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${CMAKE_CURRENT_SOURCE_DIR}/resources
        $<TARGET_FILE_DIR:MonsterMakerEngine>/resources)

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
        RmlUi::RmlUi
)

if(UNIX AND NOT APPLE)
    target_link_options(MonsterMakerEngine PRIVATE -static-libgcc -static-libstdc++)
    target_link_libraries(MonsterMakerEngine
            PRIVATE
            pthread
            dl
            m
            rt
            X11
            Xrandr
            Xinerama
            Xcursor
            Xi
    )
endif()

if(APPLE)
    find_library(COREAUDIO_FRAMEWORK CoreAudio)
    find_library(AUDIOTOOLBOX_FRAMEWORK AudioToolbox)
    find_library(COREFOUNDATION_FRAMEWORK CoreFoundation)
    find_library(AUDIOUNIT_FRAMEWORK AudioUnit)
    find_library(IOKIT_FRAMEWORK IOKit)
    find_library(COCOA_FRAMEWORK Cocoa)
    find_library(QUARTZ_FRAMEWORK QuartzCore)

    target_link_libraries(MonsterMakerEngine
            PRIVATE
            ${COREAUDIO_FRAMEWORK}
            ${AUDIOTOOLBOX_FRAMEWORK}
            ${COREFOUNDATION_FRAMEWORK}
            ${AUDIOUNIT_FRAMEWORK}
            ${IOKIT_FRAMEWORK}
            ${COCOA_FRAMEWORK}
            ${QUARTZ_FRAMEWORK}
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
        src/memory/SessionManager.cpp
        src/entities/service/CollisionService.cpp
        tests/mocks/MockScriptComponent.cpp
        tests/unitary/InputManagerTest.cpp
        tests/mocks/MockGLFW.cpp
        tests/unitary/StateManagerTest.cpp
        tests/unitary/EntityTest.cpp
        tests/unitary/EntityManagerTest.cpp
        tests/unitary/StateManagerTest.cpp
        tests/unitary/DialogBoxTest.cpp
        tests/unitary/CollisionServiceTest.cpp
        tests/unitary/BorderMapServiceTest.cpp
        src/entities/service/BordersMapService.cpp
        tests/unitary/SesionManagerTest.cpp
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
        SoloudStatic
)

if(UNIX AND NOT APPLE)
    target_link_options(UnitTests PRIVATE -static-libgcc -static-libstdc++)
    target_link_libraries(UnitTests
            PRIVATE
            pthread
            dl
            m
            rt
            X11
            Xrandr
            Xinerama
            Xcursor
            Xi
    )
endif()

if(APPLE)
    target_link_libraries(UnitTests
            PRIVATE
            ${COREAUDIO_FRAMEWORK}
            ${AUDIOTOOLBOX_FRAMEWORK}
            ${COREFOUNDATION_FRAMEWORK}
            ${AUDIOUNIT_FRAMEWORK}
            ${IOKIT_FRAMEWORK}
            ${COCOA_FRAMEWORK}
            ${QUARTZ_FRAMEWORK}
    )
endif()

include(GoogleTest)
gtest_discover_tests(UnitTests)