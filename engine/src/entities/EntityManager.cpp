//
// Created by inkih on 30/11/25.
//
#include "EntityManager.h"

#include <algorithm>
#include <cmath>

#include "ColliderComponent.h"
#include "GameConfig.h"
#include "PositionComponent.h"

Entity* EntityManager::createEntity() {
    auto entity = std::make_unique<Entity>();
    Entity* entityPtr = entity.get();
    m_entities.push_back(std::move(entity));
    return entityPtr;
}

Entity* EntityManager::createEntity(EntityTag tag, EntityLayer layer) {
    auto entity = std::make_unique<Entity>();
    Entity* entityPtr = entity.get();
    m_entities.push_back(std::move(entity));
    m_entitiesByTag[tag].push_back(entityPtr);
    m_entitiesByLayer[layer].push_back(entityPtr);
    return entityPtr;
}

void EntityManager::destroyEntity(Entity* entity) {
    m_entities.erase(std::remove_if(m_entities.begin(), m_entities.end(),
        [entity](const std::unique_ptr<Entity>& e) { return e.get() == entity; }), m_entities.end());

    for (auto& [tag, entities] : m_entitiesByTag) {
        entities.erase(std::remove(entities.begin(), entities.end(), entity), entities.end());
    }

    for (auto& [layer, entities] : m_entitiesByLayer) {
        entities.erase(std::remove(entities.begin(), entities.end(), entity), entities.end());
    }
}

std::vector<Entity*> EntityManager::getEntitiesByTag(EntityTag tag) const {
    auto it = m_entitiesByTag.find(tag);
    if (it != m_entitiesByTag.end()) {
        return it->second;
    }
    return {};
}

std::vector<Entity*> EntityManager::getEntitiesByLayer(EntityLayer layer) const {
    auto it = m_entitiesByLayer.find(layer);
    if (it != m_entitiesByLayer.end()) {
        return it->second;
    }
    return {};
}

void EntityManager::updateEntities(int deltaTime) {
    for (const auto& entity : m_entities) {
        entity->update(deltaTime);
    }
}

void EntityManager::renderEntities() const {
    for (const auto& entity : m_entities) {
        entity->render();
    }
}
std::vector<Entity*> EntityManager::getEntitiesByComponent(ComponentsType type) const {
    std::vector<Entity*> entitiesWithComponent;
    for (const auto& entity : m_entities) {
        if (entity->hasComponent(type)) {
            entitiesWithComponent.push_back(entity.get());
        }
    }
    return entitiesWithComponent;
}


void EntityManager::initCollisionCache() {
    m_collisionEntities.clear();

    for (const auto& entity : m_rawCollisionEntities) {
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

void EntityManager::updatePositionCollisionCache(const Position& oldPos, const Position& newPos, Entity* entity) {
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

bool EntityManager::isAreaFree(const Position& targetPos, const int width, const int height, const Entity* source) {
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
