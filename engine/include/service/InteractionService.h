//
// Created by inkih on 31/1/26.
//

#ifndef MONSTERMAKERENGINE_INTERACTIONSERVICE_H
#define MONSTERMAKERENGINE_INTERACTIONSERVICE_H

#include "CollisionService.h"

class InteractionService {
    private:
        CollisionService* m_collisionService;

    public:
        InteractionService(CollisionService* colService) : m_collisionService(colService) {}
        void tryInteract(Entity* initiator) const;
};

#endif //MONSTERMAKERENGINE_INTERACTIONSERVICE_H