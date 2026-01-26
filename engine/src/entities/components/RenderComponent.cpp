//
// Created by inkih on 6/12/25.
//

#include "RenderComponent.h"
#include "Renderer.h"

#include "Entity.h"
#include "Position.h"
#include "PositionComponent.h"

void RenderComponent::render() {
    Renderer::getInstance().setShader("sprite");
    if (!isActive) return;
    draw();
}

void RenderComponent::update(int deltaTime) {
    // Update logic if necessary
}


glm::vec2  RenderComponent::getPrettyPosition() const {
    Component *defaultComponent = m_entity->getComponent(ComponentsType::POSITION);
    if (!defaultComponent) return glm::vec2(0.0f, 0.0f);

    auto positionComponent = dynamic_cast<PositionComponent*>(defaultComponent);
    Position position = positionComponent->getPosition();

    return glm::vec2(position.x, position.y);
}

void RenderComponent::draw() const {
    if (spriteRect.width == -1 && spriteRect.height == -1 && spriteRect.x == -1 && spriteRect.y == -1) {
        Renderer::getInstance().drawSprite(m_spriteSheetPath,  getPrettyPosition(), glm::vec2(m_height, m_width));
    } else {
        Renderer::getInstance().drawSprite(m_spriteSheetPath, getPrettyPosition(), glm::vec2(m_height, m_width), 0.0f, glm::vec3(1.0f), &spriteRect);
    }
}