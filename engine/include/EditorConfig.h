//
// Created by inkih on 07/3/26.
//

#ifndef MONSTERMAKERENGINE_EditorConfig_H
#define MONSTERMAKERENGINE_EditorConfig_H
#include <string>
#include <unordered_map>

class EditorConfig {
public:
    EditorConfig(const EditorConfig&) = delete;
    EditorConfig& operator=(const EditorConfig&) = delete;

    static EditorConfig& getInstance() {
        static EditorConfig instance;
        return instance;
    }

    void setVirtualResolution() const;

    const std::string& getInitialMapPath() const;
    void setInitialMapPath(const std::string& value);

    const std::string& getGameName() const;
    void setGameName(const std::string& value);

    const std::string& getGameVersion() const;
    void setGameVersion(const std::string& value);

    const std::string& getImageIconPath() const;
    void setImageIconPath(const std::string& value);

    const std::string& getDefaultFontPath() const;
    void setDefaultFontPath(const std::string& value);

    int getVirtualWidth() const;
    void setVirtualWidth(int value);

    int getVirtualHeight() const;
    void setVirtualHeight(int value);

    const std::unordered_map<std::string, std::string>& getTags() const;
    void setTags(const std::unordered_map<std::string, std::string>& value);
    void addTag(const std::string& name, const std::string& path);
    bool hasTag(const std::string& name) const;
    const std::string& getTag(const std::string& name) const;

    const std::unordered_map<std::string, int>& getShaderTags() const;
    void setShaderTags(const std::unordered_map<std::string, int>& value);
    void addShaderTag(const std::string& tag, int mode);
    bool hasShaderTag(const std::string& tag) const;
    int getShaderMode(const std::string& tag) const;

private:
    EditorConfig() = default;
    std::string initialMapPath;
    std::string gameName = "Monster Maker Engine";
    std::string gameVersion = "1.0.0";
    std::string imageIconPath;
    std::string defaultFontPath;
    int virtualWidth = 480;
    int virtualHeight = 270;
    std::unordered_map<std::string, std::string> maps;
    std::unordered_map<std::string, int> shaderTags;
};

#endif //MONSTERMAKERENGINE_EditorConfig_H