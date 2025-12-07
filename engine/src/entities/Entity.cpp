//
// Created by inkih on 30/11/25.
//
#include "Entity.h"

void Entity::addComponent(ComponentsType type, std::unique_ptr<Component> component) {
    components[type] = std::move(component);
    components[type]->setOwner(this);
}

Component *Entity::getComponent(ComponentsType type) {
    const auto it = components.find(type);
    return (it != components.end()) ? it->second.get() : nullptr;
}

void Entity::update(int deltaTime) {
    // Update logic for the entity can be added here
}

bool Entity::hasComponent(ComponentsType type) const {
    const auto it = components.find(type);
    return it != components.end();
}

void Entity::render() {
    components[ComponentsType::RENDER]->render();
}
