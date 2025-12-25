//
// Created by inkih on 24/12/25.
//

#ifndef POKEMONGAMEENGINE_TEXTRENDERR_H
#define POKEMONGAMEENGINE_TEXTRENDERR_H
#include <map>
#include <string>
#include <ft2build.h>
#include FT_FREETYPE_H
#include "Character.h"
#include "Shader.h"

class TextRenderer {
    private:
        std::map<char, Character> m_characters;
        Shader* m_textShader;
        GLuint m_VAO, m_VBO;
        FT_Library m_ft;
        FT_Face m_face;
        void initRenderData();


    public:
        TextRenderer(const std::string& pathFont , unsigned int fontSize);

        virtual void renderText(const std::string& text, glm::vec2 position, float scale, glm::vec3 color);

        virtual float getTextWidth(const std::string& text, float scale) const;

        virtual float getTextHeight(float scale) const;
        ~TextRenderer();
};

#endif //POKEMONGAMEENGINE_TEXTRENDERR_H