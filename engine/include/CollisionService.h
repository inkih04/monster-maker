//
// Created by inkih on 26/1/26.
//

#ifndef POKEMONGAMEENGINE_COLLISIONSERVICE_H
#define POKEMONGAMEENGINE_COLLISIONSERVICE_H
#include <unordered_map>

#include "Position.h"

class Entity;

class CollisionService {
    private:
        std::unordered_map<Position, Entity*> m_collisionEntities;


    public:
        CollisionService() = default;
        bool isAreaFree(const Position &targetPos, int width, int height, const Entity *source);

        void removeEntity(Entity *entity);

        void updatePositionCollisionCache(const Position& oldPos, const Position& newPos, Entity* entity);
        void initCollisionCache(const std::vector<Entity*>& collisionEntities);

};

#endif //POKEMONGAMEENGINE_COLLISIONSERVICE_H