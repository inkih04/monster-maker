//
// Created by inkih on 12/12/25.
//

#include "MovementComponent.h"

#include <iostream>

#include "AnimationComponent.h"
#include "Entity.h"
#include "PositionComponent.h"
#include <string>

void MovementComponent::update(int deltaTime) {
    //todo: ejecutar un script de lua y/o dejar algo preecho en c++ para comprobar cuando la entity debe desplazarse
}

void MovementComponent::move(Position pos) {
    PositionComponent* positionComponent = getPosition();
    if (!positionComponent) return;

    Position oldPos = positionComponent->getPosition();
    AnimationComponent* animation = getAnimation();

    if (checkDirectionUp(pos, oldPos)) {
        //todo:Comprobar colisiones
        if (animation) animation->play(animationToString(BasicAnimation::MOVEUP));
        m_lastDirection = Direction::TOP;
    }
    else if (checkDirectionDown(pos, oldPos)) {
        //todo:Comprobar colisiones
        if (animation) animation->play(animationToString(BasicAnimation::MOVEDOWN));
        m_lastDirection = Direction::BOTTOM;
    }
    else if (checkDirectionRight(pos, oldPos)) {
        //todo:Comprobar colisiones
        if (animation) animation->play(animationToString(BasicAnimation::MOVERIGHT));
        m_lastDirection = Direction::RIGHT;
    }
    else if (checkDirectionLeft(pos, oldPos)) {
        //todo:Comprobar colisiones
        if (animation) animation->play(animationToString(BasicAnimation::MOVELEFT));
        m_lastDirection = Direction::LEFT;
    }
    else {
        if (animation) animation->play(getStandAnimation());
    }

    positionComponent->setPosition(pos);
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

//todo: guardar estos punteros en variables miembro para no tener que buscarlos cada vez
AnimationComponent* MovementComponent::getAnimation() const {
    auto component = m_entity->getComponent(ComponentsType::ANIMATION);
    return dynamic_cast<AnimationComponent*>(component);
}

PositionComponent* MovementComponent::getPosition() const {
    auto component = m_entity->getComponent(ComponentsType::POSITION);
    return dynamic_cast<PositionComponent*>(component);
}
//todo:------------------------------------------------------------------------------

std::string MovementComponent::getStandAnimation() const {
    if (m_lastDirection == Direction::BOTTOM) return animationToString(BasicAnimation::STANDDOWN);
    else if (m_lastDirection == Direction::LEFT) return animationToString(BasicAnimation::STANDLEFT);
    else if (m_lastDirection == Direction::RIGHT) return animationToString(BasicAnimation::STANDRIGHT);
    else if (m_lastDirection == Direction::TOP) return animationToString(BasicAnimation::STANDUP);
    return animationToString(BasicAnimation::STANDDOWN);
}
