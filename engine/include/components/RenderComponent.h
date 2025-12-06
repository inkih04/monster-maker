//
// Created by inkih on 6/12/25.
//

#ifndef POKEMONGAMEENGINE_RENDER_H
#define POKEMONGAMEENGINE_RENDER_H

#include "Component.h"
#include "string"
#include "SpriteRect.h"

class RenderComponent: public Component {
    private:
        std::string m_spriteSheetPath;
        SpriteRect spriteRect;

    public:
        void render() override;
        void update(int deltaTime) override;
        RenderComponent(const std::string& sheetPath, const SpriteRect& spriteRect): m_spriteSheetPath(sheetPath), spriteRect(spriteRect) {};
        RenderComponent(const std::string& sheetPath, float x, float y): m_spriteSheetPath (sheetPath), spriteRect(x, y) {};



};

#endif //POKEMONGAMEENGINE_RENDER_H