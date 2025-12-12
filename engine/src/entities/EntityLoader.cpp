//
// Created by inkih on 6/12/25.
//

#include "EntityLoader.h"
#include "PositionComponent.h"
#include "RenderComponent.h"
#include "ColliderComponent.h"
#include <fstream>
#include <iostream>
#include "components/AnimationComponent.h"
#include <stdexcept>

#include "MovementComponent.h"

void EntityLoader::loadEntitiesFromFile(const std::string& filePath, EntityManager& entityManager) {
    std::ifstream file(filePath);
    if (!file.is_open()) {
        throw std::runtime_error("No se pudo abrir el archivo: " + filePath);
    }

    json mapData;
    try {
        file >> mapData;
    } catch (const json::exception& e) {
        throw std::runtime_error("Error parseando JSON: " + std::string(e.what()));
    }


    if (!mapData.contains("entities")) {
        std::cerr << "Advertencia: No se encontró array 'entities' en " << filePath << std::endl;
        return;
    }

    const auto& entities = mapData["entities"];
    for (const auto& entityJson : entities) {
        try {
            parseEntity(entityJson, entityManager);
        } catch (const std::exception& e) {
            std::cerr << "Error cargando entity: " << e.what() << std::endl;
        }
    }
}

void EntityLoader::parseEntity(const json& entityJson, EntityManager& entityManager) {
    EntityTag tag = EntityTag::UNKNOWN;
    EntityLayer layer = EntityLayer::UNKNOWN;

    if (entityJson.contains("tag")) {
        std::string tagStr = entityJson["tag"].get<std::string>();
        tag = stringToTag(tagStr);
    }

    if (entityJson.contains("layer")) {
        std::string layerStr = entityJson["layer"].get<std::string>();
        layer = stringToLayer(layerStr);
    }

    Entity* entity = entityManager.createEntity(tag, layer);

    if (!entityJson.contains("components")) {
        std::cerr << "Advertencia: Entity sin componentes encontrada" << std::endl;
        return;
    }

    const auto& components = entityJson["components"];

    if (components.contains("POSITION")) {
        auto posComponent = createPositionComponent(components["POSITION"]);
        entity->addComponent(ComponentsType::POSITION, std::move(posComponent));
    }

    if (components.contains("RENDER")) {
        auto renderComponent = createRenderComponent(components["RENDER"]);
        entity->addComponent(ComponentsType::RENDER, std::move(renderComponent));
    }

    if (components.contains("COLLIDER")) {
        const auto& colliderData = components["COLLIDER"];
        float width = colliderData.value("width", 0.0f);
        float height = colliderData.value("height", 0.0f);

        if (width > 0 && height > 0) {
            auto colliderComponent = createColliderComponent(colliderData);
            entity->addComponent(ComponentsType::COLLIDER, std::move(colliderComponent));
        }
    }

    if (components.contains("ANIMATION")) {
        auto animationComponent = createAnimationComponent(components["ANIMATION"]);
        entity->addComponent(ComponentsType::ANIMATION, std::move(animationComponent));
    }

    if (components.contains("MOVEMENT")) {
        entity->addComponent(ComponentsType::MOVEMENT, std::move(std::make_unique<MovementComponent>()));
    }


}

std::unique_ptr<Component> EntityLoader::createPositionComponent(const json& data) {
    float x = data.value("x", 0.0f);
    float y = data.value("y", 0.0f);
    float rotation = data.value("rotation", 0.0f);

    return std::make_unique<PositionComponent>(x, y, rotation);
}

std::unique_ptr<Component> EntityLoader::createRenderComponent(const json& data) {
    if (!data.contains("spriteSheetPath")) {
        throw std::runtime_error("RenderComponent requiere 'spriteSheetPath'");
    }

    std::string spriteSheetPath = data["spriteSheetPath"];

    float x = data.value("x", -1.0f);
    float y = data.value("y", -1.0f);
    float w = data.value("w", -1.0f);
    float h = data.value("h", -1.0f);

    float width = data.value("width", 32.0f);
    float height = data.value("height", 32.0f);

    return std::make_unique<RenderComponent>(spriteSheetPath, x, y, w, h, width, height);
}

std::unique_ptr<Component> EntityLoader::createColliderComponent(const json& data) {
    float width = data.value("width", 0.0f);
    float height = data.value("height", 0.0f);

    return std::make_unique<CollisionComponent>(width, height);
}

std::unique_ptr<Component> EntityLoader::createAnimationComponent(const json& data) {
    auto animComponent = std::make_unique<AnimationComponent>();

    if (!data.contains("animations")) {
        throw std::runtime_error("AnimationComponent requiere un array 'animations'");
    }

    for (const auto& animJson : data["animations"]) {
        std::string name = animJson.value("name", "");

        if (!animJson.contains("frames")) {
            throw std::runtime_error("Animation '" + name + "' requiere 'frames'");
        }

        std::vector<SpriteRect> frames;

        for (const auto& frame : animJson["frames"]) {
            SpriteRect rect;
            rect.x = frame.value("x", 0);
            rect.y = frame.value("y", 0);
            rect.width = frame.value("w", 32);
            rect.height = frame.value("h", 32);
            frames.push_back(rect);
        }

        float frameDuration = animJson.value("frameDuration", 100.0f);
        bool loop = animJson.value("loop", true);
        int priority = animJson.value("priority", 0);

        animComponent->addAnimation(name, frames, frameDuration, loop, priority);
    }

    if (data.contains("defaultAnimation")) {
        std::string defaultAnim = data["defaultAnimation"];
        animComponent->play(defaultAnim, true);
    }

    return animComponent;
}
