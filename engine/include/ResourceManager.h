//
// Created by inkih on 6/12/25.
//

#ifndef POKEMONGAMEENGINE_RESOURCEMANAGER_H
#define POKEMONGAMEENGINE_RESOURCEMANAGER_H

#include <string>
#include "Texture.h"
#include "Shader.h"
#include <unordered_map>
#include <memory>
#include "structs/ShaderPath.h"
#include "TextRenderer.h"

class ResourceManager {
    public:
        static Texture* loadTexture(const std::string& path);
        static Shader* loadShader(const std::string& vertexShaderPath, const std::string& fragmentShaderPath);
        static TextRenderer* loadFont(const std::string& fontPath, unsigned int fontSize);

    private:
        static std::unordered_map<std::string, std::unique_ptr<Texture>> m_textures;
        static std::unordered_map<ShaderPath, std::unique_ptr<Shader>> m_shaders;
        static std::unordered_map<std::string, std::unique_ptr<TextRenderer>> m_fonts;

};

#endif //POKEMONGAMEENGINE_RESOURCEMANAGER_H