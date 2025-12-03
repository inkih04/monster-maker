//
// Created by inkih on 30/11/25.
//

#include <gtest/gtest.h>
#include "EntityManager.h"
#include "../mocks/MockComponent.h"

TEST(EntityManagerTest, CreateEntityReturnsPointer) {
    EntityManager manager;

    Entity* e = manager.createEntity();

    ASSERT_NE(e, nullptr);
}

TEST(EntityManagerTest, CreateEntityStoresEntityInManager) {
    EntityManager manager;

    Entity* e1 = manager.createEntity();
    Entity* e2 = manager.createEntity();

    // Aún no hay componentes, así que getEntitiesByComponent devuelve vacío
    auto entitiesWithPosition = manager.getEntitiesByComponent(ComponentsType::POSITION);
    EXPECT_TRUE(entitiesWithPosition.empty());

    // Los punteros devueltos por createEntity no son nulos
    EXPECT_NE(e1, nullptr);
    EXPECT_NE(e2, nullptr);
}

TEST(EntityManagerTest, GetEntitiesByComponentReturnsCorrectEntities) {
    EntityManager manager;

    Entity* e1 = manager.createEntity();
    Entity* e2 = manager.createEntity();
    Entity* e3 = manager.createEntity();

    // Añadimos componentes solo a e1 y e3
    e1->addComponent(ComponentsType::POSITION, std::make_unique<MockComponent>());
    e3->addComponent(ComponentsType::POSITION, std::make_unique<MockComponent>());

    // Solo e2 tendrá RENDER
    e2->addComponent(ComponentsType::RENDER, std::make_unique<MockComponent>());

    auto positionEntities = manager.getEntitiesByComponent(ComponentsType::POSITION);
    auto renderEntities = manager.getEntitiesByComponent(ComponentsType::RENDER);

    EXPECT_EQ(positionEntities.size(), 2);
    EXPECT_TRUE((positionEntities[0] == e1 && positionEntities[1] == e3) ||
                (positionEntities[0] == e3 && positionEntities[1] == e1));

    EXPECT_EQ(renderEntities.size(), 1);
    EXPECT_EQ(renderEntities[0], e2);
}
