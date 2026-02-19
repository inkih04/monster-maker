//
// Created by inkih on 19/2/26.
//

#include "BordersMapService.h"
#include "PositionComponent.h"
#include "ComponentsType.h"
#include <limits>

BordersMapService::BordersMapService()
    : m_topLeft(std::numeric_limits<int>::max(), std::numeric_limits<int>::max()),
      m_bottomRight(std::numeric_limits<int>::min(), std::numeric_limits<int>::min()) {
}

Position BordersMapService::getPositionFromEntity(Entity* entity) const {
    auto* posComponent = static_cast<PositionComponent*>(entity->getComponent(ComponentsType::POSITION));
    if (posComponent) {
        return posComponent->getPosition();
    }
    return Position(0, 0);
}

void BordersMapService::initBordersMapService(const std::vector<Entity*>& entities) {
    if (entities.empty()) return;

    for (const auto& entity : entities) {
        Position pos = getPositionFromEntity(entity);

        if (pos.x < m_topLeft.x) m_topLeft.x = pos.x;
        if (pos.y < m_topLeft.y) m_topLeft.y = pos.y;
        if (pos.x + GameConfig::GridSize > m_bottomRight.x) m_bottomRight.x = pos.x + GameConfig::GridSize;
        if (pos.y + GameConfig::GridSize > m_bottomRight.y) m_bottomRight.y = pos.y + GameConfig::GridSize;
    }
}

void BordersMapService::setPosition(const Position& position) {
    if (position.x < m_topLeft.x) m_topLeft.x = position.x;
    if (position.y < m_topLeft.y) m_topLeft.y = position.y;
    if (position.x + GameConfig::GridSize > m_bottomRight.x) m_bottomRight.x = position.x + GameConfig::GridSize;
    if (position.y + GameConfig::GridSize > m_bottomRight.y) m_bottomRight.y = position.y + GameConfig::GridSize;
}

Position BordersMapService::clampCameraPosition(const Position& camTarget, float halfW, float halfH) const {
    float x = std::max(m_topLeft.x + halfW, std::min((float)camTarget.x, m_bottomRight.x - halfW));
    float y = std::max(m_topLeft.y + halfH, std::min((float)camTarget.y, m_bottomRight.y - halfH));
    return Position(x, y);
}

bool BordersMapService::isOutOfBounds(const Position& position, const glm::vec2& offset) const {
    return (position.x - offset.x < m_topLeft.x) ||
           (position.y - offset.y < m_topLeft.y) ||
           (position.x + offset.x > m_bottomRight.x) ||
           (position.y + offset.y > m_bottomRight.y);
}