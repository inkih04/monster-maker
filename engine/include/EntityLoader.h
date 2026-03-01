//
// Created by inkih on 6/12/25.
//

#ifndef POKEMONGAMEENGINE_ENTITYLOADER_H
#define POKEMONGAMEENGINE_ENTITYLOADER_H

#include <iosfwd>
#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "EntityManager.h"
#include "SpriteRect.h"

using json = nlohmann::json;

class EntityLoader {
public:
    static void loadEntitiesFromFile(const std::string& filePath, EntityManager& entityManager);

private:
    static void parseEntity(const json& entityJson, EntityManager& entityManager);

    static std::unique_ptr<Component> createPositionComponent(const json& data);
    static std::unique_ptr<Component> createRenderComponent(const json& data);
    static std::unique_ptr<Component> createColliderComponent(const json& data);
    static std::unique_ptr<Component> createAnimationComponent(const json& data);

    static std::vector<SpriteRect> parseFrames(const json &framesJson);

    static std::unique_ptr<Component> createScriptComponent(const json& data);
};

#endif //POKEMONGAMEENGINE_ENTITYLOADER_H