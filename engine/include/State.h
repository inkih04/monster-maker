//
// Created by inkih on 29/11/25.
//
#ifndef POKEMONGAMEENGINE_STATE_H
#define POKEMONGAMEENGINE_STATE_H

class StateManager;

class State {
    protected:
        StateManager* m_stateManager = nullptr;
    public:
        State() = default;
        virtual ~State() = default;
        virtual void render() = 0;
        virtual void update(int deltaTime) = 0;

};

#endif //POKEMONGAMEENGINE_STATE_H