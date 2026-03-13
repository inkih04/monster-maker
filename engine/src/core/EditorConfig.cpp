//
// Created by inkih on 07/3/26.
//

#include "EditorConfig.h"

const std::string& EditorConfig::getInitialMapPath() const { return initialMapPath; }
void EditorConfig::setInitialMapPath(const std::string& value) { initialMapPath = value; }

const std::string& EditorConfig::getGameName() const { return gameName; }
void EditorConfig::setGameName(const std::string& value) { gameName = value; }

const std::string& EditorConfig::getGameVersion() const { return gameVersion; }
void EditorConfig::setGameVersion(const std::string& value) { gameVersion = value; }

const std::string& EditorConfig::getImageIconPath() const { return imageIconPath; }
void EditorConfig::setImageIconPath(const std::string& value) { imageIconPath = value; }

const std::unordered_map<std::string, std::string>& EditorConfig::getMaps() const { return maps; }
void EditorConfig::setMaps(const std::unordered_map<std::string, std::string>& value) { maps = value; }
void EditorConfig::addMap(const std::string& name, const std::string& path) { maps[name] = path; }
bool EditorConfig::hasMap(const std::string& name) const { return maps.count(name) > 0; }
const std::string& EditorConfig::getMap(const std::string& name) const { return maps.at(name); }

const std::unordered_map<std::string, int>& EditorConfig::getShaderTags() const { return shaderTags; }
void EditorConfig::setShaderTags(const std::unordered_map<std::string, int>& value) { shaderTags = value; }
void EditorConfig::addShaderTag(const std::string& tag, int mode) { shaderTags[tag] = mode; }
bool EditorConfig::hasShaderTag(const std::string& tag) const { return shaderTags.count(tag) > 0; }
int EditorConfig::getShaderMode(const std::string& tag) const {
    auto it = shaderTags.find(tag);
    return it != shaderTags.end() ? it->second : 0;
}