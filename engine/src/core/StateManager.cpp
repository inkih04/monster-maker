//
// Created by inkih on 30/11/25.
//
//
// Created by inkih on 29/11/25.
//
#include "StateManager.h"

StateManager::StateManager() {
    m_states = std::stack<std::unique_ptr<State>>();
}

StateManager::~StateManager() = default;


State* StateManager::getCurrentState() {
    if (!m_states.empty())
        return m_states.top().get();

    return nullptr;
}

void StateManager::renderCurrentState() {
    if (!m_states.empty())
        m_states.top()->render();
}

void StateManager::updateCurrentState(int deltaTime) {
    if (!m_states.empty())
        m_states.top()->update(deltaTime);
}

void StateManager::pushState(std::unique_ptr<State> state) {
    state->setStateManager(this);
    m_states.push(std::move(state));
    m_states.top()->onEnter();
}

void StateManager::popState() {
    if (!m_states.empty())
        m_states.pop();
    if (!m_states.empty()) {
        m_states.top()->onEnter();
    }
}