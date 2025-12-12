//
// Created by inkih on 12/12/25.
//

#ifndef POKEMONGAMEENGINE_ENTITYLAYER_H
#define POKEMONGAMEENGINE_ENTITYLAYER_H

#include <string>
#include <unordered_map>
#include <vector>
#include <functional>

enum class EntityLayer {
    GROUND,
    DECORATION,
    ENTITIES,
    SHADOWS,
    FOREGROUND,        // Techos, puentes superiores
    EFFECTS_HIGH,
    UI_MENU,

    UNKNOWN
};

namespace std {
    template <>
    struct hash<EntityLayer> {
        size_t operator()(const EntityLayer& layer) const noexcept {
            return static_cast<size_t>(layer);
        }
    };
}


inline std::string layerToString(EntityLayer layer) {
    static const std::unordered_map<EntityLayer, std::string> names = {
        {EntityLayer::GROUND, "ground"},
        {EntityLayer::DECORATION, "decoration"},
        {EntityLayer::ENTITIES, "entities"},
        {EntityLayer::SHADOWS, "shadows"},
        {EntityLayer::FOREGROUND, "foreground"},
        {EntityLayer::EFFECTS_HIGH, "effects_high"},
        {EntityLayer::UI_MENU, "ui_menu"},
        {EntityLayer::UNKNOWN, "unknown"}
    };

    auto it = names.find(layer);
    return (it != names.end()) ? it->second : "unknown";
}

inline EntityLayer stringToLayer(const std::string& str) {
    static const std::unordered_map<std::string, EntityLayer> values = {
        {"ground", EntityLayer::GROUND},
        {"decoration", EntityLayer::DECORATION},
        {"entities", EntityLayer::ENTITIES},
        {"shadows", EntityLayer::SHADOWS},
        {"foreground", EntityLayer::FOREGROUND},
        {"effects_high", EntityLayer::EFFECTS_HIGH},
        {"ui_menu", EntityLayer::UI_MENU}
    };

    auto it = values.find(str);
    return (it != values.end()) ? it->second : EntityLayer::UNKNOWN;
}

inline std::vector<std::string> getAllLayerNames() {
    return {
        "ground",
        "decoration",
        "entities",
        "shadows",
        "foreground",
        "effects_high",
        "ui_menu"
    };
}



#endif //POKEMONGAMEENGINE_ENTITYLAYER_H