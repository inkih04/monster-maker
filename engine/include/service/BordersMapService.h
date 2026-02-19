//
// Created by inkih on 19/2/26.
//

#ifndef MONSTERMAKERENGINE_BORDERSMAPSERVICE_H
#define MONSTERMAKERENGINE_BORDERSMAPSERVICE_H
#include <glm/vec2.hpp>
#include "Entity.h"
#include "Position.h"

class BordersMapService {
    private:
        Position m_topLeft;
        Position m_bottomRight;
        Position getPositionFromEntity(Entity* entity) const;

    public:
        void initBordersMapService(const std::vector<Entity*>& entities);
        Position clampCameraPosition(const Position& camTarget, float halfW, float halfH) const;
        BordersMapService();
        void setPosition(const Position& position);
        [[nodiscard]] bool isOutOfBounds(const Position& position,const glm::vec2& offset) const;


};

#endif //MONSTERMAKERENGINE_BORDERSMAPSERVICE_H