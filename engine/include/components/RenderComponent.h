//
// Created by inkih on 6/12/25.
//

#ifndef POKEMONGAMEENGINE_RENDER_H
#define POKEMONGAMEENGINE_RENDER_H

#include <glm/vec2.hpp>

#include "Component.h"
#include "string"
#include "SpriteRect.h"

class RenderComponent: public Component {
    private:
        std::string m_spriteSheetPath;
        SpriteRect spriteRect;
        float m_height;
        float m_width;
        glm::vec2 getPrettyPosition() const;
        void draw() const;
        bool isActive;

    public:
        void setSpriteRect(const SpriteRect& rect) { spriteRect = rect; }
        void render() override;
        void update(int deltaTime) override;
        RenderComponent(const std::string& sheetPath, const SpriteRect& spriteRect, const float width, const float height): m_spriteSheetPath(sheetPath), spriteRect(spriteRect), m_height(width), m_width(height), isActive(true) {};
        RenderComponent(const std::string& sheetPath, const float x, const float y,const float w, const float h ,const float width, const float height): m_spriteSheetPath (sheetPath), spriteRect(x, y, w, h), m_width(width), m_height(height), isActive(true) {};
        void setIsActive(bool active) {isActive = active;}
        bool getIsActive() {return isActive;}



};

#endif //POKEMONGAMEENGINE_RENDER_H