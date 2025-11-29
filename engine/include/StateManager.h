#pragma once
//
// Created by inkih on 29/11/25.
//

#include <stack>
#include <memory>
#include "State.h"

#ifndef POKEMONGAMEENGINE_STATEMANGER_H
#define POKEMONGAMEENGINE_STATEMANGER_H

class StateManager {
private:
    std::stack<std::unique_ptr<State>> m_states;

public:
    StateManager();
    ~StateManager();

    StateManager(const StateManager&) = delete;
    StateManager& operator=(const StateManager&) = delete;

    StateManager(StateManager&&) = default;
    StateManager& operator=(StateManager&&) = default;

    State* getCurrentState();
    void renderCurrentState();
    void updateCurrentState(int deltaTime);
    void pushState(std::unique_ptr<State> state);
    void popState();
};

#endif //POKEMONGAMEENGINE_STATEMANGER_H