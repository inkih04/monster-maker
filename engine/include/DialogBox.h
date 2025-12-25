//
// Created by inkih on 24/12/25.
//

#ifndef POKEMONGAMEENGINE_DIALOGBOX_H
#define POKEMONGAMEENGINE_DIALOGBOX_H

#include <string>
#include <glm/vec2.hpp>
#include <glm/vec3.hpp>

#include "Renderer.h"
#include "TextRenderer.h"
#include "enums/DialogSpeed.h"

class DialogBox {
    private:
        glm::vec2 m_position;
        glm::vec2 m_size;

        glm::vec3 m_backgroundColor;
        glm::vec3 m_borderColor;
        glm::vec3 m_textColor;
        float m_borderThickness;

        std::string m_fullText;
        std::string m_currentDisplayText;
        size_t m_currentCharIndex;

        float m_timeAccumulator;
        DialogSpeed m_textSpeed;

        bool m_isActive;
        bool m_isComplete;
        bool m_isVisible;

        float m_padding;

        std::vector<std::string> m_lines;
        int m_maxCharsPerLine;

        TextRenderer* m_textRenderer;
        Renderer* m_renderer;

        void wrapText();
        void drawBackground();
        void drawBorder();
        void drawText();

    public:
        DialogBox(glm::vec2 position, glm::vec2 size, const std::string& pathFont , unsigned int fontSize);

        ~DialogBox() = default;

        void setText(const std::string& text);
        void start();
        void update(float deltaTime);
        void render();
        void complete();
        void hide();
        void show();

        void setSpeed(DialogSpeed speed);
        void setTextColor(glm::vec3 color);
        void setBackgroundColor(glm::vec3 color);
        void setBorderColor(glm::vec3 color);
        void setBorderThickness(float thickness);
        void setPosition(glm::vec2 position);
        void setSize(glm::vec2 size);
        void setPadding(float padding);
        void centerOnScreen();
        void placeBottom(float margin);


        bool isActive() const { return m_isActive; }
        bool isComplete() const { return m_isComplete; }
        bool isVisible() const { return m_isVisible; }
        DialogSpeed getSpeed() const { return m_textSpeed; }
        std::string getCurrentText() const { return m_currentDisplayText; }
};
#endif //POKEMONGAMEENGINE_DIALOGBOX_H