//
// Created by inkih on 13/12/25.
//
#include "scripting/ScriptBindings.h"
#include "scripting/ScriptEngine.h"

ScriptEngine& ScriptEngine::getInstance() {
    static ScriptEngine instance;
    return instance;
}

void ScriptEngine::init() {
    try {
        m_lua.open_libraries(sol::lib::base, sol::lib::package, sol::lib::math, sol::lib::table);
        std::cout << "ScriptEngine inicializado correctamente." << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "ScriptEngine Error al inicializar Lua: " << e.what() << std::endl;
    }
}

void ScriptEngine::setupBindingsStatic() {
    ScriptBindings::registerStatic(m_lua);
}

void ScriptEngine::setupBindingsDynamic(const Camera* camera, EntityManager& entityManager) {
    ScriptBindings::registerDynamic(m_lua, camera, entityManager);
}

bool ScriptEngine::runScript(const std::string& filePath) {
    auto result = m_lua.script_file(filePath, sol::script_pass_on_error);

    if (!result.valid()) {
        sol::error err = result;
        std::cerr << "ScriptEngine Error en script " << filePath << ": " << err.what() << std::endl;
        return false;
    }

    return true;
}