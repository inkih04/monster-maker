//
// Created by inkih on 7/12/25.
//
#include "ExplorationState.h"
#include "AnimationComponent.h"
#include "DebugHelper.h"
#include "Engine.h"
#include "EntityLoader.h"
#include "InputManager.h"
#include "PositionComponent.h"
#include "ScriptEngine.h"


ExplorationState::ExplorationState() {
    setEntityManager();
    debugMode = !DebugHelper::getInstance().getCurrentMap().empty();
}
void ExplorationState::applyScriptContext()  {
    if (m_entityManager)
        ScriptEngine::getInstance().setupBindingsDynamic(Renderer::getInstance().getWorldCamera(), *m_entityManager);
}


void ExplorationState::update(int deltaTime) {
    m_entityManager->updateEntities(deltaTime);

    if (ScriptEngine::getInstance().hasPendingMapChange()) {
        changeMap(ScriptEngine::getInstance().consumePendingMap());
    }

    if (debugMode) {
        moveDebugCamera();
    }
}

void ExplorationState::changeMap(const std::string& mapPath) {
    auto playerEntity = m_entityManager->extractEntity(EntityTag::PLAYER, EntityLayer::ENTITIES);

    m_entityManager = std::make_unique<EntityManager>();
    EntityLoader::loadEntitiesFromFile(mapPath, *m_entityManager);

    if (playerEntity) {
        m_entityManager->adoptEntity(std::move(playerEntity), EntityTag::PLAYER, EntityLayer::ENTITIES);
    }
    applyScriptContext();

    std::cout << "[Engine] Map changed to: " << mapPath << std::endl;
}

void ExplorationState::moveDebugCamera() {
    Camera *camera = Renderer::getInstance().getWorldCamera();
    if (!camera) return;

    auto& input = InputManager::getInstance();

    bool isControlDown = input.isKeyDown(GLFW_KEY_LEFT_CONTROL) ||
                         input.isKeyDown(GLFW_KEY_RIGHT_CONTROL);

    if (!isControlDown) return;
    int speed = 16;
    float smoothness = 0.15f;
    glm::vec2 targetPos = camera->getPosition();

    if (input.isKeyDown(GLFW_KEY_W) || input.isKeyDown(GLFW_KEY_UP))    targetPos.y -= speed;
    if (input.isKeyDown(GLFW_KEY_S) || input.isKeyDown(GLFW_KEY_DOWN))  targetPos.y += speed;
    if (input.isKeyDown(GLFW_KEY_A) || input.isKeyDown(GLFW_KEY_LEFT))  targetPos.x -= speed;
    if (input.isKeyDown(GLFW_KEY_D) || input.isKeyDown(GLFW_KEY_RIGHT)) targetPos.x += speed;

    camera->lerpTo(targetPos, smoothness);
}

void ExplorationState::setEntityManager() {
    m_entityManager = std::make_unique<EntityManager>();
    std::string debugMap = DebugHelper::getInstance().getCurrentMap();
    if (debugMap.empty()) EntityLoader::loadEntitiesFromFile("resources/maps/data/map32-super.json", *m_entityManager);
    else {
        EntityLoader::loadEntitiesFromFile(debugMap, *m_entityManager);
    }
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