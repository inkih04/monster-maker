//
// Created by inkih on 7/12/25.
//
#include "ExplorationState.h"

#include <iostream>

#include "AnimationComponent.h"
#include "Engine.h"
#include "EntityLoader.h"
#include "InputManager.h"
#include "MovementComponent.h"
#include "PositionComponent.h"
#include "ScriptEngine.h"


ExplorationState::ExplorationState() {
    setEntityManager();

}
void ExplorationState::applyScriptContext()  {
    if (m_entityManager)
        ScriptEngine::getInstance().setupBindingsDynamic(Renderer::getInstance().getWorldCamera(), *m_entityManager);
}


void ExplorationState::update(int deltaTime) {
    m_entityManager->updateEntities(deltaTime);
}

void ExplorationState::setEntityManager() {
    m_entityManager = std::make_unique<EntityManager>();
    EntityLoader::loadEntitiesFromFile("../resources/maps/data/map32-super.json", *m_entityManager);

}

void ExplorationState::render() {
    renderGround();
    renderDecoration();
    renderEntities();
    renderShadows();
    renderForeground();

}



void ExplorationState::renderGround() const {
    auto entities = m_entityManager->getEntitiesByLayer(EntityLayer::GROUND);
    for (auto* enity : entities) {
        enity->render();
    }
}

void ExplorationState::renderDecoration() const {
    auto entities = m_entityManager->getEntitiesByLayer(EntityLayer::DECORATION);
    for (auto* enity : entities) {
        enity->render();
    }
}

void ExplorationState::renderEntities() const {
    auto entities = m_entityManager->getEntitiesByLayer(EntityLayer::ENTITIES);
    for (auto* enity : entities) {
        enity->render();
    }
}

void ExplorationState::renderShadows() const {
    auto entities = m_entityManager->getEntitiesByLayer(EntityLayer::SHADOWS);
    for (auto* enity : entities) {
        enity->render();
    }
}

void ExplorationState::renderForeground() const {
    auto entities = m_entityManager->getEntitiesByLayer(EntityLayer::FOREGROUND);
    for (auto* enity : entities) {
        enity->render();
    }
}