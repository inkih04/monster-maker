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

        bool m_initialized = false;
        bool m_startCalled = false;

    public:
        explicit ScriptComponent(std::string path);
        ~ScriptComponent() override;

        void init();
        void update(int deltaTime) override;
        void render() override {};
};

#endif //POKEMONGAMEENGINE_SCRIPTCOMPONET_H