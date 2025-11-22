# CMakeLists.txt para SOIL
# Define la librería estática
add_library(SOIL_lib STATIC
        src/SOIL.c
        src/image_DXT.c
        src/image_helper.c
        src/stb_image_aug.c
)

# Añade las rutas de cabecera de SOIL para que el compilador las encuentre
target_include_directories(SOIL_lib PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/src
)

# Esto define el target "SOIL_lib"