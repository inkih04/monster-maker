//
// Created by inkih on 7/12/25.
//

#ifndef POKEMONGAMEENGINE_EXPLORATIONSTATE_H
#define POKEMONGAMEENGINE_EXPLORATIONSTATE_H


#include "DialogBox.h"
#include "State.h"


class ExplorationState : public State{
    public:
        void update(int deltaTime) override;
        void render() override;
        ExplorationState();
        ~ExplorationState() override = default;

    protected:
        void setEntityManager() override;
        void applyScriptContext() override;


    private:

        void renderGround() const;
        void renderDecoration() const;
        void renderEntities() const;
        void renderShadows() const;
        void renderForeground() const;
};

#endif //POKEMONGAMEENGINE_EXPLORATIONSTATE_H