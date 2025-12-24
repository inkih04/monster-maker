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
#include "ResourceManager.h"
#include "TextRenderer.h"
#include "enums/GameConfig.h"

ExplorationState::ExplorationState() {
    setEntityManager();
    m_textRenderer = ResourceManager::loadFont("../resources/fonts/Roboto/Roboto.ttf", 24);

}


void ExplorationState::update(int deltaTime) {
    updatePlayerMovement(deltaTime);
    m_entityManager->updateEntities(deltaTime);
}

void ExplorationState::setEntityManager() {
    m_entityManager = std::make_unique<EntityManager>();
    EntityLoader::loadEntitiesFromFile("../resources/maps/data/test_map.json", *m_entityManager);

}

void ExplorationState::render() {
    renderGround();
    renderDecoration();
    renderEntities();
    renderShadows();
    renderForeground();

    if (m_textRenderer) {
        std::string message = "Hola Mundo";

        // Escala 1.0
        float scale = 1.0f;

        // Medir ancho y alto del texto
        float textWidth = m_textRenderer->getTextWidth(message, scale);
        float textHeight = m_textRenderer->getTextHeight(scale);

        // Coordenadas para centrar
        float x = (GameConfig::Width  - textWidth) / 2.0f;
        float y = (GameConfig::Height - textHeight) / 2.0f;

        m_textRenderer->renderText(message, {x, y}, scale, {1.0f, 1.0f, 1.0f}); // blanco
    }

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