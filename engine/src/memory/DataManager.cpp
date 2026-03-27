//
// Created by inkih on 27/3/26.
//
#include "DataManager.h"
#include <fstream>
#include <iostream>

sol::object DataManager::get(const std::string& key, sol::this_state s) {
    if (m_data.contains(key)) {
        return jsonToLua(m_data[key], s);
    }
    return sol::make_object(s, sol::lua_nil);
}

bool DataManager::has(const std::string& key) const {
    return m_data.contains(key);
}

void DataManager::clear() {
    m_data.clear();
    m_data = nlohmann::json::object();
}

bool DataManager::loadFromFile(const std::string& category, const std::string& filepath) {
    std::ifstream file(filepath);
    if (!file.is_open()) {
        std::cerr << "[ENGINE][ERROR] Could not open data file: " << filepath << std::endl;
        return false;
    }
    try {
        nlohmann::json fileData;
        file >> fileData;
        m_data[category] = fileData;
    } catch (const nlohmann::json::parse_error& e) {
        std::cerr << "[ENGINE][ERROR] Failed to parse data JSON (" << filepath << "): " << e.what() << std::endl;
        return false;
    }
    return true;
}

sol::object DataManager::jsonToLua(const nlohmann::json& j, sol::this_state s) const {
    sol::state_view lua(s);

    if (j.is_null()) {
        return sol::make_object(s, sol::lua_nil);
    } else if (j.is_boolean()) {
        return sol::make_object(s, j.get<bool>());
    } else if (j.is_number_integer()) {
        return sol::make_object(s, j.get<int>());
    } else if (j.is_number_float()) {
        return sol::make_object(s, j.get<double>());
    } else if (j.is_string()) {
        return sol::make_object(s, j.get<std::string>());
    } else if (j.is_array()) {
        sol::table t = lua.create_table();
        int index = 1;
        for (const auto& elem : j) {
            t[index++] = jsonToLua(elem, s);
        }
        return t;
    } else if (j.is_object()) {
        sol::table t = lua.create_table();
        for (auto it = j.begin(); it != j.end(); ++it) {
            t[it.key()] = jsonToLua(it.value(), s);
        }
        return t;
    }

    return sol::make_object(s, sol::lua_nil);
}