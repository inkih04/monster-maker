//
// Created by inkih on 12/12/25.
//

#ifndef POKEMONGAMEENGINE_ENTITYTAG_H
#define POKEMONGAMEENGINE_ENTITYTAG_H
#include <string>
#include <unordered_map>
#include <vector>

enum class EntityTag {
    PLAYER,
    ENEMY,
    NPC,
    ITEM,
    TILEMAP,
    TILEMAP_COLLIDER,
    TRIGGER,
    DOOR,
    SIGN,
    PARTICLE,
    PROJECTILE,
    SPAWN_POINT,
    PLAYER_SPAWN_POINT,
    UNKNOWN
};

namespace std {
    template <>
    struct hash<EntityTag> {
        size_t operator()(const EntityTag& tag) const noexcept {
            return static_cast<size_t>(tag);
        }
    };
}

inline std::string tagToString(EntityTag tag) {
    static const std::unordered_map<EntityTag, std::string> names = {
        {EntityTag::PLAYER, "player"},
        {EntityTag::ENEMY, "enemy"},
        {EntityTag::NPC, "npc"},
        {EntityTag::ITEM, "item"},
        {EntityTag::TILEMAP, "tilemap"},
        {EntityTag::TILEMAP_COLLIDER, "tilemap_collider"},
        {EntityTag::TRIGGER, "trigger"},
        {EntityTag::DOOR, "door"},
        {EntityTag::SIGN, "sign"},
        {EntityTag::PARTICLE, "particle"},
        {EntityTag::PROJECTILE, "projectile"},
        {EntityTag::SPAWN_POINT, "spawn_point"},
        {EntityTag::PLAYER_SPAWN_POINT, "player_spawn_point"},
        {EntityTag::UNKNOWN, "unknown"}
    };

    auto it = names.find(tag);
    return (it != names.end()) ? it->second : "unknown";
}


inline EntityTag stringToTag(const std::string& str) {
    static const std::unordered_map<std::string, EntityTag> values = {
        {"player", EntityTag::PLAYER},
        {"enemy", EntityTag::ENEMY},
        {"npc", EntityTag::NPC},
        {"item", EntityTag::ITEM},
        {"tilemap", EntityTag::TILEMAP},
        {"tilemap_collider", EntityTag::TILEMAP_COLLIDER},
        {"trigger", EntityTag::TRIGGER},
        {"door", EntityTag::DOOR},
        {"sign", EntityTag::SIGN},
        {"particle", EntityTag::PARTICLE},
        {"projectile", EntityTag::PROJECTILE},
        {"player_spawn_point", EntityTag::PLAYER_SPAWN_POINT},
        {"spawn_point", EntityTag::SPAWN_POINT}
    };

    auto it = values.find(str);
    return (it != values.end()) ? it->second : EntityTag::UNKNOWN;
}

inline std::vector<std::string> getAllTagNames() {
    return {
        "player",
        "enemy",
        "npc",
        "item",
        "tilemap",
        "tilemap_collider",
        "trigger",
        "door",
        "sign",
        "particle",
        "projectile",
        "camera_zone",
        "player_spawn_point",
        "spawn_point"
    };
}

#endif //POKEMONGAMEENGINE_ENTITYTAG_H