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
#include <soloud_wav.h>
#include "structs/ShaderPath.h"

class ResourceManager {
    public:
        static Texture* loadTexture(const std::string& path);
        static Shader* loadShader(const std::string& vertexShaderPath, const std::string& fragmentShaderPath);
        static SoLoud::Wav* loadSound(const std::string& path);

    private:
        static std::unordered_map<std::string, std::unique_ptr<Texture>> m_textures;
        static std::unordered_map<ShaderPath, std::unique_ptr<Shader>> m_shaders;
        static std::unordered_map<std::string, std::unique_ptr<SoLoud::Wav>> m_sounds;

};

#endif //POKEMONGAMEENGINE_RESOURCEMANAGER_H