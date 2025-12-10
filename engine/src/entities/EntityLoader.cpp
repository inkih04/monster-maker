//
// Created by inkih on 6/12/25.
//

#include "EntityLoader.h"
#include "PositionComponent.h"
#include "RenderComponent.h"
#include "ColliderComponent.h"
#include <fstream>
#include <iostream>
#include <stdexcept>

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
    Entity* entity = entityManager.createEntity();

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

    // LAYER Component
    // if (components.contains("LAYER")) {
    //     // ...
    // }
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