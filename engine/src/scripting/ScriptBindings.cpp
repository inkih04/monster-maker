#include <GL/glew.h>
#include "scripting/ScriptBindings.h"
#include <GLFW/glfw3.h>
#include "Camera.h"
#include "EntityManager.h"
#include "EntityTag.h"
#include "InputManager.h"
#include "MovementComponent.h"
#include "PositionComponent.h"
#include "RenderComponent.h"
#include "AudioService.h"
#include "EditorConfig.h"
#include "InteractionComponent.h"
#include "ScriptEngine.h"
#include "UiManager.h"

void ScriptBindings::registerStatic(sol::state& lua, SessionManager& sessionManager, SaveManager& save_manager) {
    registerKeys(lua);
    registerInputManager(lua);
    registerComponents(lua);
    registerTags(lua);
    registerLayers(lua);
    registerEntity(lua);
    registerEntityManager(lua);
    registerCamera(lua);
    registerAudioService(lua);
    registerBordersMapService(lua);
    registerUiManager(lua);
    registerConfigTags(lua);
    registerConfig(lua);
    registerSessionManager(lua, sessionManager);
    registerSaveManager(lua, save_manager);
}

void ScriptBindings::registerSessionManager(sol::state& lua, SessionManager& sessionManager) {
    lua.new_usertype<SessionManager>("SessionManager",
        sol::no_constructor,
        "set",    &SessionManager::set,
        "get",    &SessionManager::get,
        "has",    &SessionManager::has,
        "remove", &SessionManager::remove,
        "clear",  &SessionManager::clear
    );
    lua["Session"] = std::ref(sessionManager);
}

void ScriptBindings::registerSaveManager(sol::state& lua, SaveManager& saveManager) {
    lua.new_usertype<SaveManager>("SaveManager",
        sol::no_constructor,
        "set",    &SaveManager::set,
        "get",    &SaveManager::get,
        "has",    &SaveManager::has,
        "remove", &SaveManager::remove,
        "clear",  &SaveManager::clear,

        "load",   &SaveManager::loadFromFile,
        "commit", &SaveManager::commitToFile
    );
    lua["Save"] = std::ref(saveManager);
}


void ScriptBindings::registerConfig(sol::state& lua) {
    lua.new_usertype<EditorConfig>("EditorConfig",
        sol::no_constructor,
        "setLetterboxing", &EditorConfig::setLetterboxing,
        "getLetterboxing", &EditorConfig::getLetterboxing,
        "getGameName", &EditorConfig::getGameName,
        "getGameVersion", &EditorConfig::getGameVersion
    );
    lua["Config"] = &EditorConfig::getInstance();
}

void ScriptBindings::registerConfigTags(sol::state& lua) {
    sol::table tagsTable = lua.create_table();
    for (const auto& [name, path] : EditorConfig::getInstance().getTags()) {
        tagsTable[name] = path;
    }
    lua["tags"] = tagsTable;
}

void ScriptBindings::registerUiManager(sol::state& lua) {
    lua.new_usertype<UiDocument>("UiDocument",
        "isOpen", &UiDocument::isOpen,
        "close",  &UiDocument::close
    );

    lua.new_usertype<UiManager>("UiManager",
        sol::no_constructor,
        "open",    [](UiManager& self, const std::string& id, const std::string& uiFilePath) -> UiDocument* {
            return self.openDocument(id, EditorConfig::getInstance().getTag(uiFilePath));
        },
        "close",   [](UiManager& self, const std::string& id) {
            self.closeDocument(id);
        },
        "isOpen",  [](UiManager& self, const std::string& id) {
            return self.isOpen(id);
        },
        "get",     [](UiManager& self, const std::string& id) -> UiDocument* {
            return self.getDocument(id);
        }
    );

    lua["UI"] = &UiManager::getInstance();
}


void ScriptBindings::registerBordersMapService(sol::state& lua) {
    lua.new_usertype<BordersMapService>("BordersMapService",
        "isOutOfBounds", [](BordersMapService& self, const Position& pos, float offsetX, float offsetY) {
            return self.isOutOfBounds(pos, glm::vec2(offsetX, offsetY));
        },
        "clampCamera", &BordersMapService::clampCameraPosition
    );
}

void ScriptBindings::registerAnimationComponent(sol::state& lua) {
    lua.new_usertype<AnimationComponent>("AnimationComponent",
        "setSet",  &AnimationComponent::setActiveSet,
        "getSet",  &AnimationComponent::getActiveSet,

        "play", [](AnimationComponent& anim, const std::string& name, sol::optional<bool> forceRestart) {
            anim.play(name, forceRestart.value_or(false));
        },
        "pause",  &AnimationComponent::pause,
        "resume", &AnimationComponent::resume,
        "stop",   &AnimationComponent::stop,

        "isPlaying",       &AnimationComponent::isPlaying,
        "currentAnim",     &AnimationComponent::getCurrentAnimationName
    );
}

void ScriptBindings::registerAudioService(sol::state& lua) {
    lua.new_usertype<AudioService>("AudioService",
        sol::no_constructor,

        "playMusic", [](AudioService& self, const std::string& path, sol::optional<bool> loop) {
            self.playMusic(EditorConfig::getInstance().getTag(path), loop.value_or(true));
        },
        "playSound", &AudioService::playSound,
        "stopMusic", &AudioService::stopMusic,
        "pauseMusic", &AudioService::pauseMusic,

        "setMasterVolume", &AudioService::setMasterVolume,
        "setMusicVolume", &AudioService::setMusicVolume,
        "setSfxVolume", &AudioService::setSfxVolume
    );

    lua["Audio"] = &AudioService::getInstance();
}

void ScriptBindings::registerDynamic(sol::state& lua, Camera* camera, EntityManager& entityManager) {
    lua["World"] = &entityManager;
    lua["MainCamera"] = camera;
    lua["Borders"] = entityManager.getBordersMapService();

    lua.set_function("GetEntity", [&entityManager](EntityTag tag) -> Entity* {
        auto entities = entityManager.getEntitiesByTag(tag);
        return entities.empty() ? nullptr : entities[0];
    });

    lua.set_function("loadMap", [](const std::string& path) {
        ScriptEngine::getInstance().requestMapChange(EditorConfig::getInstance().getTag(path));
    });
}

void ScriptBindings::registerEntity(sol::state& lua) {
    lua.new_usertype<Entity>("Entity",
        "hasComponent", &Entity::hasComponent,
        "disable", &Entity::disableEntity,
        "getPos", [](Entity& e) -> PositionComponent* {
            auto* comp = e.getComponent(ComponentsType::POSITION);
            if (!comp) {
                std::cout << "[ENGINE][WARNING] Trying to access a component that the entity does not have: PositionComponent" << std::endl;
                return nullptr;
            }
            return static_cast<PositionComponent*>(comp);
        },
        "getMove", [](Entity& e) -> MovementComponent* {
            auto* comp = e.getComponent(ComponentsType::MOVEMENT);
            if (!comp) {
                std::cout << "[ENGINE][WARNING] Trying to access a component that the entity does not have: MovementComponent" << std::endl;
                return nullptr;
            }
            return static_cast<MovementComponent*>(comp);
        },
        "interact", [](Entity& e) {
            auto* service = e.getInteractionService();
            if (service) {
                service->tryInteract(&e);
            }
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
        "getPosition", &Camera::getPosition,
        "getWidth",  &Camera::getWidth,
        "getHeight", &Camera::getHeight
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
    registerRenderComponent(lua);
    registerInteractionComponent(lua);
}

void ScriptBindings::registerInteractionComponent(sol::state& lua) {
    lua.new_usertype<InteractionComponent>("InteractionComponent");
}

void ScriptBindings::registerRenderComponent(sol::state& lua) {
    lua.new_usertype<RenderComponent>("RenderComponent",
        "setIsActive", &RenderComponent::setIsActive,
        "getIsActive", &RenderComponent::getIsActive
    );
}

void ScriptBindings::registerPositionComponent(sol::state& lua) {
    lua.new_enum<Direction>("Direction", {
        {"TOP",    Direction::TOP},
        {"BOTTOM", Direction::BOTTOM},
        {"LEFT",   Direction::LEFT},
        {"RIGHT",  Direction::RIGHT},
        {"UNKNOWN", Direction::UNKNOWN}
    });

    lua.new_usertype<Position>("Position",
        sol::constructors<Position(), Position(float, float)>(),
        "x", &Position::x,
        "y", &Position::y
    );

    lua.new_usertype<PositionComponent>("PositionComponent",
        "x", sol::readonly_property([](PositionComponent& p) { return p.getPosition().x; }),
        "y", sol::readonly_property([](PositionComponent& p) { return p.getPosition().y; }),
        "direction", sol::property(&PositionComponent::getDirection, &PositionComponent::setDirection),
        "get", &PositionComponent::getPosition
    );
}

void ScriptBindings::registerMovementComponent(sol::state& lua) {
    lua.new_usertype<MovementComponent>("MovementComponent",
        "move", &MovementComponent::move
    );
}