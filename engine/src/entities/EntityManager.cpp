//
// Created by inkih on 30/11/25.
//
#include "EntityManager.h"

#include <algorithm>
#include <cmath>

#include "ScriptComponet.h"
#include "../../include/service/CollisionService.h"


EntityManager::EntityManager(): isCacheStarted(false), isBordersMapStarted(false) {
    m_collisionService = std::make_unique<CollisionService>();
    m_interactionService = std::make_unique<InteractionService>(m_collisionService.get());
    m_bordersMapService = std::make_unique<BordersMapService>();
}

Entity* EntityManager::createEntity() {
    auto entity = std::make_unique<Entity>();
    entity->setCollisionService(m_collisionService.get());
    entity->setInteractionService(m_interactionService.get());
    Entity* entityPtr = entity.get();
    m_entities.push_back(std::move(entity));
    return entityPtr;
}

Entity* EntityManager::createEntity(EntityTag tag, EntityLayer layer, std::string id) {
    auto entity = std::make_unique<Entity>(id);
    Entity* entityPtr = entity.get();
    entity->setCollisionService(m_collisionService.get());
    entity->setInteractionService(m_interactionService.get());
    m_entities.push_back(std::move(entity));
    m_entitiesByTag[tag].push_back(entityPtr);
    m_entitiesByLayer[layer].push_back(entityPtr);
    return entityPtr;
}

std::unique_ptr<Entity> EntityManager::extractEntity(EntityTag tag, EntityLayer layer) {
    auto it = std::find_if(m_entities.begin(), m_entities.end(),
        [&](const std::unique_ptr<Entity>& e) {
            auto tagIt = m_entitiesByTag.find(tag);
            if (tagIt == m_entitiesByTag.end()) return false;
            auto& tagVec = tagIt->second;
            return std::find(tagVec.begin(), tagVec.end(), e.get()) != tagVec.end();
        });

    if (it == m_entities.end()) return nullptr;

    Entity* rawPtr = it->get();

    for (auto& [t, vec] : m_entitiesByTag)
        vec.erase(std::remove(vec.begin(), vec.end(), rawPtr), vec.end());

    for (auto& [l, vec] : m_entitiesByLayer)
        vec.erase(std::remove(vec.begin(), vec.end(), rawPtr), vec.end());

    m_rawCollisionEntities.erase(
        std::remove(m_rawCollisionEntities.begin(), m_rawCollisionEntities.end(), rawPtr),
        m_rawCollisionEntities.end());

    std::unique_ptr<Entity> extracted = std::move(*it);
    m_entities.erase(it);

    return extracted;
}

Entity* EntityManager::adoptEntity(std::unique_ptr<Entity> entity, EntityTag tag, EntityLayer layer) {
    entity->setCollisionService(m_collisionService.get());
    entity->setInteractionService(m_interactionService.get());

    if (entity->hasComponent(ComponentsType::SCRIPT)) {
        auto* script = static_cast<ScriptComponent*>(entity->getComponent(ComponentsType::SCRIPT));
        script->reset();
    }

    Entity* entityPtr = entity.get();
    m_entities.push_back(std::move(entity));
    m_entitiesByTag[tag].push_back(entityPtr);
    m_entitiesByLayer[layer].push_back(entityPtr);

    return entityPtr;
}

void EntityManager::registerCollisionEntity(Entity* entity) {
    if (!entity->hasComponent(ComponentsType::COLLIDER)) {
        std::cout << "[ENGINE][WARNING] EntityManager::registerCollisionEntity: entity has no ColliderComponent, skipping." << std::endl;
        return;
    }
    m_rawCollisionEntities.push_back(entity);
    if (isCacheStarted) {
        initCollisionCache();
    }
}

void EntityManager::destroyEntity(Entity* entity) {
    m_entities.erase(std::remove_if(m_entities.begin(), m_entities.end(),
        [entity](const std::unique_ptr<Entity>& e) { return e.get() == entity; }), m_entities.end());

    for (auto& [tag, entities] : m_entitiesByTag)
        entities.erase(std::remove(entities.begin(), entities.end(), entity), entities.end());

    for (auto& [layer, entities] : m_entitiesByLayer)
        entities.erase(std::remove(entities.begin(), entities.end(), entity), entities.end());

    m_rawCollisionEntities.erase(
        std::remove(m_rawCollisionEntities.begin(), m_rawCollisionEntities.end(), entity),
        m_rawCollisionEntities.end());
}

std::vector<Entity*> EntityManager::getEntitiesByTag(EntityTag tag) const {
    auto it = m_entitiesByTag.find(tag);
    if (it != m_entitiesByTag.end()) return it->second;
    return {};
}

std::vector<Entity*> EntityManager::getEntitiesByLayer(EntityLayer layer) const {
    auto it = m_entitiesByLayer.find(layer);
    if (it != m_entitiesByLayer.end()) return it->second;
    return {};
}

void EntityManager::updateEntities(int deltaTime) {
    if (!isCacheStarted) {
        initCollisionCache();
        isCacheStarted = true;
    }
    if (!isBordersMapStarted) {
        m_bordersMapService->initBordersMapService(this->getEntitiesByComponent(ComponentsType::POSITION));
        isBordersMapStarted = true;
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

