//
// Created by inkih on 6/12/25.
//
#pragma once
#include "GameConfig.h"

struct Position {
    float x;
    float y;
    float rotation;

    Position(float x, float y): x(x), y(y), rotation(0.0f) {};
    Position(): x(0.0f), y(0.0f), rotation(0.0f) {};
    Position(float x, float y, float rotation) : x(x), y(y), rotation(rotation) {};

    bool operator==(const Position& other) const {
        return std::abs(x - other.x) < 0.001f &&
               std::abs(y - other.y) < 0.001f;
    }
};
namespace std {
    template <>
    struct hash<Position> {
        size_t operator()(const Position& p) const {
            int gridX = static_cast<int>(std::floor(p.x / GameConfig::GridSize));
            int gridY = static_cast<int>(std::floor(p.y / GameConfig::GridSize));
            return std::hash<int>{}(gridX) ^ (std::hash<int>{}(gridY) << 1);
        }
    };
}