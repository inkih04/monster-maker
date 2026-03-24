//
// Created by inkih on 24/3/26.
//

#ifndef MONSTERMAKERENGINE_SESSIONMANAGER_H
#define MONSTERMAKERENGINE_SESSIONMANAGER_H


#include <string>
#include <unordered_map>
#include <sol/sol.hpp>

class SessionManager {
    public:
        SessionManager() = default;
        ~SessionManager() = default;

        SessionManager(const SessionManager&) = delete;
        SessionManager& operator=(const SessionManager&) = delete;

        void set(const std::string& key, sol::object value);
        sol::object get(const std::string& key, sol::this_state s);
        bool has(const std::string& key) const;
        void remove(const std::string& key);
        void clear();

    private:
        std::unordered_map<std::string, sol::object> m_data;
    };

#endif //MONSTERMAKERENGINE_SESSIONMANAGER_H