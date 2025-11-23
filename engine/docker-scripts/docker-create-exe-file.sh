#!/bin/bash
set -e


GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🏗️  Compilando Motor con Docker (Output Local)...${NC}"


SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"
cd "${PROJECT_ROOT}"


if ! docker image inspect pokemon-engine:dev >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Imagen de compilación no encontrada. Creándola...${NC}"
    ./docker-scripts/docker-build.sh
fi


docker run \
    --rm \
    -v "$(pwd):/home/builder/engine" \
    --user $(id -u):$(id -g) \
    -w /home/builder/engine \
    pokemon-engine:dev \
    /bin/bash -c "
        # Crear carpeta build si no existe
        mkdir -p build

        # Configurar CMake
        if [ ! -f build/build.ninja ]; then
            echo '⚙️  Configurando CMake...'
            rm -f build/CMakeCache.txt

            cmake -B build -G Ninja \
                -DCMAKE_BUILD_TYPE=Debug \
                -DCMAKE_TOOLCHAIN_FILE=/opt/vcpkg/scripts/buildsystems/vcpkg.cmake \
                -DVCPKG_TARGET_TRIPLET=x64-linux \
                -DVCPKG_MANIFEST_MODE=OFF \
                -DVCPKG_INSTALLED_DIR=/opt/vcpkg/installed \
                -DCMAKE_C_COMPILER=gcc \
                -DCMAKE_CXX_COMPILER=g++ \
                -DCMAKE_CXX_FLAGS='-march=x86-64 -mtune=generic'
        fi

        # Compilar
        echo '🔨 Compilando...'
        cmake --build build --parallel \$(nproc)
    "

echo -e "${GREEN}✅ Compilación terminada.${NC}"
echo -e "${YELLOW}👉 Para jugar ejecuta: ./build/PokemonGameEngine${NC}"