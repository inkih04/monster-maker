//
// Created by inkih on 6/12/25.
//

#ifndef POKEMONGAMEENGINE_SPRITE_H
#define POKEMONGAMEENGINE_SPRITE_H

struct SpriteRect {
    float x;
    float y;
    float width;
    float height;

    SpriteRect(float x, float y, float width, float height): x(x), y(y), width(width), height(height)  {};
    SpriteRect() : x(0), y(0), width(0), height(0) {}
};

#endif //POKEMONGAMEENGINE_SPRITE_H