//
// Created by inkih on 6/12/25.
//
#pragma once

struct Position {
    float x;
    float y;
    float rotation;

    Position(): x(0.0f), y(0.0f), rotation(0.0f) {};
    Position(float x, float y, float rotation) : x(x), y(y), rotation(rotation) {};
};
