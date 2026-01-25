//
// Created by inkih on 12/12/25.
//

#ifndef POKEMONGAMEENGINE_MOVEMENTCOMPONENT_H
#define POKEMONGAMEENGINE_MOVEMENTCOMPONENT_H
#include "AnimationComponent.h"
#include "Component.h"
#include "Direction.h"
#include "Position.h"
#include "PositionComponent.h"
#include "enums/BasicAnimation.h"

class MovementComponent : public Component {
    private:
        bool checkDirectionUp(Position newPos, Position oldPos) const;
        bool checkDirectionDown(Position newPos, Position oldPos) const;
        bool checkDirectionRight(Position newPos, Position oldPos) const;
        bool checkDirectionLeft(Position newPos, Position oldPos) const;
        Direction m_lastDirection = Direction::UNKNOWN;
        AnimationComponent *getAnimation() const;
        PositionComponent *getPosition() const;
        std::string getStandAnimation() const;
        AnimationComponent* m_animationComponent;
        PositionComponent *m_positionComponent;


    public:
        MovementComponent():m_animationComponent(nullptr), m_positionComponent(nullptr){};
        void move(const Position& pos);



        void update(int deltaTime) override {};
        void render() override {};
};

#endif //POKEMONGAMEENGINE_MOVEMENTCOMPONENT_H