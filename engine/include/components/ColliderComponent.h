//
// Created by inkih on 6/12/25.
//

#ifndef POKEMONGAMEENGINE_COLLIDER_H
#define POKEMONGAMEENGINE_COLLIDER_H
#include "Component.h"

class CollisionComponent: public Component {
    private:
        int m_width;
        int m_height;

    public:
        CollisionComponent(const int width, const int height): m_width(width), m_height(height) {};
        void update(int deltaTime) override {};
        void render() override {};
        [[nodiscard]] int getWidth() const {return m_width;};
        [[nodiscard]] int getHeight() const {return m_height;};

};

#endif //POKEMONGAMEENGINE_COLLIDER_H