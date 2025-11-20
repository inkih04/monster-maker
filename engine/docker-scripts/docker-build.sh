#!/bin/bash
set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🐳 Building Pokemon Engine Docker Images${NC}"

# Detectar arquitectura
ARCH=$(uname -m)
echo -e "${YELLOW}Architecture: ${ARCH}${NC}"

# Build de la imagen de runtime
echo -e "${GREEN}📦 Building runtime image...${NC}"
docker build \
    --target runtime \
    --tag pokemon-engine:latest \
    --tag pokemon-engine:runtime \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --progress=plain \
    .

# Build de la imagen de desarrollo
echo -e "${GREEN}🛠️  Building development image...${NC}"
docker build \
    --target development \
    --tag pokemon-engine:dev \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --progress=plain \
    .

# Mostrar imágenes creadas
echo -e "${GREEN}✅ Build completed!${NC}"
docker images | grep pokemon-engine

# Mostrar tamaños
echo -e "${YELLOW}📊 Image sizes:${NC}"
docker images pokemon-engine --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}"

echo -e "${GREEN}🎉 Done! Use './scripts/docker-run.sh' to run the game${NC}"