```mermaid
classDiagram

Renderer "1"-- "*" Texture
Entity --  Renderer
Entity -- ResourceManager
Renderer "1"-- "*" Shader
Renderer "1"-- "*" Camera

    class ResourceManager {
        -static unordered_map~string, unique_ptr~ Texture~~ textures
        -static unordered_map~string, unique_ptr~Shader~ ~ shaders
        - static std::unordered_map<std::string, std::unique_ptr<TextRenderer>> m_fonts
        +static loadTexture(path)
        +static loadShader(vertexShaderPath, fragmentShaderPath)
        + static TextRenderer* loadFont(const std::string& fontPath, unsigned int fontSize)
    }

    class Entity {
       -unordered_map~ComponentsType, unique_ptr~Component~ m_components
       
       +addComponent(unique_ptr~Component~, ComponentsType type) void
       +getComponent(ComponentsType type) Component*
       +update(int deltaTime)
       +hasComponent(ComponentsType type) bool
       +render() 
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
      +void draw(glm::vec2 position, glm::vec2 size, float rotation = 0.0f, glm::vec4 color = glm::vec4(1.0f), SpriteRect spriteRect = null)
    +void drawSprite(const string& texturePath, glm::vec2 position, glm::vec2 size, float rotation = 0.0f, glm::vec4 color = glm::vec4(1.0f), SpriteRect spriteRect = null)
    }
    
    class Texture {
    -GLuint m_textureID
    -int m_width
    -int m_height
    -int m_channels
    -string m_path
    +Texture(string path)
    +~Texture(string path)delete
    +~Texture()
    +Texture& operator=(const Texture&)delete
    
    +GLuint getID()
    +void bind(GLuint slot = 0) 
    +void unbind() 
    +int getWidth() 
    +int getHeight() 
    +string getPath()
    }
    
    class Shader {
    -GLuint m_programID
    -unordered_map~string, GLint~ m_uniformLocationCache
    -GLint getUniformLocation(const string& name)
    +Shader(const string& vertexPath, const string& fragmentPath)
    +~Shader()
    +Shader& operator=(const Shader&)delete
    +use()
    +setInt(const string& name, int value)
    +setFloat(const string& name, float value)
    +setBool(const string& name, bool value)
    +setMat4(const string& name, const glm::mat4& matrix)
    +setMat3(const string& name, const glm::mat4& matrix)
    +setVec3(const string& name, const glm::vec3& vector)
    +setVec2(const string& name, const glm::vec3& vector)
    +setVec4(const string& name, const glm::vec3& vector)
    +Gluint getID()
    }
    
    class Camera {
    +Camera(float width, float height)
    +~Camera()
    +glm::mat4 getViewMatrix()
    +glm::mat4 getProjectionMatrix()
    +void setPosition(const glm::vec2& position)
    +glm::vec2 getPosition()
    +void setZoom(float zoom)
    +float getZoom()
    -glm::mat4 m_view
    -glm::mat4 m_projection
    -glm::vec2 m_position
    -float m_zoom
    -void updateViewMatrix()
    -float m_width
    -float m_height
    }

```mermaid