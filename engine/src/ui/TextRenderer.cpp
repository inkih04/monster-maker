//
// Created by inkih on 24/12/25.
//
#include "TextRenderer.h"

#include <iostream>
#include <glm/ext/matrix_clip_space.hpp>

#include "GameConfig.h"
#include "ResourceManager.h"

TextRenderer::TextRenderer(const std::string& fontPath, unsigned int fontSize)
    : m_textShader(nullptr) {
    m_textShader = ResourceManager::loadShader("../src/graphics/Shader/text.vert", "../src/graphics/Shader/text.frag");
    m_textShader->use();
    m_textShader->setMat4("projection", glm::ortho(0.0f, static_cast<float>(GameConfig::Width), 0.0f, static_cast<float>(GameConfig::Height)));

    if (FT_Init_FreeType(&m_ft)) {
        std::cerr << "ERROR::FREETYPE: Could not init FreeType Library" << std::endl;
        return;
    }

    if (FT_New_Face(m_ft, fontPath.c_str(), 0, &m_face)) {
        std::cerr << "ERROR::FREETYPE: Failed to load font: " << fontPath << std::endl;
        return;
    }

    FT_Set_Pixel_Sizes(m_face, 0, fontSize);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

    for (unsigned char c = 0; c < 128; c++) {
        if (FT_Load_Char(m_face, c, FT_LOAD_RENDER)) {
            std::cerr << "ERROR::FREETYPE: Failed to load Glyph for char: " << c << std::endl;
            continue;
        }

        GLuint texture;
        glGenTextures(1, &texture);
        glBindTexture(GL_TEXTURE_2D, texture);
        glTexImage2D(
            GL_TEXTURE_2D,
            0,
            GL_RED,
            m_face->glyph->bitmap.width,
            m_face->glyph->bitmap.rows,
            0,
            GL_RED,
            GL_UNSIGNED_BYTE,
            m_face->glyph->bitmap.buffer
        );

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

        Character character = {
            texture,
            glm::ivec2(m_face->glyph->bitmap.width, m_face->glyph->bitmap.rows),
            glm::ivec2(m_face->glyph->bitmap_left, m_face->glyph->bitmap_top),
            static_cast<GLuint>(m_face->glyph->advance.x)
        };

        m_characters.insert(std::pair<char, Character>(c, character));
    }

    glBindTexture(GL_TEXTURE_2D, 0);

    FT_Done_Face(m_face);
    FT_Done_FreeType(m_ft);

    initRenderData();

    std::cout << "TextRenderer initialized with font: " << fontPath << std::endl;
}

TextRenderer::~TextRenderer() {
    glDeleteVertexArrays(1, &m_VAO);
    glDeleteBuffers(1, &m_VBO);

    for (auto& pair : m_characters) {
        glDeleteTextures(1, &pair.second.textureID);
    }
}

void TextRenderer::initRenderData() {
    glGenVertexArrays(1, &m_VAO);
    glGenBuffers(1, &m_VBO);

    glBindVertexArray(m_VAO);
    glBindBuffer(GL_ARRAY_BUFFER, m_VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(float) * 6 * 4, nullptr, GL_DYNAMIC_DRAW);

    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 4, GL_FLOAT, GL_FALSE, 4 * sizeof(float), 0);

    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);
}

void TextRenderer::renderText(const std::string& text, glm::vec2 position, float scale, glm::vec3 color) {

    if (!m_textShader) {
        std::cerr << "ERROR::TextRenderer: No shader configured" << std::endl;
        return;
    }

    m_textShader->use();
    m_textShader->setVec3("textColor", color);
    glActiveTexture(GL_TEXTURE0);
    glBindVertexArray(m_VAO);

    float x = position.x;
    float y = position.y;

    for (char c : text) {
        Character ch = m_characters[c];

        float xpos = x + ch.bearing.x * scale;
        float ypos = y - (ch.size.y - ch.bearing.y) * scale;

        float w = ch.size.x * scale;
        float h = ch.size.y * scale;

        float vertices[6][4] = {
            { xpos,     ypos + h,   0.0f, 0.0f },
            { xpos,     ypos,       0.0f, 1.0f },
            { xpos + w, ypos,       1.0f, 1.0f },

            { xpos,     ypos + h,   0.0f, 0.0f },
            { xpos + w, ypos,       1.0f, 1.0f },
            { xpos + w, ypos + h,   1.0f, 0.0f }
        };

        glBindTexture(GL_TEXTURE_2D, ch.textureID);

        glBindBuffer(GL_ARRAY_BUFFER, m_VBO);
        glBufferSubData(GL_ARRAY_BUFFER, 0, sizeof(vertices), vertices);
        glBindBuffer(GL_ARRAY_BUFFER, 0);

        glDrawArrays(GL_TRIANGLES, 0, 6);

        x += (ch.advance >> 6) * scale;
    }

    glBindVertexArray(0);
    glBindTexture(GL_TEXTURE_2D, 0);
}

float TextRenderer::getTextWidth(const std::string& text, float scale) const {
    float width = 0.0f;

    for (char c : text) {
        auto it = m_characters.find(c);
        if (it != m_characters.end()) {
            width += (it->second.advance >> 6) * scale;
        }
    }

    return width;
}

float TextRenderer::getTextHeight(float scale) const {
    float maxHeight = 0.0f;

    for (const auto& pair : m_characters) {
        float height = pair.second.size.y * scale;
        if (height > maxHeight) {
            maxHeight = height;
        }
    }

    return maxHeight;
}