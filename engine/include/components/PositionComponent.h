//
// Created by inkih on 6/12/25.
//

#ifndef POKEMONGAMEENGINE_POSITION_H
#define POKEMONGAMEENGINE_POSITION_H
#include "Component.h"
#include "Direction.h"
#include "Position.h"

class PositionComponent: public Component {
    private:
                float m_x;
                float m_y;
                Direction m_direction;
    public:
        PositionComponent(const float x, const float y): m_x(x), m_y(y), m_direction(Direction::UNKNOWN) {};
        explicit PositionComponent(const Position& position): m_x(position.x), m_y(position.y), m_direction(Direction::UNKNOWN) {};
        void update(int deltaTime) override {};
        void render() override {};
        void setPosition(const float x, const float y) {m_x = x;m_y = y;};
        void setPosition(const Position& position) {m_x = position.x; m_y = position.y;}
        void setDirection(const Direction direction) {m_direction = direction;}
        Direction getDirection() {return m_direction;}

        Position getPosition() {return Position(m_x, m_y);}
};

#endif //POKEMONGAMEENGINE_POSITION_H