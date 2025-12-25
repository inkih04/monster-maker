//
// Created by inkih on 29/11/25.
//
#ifndef POKEMONGAMEENGINE_STATE_H
#define POKEMONGAMEENGINE_STATE_H

#include "EntityManager.h"

class StateManager;

class State {
    protected:
        StateManager* m_stateManager = nullptr;
        std::unique_ptr<EntityManager> m_entityManager = nullptr;
        virtual void setEntityManager() = 0;

    public:
        State() = default;
        virtual ~State() = default;
        virtual void render() = 0;
        virtual void update(int deltaTime) = 0;
        void setStateManager(StateManager* stateManager){ m_stateManager = stateManager;};


};

#endif //POKEMONGAMEENGINE_STATE_H