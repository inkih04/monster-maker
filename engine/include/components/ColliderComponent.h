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
        int m_offsetX;
        int m_offsetY;
        bool isTrigger;

    public:
        CollisionComponent(const int width, const int height, int ofX = 0, int ofY = 0, bool trigger = false): m_width(width), m_height(height), m_offsetX(ofX), m_offsetY(ofY), isTrigger(trigger) {};
        void update(int deltaTime) override {};
        void render() override {};
        [[nodiscard]] int getOffsetX() const {return m_offsetX;};
        [[nodiscard]] int getOffsetY() const {return m_offsetY;};
        [[nodiscard]] int getWidth() const {return m_width;};
        [[nodiscard]] int getHeight() const {return m_height;};
        [[nodiscard]] bool getIsTrigger() const {return isTrigger;};

};

#endif //POKEMONGAMEENGINE_COLLIDER_H