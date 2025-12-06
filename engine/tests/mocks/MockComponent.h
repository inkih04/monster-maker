//
// Created by inkih on 30/11/25.
//

#ifndef POKEMONGAMEENGINE_MOCKCOMPONENT_H
#define POKEMONGAMEENGINE_MOCKCOMPONENT_H

#pragma once
#include "../../include/components/Component.h"

class MockComponent : public Component {
public:
    bool updateCalled = false;
    bool renderCalled = false;

    void update(int deltaTime) override {
        updateCalled = true;
    }

    void render() override {
        renderCalled = true;
    }
};




#endif //POKEMONGAMEENGINE_MOCKCOMPONENT_H