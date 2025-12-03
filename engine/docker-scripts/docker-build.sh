#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🐳 Building Pokemon Engine Docker Image${NC}"

ARCH=$(uname -m)
echo -e "${YELLOW}Architecture: ${ARCH}${NC}"

echo -e "${GREEN}📦 Building development image...${NC}"
docker build \
    --target development \
    --tag pokemon-engine:dev \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --progress=plain \
    .

echo -e "${GREEN}✅ Build completed!${NC}"
docker images pokemon-engine --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}"

echo -e "${GREEN}🎉 Done!${NC}"
echo -e "${YELLOW}Use: docker run -it --rm -v \$(pwd):/home/builder/engine pokemon-engine:dev bash${NC}"