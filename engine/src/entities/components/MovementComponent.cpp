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
#include "CollisionService.h"
#include "ScriptComponet.h"


void MovementComponent::updateAnimation(const Position &pos, Position oldPos) {
    if (checkDirectionUp(pos, oldPos)) {
        if (m_animationComponent) m_animationComponent->play(animationToString(BasicAnimation::MOVEUP));
        m_lastDirection = Direction::TOP;
    }
    else if (checkDirectionDown(pos, oldPos)) {
        if (m_animationComponent) m_animationComponent->play(animationToString(BasicAnimation::MOVEDOWN));
        m_lastDirection = Direction::BOTTOM;
    }
    else if (checkDirectionRight(pos, oldPos)) {
        if (m_animationComponent) m_animationComponent->play(animationToString(BasicAnimation::MOVERIGHT));
        m_lastDirection = Direction::RIGHT;
    }
    else if (checkDirectionLeft(pos, oldPos)) {
        if (m_animationComponent) m_animationComponent->play(animationToString(BasicAnimation::MOVELEFT));
        m_lastDirection = Direction::LEFT;
    }
    else {
        if (m_animationComponent) m_animationComponent->play(getStandAnimation());
    }
}

void MovementComponent::handleCollision(const Position &pos, CollisionService *collisionService, CollisionComponent *collider, bool &canMove) {
    if (collider && collider->getIsTrigger()) {
        Entity *entityAtPos = collisionService->getEntityAtArea(pos, collider->getWidth(), collider->getHeight(), m_entity);
        if (entityAtPos && entityAtPos != m_lastCollidedEntity) {
            auto* script = static_cast<ScriptComponent*>(entityAtPos->getComponent(ComponentsType::SCRIPT));
            if (script) {
                script->executeOnTriggerEnter(m_entity);
            }
            m_lastCollidedEntity = entityAtPos;
        }
        else {
            m_lastCollidedEntity = nullptr;
        }
    }
    else if (collider) {
        canMove = collisionService->isAreaFree(pos, collider->getWidth(), collider->getHeight(), m_entity);
        auto* script = static_cast<ScriptComponent*>(m_entity->getComponent(ComponentsType::SCRIPT));
        if (!canMove) {
            Entity *entityAtPos = collisionService->getEntityAtArea(pos, collider->getWidth(), collider->getHeight(), m_entity);
            auto* entityCollisionedScript = static_cast<ScriptComponent*>(entityAtPos->getComponent(ComponentsType::SCRIPT));
            if (script && entityAtPos && entityAtPos != m_lastCollidedEntity) {
                script->executeOnCollision(entityAtPos);
            }
            if (entityAtPos && entityCollisionedScript && entityAtPos != m_lastCollidedEntity) {
                entityCollisionedScript->executeOnCollision(m_entity);
            }
            m_lastCollidedEntity = entityAtPos;
        }
        else {
            m_lastCollidedEntity = nullptr;
        }
    }
}

void MovementComponent::move(const Position& pos) {
    if (!m_entity) return;

    if (!m_positionComponent) m_positionComponent = getPosition();
    if (!m_animationComponent) m_animationComponent = getAnimation();
    if (!m_positionComponent) return;

    auto* collisionService = m_entity->getCollisionService();
    if (!collisionService) return;

    Position oldPos = m_positionComponent->getPosition();
    auto* collider = static_cast<CollisionComponent*>(m_entity->getComponent(ComponentsType::COLLIDER));
    bool canMove = true;

    handleCollision(pos, collisionService, collider, canMove);

    if (canMove) {
        updateAnimation(pos, oldPos);
        collisionService->updatePositionCollisionCache(oldPos, pos, m_entity);
        m_positionComponent->setPosition(pos);
    }
    else {
        if (m_animationComponent) m_animationComponent->play(getStandAnimation());
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

PositionComponent* MovementComponent::getPosition() const {;
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