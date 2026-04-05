//
// Created by inkih on 13/12/25.
//
#include "scripting/ScriptBindings.h"
#include "scripting/ScriptEngine.h"

#include "DataManager.h"
#include "SaveManager.h"
#include <filesystem>

ScriptEngine& ScriptEngine::getInstance() {
    static ScriptEngine instance;
    return instance;
}

void ScriptEngine::init() {
    try {
        m_lua.open_libraries(sol::lib::base, sol::lib::package, sol::lib::math, sol::lib::table);

        std::filesystem::path corePath = std::filesystem::path("resources") / "scripts" / "Core.lua";

        if (std::filesystem::exists(corePath)) {
            auto result = m_lua.script_file(corePath.string(), sol::script_pass_on_error);

            if (result.valid()) {
                std::cout << "[ENGINE] Core.lua loaded successfully." << std::endl;
            } else {
                sol::error err = result;
                std::cerr << "[ENGINE][ERROR] Failed to execute Core.lua: " << err.what() << std::endl;
            }
        } else {
            std::cerr << "[ENGINE][WARNING] Core.lua not found at " << corePath.string()
                      << ". Continuing execution..." << std::endl;
        }

        std::cout << "[ENGINE] ScriptEngine init" << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "[ENGINE][ERROR] Error while loadin lua " << e.what() << std::endl;
    }
}

void ScriptEngine::setupBindingsStatic(SessionManager& sessionManager, SaveManager& saveManager, DataManager& dataManager) {
    ScriptBindings::registerStatic(m_lua, sessionManager, saveManager, dataManager);
}

std::string ScriptEngine::consumePendingMap() {
    std::string path = m_pendingMap;
    m_pendingMap.clear();
    return path;
}

void ScriptEngine::setupBindingsDynamic(Camera* camera, EntityManager& entityManager) {
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