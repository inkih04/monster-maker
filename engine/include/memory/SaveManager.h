//
// Created by inkih on 24/3/26.
//

#ifndef MONSTERMAKERENGINE_SAVEMANAGER_H
#define MONSTERMAKERENGINE_SAVEMANAGER_H

#include <string>
#include <sol/sol.hpp>
#include <nlohmann/json.hpp>

class SaveManager {
public:
    SaveManager() = default;
    ~SaveManager() = default;

    SaveManager(const SaveManager&) = delete;
    SaveManager& operator=(const SaveManager&) = delete;

    void set(const std::string& key, sol::object value);
    sol::object get(const std::string& key, sol::this_state s);
    bool has(const std::string& key) const;
    void remove(const std::string& key);
    void clear();

    bool loadFromFile(const std::string& filepath);
    bool commitToFile(const std::string& filepath) const;

private:
    nlohmann::json m_data = nlohmann::json::object();

    nlohmann::json luaToJson(sol::object obj) const;
    sol::object jsonToLua(const nlohmann::json& j, sol::this_state s) const;
};

#endif //MONSTERMAKERENGINE_SAVEMANAGER_H