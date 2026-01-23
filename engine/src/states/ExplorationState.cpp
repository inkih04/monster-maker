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


ExplorationState::ExplorationState() {
    setEntityManager();

}


void ExplorationState::update(int deltaTime) {
    updatePlayerMovement(deltaTime);
    m_entityManager->updateEntities(deltaTime);
}

void ExplorationState::setEntityManager() {
    m_entityManager = std::make_unique<EntityManager>();
    EntityLoader::loadEntitiesFromFile("../resources/maps/data/map32.json", *m_entityManager);

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

void ExplorationState::updatePlayerMovement(int deltaTime) {
    auto playerEntity = m_entityManager->getEntitiesByTag(EntityTag::PLAYER)[0];
    auto& input = InputManager::getInstance();

    if (!playerEntity) return;

    Component* pc = playerEntity->getComponent(ComponentsType::POSITION);
    PositionComponent* positionComponent = dynamic_cast<PositionComponent*>(pc);
    if (!positionComponent) return;

    float playerSpeed = 2;
    Position position = positionComponent->getPosition();

    auto mc = playerEntity->getComponent(ComponentsType::MOVEMENT);
    auto movementComponent = dynamic_cast<MovementComponent*>(mc);

    if (!movementComponent) return;


    if (input.isKeyDown(GLFW_KEY_W) || input.isKeyDown(GLFW_KEY_UP)) {
        position.y -= playerSpeed;
    }
    else if (input.isKeyDown(GLFW_KEY_S) || input.isKeyDown(GLFW_KEY_DOWN)) {
        position.y += playerSpeed;
    }
    else if (input.isKeyDown(GLFW_KEY_A) || input.isKeyDown(GLFW_KEY_LEFT)) {
        position.x -= playerSpeed;
    }
    else if (input.isKeyDown(GLFW_KEY_D) || input.isKeyDown(GLFW_KEY_RIGHT)) {
        position.x += playerSpeed;

    }
    movementComponent->move(position);

}