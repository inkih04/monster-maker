//
// Created by inkih on 24/1/26.
//

#ifndef POKEMONGAMEENGINE_SCRIPTCOMPONET_H
#define POKEMONGAMEENGINE_SCRIPTCOMPONET_H

#include "components/Component.h"
#include <sol/sol.hpp>
#include <string>

class ScriptComponent : public Component {
    private:
        std::string m_scriptPath;
        sol::protected_function m_luaStart;
        sol::protected_function m_luaUpdate;
        sol::protected_function m_luaDestroy;
        sol::protected_function m_luaOnCollision;
        sol::protected_function m_luaOnTriggerEnter;
        sol::protected_function m_luaOnInteract;

        bool m_initialized = false;
        bool m_startCalled = false;

    public:
        explicit ScriptComponent(std::string path);
        ~ScriptComponent() override;

        void executeOnCollision(Entity* other);

        void executeOnInteract(Entity *other);

        void executeOnTriggerEnter(Entity* other);

        void init();
        void update(int deltaTime) override;
        void render() override {};
};

#endif //POKEMONGAMEENGINE_SCRIPTCOMPONET_H