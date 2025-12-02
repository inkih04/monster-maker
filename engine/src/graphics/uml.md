```mermaid
classDiagram

Renderer "1"-- "*" Texture
Entity --  Renderer
Renderer "1"-- "1" Shader

    class Entity {
    }
    
    class Renderer {
    
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
    }

```mermaid