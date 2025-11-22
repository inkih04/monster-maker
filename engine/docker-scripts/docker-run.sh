#!/bin/bash
set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Starting Development Session (Simplified X11)${NC}"

# 1. Ubicar directorios de forma robusta
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"
cd "${PROJECT_ROOT}"

# 2. Asegurar que la imagen base existe
if ! docker image inspect pokemon-engine:dev >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Dev image not found. Building once...${NC}"
    docker build --target development -t pokemon-engine:dev .
fi

# 3. Preparación de entorno gráfico
# IMPORTANTE: Asegúrate de haber ejecutado 'xhost +' en tu terminal antes
XSOCK=/tmp/.X11-unix

if [ "$(uname)" = "Linux" ]; then
    # Intentamos dar permisos locales automáticamente
    xhost +local:docker >/dev/null 2>&1 || true
fi

echo -e "${GREEN}🔨 Compiling and Running...${NC}"

# 4. EJECUTAR EN MODO DESARROLLO
# Eliminamos XAUTHORITY para evitar conflictos cuando usamos xhost +
docker run \
    --rm \
    -it \
    --name pokemon-engine-dev \
    --net=host \
    --privileged \
    --device /dev/dri:/dev/dri \
    -e DISPLAY=${DISPLAY} \
    -v ${XSOCK}:${XSOCK}:rw \
    -v "$(pwd):/home/builder/engine" \
    pokemon-engine:dev \
    /bin/bash -c "
        # Configurar CMake si es necesario
        if [ ! -d 'build' ]; then
            echo 'Configuring CMake...'
            cmake -B build -G Ninja \
                -DCMAKE_BUILD_TYPE=Debug \
                -DGLFW_BUILD_WAYLAND=OFF \
                -DCMAKE_C_COMPILER=gcc \
                -DCMAKE_CXX_COMPILER=g++ \
                -DCMAKE_CXX_FLAGS='-march=x86-64 -mtune=generic'
        fi

        # Compilar
        cmake --build build --parallel $(nproc)

        # Ejecutar
        if [ -f build/PokemonGameEngine ]; then
            echo '🚀 Launching Game...'
            ./build/PokemonGameEngine
        else
            echo '❌ Compilation failed'
            exit 1
        fi
    "

# Limpiar permisos X11 (Opcional, comentar si molesta)
if [ "$(uname)" = "Linux" ]; then
    xhost -local:docker >/dev/null 2>&1 || true
fi