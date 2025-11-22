#!/bin/bash
set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧹 Cleaning Docker artifacts${NC}"


echo "Stopping containers..."
docker ps -q --filter "name=pokemon-engine" | xargs -r docker stop


echo "Removing containers..."
docker ps -aq --filter "name=pokemon-engine" | xargs -r docker rm


echo "Removing images..."
docker images "pokemon-engine" -q | xargs -r docker rmi -f


echo "Pruning volumes..."
docker volume prune -f


echo "Pruning build cache..."
docker builder prune -f

echo -e "${RED}✅ Cleanup completed!${NC}"
docker system df