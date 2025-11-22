//
// Created by inkih on 22/11/25.
//

#ifndef POKEMONGAMEENGINE_APPLICATION_H
#define POKEMONGAMEENGINE_APPLICATION_H
#include "Engine.h"
#include <memory>


class Application {
public:
    Application(const char* title, int width, int height);
    ~Application() = default;
    void update(int deltaTime);
    void run();

private:
    std::unique_ptr<Engine> m_engine;

    // Aquí irían variables del juego (ej: Player, Map)
    // World* m_world;

};

#endif //POKEMONGAMEENGINE_APPLICATION_H