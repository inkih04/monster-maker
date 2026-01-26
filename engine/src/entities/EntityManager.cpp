//
// Created by inkih on 30/11/25.
//
#include "EntityManager.h"

#include <algorithm>
#include <cmath>
#include "CollisionService.h"


EntityManager::EntityManager(): isCacheStarted(false) {
    m_collisionService = std::make_unique<CollisionService>();
}


Entity* EntityManager::createEntity() {
    auto entity = std::make_unique<Entity>(m_collisionService.get());
    Entity* entityPtr = entity.get();
    m_entities.push_back(std::move(entity));
    return entityPtr;
}

Entity* EntityManager::createEntity(EntityTag tag, EntityLayer layer) {
    auto entity = std::make_unique<Entity>(m_collisionService.get());
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
    if (!isCacheStarted) {
        initCollisionCache();
        isCacheStarted = true;
    }

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
    m_collisionService->initCollisionCache(m_rawCollisionEntities);
}


EntityManager::~EntityManager() {
    m_entities.clear();
    m_entitiesByTag.clear();
    m_entitiesByLayer.clear();
    m_rawCollisionEntities.clear();

}

