//
// Created by inkih on 7/12/25.
//
#include <ExplorationState.h>

ExplorationState::ExplorationState() {
    setEntityManager();
}


void ExplorationState::update(int deltaTime) {
    m_entityManager->updateEntities(deltaTime);
}

void ExplorationState::setEntityManager() {
    m_entityManager = std::make_unique<EntityManager>();
}

void ExplorationState::render() {
    m_entityManager->renderEntities();
}



