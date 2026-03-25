//
// Created by inkih on 22/11/25.
//

#ifndef POKEMONGAMEENGINE_APPLICATION_H
#define POKEMONGAMEENGINE_APPLICATION_H
#include "Engine.h"
#include <memory>

#include "SaveManager.h"
#include "SessionManager.h"
#include "StateManager.h"


class Application {
public:
    Application(int width, int height);
    ~Application() = default;
    void update(int deltaTime);
    void run();
    void render();

private:
    std::unique_ptr<Engine> m_engine;
    StateManager m_stateManager;
    SessionManager m_sessionManager;
    SaveManager m_saveManager;
};

#endif //POKEMONGAMEENGINE_APPLICATION_H