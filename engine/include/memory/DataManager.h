//
// Created by inkih on 27/3/26.
//

#ifndef MONSTERMAKERENGINE_DATAMANAGER_H
#define MONSTERMAKERENGINE_DATAMANAGER_H

#include <string>
#include <sol/sol.hpp>
#include <nlohmann/json.hpp>

class DataManager {
public:
    DataManager() = default;
    ~DataManager() = default;

    DataManager(const DataManager&) = delete;
    DataManager& operator=(const DataManager&) = delete;

    sol::object get(const std::string& key, sol::this_state s);
    bool has(const std::string& key) const;

    bool loadFromFile(const std::string& category, const std::string& filepath);
    void clear();

private:
    nlohmann::json m_data = nlohmann::json::object();

    sol::object jsonToLua(const nlohmann::json& j, sol::this_state s) const;
};

#endif //MONSTERMAKERENGINE_DATAMANAGER_H
