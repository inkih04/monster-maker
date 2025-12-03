//
// Created by inkih on 30/11/25.
//
#include "EntityManager.h"

Entity* EntityManager::createEntity() {
    auto entity = std::make_unique<Entity>();
    Entity* entityPtr = entity.get();
    m_entities.push_back(std::move(entity));
    return entityPtr;
}

void EntityManager::updateEntities(int deltaTime) const {
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
