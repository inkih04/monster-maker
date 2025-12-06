//
// Created by inkih on 30/11/25.
//

#ifndef POKEMONGAMEENGINE_ENTITY_H
#define POKEMONGAMEENGINE_ENTITY_H
#include "ComponentsType.h"
#include <unordered_map>
#include <memory>
#include "components/Component.h"

class Entity {
    private:
        std::unordered_map<ComponentsType, std::unique_ptr<Component>> components;
    public:
        void addComponent(ComponentsType type, std::unique_ptr<Component> component);
        Component* getComponent(ComponentsType type);
        bool hasComponent(ComponentsType type) const;
        void update(int deltaTime);
        void render();
};

#endif //POKEMONGAMEENGINE_ENTITY_H