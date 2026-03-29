//
// Created by inkih on 28/3/26.
//

#ifndef MONSTERMAKERENGINE_DIALOGTYPES_H
#define MONSTERMAKERENGINE_DIALOGTYPES_H

#include <string>
#include <vector>
#include <unordered_map>



struct DialogPage {
    std::string speaker;
    std::string text;
};

struct DialogChain {
    std::string id;
    std::vector<DialogPage> pages;
};

struct DialogFile {
    std::vector<DialogChain> dialogues;
    std::unordered_map<std::string, std::size_t> indexById;

    const DialogChain* find(const std::string& id) const {
        auto it = indexById.find(id);
        if (it == indexById.end()) return nullptr;
        return &dialogues[it->second];
    }

    const DialogChain* at(std::size_t luaIndex) const {
        if (luaIndex == 0 || luaIndex > dialogues.size()) return nullptr;
        return &dialogues[luaIndex - 1];
    }
};

#endif //MONSTERMAKERENGINE_DIALOGTYPES_H
