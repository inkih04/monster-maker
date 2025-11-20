#!/bin/bash
set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🎮 Running Pokemon Engine${NC}"

# Verificar que la imagen existe
if ! docker image inspect pokemon-engine:latest >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Image not found. Building first...${NC}"
    ./scripts/docker-build.sh
fi

# Configurar X11 para GUI (Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xhost +local:docker >/dev/null 2>&1 || true
fi

# Ejecutar el contenedor
echo -e "${GREEN}🚀 Starting game...${NC}"
docker run \
    --rm \
    -it \
    --name pokemon-engine-game \
    -e DISPLAY=${DISPLAY:-:0} \
    -v /tmp/.X11-unix:/tmp/.X11-unix:ro \
    -v "$(pwd)/game_data:/home/gamerunner/game/data" \
    pokemon-engine:latest "$@"

# Limpiar permisos de X11
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xhost -local:docker >/dev/null 2>&1 || true
fi