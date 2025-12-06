//
// Created by inkih on 6/12/25.
//

#ifndef POKEMONGAMEENGINE_COLLIDER_H
#define POKEMONGAMEENGINE_COLLIDER_H
#include "Component.h"

class CollisionComponent: public Component {
    private:
        float m_width;
        float m_height;

    public:
        CollisionComponent(const float width, const float height): m_width(width), m_height(height) {};
        void update(int deltaTime) override {};
        void render() override {};

};

#endif //POKEMONGAMEENGINE_COLLIDER_H