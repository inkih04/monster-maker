//
// Created by inkih on 24/1/26.
//
#include "scripting/ScriptEngine.h"
#include <iostream>

#include "ScriptComponet.h"
#include  "Entity.h"

ScriptComponent::ScriptComponent(std::string path)
    : m_scriptPath(std::move(path)) {}

ScriptComponent::~ScriptComponent() {
    if (m_luaDestroy.valid()) {
        auto result = m_luaDestroy(getOwner());
        if (!result.valid()) {
            sol::error err = result;
            std::cerr << "LUA Error (onDestroy): " << err.what() << std::endl;
        }
    }
}

void ScriptComponent::init() {
    auto& lua = ScriptEngine::getInstance().getState();

    auto script = lua.load_file(m_scriptPath);
    if (!script.valid()) {
        sol::error err = script;
        std::cerr << "LUA Error (Load): " << m_scriptPath << " - " << err.what() << std::endl;
        return;
    }

    script();

    m_luaStart = lua["onStart"];
    m_luaUpdate = lua["onUpdate"];
    m_luaDestroy = lua["onDestroy"];
    m_luaOnCollision = lua["onCollision"];
    m_luaOnTriggerEnter = lua["onTriggerEnter"];
    m_luaOnInteract = lua["onInteract"];

    m_initialized = true;
}

void ScriptComponent::executeOnCollision(Entity *other) {
    if (!m_initialized) init();
    if (m_luaOnCollision.valid()) {
        auto result = m_luaOnCollision(getOwner(), other);
        if (!result.valid()) {
            sol::error err = result;
            std::cerr << "LUA Error (onCollision): " << err.what() << std::endl;
        }
    }
}

void ScriptComponent::executeOnInteract(Entity *other) {
    if (!m_initialized) init();
    if (m_luaOnInteract.valid()) {
        auto result = m_luaOnInteract(getOwner(), other);
        if (!result.valid()) {
            sol::error err = result;
            std::cerr << "LUA Error (onInteract): " << err.what() << std::endl;
        }
    }
}

void ScriptComponent::executeOnTriggerEnter(Entity *other) {
    if (!m_initialized) init();
    if (m_luaOnTriggerEnter.valid()) {
        auto result = m_luaOnTriggerEnter(getOwner(), other);
        if (!result.valid()) {
            sol::error err = result;
            std::cerr << "LUA Error (onTriggerEnter): " << err.what() << std::endl;
        }
    }
}

void ScriptComponent::update(int deltaTime) {
    if (!m_initialized) init();

    if (!m_startCalled) {
        if (m_luaStart.valid()) {
            auto result = m_luaStart(getOwner());
            if (!result.valid()) {
                sol::error err = result;
                std::cerr << "LUA Error (onStart): " << err.what() << std::endl;
            }
        }
        m_startCalled = true;
    }

    if (m_luaUpdate.valid()) {
        auto result = m_luaUpdate(getOwner(), deltaTime);
        if (!result.valid()) {
            sol::error err = result;
            std::cerr << "LUA Error (onUpdate): " << err.what() << std::endl;
        }
    }
}
