//
// Created by inkih on 30/11/25.
//

#ifndef POKEMONGAMEENGINE_ENTITYMANAGER_H
#define POKEMONGAMEENGINE_ENTITYMANAGER_H

#include <memory>
#include <vector>

#include "service/CollisionService.h"
#include "ComponentsType.h"
#include "enums/EntityLayer.h"
#include "enums/EntityTag.h"
#include "Entity.h"
#include "service/BordersMapService.h"
#include "service/InteractionService.h"

class EntityManager {
    private:
        std::vector<std::unique_ptr<Entity>> m_entities;
        std::unordered_map<EntityTag, std::vector<Entity*>> m_entitiesByTag;
        std::unordered_map<EntityLayer, std::vector<Entity*>> m_entitiesByLayer;
        std::vector<Entity*> m_rawCollisionEntities;
        void initCollisionCache();
        bool isCacheStarted;
        bool isBordersMapStarted;
        std::unique_ptr<CollisionService> m_collisionService;
        std::unique_ptr<InteractionService> m_interactionService;
        std::unique_ptr<BordersMapService> m_bordersMapService;

    public:
        EntityManager();
        Entity* createEntity(EntityTag tag, EntityLayer layer);
        Entity* createEntity();

        void destroyEntity(Entity* entity);
        std::vector<Entity*> getEntitiesByTag(EntityTag tag) const;
        std::vector<Entity*> getEntitiesByLayer(EntityLayer layer) const;
        ~EntityManager();
        void updateEntities(int deltaTime);
        void renderEntities() const;


        void setCollisionEntity(Entity* entity) {m_rawCollisionEntities.push_back(entity);};
        std::vector<Entity*> getEntitiesByComponent(ComponentsType type) const;
        BordersMapService* getBordersMapService() const { return m_bordersMapService.get(); }

};

#endif //POKEMONGAMEENGINE_ENTITYMANAGER_H