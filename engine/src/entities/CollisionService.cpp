//
// Created by inkih on 26/1/26.
//
#include "CollisionService.h"

#include "ColliderComponent.h"
#include "ComponentsType.h"
#include "PositionComponent.h"
#include "Entity.h"


void CollisionService::initCollisionCache(const std::vector<Entity*>& collisionEntities) {
    m_collisionEntities.clear();

    for (const auto& entity : collisionEntities) {
        auto* posComp = dynamic_cast<PositionComponent*>(entity->getComponent(ComponentsType::POSITION));
        auto* collComp = dynamic_cast<CollisionComponent*>(entity->getComponent(ComponentsType::COLLIDER));

        if (posComp && collComp) {
            Position basePos = posComp->getPosition();
            int numCellsX = std::ceil(collComp->getWidth() / static_cast<float>(GameConfig::GridSize));
            int numCellsY = std::ceil(collComp->getHeight() / static_cast<float>(GameConfig::GridSize));

            for (int x = 0; x < numCellsX; ++x) {
                for (int y = 0; y < numCellsY; ++y) {
                    Position cellPos(
                        basePos.x + (x * GameConfig::GridSize),
                        basePos.y + (y * GameConfig::GridSize)
                    );
                    m_collisionEntities[cellPos] = entity;
                }
            }
        }
    }
}

void CollisionService::updatePositionCollisionCache(const Position& oldPos, const Position& newPos, Entity* entity) {
    auto* collComp = dynamic_cast<CollisionComponent*>(entity->getComponent(ComponentsType::COLLIDER));
    if (!collComp) return;

    int numCellsX = std::ceil(collComp->getWidth() / static_cast<float>(GameConfig::GridSize));
    int numCellsY = std::ceil(collComp->getHeight() / static_cast<float>(GameConfig::GridSize));

    for (int x = 0; x < numCellsX; ++x) {
        for (int y = 0; y < numCellsY; ++y) {
            Position oldCell(oldPos.x + (x * GameConfig::GridSize), oldPos.y + (y * GameConfig::GridSize));

            auto it = m_collisionEntities.find(oldCell);
            if (it != m_collisionEntities.end() && it->second == entity) {
                m_collisionEntities.erase(it);
            }
        }
    }

    for (int x = 0; x < numCellsX; ++x) {
        for (int y = 0; y < numCellsY; ++y) {
            Position newCell(newPos.x + (x * GameConfig::GridSize), newPos.y + (y * GameConfig::GridSize));
            m_collisionEntities[newCell] = entity;
        }
    }
}


bool CollisionService::isAreaFree(const Position& targetPos, const int width, const int height, const Entity* source) {
    int numCellsX = std::ceil(width / static_cast<float>(GameConfig::GridSize));
    int numCellsY = std::ceil(height / static_cast<float>(GameConfig::GridSize));

    for (int x = 0; x < numCellsX; ++x) {
        for (int y = 0; y < numCellsY; ++y) {
            Position checkPos(targetPos.x + (x * GameConfig::GridSize), targetPos.y + (y * GameConfig::GridSize));

            auto it = m_collisionEntities.find(checkPos);
            if (it != m_collisionEntities.end() && it->second != source) {
                return false;
            }
        }
    }
    return true;
}


void CollisionService::removeEntity(Entity* entity) {
    if (!entity) return;

    auto* posComp = static_cast<PositionComponent*>(entity->getComponent(ComponentsType::POSITION));
    auto* collComp = static_cast<CollisionComponent*>(entity->getComponent(ComponentsType::COLLIDER));


    if (!posComp || !collComp) return;

    Position pos = posComp->getPosition();
    int width = collComp->getWidth();
    int height = collComp->getHeight();

    int numCellsX = std::ceil(width / static_cast<float>(GameConfig::GridSize));
    int numCellsY = std::ceil(height / static_cast<float>(GameConfig::GridSize));


    for (int x = 0; x < numCellsX; ++x) {
        for (int y = 0; y < numCellsY; ++y) {
            Position cellPos(
                pos.x + (x * GameConfig::GridSize),
                pos.y + (y * GameConfig::GridSize)
            );

            auto it = m_collisionEntities.find(cellPos);
            if (it != m_collisionEntities.end() && it->second == entity) {
                m_collisionEntities.erase(it);
            }
        }
    }
}