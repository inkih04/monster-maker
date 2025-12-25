```mermaid

classDiagram
class DialogBox {
- glm::vec2 m_position
- glm::vec2 m_size
- glm::vec3 m_backgroundColor
- glm::vec3 m_borderColor
- glm::vec3 m_textColor
- float m_borderThickness
- std::string m_fullText
- std::string m_currentDisplayText
- size_t m_currentCharIndex
- float m_timeAccumulator
- DialogSpeed m_textSpeed
- bool m_isActive
- bool m_isComplete
- bool m_isVisible
- float m_padding
- std::vector<std::string> m_lines
- int m_maxCharsPerLine
- TextRenderer* m_textRenderer
- Renderer* m_renderer
- void wrapText()
- void drawBackground()
- void drawBorder()
- void drawText()
+ DialogBox(glm::vec2 position, glm::vec2 size, const std::string& pathFont , unsigned int fontSize)
+ void setText(const std::string& text)
+ void start()
+ void update(float deltaTime)
+ void render()
+ void complete()
+ void hide()
+ void show()
+ void setSpeed(DialogSpeed speed)
+ void setTextColor(glm::vec3 color)
+ void setBackgroundColor(glm::vec3 color)
+ void setBorderColor(glm::vec3 color)
+ void setBorderThickness(float thickness)
+ void setPosition(glm::vec2 position)
+ void setSize(glm::vec2 size)
+ void setPadding(float padding)
+ bool isActive()
+ bool isComplete()
+ bool isVisible()
+ DialogSpeed getSpeed()
+ std::string getCurrentText()
}

class TextRenderer {
    - std::map<char, Character> m_characters
    - Shader* m_textShader
    - GLuint m_VAO
    - GLuint m_VBO
    - FT_Library m_ft
    - FT_Face m_face
    - void initRenderData()
    + TextRenderer(const std::string& pathFont , unsigned int fontSize)
    + void renderText(const std::string& text, glm::vec2 position, float scale, glm::vec3 color)
    + float getTextWidth(const std::string& text, float scale) const
    + float getTextHeight(float scale) const
    + ~TextRenderer()
}

    class Renderer {
    -GLuint m_quadVAO
    -GLuint m_quadVBO
    -*Shader m_currentShader
    -Camera* m_activeCamera
    -void initRenderData()
    -void updateCameraUniforms()
    -Renderer()
    -~Renderer()
    +Renderer* getInstance()
    +void loadShader(const string& name, const string& vertexPath, const string& fragmentPath)
    +void setShader(const string& name)
    +void setCamera(Camera* camera)
    +void drawSprite(const string& texturePath, glm::vec2 position, glm::vec2 size, float rotation = 0.0f, glm::vec4 color = glm::vec4(1.0f), SpriteRect spriteRect = null)
    +void draw(glm::vec2 position, glm::vec2 size, float rotation = 0.0f, glm::vec4 color = glm::vec4(1.0f), SpriteRect spriteRect = null)
    
    }


    DialogBox --> TextRenderer 
    DialogBox --> Renderer 
```mermaid