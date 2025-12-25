//
// Created by inkih on 25/12/25.
//

#include "DialogBox.h"
#include <sstream>

#include "GameConfig.h"
#include "Renderer.h"
#include "ResourceManager.h"

DialogBox::DialogBox(glm::vec2 position, glm::vec2 size, const std::string& pathFont , unsigned int fontSize)
    : m_position(position), m_size(size), m_backgroundColor(1.0f, 1.0f, 1.0f)  , m_borderColor(0.0f, 0.0f, 0.0f)
    , m_textColor(0.0f, 0.0f, 0.0f), m_borderThickness(3.0f), m_currentCharIndex(0), m_timeAccumulator(0.0f)
    , m_textSpeed(DialogSpeed::NORMAL), m_isActive(false), m_isComplete(false), m_isVisible(false), m_padding(20.0f)
    , m_maxCharsPerLine(40), m_textRenderer(nullptr), m_renderer(nullptr) {
        m_textRenderer = ResourceManager::loadFont(pathFont , fontSize);
        m_renderer = &Renderer::getInstance();
    }

void DialogBox::setText(const std::string& text) {
    m_fullText = text;
    m_currentDisplayText = "";
    m_currentCharIndex = 0;
    m_timeAccumulator = 0.0f;
    m_isComplete = false;
    wrapText();
}

void DialogBox::start() {
    m_isActive = true;
    m_isVisible = true;
    m_currentCharIndex = 0;
    m_currentDisplayText = "";
    m_timeAccumulator = 0.0f;
    m_isComplete = false;
}

void DialogBox::update(float deltaTime) {
    if (!m_isActive || m_isComplete) return;

    if (m_textSpeed == DialogSpeed::INSTANT) {
        m_currentDisplayText = m_fullText;
        m_currentCharIndex = m_fullText.length();
        m_isComplete = true;
        return;
    }

    m_timeAccumulator += deltaTime;

    float charDelay = static_cast<float>(m_textSpeed);

    while (m_timeAccumulator >= charDelay && m_currentCharIndex < m_fullText.length()) {
        m_currentDisplayText += m_fullText[m_currentCharIndex];
        m_currentCharIndex++;
        m_timeAccumulator -= charDelay;

        if (m_currentCharIndex >= m_fullText.length()) {
            m_isComplete = true;
            break;
        }
    }
}

void DialogBox::render() {
    if (!m_isVisible) return;
    drawBackground();
    drawBorder();
    drawText();
}

void DialogBox::drawBackground() {
    m_renderer->draw(
        m_position,
        m_size,
        0.0f,
        m_backgroundColor
    );
}

void DialogBox::drawBorder() {

    m_renderer->draw(
        glm::vec2(m_position.x, m_position.y),
        glm::vec2(m_size.x, m_borderThickness),
        0.0f,
        m_borderColor
    );


    m_renderer->draw(
        glm::vec2(m_position.x, m_position.y + m_size.y - m_borderThickness),
        glm::vec2(m_size.x, m_borderThickness),
        0.0f,
        m_borderColor
    );


    m_renderer->draw(
        glm::vec2(m_position.x, m_position.y),
        glm::vec2(m_borderThickness, m_size.y),
        0.0f,
        m_borderColor
    );


    m_renderer->draw(
        glm::vec2(m_position.x + m_size.x - m_borderThickness, m_position.y),
        glm::vec2(m_borderThickness, m_size.y),
        0.0f,
        m_borderColor
    );
}

void DialogBox::drawText() {
    if (m_currentDisplayText.empty()) return;

    float textX = m_position.x + m_padding;
    float textY = m_position.y + m_padding;
    float lineHeight = m_textRenderer->getTextHeight(1.0f) + 5.0f;

    std::stringstream ss(m_currentDisplayText);
    std::string word;
    std::string currentLine;
    float currentLineWidth = 0.0f;
    float maxLineWidth = m_size.x - (m_padding * 2);

    int lineNumber = 0;

    while (ss >> word) {
        float wordWidth = m_textRenderer->getTextWidth(word + " ", 1.0f);

        if (currentLineWidth + wordWidth > maxLineWidth && !currentLine.empty()) {
            m_textRenderer->renderText(
                currentLine,
                glm::vec2( textX,
                textY + (lineNumber * lineHeight)),
                1.0f,
                m_textColor
            );

            currentLine = word + " ";
            currentLineWidth = wordWidth;
            lineNumber++;
        } else {
            currentLine += word + " ";
            currentLineWidth += wordWidth;
        }
    }

    // Renderizar la última línea
    if (!currentLine.empty()) {
        m_textRenderer->renderText(
            currentLine,
            glm::vec2(textX,
            textY + (lineNumber * lineHeight)),
            1.0f,
            m_textColor
        );
    }
}

void DialogBox::complete() {
    m_currentDisplayText = m_fullText;
    m_currentCharIndex = m_fullText.length();
    m_isComplete = true;
}

void DialogBox::hide() {
    m_isVisible = false;
}

void DialogBox::show() {
    m_isVisible = true;
}

void DialogBox::wrapText() {
    m_lines.clear();

    std::stringstream ss(m_fullText);
    std::string word;
    std::string currentLine;

    while (ss >> word) {
        if (currentLine.length() + word.length() + 1 > static_cast<size_t>(m_maxCharsPerLine)) {
            if (!currentLine.empty()) {
                m_lines.push_back(currentLine);
                currentLine = word;
            } else {
                m_lines.push_back(word);
            }
        } else {
            if (!currentLine.empty()) currentLine += " ";
            currentLine += word;
        }
    }

    if (!currentLine.empty()) {
        m_lines.push_back(currentLine);
    }
}

void DialogBox::setSpeed(DialogSpeed speed) {
    m_textSpeed = speed;
}

void DialogBox::setTextColor(glm::vec3 color) {
    m_textColor = color;
}

void DialogBox::setBackgroundColor(glm::vec3 color) {
    m_backgroundColor = color;
}

void DialogBox::setBorderColor(glm::vec3 color) {
    m_borderColor = color;
}

void DialogBox::setBorderThickness(float thickness) {
    m_borderThickness = thickness;
}

void DialogBox::setPosition(glm::vec2 position) {
    m_position = position;
}

void DialogBox::setSize(glm::vec2 size) {
    m_size = size;
}

void DialogBox::setPadding(float padding) {
    m_padding = padding;
}

void DialogBox::centerOnScreen() {
    m_position.x = (GameConfig::Width  - m_size.x) / 2.0f;
    m_position.y = (GameConfig::Height - m_size.y) / 2.0f;
}

void DialogBox::placeBottom(float margin = 20.0f) {
    m_position.x = (GameConfig::Width - m_size.x) / 2.0f;
    m_position.y = GameConfig::Height - m_size.y - margin;
}

