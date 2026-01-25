//
// Created by inkih on 12/12/25.
//

#include "MovementComponent.h"

#include <iostream>

#include "AnimationComponent.h"
#include "Entity.h"
#include "PositionComponent.h"
#include <string>

#include "ColliderComponent.h"


MovementComponent::MovementComponent() {
    m_animationComponent = getAnimation();
    m_positionComponent = getPosition();
    m_entityManager = m_entity->;
}


void MovementComponent::move(const Position& pos) {
    if (!m_positionComponent) m_positionComponent = getPosition();
    if (!m_animationComponent) m_animationComponent = getAnimation();
    if (!m_positionComponent || !m_animationComponent) return;

    Position oldPos = m_positionComponent->getPosition();

    auto* collider = static_cast<CollisionComponent*>(m_entity->getComponent(ComponentsType::COLLIDER));

    // Si no tiene collider, se mueve libremente.
    // Si tiene, le pedimos permiso al EntityManager (isAreaFree)
    bool canMove = true;
    if (collider) {
        canMove = m_entityManager->isAreaFree(pos, collider->getWidth(), collider->getHeight(), m_entity);
    }

    if (canMove) {
        if (checkDirectionUp(pos, oldPos)) {
            m_animationComponent->play(animationToString(BasicAnimation::MOVEUP));
            m_lastDirection = Direction::TOP;
        }
        else if (checkDirectionDown(pos, oldPos)) {
            m_animationComponent->play(animationToString(BasicAnimation::MOVEDOWN));
            m_lastDirection = Direction::BOTTOM;
        }
        else if (checkDirectionRight(pos, oldPos)) {
            m_animationComponent->play(animationToString(BasicAnimation::MOVERIGHT));
            m_lastDirection = Direction::RIGHT;
        }
        else if (checkDirectionLeft(pos, oldPos)) {
            m_animationComponent->play(animationToString(BasicAnimation::MOVELEFT));
            m_lastDirection = Direction::LEFT;
        }
        m_entityManager->updatePositionCollisionCache(oldPos, pos, m_entity);
        m_positionComponent->setPosition(pos);
    }
    else {
        m_animationComponent->play(getStandAnimation());
    }
}

bool MovementComponent::checkDirectionUp(Position newPos, Position oldPos) const {
    return newPos.y < oldPos.y;
}

bool MovementComponent::checkDirectionDown(Position newPos, Position oldPos) const {
    return newPos.y > oldPos.y;
}

bool MovementComponent::checkDirectionRight(Position newPos, Position oldPos) const {
    return newPos.x > oldPos.x;

}

bool MovementComponent::checkDirectionLeft(Position newPos, Position oldPos) const {
    return newPos.x < oldPos.x;
}

AnimationComponent* MovementComponent::getAnimation() const {
    auto component = m_entity->getComponent(ComponentsType::ANIMATION);
    return dynamic_cast<AnimationComponent*>(component);
}

PositionComponent* MovementComponent::getPosition() const {
    auto component = m_entity->getComponent(ComponentsType::POSITION);
    return dynamic_cast<PositionComponent*>(component);
}

std::string MovementComponent::getStandAnimation() const {
    if (m_lastDirection == Direction::BOTTOM) return animationToString(BasicAnimation::STANDDOWN);
    else if (m_lastDirection == Direction::LEFT) return animationToString(BasicAnimation::STANDLEFT);
    else if (m_lastDirection == Direction::RIGHT) return animationToString(BasicAnimation::STANDRIGHT);
    else if (m_lastDirection == Direction::TOP) return animationToString(BasicAnimation::STANDUP);
    return animationToString(BasicAnimation::STANDDOWN);
}
