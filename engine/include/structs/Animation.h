//
// Created by inkih on 12/12/25.
//

#ifndef POKEMONGAMEENGINE_ANIMATION_H
#define POKEMONGAMEENGINE_ANIMATION_H
#include <string>
#include <vector>

struct SpriteRect;

struct Animation {
    std::string name;
    std::vector<SpriteRect> frames;
    float frameDuration;  // Milisegundos
    bool loop;
    int priority;
};

#endif //POKEMONGAMEENGINE_ANIMATION_H