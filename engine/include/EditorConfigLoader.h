//
// Created by inkih on 7/3/26.
//

#ifndef MONSTERMAKERENGINE_EDITORCONFIGLOADER_H
#define MONSTERMAKERENGINE_EDITORCONFIGLOADER_H

#include <string>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

class EditorConfigLoader {
public:
    static void loadFromFile(const std::string& filePath);

private:
    static void parseShaders(const json& shadersJson);
};

#endif //MONSTERMAKERENGINE_EDITORCONFIGLOADER_H