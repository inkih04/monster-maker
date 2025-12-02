//
// Created by inkih on 30/11/25.
//

#ifndef POKEMONGAMEENGINE_TEXTURE_H
#define POKEMONGAMEENGINE_TEXTURE_H
#include <GL/glew.h>
#include <string>


class Texture {
    private:
        GLuint m_textureID;
        int m_width;
        int m_height;
        int m_channels;
        std::string m_path;

    public:
        explicit Texture(const std::string& path);
        ~Texture();
        Texture(const Texture&) = delete;
        Texture& operator=(const Texture&) = delete;
        GLuint getID() const {return m_textureID;};
        void bind(GLuint slot) const;
        void unbind() const;
        int getWidth() const {return m_width;}
        int getHeight() const {return m_height;}
        std::string& getPath() {return m_path;}

};

#endif //POKEMONGAMEENGINE_TEXTURE_H