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
    static SaveManager& getInstance() {
        static SaveManager instance;
        return instance;
    }

    SaveManager(const SaveManager&) = delete;
    SaveManager& operator=(const SaveManager&) = delete;

    void set(const std::string& key, sol::object value);

    void setTrue(const std::string &key);

    void setFalse(const std::string &key);

    bool isTrue(const std::string &key) const;

    sol::object get(const std::string& key, sol::this_state s);
    bool has(const std::string& key) const;
    void remove(const std::string& key);
    void clear();

    bool loadFromFile(const std::string& filepath);
    bool commitToFile(const std::string& filepath) const;

private:
    SaveManager() = default;
    ~SaveManager() = default;
    nlohmann::json m_data = nlohmann::json::object();

    nlohmann::json luaToJson(sol::object obj) const;
    sol::object jsonToLua(const nlohmann::json& j, sol::this_state s) const;
};

#endif //MONSTERMAKERENGINE_SAVEMANAGER_H