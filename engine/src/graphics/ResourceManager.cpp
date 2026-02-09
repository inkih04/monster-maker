//
// Created by inkih on 6/12/25.
//
#include "ResourceManager.h"
#include <iostream>

std::unordered_map<std::string, std::unique_ptr<Texture>> ResourceManager::m_textures;
std::unordered_map<ShaderPath, std::unique_ptr<Shader>> ResourceManager::m_shaders;
std::unordered_map<std::string, std::unique_ptr<TextRenderer>> ResourceManager::m_fonts;
std::unordered_map<std::string, std::unique_ptr<SoLoud::Wav>> ResourceManager::m_sounds;


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

SoLoud::Wav* ResourceManager::loadSound(const std::string& path) {
    auto it = m_sounds.find(path);
    if (it != m_sounds.end()) {
        return it->second.get();
    }

    auto sound = std::make_unique<SoLoud::Wav>();
    if (sound->load(path.c_str()) != 0) {
        return nullptr;
    }

    SoLoud::Wav* soundPtr = sound.get();
    m_sounds[path] = std::move(sound);
    return soundPtr;
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

TextRenderer* ResourceManager::loadFont(const std::string& fontPath, unsigned int fontSize) {
    std::string key = fontPath + std::to_string(fontSize);
    auto it = m_fonts.find(key);
    if (it != m_fonts.end()) {
        return it->second.get();
    }

    std::unique_ptr<TextRenderer> font = std::make_unique<TextRenderer>(fontPath, fontSize);
    TextRenderer* fontPtr = font.get();
    m_fonts[key] = std::move(font);
    return fontPtr;
}