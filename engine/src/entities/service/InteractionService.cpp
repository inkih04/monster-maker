//
// Created by inkih on 31/1/26.
//
#include "service/InteractionService.h"

#include "ComponentsType.h"
#include "Entity.h"
#include "InteractionComponent.h"
#include "PositionComponent.h"
#include "ColliderComponent.h"
#include "ScriptComponet.h"

void InteractionService::tryInteract(Entity* initiator) const {
    if (!initiator) return;
    auto* posComp = static_cast<PositionComponent*>(initiator->getComponent(ComponentsType::POSITION));
    auto* collisionComp = static_cast<CollisionComponent*>(initiator->getComponent(ComponentsType::COLLIDER));
    if (!posComp || !collisionComp) return;

    Position pos = posComp->getPosition();
    switch (posComp->getDirection()) {
        case Direction::TOP:     pos.y -= GameConfig::GridSize; break;
        case Direction::BOTTOM:  pos.y += GameConfig::GridSize; break;
        case Direction::LEFT:    pos.x -= GameConfig::GridSize; break;
        case Direction::RIGHT:   pos.x += GameConfig::GridSize; break;
        default: break;
    }


    Entity* target = m_collisionService->getEntityAtArea(pos, collisionComp->getWidth(), collisionComp->getHeight(), initiator);
    if (target) {
        auto* interactComp = static_cast<InteractionComponent*>(target->getComponent(ComponentsType::INTERACTION));
        if (interactComp) {
            auto* script = static_cast<ScriptComponent*>(target->getComponent(ComponentsType::SCRIPT));

            if (script) {
                script->executeOnInteract(initiator);
            }
        }
    }
}
