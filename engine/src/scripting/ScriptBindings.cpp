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
#include "DialogTypes.h"
#include "DialogLoader.h"
#include "DialogManager.h"
#include "LocalizationManager.h"
#include "AnimationComponent.h"
#include "BlockEntityComponentByTag.h"
#include "ColliderComponent.h"
#include "PersistenceComponent.h"

void ScriptBindings::registerStatic(sol::state& lua, SessionManager& sessionManager, SaveManager& save_manager, DataManager& dataManager) {
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
    registerDialog(lua);
    registerLocalization(lua);
    registerSessionManager(lua, sessionManager);
    registerSaveManager(lua, save_manager);
    registerDataManager(lua, dataManager);
    registerBlockEntityComponentByTagService(lua);
}

void ScriptBindings::registerDataManager(sol::state& lua, DataManager& dataManager) {
    lua.new_usertype<DataManager>("DataManager",
        sol::no_constructor,
        "get", &DataManager::get,
        "has", &DataManager::has
    );
    lua["Data"] = std::ref(dataManager);
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
        "commit", &SaveManager::commitToFile,
        "setTrue",  &SaveManager::setTrue,
        "setFalse", &SaveManager::setFalse
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
        sol::no_constructor,
        "isOpen", &UiDocument::isOpen,
        "close",  &UiDocument::close,
        "update", &UiDocument::updateModel
    );

    lua.new_usertype<UiManager>("UiManager",
        sol::no_constructor,
        "open", [](UiManager& self,
                   const std::string& id,
                   const std::string& uiFilePath,
                   sol::optional<sol::table> data) -> UiDocument*
        {
            return self.openDocument(id, EditorConfig::getInstance().getTag(uiFilePath), data);
        },
        "close",  [](UiManager& self, const std::string& id) {
            self.closeDocument(id);
        },
        "isOpen", [](UiManager& self, const std::string& id) {
            return self.isOpen(id);
        },
        "get",    [](UiManager& self, const std::string& id) -> UiDocument* {
            return self.getDocument(id);
        }
    );

    lua["UI"] = &UiManager::getInstance();
}

void ScriptBindings::registerDialog(sol::state& lua) {
    lua.new_usertype<DialogChoice>("DialogChoice",
        sol::no_constructor,
        "text",      sol::readonly(&DialogChoice::text),
        "nextChain", sol::readonly(&DialogChoice::nextChain)
    );

    lua.new_usertype<DialogFile>("DialogFile",
        sol::no_constructor,
        sol::meta_function::index,
        [](const DialogFile& self, sol::stack_object key) -> sol::optional<DialogChain>
        {
            if (key.is<std::string>()) {
                const auto* chain = self.find(key.as<std::string>());
                if (chain) return *chain;
            } else if (key.is<int>()) {
                const auto* chain = self.at(static_cast<std::size_t>(key.as<int>()));
                if (chain) return *chain;
            }
            return sol::nullopt;
        }
    );

    lua.new_usertype<DialogChain>("DialogChain",
        sol::no_constructor,
        "id",    sol::readonly(&DialogChain::id),
        "count", [](const DialogChain& c) { return c.pages.size(); }
    );

    sol::table dialog = lua.create_named_table("Dialog");

    dialog["load"] = [](const std::string& path) -> DialogFile {
        try {
            return DialogLoader::loadFile(EditorConfig::getInstance().getTag(path));
        } catch (const std::exception& e) {
            throw sol::error(e.what());
        }
    };

    dialog["open"] = [](const std::string& id,
                         const std::string& rmlPath,
                         const DialogChain& chain,
                         const sol::table& varMapping)
    {
        const std::string speakerVar = varMapping.get_or<std::string>("speaker", "speaker");
        const std::string textVar    = varMapping.get_or<std::string>("text",    "text");
        DialogManager::getInstance().open(
            id,
            EditorConfig::getInstance().getTag(rmlPath),
            chain,
            speakerVar,
            textVar);
    };

    dialog["openFromFile"] = [](const std::string& id,
                                 const std::string& rmlPath,
                                 const DialogFile&  file,
                                 const std::string& chainId,
                                 const sol::table&  varMapping)
    {
        const DialogChain* chain = file.find(chainId);
        if (!chain)
            throw sol::error("[Dialog.openFromFile] chain id not found: " + chainId);

        const std::string speakerVar = varMapping.get_or<std::string>("speaker", "speaker");
        const std::string textVar    = varMapping.get_or<std::string>("text",    "text");
        DialogManager::getInstance().registerFile(id, file);
        DialogManager::getInstance().open(
            id,
            EditorConfig::getInstance().getTag(rmlPath),
            *chain,
            speakerVar,
            textVar);
    };

    dialog["interact"] = [](const std::string& id,
                             const std::string& rmlPath,
                             const DialogFile& file,
                             const std::string& startChainId,
                             const sol::table& varMapping) -> bool
    {
        const std::string speakerVar = varMapping.get_or<std::string>("speaker", "speaker");
        const std::string textVar    = varMapping.get_or<std::string>("text",    "text");
        std::string resolvedPath = EditorConfig::getInstance().getTag(rmlPath);
        return DialogManager::getInstance().interact(id, resolvedPath, file, startChainId, speakerVar, textVar);
    };

    dialog["updateNavigation"] = [](const std::string& id, int upKey, int downKey) {
        DialogManager::getInstance().updateNavigation(id, upKey, downKey);
    };

    dialog["advance"] = [](const std::string& id) -> bool {
        return DialogManager::getInstance().advance(id);
    };

    dialog["close"] = [](const std::string& id) {
        DialogManager::getInstance().close(id);
    };

    dialog["isActive"] = [](const std::string& id) -> bool {
        return DialogManager::getInstance().isActive(id);
    };

    dialog["hasChoices"] = [](const std::string& id) -> bool {
        return DialogManager::getInstance().hasChoices(id);
    };

    dialog["moveChoice"] = [](const std::string& id, int delta) {
        DialogManager::getInstance().moveChoice(id, delta);
    };

    dialog["getChoiceIndex"] = [](const std::string& id) -> int {
        return DialogManager::getInstance().getChoiceIndex(id);
    };

    dialog["getSelectedTarget"] = [](const std::string& id) -> std::string {
        return DialogManager::getInstance().getSelectedTarget(id);
    };

    dialog["jump"] = [](const std::string& id, const std::string& chainId) -> bool {
        return DialogManager::getInstance().jumpToChain(id, chainId);
    };

    dialog["registerFile"] = [](const std::string& id, const DialogFile& file) {
        DialogManager::getInstance().registerFile(id, file);
    };
}

void ScriptBindings::registerLocalization(sol::state& lua) {
    sol::table lang = lua.create_named_table("Lang");

    lang["load"] = [](const std::string& langCode) {
        LocalizationManager::getInstance().load(langCode);
    };

    lang["get"] = [](const std::string& key) -> const std::string& {
        return LocalizationManager::getInstance().get(key);
    };

    lang["current"] = []() -> const std::string& {
        return LocalizationManager::getInstance().getCurrentLang();
    };
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
        "isPlaying",   &AnimationComponent::isPlaying,
        "currentAnim", &AnimationComponent::getCurrentAnimationName,
        "setIsActive", &AnimationComponent::setIsActive,
        "getIsActive", &AnimationComponent::isActive
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
        "setMusicVolume",  &AudioService::setMusicVolume,
        "setSfxVolume",    &AudioService::setSfxVolume
    );

    lua["Audio"] = &AudioService::getInstance();
}

void ScriptBindings::registerDynamic(sol::state& lua, Camera* camera, EntityManager& entityManager) {
    lua["World"]      = &entityManager;
    lua["MainCamera"] = camera;
    lua["Borders"]    = entityManager.getBordersMapService();

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
        "getId", &Entity::getId,
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
        "getRender", [](Entity& e) -> RenderComponent* {
            auto* comp = e.getComponent(ComponentsType::RENDER);
            if (!comp) {
                std::cout << "[ENGINE][WARNING] Trying to access a component that the entity does not have: RenderComponent" << std::endl;
                return nullptr;
            }
            return static_cast<RenderComponent*>(comp);
        },
        "getAnim", [](Entity& e) -> AnimationComponent* {
            auto* comp = e.getComponent(ComponentsType::ANIMATION);
            if (!comp) {
                std::cout << "[ENGINE][WARNING] Trying to access a component that the entity does not have: AnimationComponent" << std::endl;
                return nullptr;
            }
            return static_cast<AnimationComponent*>(comp);
        },
        "getInteract", [](Entity& e) -> InteractionComponent* {
            auto* comp = e.getComponent(ComponentsType::INTERACTION);
            if (!comp) {
                std::cout << "[ENGINE][WARNING] Trying to access a component that the entity does not have: InteractionComponent" << std::endl;
                return nullptr;
            }
            return static_cast<InteractionComponent*>(comp);
        },
        "getCollider", [](Entity& e) -> CollisionComponent* {
            auto* comp = e.getComponent(ComponentsType::COLLIDER);
            if (!comp) {
                std::cout << "[ENGINE][WARNING] Trying to access a component that the entity does not have: CollisionComponent" << std::endl;
                return nullptr;
            }
            return static_cast<CollisionComponent*>(comp);
        },
        "getPersistence", [](Entity& e) -> PersistentComponent* {
            auto* comp = e.getComponent(ComponentsType::PERSISTENCE);
            if (!comp) {
                std::cout << "[ENGINE][WARNING] Trying to access a component that the entity does not have: PersistentComponent" << std::endl;
                return nullptr;
            }
            return static_cast<PersistentComponent*>(comp);
        },
        "interact", [](Entity& e) {
            auto* service = e.getInteractionService();
            if (service) {
                service->tryInteract(&e);
            }
        },
        "addPosition", [](Entity& e, float x, float y) {
            e.addComponent(ComponentsType::POSITION, std::make_unique<PositionComponent>(x, y));
        },
        "addRender", [](Entity& e, const std::string& spriteSheetPath,
                         sol::optional<float> x, sol::optional<float> y,
                         sol::optional<float> w, sol::optional<float> h,
                         sol::optional<float> width, sol::optional<float> height) {
            int shaderMode = EditorConfig::getInstance().getShaderMode("default");
            e.addComponent(ComponentsType::RENDER, std::make_unique<RenderComponent>(
                EditorConfig::getInstance().getTag(spriteSheetPath),
                x.value_or(-1.0f), y.value_or(-1.0f),
                w.value_or(-1.0f), h.value_or(-1.0f),
                width.value_or(32.0f), height.value_or(32.0f),
                shaderMode
            ));
        },
        "addMovement", [](Entity& e) {
            e.addComponent(ComponentsType::MOVEMENT, std::make_unique<MovementComponent>());
        },
        "addInteraction", [](Entity& e) {
            e.addComponent(ComponentsType::INTERACTION, std::make_unique<InteractionComponent>());
        },
        "addAnimation", [](Entity& e) -> AnimationComponent* {
            auto anim = std::make_unique<AnimationComponent>();
            AnimationComponent* ptr = anim.get();
            e.addComponent(ComponentsType::ANIMATION, std::move(anim));
            return ptr;
        },
        "addCollider", [](Entity& e, int width, int height, sol::optional<int> offsetX, sol::optional<int> offsetY, sol::optional<bool> trigger) -> CollisionComponent* {
            auto collider = std::make_unique<CollisionComponent>(
                width,
                height,
                offsetX.value_or(0),
                offsetY.value_or(0),
                trigger.value_or(false)
            );
            CollisionComponent* ptr = collider.get();
            e.addComponent(ComponentsType::COLLIDER, std::move(collider));
            return ptr;
        },
        "addPersistence", [](Entity& e, const std::string& saveFlag) {
            e.addComponent(ComponentsType::PERSISTENCE, std::make_unique<PersistentComponent>(saveFlag));
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
        "setZoom",    &Camera::setZoom,
        "getPosition",&Camera::getPosition,
        "getWidth",   &Camera::getWidth,
        "getHeight",  &Camera::getHeight
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
        "getEntitiesByTag",   &EntityManager::getEntitiesByTag,
        "getEntitiesByLayer", &EntityManager::getEntitiesByLayer,
        "createEntity", [](EntityManager& em, EntityTag tag, EntityLayer layer) -> Entity* {
            return em.createEntity(tag, layer, "");
        },
        "destroyEntity", [](EntityManager& em, Entity* entity) {
            if (!entity) {
                std::cout << "[ENGINE][WARNING] World:destroyEntity called with nil entity." << std::endl;
                return;
            }
            em.destroyEntity(entity);
        },
        "registerCollider", [](EntityManager& em, Entity* entity) {
            if (!entity) {
                std::cout << "[ENGINE][WARNING] World:registerCollider called with nil entity." << std::endl;
                return;
            }
            em.registerCollisionEntity(entity);
        }
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
    keys["UP"]    = GLFW_KEY_UP;
    keys["DOWN"]  = GLFW_KEY_DOWN;
    keys["LEFT"]  = GLFW_KEY_LEFT;
    keys["RIGHT"] = GLFW_KEY_RIGHT;
    lua["Keys"] = keys;
}

void ScriptBindings::registerInputManager(sol::state& lua) {
    lua.new_usertype<InputManager>("InputManager",
        "isKeyDown",    &InputManager::isKeyDown,
        "isKeyPressed", &InputManager::isKeyPressed
    );
    lua["Input"] = &InputManager::getInstance();
}

void ScriptBindings::registerComponents(sol::state& lua) {
    registerPositionComponent(lua);
    registerMovementComponent(lua);
    registerRenderComponent(lua);
    registerInteractionComponent(lua);
    registerAnimationComponent(lua);
    registerPersistentComponent(lua);
    registerComponentsTypeEnum(lua);
}

void ScriptBindings::registerInteractionComponent(sol::state& lua) {
    lua.new_usertype<InteractionComponent>("InteractionComponent",
        "setIsActive", &InteractionComponent::setIsActive,
        "getIsActive", &InteractionComponent::isActive
    );
}

void ScriptBindings::registerRenderComponent(sol::state& lua) {
    lua.new_usertype<RenderComponent>("RenderComponent",
        "setIsActive", &RenderComponent::setIsActive,
        "getIsActive", &RenderComponent::isActive
    );
}

 void ScriptBindings::registerPersistentComponent(sol::state& lua) {
    lua.new_usertype<PersistentComponent>("PersistentComponent",
        "getSaveFlag", &PersistentComponent::get_save_flag,
        "setIsActive", &PersistentComponent::setIsActive,
        "getIsActive", &PersistentComponent::isActive
    );
}

void ScriptBindings::registerPositionComponent(sol::state& lua) {
    lua.new_enum<Direction>("Direction", {
        {"TOP",     Direction::TOP},
        {"BOTTOM",  Direction::BOTTOM},
        {"LEFT",    Direction::LEFT},
        {"RIGHT",   Direction::RIGHT},
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
        "get", &PositionComponent::getPosition,
        "setIsActive", &PositionComponent::setIsActive,
        "getIsActive", &PositionComponent::isActive
    );
}

void ScriptBindings::registerMovementComponent(sol::state& lua) {
    lua.new_usertype<MovementComponent>("MovementComponent",
        "move", &MovementComponent::move,
        "setIsActive", &MovementComponent::setIsActive,
        "getIsActive", &MovementComponent::isActive
    );
}

void ScriptBindings::registerComponentsTypeEnum(sol::state& lua) {
    lua.new_enum<ComponentsType>("ComponentsType", {
        {"POSITION",    ComponentsType::POSITION},
        {"RENDER",      ComponentsType::RENDER},
        {"COLLIDER",    ComponentsType::COLLIDER},
        {"ANIMATION",   ComponentsType::ANIMATION},
        {"MOVEMENT",    ComponentsType::MOVEMENT},
        {"SCRIPT",      ComponentsType::SCRIPT},
        {"INTERACTION", ComponentsType::INTERACTION},
        {"PERSISTENCE", ComponentsType::PERSISTENCE}
    });
}

void ScriptBindings::registerBlockEntityComponentByTagService(sol::state& lua) {
    lua.new_usertype<BlockEntityComponentByTag>("BlockEntityComponentByTag",
        sol::no_constructor,
        "block",   &BlockEntityComponentByTag::blockComponent,
        "unblock", &BlockEntityComponentByTag::unblockComponent
    );
}