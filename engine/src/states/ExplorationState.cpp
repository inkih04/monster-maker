//
// Created by inkih on 7/12/25.
//
#include <ExplorationState.h>
#include <iostream>
#include <ostream>

#include "PositionComponent.h"
#include "RenderComponent.h"

ExplorationState::ExplorationState() {
    setEntityManager();
    std::cout << "En ExplorationState." << std::endl;
}


void ExplorationState::update(int deltaTime) {
    m_entityManager->updateEntities(deltaTime);
}

void ExplorationState::setEntityManager() {
    m_entityManager = std::make_unique<EntityManager>();
    Entity* test = m_entityManager->createEntity();
    test->addComponent(ComponentsType::RENDER, std::make_unique<RenderComponent>("../resources/1.png", 0, 0, 32, 32));
    test->addComponent(ComponentsType::POSITION, std::make_unique<PositionComponent>(400.0f, 300.0f, 0));
    std::cout << "Entity creada" << std::endl;

}

void ExplorationState::render() {
    m_entityManager->renderEntities();

}



