//
// Created by inkih on 30/11/25.
//

#ifndef POKEMONGAMEENGINE_ENTITY_H
#define POKEMONGAMEENGINE_ENTITY_H
#include "ComponentsType.h"
#include <unordered_map>
#include <memory>
#include "components/Component.h"
#include "service/InteractionService.h"

class CollisionService;
class InteractionService;

class Entity {
    private:
        std::unordered_map<ComponentsType, std::unique_ptr<Component>> components;
        CollisionService* m_collisionService;
        InteractionService* m_interactionService;
        bool isActive;
    public:
        Entity(): m_collisionService(nullptr), isActive(true) {};
        void disableEntity();
        void addComponent(ComponentsType type, std::unique_ptr<Component> component);
        Component* getComponent(ComponentsType type);
        CollisionService* getCollisionService();
        InteractionService* getInteractionService();
        void setCollisionService(CollisionService* collisionService) {m_collisionService = collisionService;};
        void setInteractionService(InteractionService* interactionService) {m_interactionService = interactionService;};
        bool hasComponent(ComponentsType type) const;
        void update(int deltaTime);
        void render();
};

#endif //POKEMONGAMEENGINE_ENTITY_H