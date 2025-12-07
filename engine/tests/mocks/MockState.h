//
// Created by inkih on 29/11/25.
//

#ifndef POKEMONGAMEENGINE_MOCKSTATE_H
#define POKEMONGAMEENGINE_MOCKSTATE_H
#include "State.h"


class MockState : public State {
public:
    bool updateCalled = false;
    bool renderCalled = false;

    void update(int deltaTime) override { updateCalled = true; }
    void render() override { renderCalled = true; }
    void setEntityManager() override {}
};


#endif //POKEMONGAMEENGINE_MOCKSTATE_H