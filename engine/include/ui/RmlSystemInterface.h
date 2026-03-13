//
// Created by inkih on 13/3/26.
//

#ifndef MONSTERMAKERENGINE_RMLSYSTEMINTERFACE_H
#define MONSTERMAKERENGINE_RMLSYSTEMINTERFACE_H

#include <iostream>
#include <RmlUi/Core/SystemInterface.h>
#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>

class RmlSystemInterface : public Rml::SystemInterface {
public:
    double GetElapsedTime() override {
        return glfwGetTime();
    }

    bool LogMessage(Rml::Log::Type type, const Rml::String& message) override {
        std::cerr << "[ENGINE][RmlUi] " << message << std::endl;
        return true;
    }
};

#endif //MONSTERMAKERENGINE_RMLSYSTEMINTERFACE_H