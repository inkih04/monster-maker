//
// Created by inkih on 26/1/26.
//
#include "../../../include/service/CollisionService.h"
#include <functional>
#include <iostream>

#include "ColliderComponent.h"
#include "ComponentsType.h"
#include "PositionComponent.h"
#include "Entity.h"

void CollisionService::forEachGridCell(int x, int y, int w, int h, const std::function<bool(const Position&)>& func) {
    int startX = x / GameConfig::GridSize;
    int startY = y / GameConfig::GridSize;

    int endX = (x + w - 1) / GameConfig::GridSize;
    int endY = (y + h - 1) / GameConfig::GridSize;

    for (int ix = startX; ix <= endX; ++ix) {
        for (int iy = startY; iy <= endY; ++iy) {
            Position gridKey(ix * GameConfig::GridSize, iy * GameConfig::GridSize);

            if (!func(gridKey)) return;
        }
    }
}

void CollisionService::initCollisionCache(const std::vector<Entity*>& collisionEntities) {
    m_collisionEntities.clear();

    for (const auto& entity : collisionEntities) {
        auto* posComp = static_cast<PositionComponent*>(entity->getComponent(ComponentsType::POSITION));
        auto* collComp = static_cast<CollisionComponent*>(entity->getComponent(ComponentsType::COLLIDER));

        if (posComp && collComp) {
            Position pos = posComp->getPosition();
            int realX = pos.x + collComp->getOffsetX();
            int realY = pos.y + collComp->getOffsetY();

            forEachGridCell(realX, realY, collComp->getWidth(), collComp->getHeight(),
                [&](const Position& key) {
                    m_collisionEntities[key] = entity;
                    return true;
                }
            );
        }
    }
}

Entity* CollisionService::getEntityInLineOfSight(
    const Entity* source,
    Direction direction,
    int maxRange) const
{
    if (!source) return nullptr;

    auto* posComp  = static_cast<PositionComponent*>(
        const_cast<Entity*>(source)->getComponent(ComponentsType::POSITION));
    auto* collComp = static_cast<CollisionComponent*>(
        const_cast<Entity*>(source)->getComponent(ComponentsType::COLLIDER));

    if (!posComp) return nullptr;

    Position srcPos = posComp->getPosition();
    int baseX = srcPos.x + (collComp ? collComp->getOffsetX() : 0);
    int baseY = srcPos.y + (collComp ? collComp->getOffsetY() : 0);
    int colW  = collComp ? collComp->getWidth()  : GameConfig::GridSize;
    int colH  = collComp ? collComp->getHeight() : GameConfig::GridSize;

    int stepX = 0, stepY = 0;
    int rayX  = 0, rayY  = 0;

    switch (direction) {
        case Direction::RIGHT:
            stepX = GameConfig::GridSize;
            rayX  = baseX + colW;
            rayY  = baseY + colH / 2;  // centro vertical
            break;
        case Direction::LEFT:
            stepX = -GameConfig::GridSize;
            rayX  = baseX;
            rayY  = baseY + colH / 2;  // centro vertical
            break;
        case Direction::BOTTOM:
            stepY = GameConfig::GridSize;
            rayX  = baseX + colW / 2;  // centro horizontal
            rayY  = baseY + colH;
            break;
        case Direction::TOP:
            stepY = -GameConfig::GridSize;
            rayX  = baseX + colW / 2;  // centro horizontal
            rayY  = baseY;
            break;
        default: return nullptr;
    }

    auto snapToGrid = [](int v) -> int {
        return (v >= 0)
            ? (v / GameConfig::GridSize) * GameConfig::GridSize
            : ((v - GameConfig::GridSize + 1) / GameConfig::GridSize) * GameConfig::GridSize;
    };

    for (int step = 1; step <= maxRange; ++step) {
        int checkX = rayX + stepX * step;
        int checkY = rayY + stepY * step;

        Position key(snapToGrid(checkX), snapToGrid(checkY));

        auto it = m_collisionEntities.find(key);
        if (it != m_collisionEntities.end() && it->second != source) {
            return it->second;
        }
    }

    return nullptr;
}

void CollisionService::updatePositionCollisionCache(const Position& oldPos, const Position& newPos, Entity* entity) {
    auto* collComp = static_cast<CollisionComponent*>(entity->getComponent(ComponentsType::COLLIDER));
    if (!collComp) return;

    int w = collComp->getWidth();
    int h = collComp->getHeight();
    int ox = collComp->getOffsetX();
    int oy = collComp->getOffsetY();

    forEachGridCell(oldPos.x + ox, oldPos.y + oy, w, h,
        [&](const Position& key) {
            auto it = m_collisionEntities.find(key);
            if (it != m_collisionEntities.end() && it->second == entity) {
                m_collisionEntities.erase(it);
            }
            return true;
        }
    );

    forEachGridCell(newPos.x + ox, newPos.y + oy, w, h,
        [&](const Position& key) {
            m_collisionEntities[key] = entity;
            return true;
        }
    );
}

bool CollisionService::isAreaFree(const Position& targetPos, const int width, const int height, const Entity* source) {
    int checkX = targetPos.x;
    int checkY = targetPos.y;

    if (source) {
        auto* collComp = static_cast<CollisionComponent*>(const_cast<Entity*>(source)->getComponent(ComponentsType::COLLIDER));
        if (collComp) {
            checkX += collComp->getOffsetX();
            checkY += collComp->getOffsetY();
        }
    }

    bool isFree = true;

    forEachGridCell(checkX, checkY, width, height,
        [&](const Position& key) {
            auto it = m_collisionEntities.find(key);
            if (it != m_collisionEntities.end() && it->second != source) {
                isFree = false;
                return false;
            }
            return true;
        }
    );

    return isFree;
}


Entity* CollisionService::getEntityAtArea(const Position& targetPos, const int width, const int height, const Entity* source) {
    int checkX = targetPos.x;
    int checkY = targetPos.y;

    if (source) {
        auto* collComp = static_cast<CollisionComponent*>(const_cast<Entity*>(source)->getComponent(ComponentsType::COLLIDER));
        if (collComp) {
            checkX += collComp->getOffsetX();
            checkY += collComp->getOffsetY();
        }
    }

    Entity* foundEntity = nullptr;

    forEachGridCell(checkX, checkY, width, height,
        [&](const Position& key) {
            auto it = m_collisionEntities.find(key);
            if (it != m_collisionEntities.end() && it->second != source) {
                foundEntity = it->second;
                return false;
            }
            return true;
        }
    );

    return foundEntity;
}

void CollisionService::removeEntity(Entity* entity) {
    if (!entity) return;

    auto* posComp = static_cast<PositionComponent*>(entity->getComponent(ComponentsType::POSITION));
    auto* collComp = static_cast<CollisionComponent*>(entity->getComponent(ComponentsType::COLLIDER));

    if (!posComp || !collComp) return;

    Position pos = posComp->getPosition();
    int realX = pos.x + collComp->getOffsetX();
    int realY = pos.y + collComp->getOffsetY();

    forEachGridCell(realX, realY, collComp->getWidth(), collComp->getHeight(),
        [&](const Position& key) {
            auto it = m_collisionEntities.find(key);
            if (it != m_collisionEntities.end() && it->second == entity) {
                m_collisionEntities.erase(it);
            }
            return true;
        }
    );
}