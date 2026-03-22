//
// Created by inkih on 07/3/26.
//

#include "EditorConfigLoader.h"
#include "EditorConfig.h"
#include <fstream>
#include <iostream>

void EditorConfigLoader::loadFromFile(const std::string& filePath) {
    std::ifstream file(filePath);
    if (!file.is_open()) {
        std::cout << ("[Engine][Error]: cannot open file: " + filePath);
        return;
    }

    json data;
    file >> data;

    if (data.contains("shaders") && data["shaders"].is_object()) {
        parseShaders(data["shaders"]);
    }

    if (data.contains("tags") && data["tags"].is_object()) {
        parseTags(data["tags"]);
    }

    if (data.contains("gameConfig") && data["gameConfig"].is_object()) {
        parseGameConfig(data["gameConfig"]);
    }
}

void EditorConfigLoader::parseShaders(const json& shadersJson) {
    EditorConfig& config = EditorConfig::getInstance();
    for (auto& [tag, mode] : shadersJson.items()) {
        if (mode.is_number_integer()) {
            config.addShaderTag(tag, mode.get<int>());
        }
    }
}

void EditorConfigLoader::parseTags(const json& tagsJson) {
    EditorConfig& config = EditorConfig::getInstance();
    for (auto& [name, path] : tagsJson.items()) {
        if (path.is_string()) {
            config.addTag(name, path.get<std::string>());
        }
    }
}

void EditorConfigLoader::parseGameConfig(const json& gameConfigJson) {
    EditorConfig& config = EditorConfig::getInstance();

    if (gameConfigJson.contains("gameName") && gameConfigJson["gameName"].is_string()) {
        config.setGameName(gameConfigJson["gameName"].get<std::string>());
    }

    if (gameConfigJson.contains("gameVersion") && gameConfigJson["gameVersion"].is_string()) {
        config.setGameVersion(gameConfigJson["gameVersion"].get<std::string>());
    }

    if (gameConfigJson.contains("initialMapPath") && gameConfigJson["initialMapPath"].is_string()) {
        config.setInitialMapPath(gameConfigJson["initialMapPath"].get<std::string>());
    }

    if (gameConfigJson.contains("imageIconPath") && gameConfigJson["imageIconPath"].is_string()) {
        config.setImageIconPath(gameConfigJson["imageIconPath"].get<std::string>());
    }

    if (gameConfigJson.contains("defaultFont") && gameConfigJson["defaultFont"].is_string()) {
        config.setDefaultFontPath(gameConfigJson["defaultFont"].get<std::string>());
    }

    if (gameConfigJson.contains("virtualWidth") && gameConfigJson["virtualWidth"].is_number_integer()) {
        config.setVirtualWidth(gameConfigJson["virtualWidth"].get<int>());
    }

    if (gameConfigJson.contains("virtualHeight") && gameConfigJson["virtualHeight"].is_number_integer()) {
        config.setVirtualHeight(gameConfigJson["virtualHeight"].get<int>());
    }
}