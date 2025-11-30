```mermaid
classDiagram

Renderer "1"-- "*" Texture
Entity --  Renderer

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
    
    }
    
    class Camera {
    }

```mermaid