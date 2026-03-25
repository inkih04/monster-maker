//
// Created by inkih on 24/3/26.
//
#include "SaveManager.h"
#include <fstream>
#include <iostream>

void SaveManager::set(const std::string& key, sol::object value) {
    m_data[key] = luaToJson(value);
}

sol::object SaveManager::get(const std::string& key, sol::this_state s) {
    if (m_data.contains(key)) {
        return jsonToLua(m_data[key], s);
    }
    return sol::make_object(s, sol::lua_nil);
}

bool SaveManager::has(const std::string& key) const {
    return m_data.contains(key);
}

void SaveManager::remove(const std::string& key) {
    m_data.erase(key);
}

void SaveManager::clear() {
    m_data.clear();
    m_data = nlohmann::json::object();
}

bool SaveManager::loadFromFile(const std::string& filepath) {
    std::ifstream file(filepath);
    if (!file.is_open()) {
        return false;
    }
    try {
        file >> m_data;
    } catch (const nlohmann::json::parse_error& e) {
        std::cerr << "[ENGINE][ERROR] Failed to parse save JSON (" << filepath << "): " << e.what() << std::endl;
        return false;
    }
    return true;
}

bool SaveManager::commitToFile(const std::string& filepath) const {
    std::ofstream file(filepath);
    if (!file.is_open()) {
        std::cerr << "[ENGINE][ERROR] Could not open file for writing: " << filepath << std::endl;
        return false;
    }

    file << m_data.dump(4);
    return file.good();
}


nlohmann::json SaveManager::luaToJson(sol::object obj) const {
    if (obj.get_type() == sol::type::lua_nil) {
        return nullptr;
    } else if (obj.get_type() == sol::type::boolean) {
        return obj.as<bool>();
    } else if (obj.get_type() == sol::type::number) {
        return obj.as<double>();
    } else if (obj.get_type() == sol::type::string) {
        return obj.as<std::string>();
    } else if (obj.get_type() == sol::type::table) {
        sol::table t = obj.as<sol::table>();

        bool is_array = true;
        int expected_index = 1;
        for (auto& kv : t) {
            if (kv.first.get_type() == sol::type::number && kv.first.as<int>() == expected_index) {
                expected_index++;
            } else {
                is_array = false;
                break;
            }
        }

        if (is_array) {
            nlohmann::json arr = nlohmann::json::array();
            for (auto& kv : t) {
                arr.push_back(luaToJson(kv.second));
            }
            return arr;
        } else {
            nlohmann::json dict = nlohmann::json::object();
            for (auto& kv : t) {
                if (kv.first.get_type() == sol::type::string) {
                    dict[kv.first.as<std::string>()] = luaToJson(kv.second);
                } else if (kv.first.get_type() == sol::type::number) {
                    dict[std::to_string(kv.first.as<int>())] = luaToJson(kv.second);
                }
            }
            return dict;
        }
    }

    std::cerr << "[ENGINE][WARNING] Attempted to save a non-serializable type in SaveManager." << std::endl;
    return nullptr;
}


sol::object SaveManager::jsonToLua(const nlohmann::json& j, sol::this_state s) const {
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