cmake_minimum_required(VERSION 3.22)
project(PokemonEngine VERSION 0.1.0 LANGUAGES C CXX)

# ==========================================================
# CONFIGURACIÓN GLOBAL
# ==========================================================
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Para IDEs (genera compile_commands.json)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Forzar static libs (importante para distribución)
set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)

set(ENGINE_ROOT ${CMAKE_CURRENT_SOURCE_DIR})
set(EXTERNAL_DIR ${ENGINE_ROOT}/external)

# ==========================================================
# COMPILADOR (OPCIONAL: CLANG)
# ==========================================================
option(USE_CLANG "Prefer Clang if available" ON)

if (USE_CLANG AND NOT DEFINED CMAKE_CXX_COMPILER)
    find_program(CLANGPP clang++)
    find_program(CLANG clang)

    if (CLANGPP AND CLANG)
        message(STATUS "✓ Using Clang as compiler")
        set(CMAKE_CXX_COMPILER ${CLANGPP} CACHE PATH "" FORCE)
        set(CMAKE_C_COMPILER ${CLANG} CACHE PATH "" FORCE)
    endif()
endif()

# ==========================================================
# DEPENDENCIAS LOCALES (DOCKER-FRIENDLY)
# ==========================================================

# --- GLFW (Window + OpenGL context) ---
set(GLFW_BUILD_DOCS OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(GLFW_INSTALL OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_WAYLAND OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_X11 ON CACHE BOOL "" FORCE)
add_subdirectory(${EXTERNAL_DIR}/glfw EXCLUDE_FROM_ALL)

# --- GLM (Math library, header-only) ---
add_subdirectory(${EXTERNAL_DIR}/glm EXCLUDE_FROM_ALL)

# --- GLEW (OpenGL extensions) ---
add_subdirectory(${EXTERNAL_DIR}/glew/build/cmake EXCLUDE_FROM_ALL)

# --- SOIL (Image loading) ---
file(GLOB SOIL_SRC ${EXTERNAL_DIR}/soil/src/*.c)
add_library(SOIL STATIC ${SOIL_SRC})
target_include_directories(SOIL PUBLIC ${EXTERNAL_DIR}/soil/src)
set_target_properties(SOIL PROPERTIES FOLDER "External")

# --- FreeType (Font rendering) ---
# Esta sí usa FetchContent porque es grande y compleja
include(FetchContent)
FetchContent_Declare(
        freetype
        GIT_REPOSITORY https://gitlab.freedesktop.org/freetype/freetype.git
        GIT_TAG VER-2-13-2
        GIT_SHALLOW TRUE
)
set(FT_DISABLE_ZLIB ON CACHE BOOL "" FORCE)
set(FT_DISABLE_BZIP2 ON CACHE BOOL "" FORCE)
set(FT_DISABLE_PNG ON CACHE BOOL "" FORCE)
set(FT_DISABLE_HARFBUZZ ON CACHE BOOL "" FORCE)
set(FT_DISABLE_BROTLI ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(freetype)

# ==========================================================
# MOTOR: LIBRERÍA ESTÁTICA
# ==========================================================

# Lista explícita (MEJOR que GLOB para CMake)
set(ENGINE_SOURCES
        # Core
        src/core/Engine.cpp
        src/core/Application.cpp

        # Graphics
        src/graphics/Renderer.cpp
        src/graphics/Shader.cpp
        src/graphics/Texture.cpp
        src/graphics/TileMap.cpp
        src/graphics/Camera.cpp

        # Entities
        src/entities/Entity.cpp
        src/entities/Player.cpp

        # Input
        src/input/InputManager.cpp

        # Audio
        src/audio/AudioManager.cpp

        # World
        src/world/World.cpp
        src/world/Map.cpp

        # Events
        src/events/EventManager.cpp

        # Scripting
        src/scripting/LuaEngine.cpp

        # UI
        src/ui/UIManager.cpp
)

add_library(engine STATIC ${ENGINE_SOURCES})

target_include_directories(engine PUBLIC
        ${ENGINE_ROOT}/include
        ${ENGINE_ROOT}/src
)

# ==========================================================
# LINKING
# ==========================================================
target_link_libraries(engine PUBLIC
        glfw
        glm::glm
        libglew_static
        SOIL
        freetype
)

# ==========================================================
# PLATFORM-SPECIFIC
# ==========================================================
if (WIN32)
    target_link_libraries(engine PUBLIC opengl32)

    # Evitar consola en Windows Release
    if (CMAKE_BUILD_TYPE STREQUAL "Release")
        set_target_properties(engine PROPERTIES
                LINK_FLAGS "/SUBSYSTEM:WINDOWS /ENTRY:mainCRTStartup"
        )
    endif()

elseif (APPLE)
    target_link_libraries(engine PUBLIC
            "-framework Cocoa"
            "-framework OpenGL"
            "-framework IOKit"
    )

else() # Linux
    find_package(OpenGL REQUIRED)
    target_link_libraries(engine PUBLIC
            OpenGL::GL
            pthread
            dl
            X11
            Xrandr
            Xi
    )
endif()

# ==========================================================
# COMPILER FLAGS
# ==========================================================
if (MSVC)
    target_compile_options(engine PRIVATE /W4)
else()
    target_compile_options(engine PRIVATE
            -Wall -Wextra
            $<$<CONFIG:RELEASE>:-O3>
            $<$<CONFIG:DEBUG>:-g -O0>
    )
endif()

# ==========================================================
# EXECUTABLE (GAME RUNNER)
# ==========================================================
option(BUILD_GAME_RUNNER "Build executable game runner" ON)

if (BUILD_GAME_RUNNER)
    add_executable(GameRunner src/main.cpp)
    target_link_libraries(GameRunner PRIVATE engine)

    # Copiar recursos al build
    add_custom_command(TARGET GameRunner POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E copy_directory
            ${ENGINE_ROOT}/resources $<TARGET_FILE_DIR:GameRunner>/resources
            COMMENT "Copying resources..."
    )
endif()

# ==========================================================
# INSTALACIÓN (PARA DISTRIBUCIÓN)
# ==========================================================
install(TARGETS engine GameRunner
        LIBRARY DESTINATION lib
        RUNTIME DESTINATION bin
        ARCHIVE DESTINATION lib
)

install(DIRECTORY include/ DESTINATION include)
install(DIRECTORY resources/ DESTINATION share/pokemon-engine/resources)