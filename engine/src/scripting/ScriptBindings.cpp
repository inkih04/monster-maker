#include "scripting/ScriptBindings.h"
#include <GLFW/glfw3.h>
#include "Camera.h"
#include "EntityManager.h"
#include "EntityTag.h"
#include "InputManager.h"
#include "MovementComponent.h"
#include "PositionComponent.h"

void ScriptBindings::registerStatic(sol::state& lua) {
    registerKeys(lua);
    registerInputManager(lua);
    registerComponents(lua);
    registerTags(lua);
    registerLayers(lua);
    registerEntity(lua);
    registerEntityManager(lua);
    registerCamera(lua);
}

void ScriptBindings::registerDynamic(sol::state& lua, const Camera* camera, EntityManager& entityManager) {
    lua["World"] = &entityManager;
    lua["MainCamera"] = const_cast<Camera*>(camera);

    lua.set_function("GetEntity", [&entityManager](EntityTag tag) -> Entity* {
        auto entities = entityManager.getEntitiesByTag(tag);
        return entities.empty() ? nullptr : entities[0];
    });
}

void ScriptBindings::registerEntity(sol::state& lua) {
    lua.new_usertype<Entity>("Entity",
        "hasComponent", &Entity::hasComponent,
        "getPos", [](Entity& e) -> PositionComponent* {
            auto* comp = e.getComponent(ComponentsType::POSITION);
            return static_cast<PositionComponent*>(comp);
        },
        "getMove", [](Entity& e) -> MovementComponent* {
            auto* comp = e.getComponent(ComponentsType::MOVEMENT);
            return static_cast<MovementComponent*>(comp);
        }
    );
}

void ScriptBindings::registerCamera(sol::state& lua) {
    lua.new_usertype<glm::vec2>("vec2",
        sol::constructors<glm::vec2(), glm::vec2(float, float)>(),
        "x", &glm::vec2::x,
        "y", &glm::vec2::y
    );

    lua.new_usertype<Camera>("Camera",
        "setPosition", [](Camera& c, float x, float y) {
            c.setPosition(glm::vec2(x, y));
        },
        "lerpTo", [](Camera& c, float x, float y, float alpha) {
            c.lerpTo(glm::vec2(x, y), alpha);
        },
        "setZoom", &Camera::setZoom,
        "getPosition", &Camera::getPosition
    );
}

void ScriptBindings::registerTags(sol::state& lua) {
    lua.new_enum<EntityTag>("EntityTag", {
        {"PLAYER",              EntityTag::PLAYER},
        {"ENEMY",               EntityTag::ENEMY},
        {"NPC",                 EntityTag::NPC},
        {"ITEM",                EntityTag::ITEM},
        {"TILEMAP",             EntityTag::TILEMAP},
        {"TILEMAP_COLLIDER",    EntityTag::TILEMAP_COLLIDER},
        {"TRIGGER",             EntityTag::TRIGGER},
        {"DOOR",                EntityTag::DOOR},
        {"SIGN",                EntityTag::SIGN},
        {"PARTICLE",            EntityTag::PARTICLE},
        {"PROJECTILE",          EntityTag::PROJECTILE},
        {"SPAWN_POINT",         EntityTag::SPAWN_POINT},
        {"PLAYER_SPAWN_POINT",  EntityTag::PLAYER_SPAWN_POINT},
        {"UNKNOWN",             EntityTag::UNKNOWN}
    });
}

void ScriptBindings::registerLayers(sol::state& lua) {
    lua.new_enum<EntityLayer>("Layer", {
        {"GROUND",       EntityLayer::GROUND},
        {"DECORATION",   EntityLayer::DECORATION},
        {"ENTITIES",     EntityLayer::ENTITIES},
        {"SHADOWS",      EntityLayer::SHADOWS},
        {"FOREGROUND",   EntityLayer::FOREGROUND},
        {"EFFECTS_HIGH", EntityLayer::EFFECTS_HIGH},
        {"UI_MENU",      EntityLayer::UI_MENU},
        {"UNKNOWN",      EntityLayer::UNKNOWN}
    });
}

void ScriptBindings::registerEntityManager(sol::state& lua) {
    lua.new_usertype<EntityManager>("EntityManager",
        "getEntitiesByTag", &EntityManager::getEntitiesByTag,
        "getEntitiesByLayer", &EntityManager::getEntitiesByLayer
    );
}

void ScriptBindings::registerKeys(sol::state& lua) {
    sol::table keys = lua.create_table();
    keys["A"] = GLFW_KEY_A;
    keys["B"] = GLFW_KEY_B;
    keys["C"] = GLFW_KEY_C;
    keys["D"] = GLFW_KEY_D;
    keys["E"] = GLFW_KEY_E;
    keys["F"] = GLFW_KEY_F;
    keys["G"] = GLFW_KEY_G;
    keys["H"] = GLFW_KEY_H;
    keys["I"] = GLFW_KEY_I;
    keys["J"] = GLFW_KEY_J;
    keys["K"] = GLFW_KEY_K;
    keys["L"] = GLFW_KEY_L;
    keys["M"] = GLFW_KEY_M;
    keys["N"] = GLFW_KEY_N;
    keys["O"] = GLFW_KEY_O;
    keys["P"] = GLFW_KEY_P;
    keys["Q"] = GLFW_KEY_Q;
    keys["R"] = GLFW_KEY_R;
    keys["S"] = GLFW_KEY_S;
    keys["T"] = GLFW_KEY_T;
    keys["U"] = GLFW_KEY_U;
    keys["V"] = GLFW_KEY_V;
    keys["W"] = GLFW_KEY_W;
    keys["X"] = GLFW_KEY_X;
    keys["Y"] = GLFW_KEY_Y;
    keys["Z"] = GLFW_KEY_Z;
    keys["UP"] = GLFW_KEY_UP;
    keys["DOWN"] = GLFW_KEY_DOWN;
    keys["LEFT"] = GLFW_KEY_LEFT;
    keys["RIGHT"] = GLFW_KEY_RIGHT;

    lua["Keys"] = keys;
}

void ScriptBindings::registerInputManager(sol::state& lua) {
    lua.new_usertype<InputManager>("InputManager",
        "isKeyDown", &InputManager::isKeyDown,
        "isKeyPressed", &InputManager::isKeyPressed
    );
    lua["Input"] = &InputManager::getInstance();
}

void ScriptBindings::registerComponents(sol::state& lua) {
    registerPositionComponent(lua);
    registerMovementComponent(lua);
}

void ScriptBindings::registerPositionComponent(sol::state& lua) {
    lua.new_usertype<Position>("Position",
        sol::constructors<Position(), Position(float, float, float)>(),
        "x", &Position::x,
        "y", &Position::y,
        "rotation", &Position::rotation
    );

    lua.new_usertype<PositionComponent>("PositionComponent",
        "x", sol::readonly_property([](PositionComponent& p) { return p.getPosition().x; }),
        "y", sol::readonly_property([](PositionComponent& p) { return p.getPosition().y; }),
        "rotation", sol::readonly_property([](PositionComponent& p) { return p.getPosition().rotation; }),
        "get", &PositionComponent::getPosition
    );
}

void ScriptBindings::registerMovementComponent(sol::state& lua) {
    lua.new_usertype<MovementComponent>("MovementComponent",
        "move", &MovementComponent::move
    );
}