//
// Created by inkih on 6/12/25.
//
#pragma once
#include <cmath>
#include <functional>
#include "GameConfig.h"

struct Position {
    int x;
    int y;

    Position(int x, int y): x(x), y(y) {};
    Position(): x(0), y(0) {};

    bool operator==(const Position& other) const {
        return x == other.x && y == other.y;
    }
};

namespace std {
    template <>
    struct hash<Position> {
        size_t operator()(const Position& p) const {
            int gridX = p.x / GameConfig::GridSize;
            int gridY = p.y / GameConfig::GridSize;
            return std::hash<int>{}(gridX) ^ (std::hash<int>{}(gridY) << 1);
        }
    };
}