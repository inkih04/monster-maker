//
// Created by inkih on 31/1/26.
//

#ifndef MONSTERMAKERENGINE_INTERACTIONCOMPONENT_H
#define MONSTERMAKERENGINE_INTERACTIONCOMPONENT_H
#include "Component.h"

class InteractionComponent : public Component {

    public:
    InteractionComponent() {};
    void update(int deltaTime) override {};
    void render() override {};
};

#endif //MONSTERMAKERENGINE_INTERACTIONCOMPONENT_H