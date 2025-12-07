//
// Created by inkih on 30/11/25.
//

#ifndef POKEMONGAMEENGINE_ENTITYMANAGER_H
#define POKEMONGAMEENGINE_ENTITYMANAGER_H

#include <memory>
#include <vector>
#include "ComponentsType.h"

#include "Entity.h"

class EntityManager {
    private:
        std::vector<std::unique_ptr<Entity>> m_entities;

    public:
        EntityManager() = default;
        Entity* createEntity();
        ~EntityManager() = default;
        void updateEntities(int deltaTime) const;
        void renderEntities() const;
        std::vector<Entity*> getEntitiesByComponent(ComponentsType type) const;


};

#endif //POKEMONGAMEENGINE_ENTITYMANAGER_H