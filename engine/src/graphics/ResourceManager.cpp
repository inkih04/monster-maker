//
// Created by inkih on 6/12/25.
//
#include "ResourceManager.h"

std::unordered_map<std::string, std::unique_ptr<Texture>> ResourceManager::m_textures;
std::unordered_map<ShaderPath, std::unique_ptr<Shader>> ResourceManager::m_shaders;


Texture* ResourceManager::loadTexture(const std::string& path) {
    auto it = m_textures.find(path);
    if (it != m_textures.end()) {
        return it->second.get();
    }

    std::unique_ptr<Texture> texture = std::make_unique<Texture>(path);
    Texture* texturePtr = texture.get();
    m_textures[path] = std::move(texture);
    return texturePtr;
}


Shader* ResourceManager::loadShader(const std::string& vertexShaderPath, const std::string& fragmentShaderPath) {
    const ShaderPath key{vertexShaderPath, fragmentShaderPath};
    auto it = m_shaders.find(key);
    if (it != m_shaders.end()) {
        return it->second.get();
    }

    std::unique_ptr<Shader> shader = std::make_unique<Shader>(vertexShaderPath, fragmentShaderPath);
    Shader* shaderPtr = shader.get();
    m_shaders[key] = std::move(shader);
    return shaderPtr;
}