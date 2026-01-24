//
// Created by inkih on 13/12/25.
//

#ifndef POKEMONGAMEENGINE_SCRIPTENGINE_H
#define POKEMONGAMEENGINE_SCRIPTENGINE_H


#include <vector>
#include <sol/state.hpp>
#include "Camera.h"

class EntityManager;

class ScriptEngine {
public:
    static ScriptEngine& getInstance();

    void init();
    void setupBindingsStatic();
    void setupBindingsDynamic(Camera* camera, EntityManager& entityManager);
    bool runScript(const std::string& filePath);

    sol::state& getState() { return m_lua; }

private:
    ScriptEngine() = default;
    ~ScriptEngine() = default;

    ScriptEngine(const ScriptEngine&) = delete;
    ScriptEngine& operator=(const ScriptEngine&) = delete;

    sol::state m_lua;
};

#endif //POKEMONGAMEENGINE_SCRIPTENGINE_H