//
// Created by inkih on 07/3/26.
//

#include "EditorConfig.h"

#include "GameConfig.h"

const std::string& EditorConfig::getInitialMapPath() const { return initialMapPath; }
void EditorConfig::setInitialMapPath(const std::string& value) { initialMapPath = value; }

const std::string& EditorConfig::getGameName() const { return gameName; }
void EditorConfig::setGameName(const std::string& value) { gameName = value; }

const std::string& EditorConfig::getGameVersion() const { return gameVersion; }
void EditorConfig::setGameVersion(const std::string& value) { gameVersion = value; }

const std::string& EditorConfig::getImageIconPath() const { return imageIconPath; }
void EditorConfig::setImageIconPath(const std::string& value) { imageIconPath = value; }

const std::string& EditorConfig::getDefaultFontPath() const { return defaultFontPath; }
void EditorConfig::setDefaultFontPath(const std::string& value) { defaultFontPath = value; }

int EditorConfig::getVirtualWidth() const { return virtualWidth; }
void EditorConfig::setVirtualWidth(int value) { virtualWidth = value; }

int EditorConfig::getVirtualHeight() const { return virtualHeight; }
void EditorConfig::setVirtualHeight(int value) { virtualHeight = value; }

const std::unordered_map<std::string, std::string>& EditorConfig::getTags() const { return maps; }
void EditorConfig::setTags(const std::unordered_map<std::string, std::string>& value) { maps = value; }
void EditorConfig::addTag(const std::string& name, const std::string& path) { maps[name] = path; }
bool EditorConfig::hasTag(const std::string& name) const { return maps.count(name) > 0; }
const std::string& EditorConfig::getTag(const std::string& name) const {
    auto it = maps.find(name);
    return it != maps.end() ? it->second : name;
}

const std::unordered_map<std::string, int>& EditorConfig::getShaderTags() const { return shaderTags; }
void EditorConfig::setShaderTags(const std::unordered_map<std::string, int>& value) { shaderTags = value; }
void EditorConfig::addShaderTag(const std::string& tag, int mode) { shaderTags[tag] = mode; }
bool EditorConfig::hasShaderTag(const std::string& tag) const { return shaderTags.count(tag) > 0; }
int EditorConfig::getShaderMode(const std::string& tag) const {
    auto it = shaderTags.find(tag);
    return it != shaderTags.end() ? it->second : 0;
}

void EditorConfig::setVirtualResolution() const {
   GameConfig::Height = virtualHeight;
   GameConfig::Width = virtualWidth;
}