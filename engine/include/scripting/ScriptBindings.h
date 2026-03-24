//
// Created by inkih on 13/12/25.
//

#ifndef POKEMONGAMEENGINE_SCRIPTBINDINGS_H
#define POKEMONGAMEENGINE_SCRIPTBINDINGS_H

#include <sol/sol.hpp>

#include "Camera.h"
#include "SessionManager.h"

class EntityManager;

class ScriptBindings {
    private:
        static void registerKeys(sol::state& lua);
        static void registerInputManager(sol::state &lua);
        static void registerComponents(sol::state &lua);
        static void registerInteractionComponent(sol::state &lua);
        static void registerRenderComponent(sol::state &lua);
        static void registerPositionComponent(sol::state &lua);
        static void registerMovementComponent(sol::state &lua);
        static void registerTags(sol::state &lua);
        static void registerLayers(sol::state &lua);
        static void registerEntityManager(sol::state &lua);
        static void registerCamera(sol::state &lua);
        static void registerEntity(sol::state &lua);
        static void registerAudioService(sol::state &lua);
        static void registerBordersMapService(sol::state &lua);
        static void registerAnimationComponent(sol::state &lua);
        static void registerUiManager(sol::state &lua);
        static void registerConfig(sol::state &lua);
        static void registerSessionManager(sol::state &lua, SessionManager &sessionManager);

    public:
        static void registerStatic(sol::state &lua, SessionManager &sessionManager);
        static void registerConfigTags(sol::state &lua);
        static void registerDynamic(sol::state& lua,Camera* camera, EntityManager& entityManager);


};

#endif //POKEMONGAMEENGINE_SCRIPTBINDINGS_H