//
// Created by inkih on 16/3/26.
//

#include "UiDocument.h"
#include "scripting/ScriptEngine.h"
#include <iostream>
#include <vector>

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

    static bool arrayRegistered = false;
    if (!arrayRegistered) {
        constructor.RegisterArray<std::vector<std::string>>();
        arrayRegistered = true;
    }

    for (auto& [key, value] : data) {
        if (!key.is<std::string>()) continue;
        const std::string k = key.as<std::string>();

        if (value.is<std::string>()) {
            m_modelStrings[k] = value.as<std::string>();
            constructor.Bind(k, &m_modelStrings.at(k));
        } else if (value.is<bool>()) {
            m_modelBools[k] = value.as<bool>();
            constructor.Bind(k, &m_modelBools.at(k));
        } else if (value.is<int>()) {
            m_modelInts[k] = value.as<int>();
            constructor.Bind(k, &m_modelInts.at(k));
        } else if (value.is<sol::table>()) {
            sol::table tbl = value.as<sol::table>();
            std::vector<std::string> list;
            for (std::size_t i = 1; i <= tbl.size(); ++i) {
                list.push_back(tbl[i].get_or<std::string>(""));
            }
            m_modelStringLists[k] = list;
            constructor.Bind(k, &m_modelStringLists.at(k));
        }
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
        if (!key.is<std::string>()) continue;
        const std::string k = key.as<std::string>();

        if (value.is<std::string>() && m_modelStrings.count(k)) {
            m_modelStrings[k] = value.as<std::string>();
            m_modelHandle.DirtyVariable(k);
        } else if (value.is<bool>() && m_modelBools.count(k)) {
            m_modelBools[k] = value.as<bool>();
            m_modelHandle.DirtyVariable(k);
        } else if (value.is<int>() && m_modelInts.count(k)) {
            m_modelInts[k] = value.as<int>();
            m_modelHandle.DirtyVariable(k);
        } else if (value.is<sol::table>() && m_modelStringLists.count(k)) {
            sol::table tbl = value.as<sol::table>();
            std::vector<std::string> list;
            for (std::size_t i = 1; i <= tbl.size(); ++i) {
                list.push_back(tbl[i].get_or<std::string>(""));
            }
            m_modelStringLists[k] = list;
            m_modelHandle.DirtyVariable(k);
        }
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