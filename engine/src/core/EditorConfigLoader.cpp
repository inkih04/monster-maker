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
