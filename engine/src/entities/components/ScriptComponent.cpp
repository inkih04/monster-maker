//
// Created by inkih on 24/1/26.
//
#include "ScriptEngine.h"
#include <iostream>

#include "ScriptComponet.h"
#include "Entity.h"


ScriptComponent::ScriptComponent(std::string path)
    : m_scriptPath(std::move(path)) {}

ScriptComponent::ScriptComponent(std::string path, sol::table props)
    : m_scriptPath(std::move(path)), m_props(std::move(props)) {}


ScriptComponent::~ScriptComponent() {
    if (m_luaDestroy.valid()) {
        auto result = m_luaDestroy(getOwner(), m_props);
        if (!result.valid()) {
            sol::error err = result;
            std::cout << "[ENGINE][ERROR] onDestroy (" << m_scriptPath << "): " << err.what() << std::endl;
        }
    }
}

void ScriptComponent::init() {
    if (m_scriptPath.empty()) {
        std::cout << "[ENGINE][ERROR] ScriptComponent has empty path, skipping." << std::endl;
        m_initialized = true;
        return;
    }

    auto& lua = ScriptEngine::getInstance().getState();

    sol::environment env(lua, sol::create, lua.globals());
    m_env = env;

    if (!m_props.valid()) {
        m_props = lua.create_table();
    }

    auto loadResult = lua.load_file(m_scriptPath);
    if (!loadResult.valid()) {
        sol::error err = loadResult;
        std::cout << "[ENGINE][ERROR] Load (" << m_scriptPath << "): " << err.what() << std::endl;
        m_initialized = true;
        return;
    }

    sol::function script = loadResult;
    sol::set_environment(env, script);
    auto execResult = script();
    if (!execResult.valid()) {
        sol::error err = execResult;
        std::cout << "[ENGINE][ERROR] Exec (" << m_scriptPath << "): " << err.what() << std::endl;
        m_initialized = true;
        return;
    }

    m_luaStart          = env["onStart"];
    m_luaUpdate         = env["onUpdate"];
    m_luaDestroy        = env["onDestroy"];
    m_luaOnCollision    = env["onCollision"];
    m_luaOnTriggerEnter = env["onTriggerEnter"];
    m_luaOnInteract     = env["onInteract"];

    m_initialized = true;
}


void ScriptComponent::reset() {
    m_initialized = false;
    m_startCalled = false;
    m_env                = sol::environment{};
    m_luaStart           = sol::protected_function{};
    m_luaUpdate          = sol::protected_function{};
    m_luaDestroy         = sol::protected_function{};
    m_luaOnCollision     = sol::protected_function{};
    m_luaOnTriggerEnter  = sol::protected_function{};
    m_luaOnInteract      = sol::protected_function{};
}


void ScriptComponent::executeOnCollision(Entity* other) {
    if (!m_initialized) init();
    if (m_luaOnCollision.valid()) {
        auto result = m_luaOnCollision(getOwner(), other, m_props);
        if (!result.valid()) {
            sol::error err = result;
            std::cout << "[ENGINE][ERROR] onCollision (" << m_scriptPath << "): " << err.what() << std::endl;
        }
    }
}

void ScriptComponent::executeOnInteract(Entity* other) {
    if (!m_initialized) init();
    if (m_luaOnInteract.valid()) {
        auto result = m_luaOnInteract(getOwner(), other, m_props);
        if (!result.valid()) {
            sol::error err = result;
            std::cout << "[ENGINE][ERROR] onInteract (" << m_scriptPath << "): " << err.what() << std::endl;
        }
    }
}

void ScriptComponent::executeOnTriggerEnter(Entity* other) {
    if (!m_initialized) init();
    if (m_luaOnTriggerEnter.valid()) {
        auto result = m_luaOnTriggerEnter(getOwner(), other, m_props);
        if (!result.valid()) {
            sol::error err = result;
            std::cout << "[ENGINE][ERROR] onTriggerEnter (" << m_scriptPath << "): " << err.what() << std::endl;
        }
    }
}

void ScriptComponent::update(int deltaTime) {
    if (!m_isActive) return;
    if (!m_initialized) init();

    if (!m_startCalled) {
        if (m_luaStart.valid()) {
            auto result = m_luaStart(getOwner(), m_props);
            if (!result.valid()) {
                sol::error err = result;
                std::cout << "[ENGINE][ERROR] onStart (" << m_scriptPath << "): " << err.what() << std::endl;
            }
        }
        m_startCalled = true;
    }

    if (m_luaUpdate.valid()) {
        auto result = m_luaUpdate(getOwner(), deltaTime, m_props);
        if (!result.valid()) {
            sol::error err = result;
            std::cout << "[ENGINE][ERROR] onUpdate (" << m_scriptPath << "): " << err.what() << std::endl;
        }
    }
}

