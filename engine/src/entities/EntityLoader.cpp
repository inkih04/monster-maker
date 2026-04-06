#include "EntityLoader.h"
#include "PositionComponent.h"
#include "RenderComponent.h"
#include "ColliderComponent.h"
#include <fstream>
#include <iostream>
#include "AnimationComponent.h"
#include "EditorConfig.h"
#include "InteractionComponent.h"
#include "MovementComponent.h"
#include "ScriptComponet.h"
#include "PersistenceComponent.h"
#include "SaveManager.h"
#include "ScriptEngine.h"
#include <zlib.h>
#include <vector>
#include <stdexcept>


static std::string readMapFile(const std::string& filePath) {
    std::ifstream file(filePath, std::ios::binary);
    if (!file.is_open()) {
        throw std::runtime_error("Could not open file: " + filePath);
    }

    std::vector<uint8_t> raw(
        (std::istreambuf_iterator<char>(file)),
        std::istreambuf_iterator<char>()
    );

    if (raw.empty()) {
        return "";
    }
    const bool isCompressed = (raw.size() >= 2 && raw[0] == 0x78);

    if (!isCompressed) {
        return std::string(raw.begin(), raw.end());
    }

    std::vector<uint8_t> decompressed;
    decompressed.resize(raw.size() * 8);

    z_stream zs{};
    if (inflateInit(&zs) != Z_OK) {
        throw std::runtime_error("zlib inflateInit failed");
    }

    zs.next_in  = raw.data();
    zs.avail_in = static_cast<uInt>(raw.size());

    int ret = Z_OK;
    while (ret != Z_STREAM_END) {
        zs.next_out  = decompressed.data() + zs.total_out;
        zs.avail_out = static_cast<uInt>(decompressed.size() - zs.total_out);

        ret = inflate(&zs, Z_NO_FLUSH);

        if (ret == Z_BUF_ERROR || zs.avail_out == 0) {
            decompressed.resize(decompressed.size() * 2);
            continue;
        }

        if (ret != Z_OK && ret != Z_STREAM_END) {
            inflateEnd(&zs);
            throw std::runtime_error("zlib inflate failed with code: " + std::to_string(ret));
        }
    }

    const size_t decompressedSize = zs.total_out;
    inflateEnd(&zs);

    return std::string(
        reinterpret_cast<char*>(decompressed.data()),
        decompressedSize
    );
}


void EntityLoader::loadEntitiesFromFile(const std::string& filePath, EntityManager& entityManager) {
    std::string fileContent;
    try {
        fileContent = readMapFile(filePath);
    } catch (const std::exception& e) {
        std::cout << "[ENGINE][ERROR] Could not open file: " << e.what() << std::endl;
        return;
    }
    json mapData;
    try {
        mapData = json::parse(fileContent);
    } catch (const json::exception& e) {
        std::cout << "[ENGINE][ERROR] Error parsing JSON: " << e.what() << std::endl;
        return;
    }

    std::string mapScriptPath = "";
    if (mapData.contains("mapScript") && !mapData["mapScript"].is_null()) {
        mapScriptPath = mapData["mapScript"].get<std::string>();
    }

    ScriptEngine::getInstance().setMapScript(mapScriptPath);
    ScriptEngine::getInstance().initMapScript();

    if (!mapData.contains("entities")) {
        std::cout << "[ENGINE][ERROR] No 'entities' array found in " << filePath << std::endl;
        return;
    }

    const auto& entities = mapData["entities"];
    for (const auto& entityJson : entities) {
        try {
            parseEntity(entityJson, entityManager);
        } catch (const std::exception& e) {
            std::cout << "[ENGINE][ERROR] Error loading entity: " << e.what() << std::endl;
        }
    }
}

void EntityLoader::parseEntity(const json& entityJson, EntityManager& entityManager) {
    EntityTag tag = EntityTag::UNKNOWN;
    EntityLayer layer = EntityLayer::UNKNOWN;
    std::string id = "";

    if (entityJson.contains("tag")) {
        std::string tagStr = entityJson["tag"].get<std::string>();
        tag = stringToTag(tagStr);
    }

    if (entityJson.contains("layer")) {
        std::string layerStr = entityJson["layer"].get<std::string>();
        layer = stringToLayer(layerStr);
    }

    if (entityJson.contains("id")) {
        id = entityJson["id"].get<std::string>();
    }

    if (entityJson.contains("components") && entityJson["components"].contains("PERSISTENCE")) {
        const std::string& saveFlag = entityJson["components"]["PERSISTENCE"].value("saveFlag", "");
        if (!saveFlag.empty()) {
            auto& save = SaveManager::getInstance();
            if (!save.has(saveFlag)) {
                save.setFalse(saveFlag);
            }
            if (save.isTrue(saveFlag)) {
                return;
            }
        }
    }

    Entity* entity = entityManager.createEntity(tag, layer, id);

    if (!entityJson.contains("components")) {
        std::cout << "[ENGINE][ERROR] Entity with no components found" << std::endl;
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
        int width = colliderData.value("width", 0.0f);
        int height = colliderData.value("height", 0.0f);

        if (width > 0 && height > 0) {
            entityManager.setCollisionEntity(entity);
            auto colliderComponent = createColliderComponent(colliderData);
            entity->addComponent(ComponentsType::COLLIDER, std::move(colliderComponent));
        }
    }

    if (components.contains("INTERACTION")) {
        entity->addComponent(ComponentsType::INTERACTION, std::make_unique<InteractionComponent>());
    }

    if (components.contains("ANIMATION")) {
        auto animationComponent = createAnimationComponent(components["ANIMATION"]);
        entity->addComponent(ComponentsType::ANIMATION, std::move(animationComponent));
    }

    if (components.contains("MOVEMENT")) {
        entity->addComponent(ComponentsType::MOVEMENT, std::make_unique<MovementComponent>());
    }

    if (components.contains("SCRIPT")) {
        auto scriptComponent = createScriptComponent(components["SCRIPT"]);
        if (scriptComponent) {
            entity->addComponent(ComponentsType::SCRIPT, std::move(scriptComponent));
        }
    }

    if (components.contains("PERSISTENCE")) {
        const std::string& saveFlag = components["PERSISTENCE"].value("saveFlag", "");
        if (!saveFlag.empty()) {
            entity->addComponent(ComponentsType::PERSISTENCE, std::make_unique<PersistentComponent>(saveFlag));
        }
    }
}

std::unique_ptr<Component> EntityLoader::createPositionComponent(const json& data) {
    float x = data.value("x", 0.0f);
    float y = data.value("y", 0.0f);
    return std::make_unique<PositionComponent>(x, y);
}

std::unique_ptr<Component> EntityLoader::createScriptComponent(const json& data) {
    if (!data.contains("path")) {
        std::cout << "[ENGINE][ERROR] ScriptComponent requires a 'path' field" << std::endl;
    }
    std::string path = data["path"].get<std::string>();
    if (path.empty()) {
        std::cout << "[ENGINE][ERROR] ScriptComponent 'path' cannot be empty" << std::endl;
    }
    if (data.contains("properties") && data["properties"].is_object()) {
        sol::table props = jsonToSolTable(data["properties"]);
        return std::make_unique<ScriptComponent>(path, std::move(props));
    }
    return std::make_unique<ScriptComponent>(path);
}

sol::table EntityLoader::jsonToSolTable(const json& obj) {
    auto& lua = ScriptEngine::getInstance().getState();
    sol::table table = lua.create_table();

    for (const auto& [key, value] : obj.items()) {
        if (value.is_string()) {
            table[key] = value.get<std::string>();

        } else if (value.is_boolean()) {
            table[key] = value.get<bool>();

        } else if (value.is_number_integer()) {
            table[key] = value.get<int>();

        } else if (value.is_number_float()) {
            table[key] = value.get<double>();

        } else if (value.is_object()) {
            table[key] = jsonToSolTable(value);

        } else if (value.is_array()) {
            sol::table arr = lua.create_table();
            int i = 1;
            for (const auto& elem : value) {
                if      (elem.is_string())          arr[i] = elem.get<std::string>();
                else if (elem.is_boolean())         arr[i] = elem.get<bool>();
                else if (elem.is_number_integer())  arr[i] = elem.get<int>();
                else if (elem.is_number_float())    arr[i] = elem.get<double>();
                else if (elem.is_object())          arr[i] = jsonToSolTable(elem);
                ++i;
            }
            table[key] = arr;

        }
    }

    return table;
}

std::unique_ptr<Component> EntityLoader::createRenderComponent(const json& data) {
    if (!data.contains("spriteSheetPath")) {
        std::cout << "[ENGINE][ERROR] RenderComponent requires 'spriteSheetPath'" << std::endl; return nullptr;
    }

    std::string spriteSheetPath = data["spriteSheetPath"];
    float x = data.value("x", -1.0f);
    float y = data.value("y", -1.0f);
    float w = data.value("w", -1.0f);
    float h = data.value("h", -1.0f);
    std::string shader = data.value("shader", "default");
    float width = data.value("width", 32.0f);
    float height = data.value("height", 32.0f);
    int shaderMode = EditorConfig::getInstance().getShaderMode(shader);

    return std::make_unique<RenderComponent>(spriteSheetPath, x, y, w, h, width, height, shaderMode);
}

std::unique_ptr<Component> EntityLoader::createColliderComponent(const json& data) {
    int width = data.value("width", 0.0f);
    int height = data.value("height", 0.0f);
    int offsetX = data.value("offsetX", 0.0f);
    int offsetY = data.value("offsetY", 0.0f);
    bool isTrigger = data.value("isTrigger", false);
    return std::make_unique<CollisionComponent>(width, height, offsetX, offsetY, isTrigger);
}

std::unique_ptr<Component> EntityLoader::createAnimationComponent(const json& data) {
    auto animComponent = std::make_unique<AnimationComponent>();

    if (data.contains("sets")) {
        for (const auto& [setName, setJson] : data["sets"].items()) {
            if (!setJson.contains("animations")) {
                std::cout << "[ENGINE][WARN] Set '" << setName << "' has no 'animations' array, skipping" << std::endl;
                continue;
            }
            for (const auto& animJson : setJson["animations"]) {
                std::string name = animJson.value("name", "");
                if (!animJson.contains("frames")) {
                    std::cout << "[ENGINE][ERROR] Animation '" << name << "' in set '" << setName << "' requires 'frames'" << std::endl;
                    continue;
                }
                std::vector<SpriteRect> frames = parseFrames(animJson["frames"]);
                float frameDuration = animJson.value("frameDuration", 100.0f);
                bool loop = animJson.value("loop", true);
                animComponent->addAnimation(name, frames, frameDuration, loop, setName);
            }
        }
        std::string activeSet = data.value("activeSet", "default");
        animComponent->setActiveSet(activeSet);

    } else if (data.contains("animations")) {
        for (const auto& animJson : data["animations"]) {
            std::string name = animJson.value("name", "");
            if (!animJson.contains("frames")) {
                std::cout << "[ENGINE][ERROR] Animation '" << name << "' requires 'frames'" << std::endl;
                continue;
            }
            std::vector<SpriteRect> frames = parseFrames(animJson["frames"]);
            float frameDuration = animJson.value("frameDuration", 100.0f);
            bool loop = animJson.value("loop", true);
            animComponent->addAnimation(name, frames, frameDuration, loop);
        }
    } else {
        std::cout << "[ENGINE][ERROR] AnimationComponent requires either 'sets' or 'animations'" << std::endl;
        return nullptr;
    }

    if (data.contains("defaultAnimation")) {
        std::string defaultAnim = data["defaultAnimation"];
        animComponent->play(defaultAnim, true);
    }

    return animComponent;
}

std::vector<SpriteRect> EntityLoader::parseFrames(const json& framesJson) {
    std::vector<SpriteRect> frames;
    for (const auto& frame : framesJson) {
        SpriteRect rect;
        rect.x = frame.value("x", 0);
        rect.y = frame.value("y", 0);
        rect.width = frame.value("w", 32);
        rect.height = frame.value("h", 32);
        frames.push_back(rect);
    }
    return frames;
}