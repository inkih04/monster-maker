//
// Created by inkih on 24/3/26.
//
#include "SessionManager.h"

void SessionManager::set(const std::string& key, sol::object value) {
    m_data[key] = value;
}

sol::object SessionManager::get(const std::string& key, sol::this_state s) {
    auto it = m_data.find(key);
    if (it != m_data.end()) {
        return it->second;
    }
    return sol::make_object(s, sol::lua_nil);
}

bool SessionManager::has(const std::string& key) const {
    return m_data.find(key) != m_data.end();
}

void SessionManager::remove(const std::string& key) {
    m_data.erase(key);
}

void SessionManager::clear() {
    m_data.clear();
}