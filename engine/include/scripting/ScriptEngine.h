//
// Created by inkih on 13/12/25.
//

#ifndef POKEMONGAMEENGINE_SCRIPTENGINE_H
#define POKEMONGAMEENGINE_SCRIPTENGINE_H


#include <vector>
#include <sol/state.hpp>
#include "Camera.h"
#include "DataManager.h"
#include "SaveManager.h"
#include "SessionManager.h"

class EntityManager;

class ScriptEngine {
public:
    static ScriptEngine& getInstance();

    void init();
    void setupBindingsStatic(SessionManager &sessionManager, SaveManager &saveManager, DataManager &dataManager);
    void setupBindingsDynamic(Camera* camera, EntityManager& entityManager);
    bool runScript(const std::string& filePath);
    void requestMapChange(const std::string& mapPath) { m_pendingMap = mapPath; }
    bool hasPendingMapChange() const { return !m_pendingMap.empty(); }
    std::string consumePendingMap();

    void setMapScript(const std::string& path) { m_currentMapScript = path; }
    void initMapScript();

    sol::state& getState() { return m_lua; }

private:
    ScriptEngine() = default;
    ~ScriptEngine() = default;

    ScriptEngine(const ScriptEngine&) = delete;
    ScriptEngine& operator=(const ScriptEngine&) = delete;
    std::string m_pendingMap;
    sol::state m_lua;

    std::string m_currentMapScript;
    sol::environment m_mapEnv;
};

#endif //POKEMONGAMEENGINE_SCRIPTENGINE_H