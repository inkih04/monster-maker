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

    public:
        void render() override;
        void update(int deltaTime) override;
        RenderComponent(const std::string& sheetPath, const SpriteRect& spriteRect, const float width, const float height): m_spriteSheetPath(sheetPath), spriteRect(spriteRect), m_height(width), m_width(height) {};
        RenderComponent(const std::string& sheetPath, const float x, const float y,const float w, const float h ,const float width, const float height): m_spriteSheetPath (sheetPath), spriteRect(x, y, w, h), m_width(width), m_height(height) {};




};

#endif //POKEMONGAMEENGINE_RENDER_H