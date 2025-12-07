//
// Created by inkih on 6/12/25.
//

#include "RenderComponent.h"
#include "Renderer.h"
#include "Camera.h"
#include <memory>

#include "Entity.h"
#include "Position.h"
#include "PositionComponent.h"

void RenderComponent::render() {
    Renderer::getInstance().setShader("sprite");
    Renderer::getInstance().drawSprite(m_spriteSheetPath,  getPrettyPosition(), glm::vec2(m_width, m_height));
}

void RenderComponent::update(int deltaTime) {
    // Update logic if necessary
}


glm::vec2  RenderComponent::getPrettyPosition() const {
    Component *defaultComponent = m_entity->getComponent(ComponentsType::POSITION);
    auto positionComponent = dynamic_cast<PositionComponent*>(defaultComponent);
    Position position = positionComponent->getPosition();

    return glm::vec2(position.x, position.y);
}