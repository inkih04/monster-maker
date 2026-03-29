//
// Created by inkih on 16/3/26.
//

#include "UiDocument.h"
#include "scripting/ScriptEngine.h"
#include <iostream>


UiDocument::UiDocument(Rml::ElementDocument* doc,
                        Rml::Context* context,
                        const std::optional<std::string>& scriptPath)
    : m_doc(doc), m_context(context), m_scriptPath(scriptPath)
{
    if (m_scriptPath)
        loadScript(*m_scriptPath);

    callHook(m_luaOnStart, "onStart");
}

UiDocument::~UiDocument() {
    close();
}


void UiDocument::setRmlDocument(Rml::ElementDocument* doc) {
    m_doc = doc;
}


void UiDocument::close() {
    if (!m_doc) return;

    callHook(m_luaOnDestroy, "onDestroy");
    if (m_context && !m_modelName.empty()) {
        m_context->RemoveDataModel(m_modelName);
        m_modelName.clear();
    }

    m_doc->Close();
    m_doc = nullptr;
}


void UiDocument::initModel(const std::string& modelName, const sol::table& data) {
    if (!m_context) {
        std::cerr << "[ENGINE][UiDocument][ERROR] initModel called without a valid Rml::Context."
                  << std::endl;
        return;
    }
    if (!m_modelName.empty()) {
        std::cerr << "[ENGINE][UiDocument][WARNING] initModel called twice on document '"
                  << modelName << "'. Ignoring second call." << std::endl;
        return;
    }

    m_modelName = modelName;
    auto constructor = m_context->CreateDataModel(modelName);

    for (auto& [key, value] : data) {
        if (!key.is<std::string>() || !value.is<std::string>()) continue;

        const std::string k = key.as<std::string>();
        m_modelVars[k]      = value.as<std::string>();
        constructor.Bind(k, &m_modelVars.at(k));
    }

    m_modelHandle = constructor.GetModelHandle();
}

void UiDocument::updateModel(const sol::table& data) {
    if (!m_modelHandle) {
        std::cerr << "[ENGINE][UiDocument][WARNING] updateModel called before initModel."
                  << std::endl;
        return;
    }

    for (auto& [key, value] : data) {
        if (!key.is<std::string>() || !value.is<std::string>()) continue;

        const std::string k = key.as<std::string>();
        auto it = m_modelVars.find(k);
        if (it == m_modelVars.end()) {
            continue;
        }

        it->second = value.as<std::string>();
        m_modelHandle.DirtyVariable(k);
    }
}


void UiDocument::loadScript(const std::string& path) {
    auto& lua = ScriptEngine::getInstance().getState();

    m_env = sol::environment(lua, sol::create, lua.globals());

    auto loadResult = lua.load_file(path);
    if (!loadResult.valid()) {
        sol::error err = loadResult;
        std::cerr << "[ENGINE][UiDocument][ERROR] Load (" << path << "): "
                  << err.what() << std::endl;
        return;
    }

    sol::function script = loadResult;
    sol::set_environment(m_env, script);

    auto execResult = script();
    if (!execResult.valid()) {
        sol::error err = execResult;
        std::cerr << "[ENGINE][UiDocument][ERROR] Exec (" << path << "): "
                  << err.what() << std::endl;
        return;
    }

    std::cerr << "[ENGINE]" << "UI Script loaded" << std::endl;
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