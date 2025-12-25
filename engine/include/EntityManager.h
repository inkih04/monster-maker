//
// Created by inkih on 30/11/25.
//

#ifndef POKEMONGAMEENGINE_ENTITYMANAGER_H
#define POKEMONGAMEENGINE_ENTITYMANAGER_H

#include <memory>
#include <vector>
#include "ComponentsType.h"
#include "enums/EntityLayer.h"
#include "enums/EntityTag.h"

#include "Entity.h"

class EntityManager {
    private:
        std::vector<std::unique_ptr<Entity>> m_entities;
        std::unordered_map<EntityTag, std::vector<Entity*>> m_entitiesByTag;
        std::unordered_map<EntityLayer, std::vector<Entity*>> m_entitiesByLayer;

    public:
        EntityManager() = default;
        Entity* createEntity(EntityTag tag, EntityLayer layer);
        Entity* createEntity();

        void destroyEntity(Entity* entity);
        std::vector<Entity*> getEntitiesByTag(EntityTag tag) const;
        std::vector<Entity*> getEntitiesByLayer(EntityLayer layer) const;
        ~EntityManager() = default;
        void updateEntities(int deltaTime) ;
        void renderEntities() const;
        std::vector<Entity*> getEntitiesByComponent(ComponentsType type) const;


};

#endif //POKEMONGAMEENGINE_ENTITYMANAGER_H