//
// Created by inkih on 30/11/25.
//
#include "Entity.h"
#include "CollisionService.h"
#include "RenderComponent.h"

void Entity::addComponent(ComponentsType type, std::unique_ptr<Component> component) {
    components[type] = std::move(component);
    components[type]->setOwner(this);
}

Component *Entity::getComponent(ComponentsType type) {
    const auto it = components.find(type);
    return (it != components.end()) ? it->second.get() : nullptr;
}

void Entity::update(int deltaTime) {
    if (!isActive) return;
    for (auto& component: components) {
        if (component.second) {
            component.second->update(deltaTime);
        }
    }
}

CollisionService* Entity::getCollisionService() {
    return m_collisionService;
}

void Entity::disableEntity() {
    isActive = false;
    m_collisionService->removeEntity(this);
    auto component = dynamic_cast<RenderComponent*>(getComponent(ComponentsType::RENDER));
    if (component) {
        component->setIsActive(false);
    }
}

bool Entity::hasComponent(ComponentsType type) const {
    const auto it = components.find(type);
    return it != components.end();
}

void Entity::render() {
    if (!isActive) return;
    components[ComponentsType::RENDER]->render();
}
