//
// Created by inkih on 6/12/25.
//

#ifndef POKEMONGAMEENGINE_POSITION_H
#define POKEMONGAMEENGINE_POSITION_H
#include "Component.h"
#include "Position.h"

class PositionComponent: public Component {
    private:
                float m_x;
                float m_y;
                float m_rotation;
    public:
        PositionComponent(const float x, const float y, const float rotation): m_x(x), m_y(y), m_rotation(rotation)  {};
        explicit PositionComponent(const Position& position): m_x(position.x), m_y(position.y), m_rotation(position.rotation) {}
        void update(int deltaTime) override {};
        void render() override {};
        void setPosition(const float x, const float y, const float rotation) {m_x = x;m_y = y; m_rotation = rotation;};
        void setPosition(const Position& position) {m_x = position.x; m_y = position.y; m_rotation = position.rotation;}

        Position getPosition() {return Position(m_x, m_y, m_rotation);}
};

#endif //POKEMONGAMEENGINE_POSITION_H