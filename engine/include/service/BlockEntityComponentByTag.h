//
// Created by inkih on 4/4/26.
//

#ifndef MONSTERMAKERENGINE_BLOCKENTITYCOMPONENTBYTAG_H
#define MONSTERMAKERENGINE_BLOCKENTITYCOMPONENTBYTAG_H

#include "Entity.h"
#include <vector>

class BlockEntityComponentByTag {
public:
    static bool blockComponent(std::vector<Entity*> entities, ComponentsType componentType);
    static bool unblockComponent(std::vector<Entity*> entities, ComponentsType componentType);
};

#endif //MONSTERMAKERENGINE_BLOCKENTITYCOMPONENTBYTAG_H