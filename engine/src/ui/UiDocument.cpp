//
// Created by inkih on 16/3/26.
//

#include "UiDocument.h"
#include "scripting/ScriptEngine.h"
#include <iostream>

UiDocument::UiDocument(Rml::ElementDocument* doc, const std::optional<std::string>& scriptPath)
    : m_doc(doc), m_scriptPath(scriptPath)
{
    if (m_scriptPath)
        loadScript(*m_scriptPath);

    callHook(m_luaOnStart, "onStart");
}

UiDocument::~UiDocument() {
    close();
}

void UiDocument::close() {
    if (!m_doc) return;
    callHook(m_luaOnDestroy, "onDestroy");
    m_doc->Close();
    m_doc = nullptr;
}

void UiDocument::loadScript(const std::string& path) {
    auto& lua = ScriptEngine::getInstance().getState();

    m_env = sol::environment(lua, sol::create, lua.globals());

    auto loadResult = lua.load_file(path);
    if (!loadResult.valid()) {
        sol::error err = loadResult;
        std::cerr << "[ENGINE][UiDocument][ERROR] Load (" << path << "): " << err.what() << std::endl;
        return;
    }

    sol::function script = loadResult;
    sol::set_environment(m_env, script);

    auto execResult = script();
    if (!execResult.valid()) {
        sol::error err = execResult;
        std::cerr << "[ENGINE][UiDocument][ERROR] Exec (" << path << "): " << err.what() << std::endl;
        return;
    }

    m_luaOnStart   = m_env["onStart"];
    m_luaOnDestroy = m_env["onDestroy"];
}

void UiDocument::callHook(sol::protected_function& fn, const std::string& hookName) {
    if (!fn.valid()) return;
    auto result = fn();
    if (!result.valid()) {
        sol::error err = result;
        std::cerr << "[ENGINE][UiDocument][ERROR] " << hookName
                  << " (" << m_scriptPath.value_or("no script") << "): "
                  << err.what() << std::endl;
    }
}