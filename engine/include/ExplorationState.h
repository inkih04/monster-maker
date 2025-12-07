//
// Created by inkih on 7/12/25.
//

#ifndef POKEMONGAMEENGINE_EXPLORATIONSTATE_H
#define POKEMONGAMEENGINE_EXPLORATIONSTATE_H

#include "State.h"


class ExplorationState : public State{
    public:
        void update(int deltaTime) override;
        void render() override;
        ExplorationState();
        ~ExplorationState() override = default;

    protected:
        void setEntityManager() override;

};

#endif //POKEMONGAMEENGINE_EXPLORATIONSTATE_H