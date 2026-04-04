//
// Created by inkih on 4/4/26.
//
#include "BlockEntityComponentByTag.h"
#include <iostream>

bool BlockEntityComponentByTag::blockComponent(std::vector<Entity*> entities, ComponentsType componentType) {
    if (entities.empty()) {
        std::cout << "[ENGINE][WARNING] BlockEntityComponentByTag::blockComponent called with an empty entity list." << std::endl;
        return false;
    }

    for (Entity* entity : entities) {
        if (!entity) {
            std::cout << "[ENGINE][WARNING] BlockEntityComponentByTag::blockComponent found a null entity, skipping." << std::endl;
            continue;
        }

        if (!entity->hasComponent(componentType)) {
            std::cout << "[ENGINE][WARNING] BlockEntityComponentByTag::blockComponent: entity does not have component type "
                      << static_cast<int>(componentType) << ", skipping." << std::endl;
            continue;
        }

        Component* component = entity->getComponent(componentType);
        if (component) {
            component->setIsActive(false);
        }
    }

    return true;
}

bool BlockEntityComponentByTag::unblockComponent(std::vector<Entity*> entities, ComponentsType componentType) {
    if (entities.empty()) {
        std::cout << "[ENGINE][WARNING] BlockEntityComponentByTag::unblockComponent called with an empty entity list." << std::endl;
        return false;
    }

    for (Entity* entity : entities) {
        if (!entity) {
            std::cout << "[ENGINE][WARNING] BlockEntityComponentByTag::unblockComponent found a null entity, skipping." << std::endl;
            continue;
        }

        if (!entity->hasComponent(componentType)) {
            std::cout << "[ENGINE][WARNING] BlockEntityComponentByTag::unblockComponent: entity does not have component type "
                      << static_cast<int>(componentType) << ", skipping." << std::endl;
            continue;
        }

        Component* component = entity->getComponent(componentType);
        if (component) {
            component->setIsActive(true);
        }
    }

    return true;
}