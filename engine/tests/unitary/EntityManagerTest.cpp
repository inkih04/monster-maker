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

    auto positionEntities = manager.getEntitiesByComponent(ComponentsType::POSITION);
    EXPECT_TRUE(positionEntities.empty());

    EXPECT_NE(e1, nullptr);
    EXPECT_NE(e2, nullptr);
}

TEST(EntityManagerTest, CreateEntityWithTagAndLayerStoresCorrectly) {
    EntityManager manager;

    Entity* e1 = manager.createEntity(EntityTag::PLAYER, EntityLayer::ENTITIES, " ");
    Entity* e2 = manager.createEntity(EntityTag::ENEMY, EntityLayer::ENTITIES, " ");
    Entity* e3 = manager.createEntity(EntityTag::ITEM, EntityLayer::GROUND, " ");

    auto playerEntities = manager.getEntitiesByTag(EntityTag::PLAYER);
    auto enemyEntities = manager.getEntitiesByTag(EntityTag::ENEMY);
    auto entitiesLayer = manager.getEntitiesByLayer(EntityLayer::ENTITIES);
    auto groundLayer = manager.getEntitiesByLayer(EntityLayer::GROUND);

    EXPECT_EQ(playerEntities.size(), 1);
    EXPECT_EQ(playerEntities[0], e1);

    EXPECT_EQ(enemyEntities.size(), 1);
    EXPECT_EQ(enemyEntities[0], e2);

    EXPECT_EQ(entitiesLayer.size(), 2);
    EXPECT_TRUE((entitiesLayer[0] == e1 && entitiesLayer[1] == e2) ||
                (entitiesLayer[0] == e2 && entitiesLayer[1] == e1));

    EXPECT_EQ(groundLayer.size(), 1);
    EXPECT_EQ(groundLayer[0], e3);
}

TEST(EntityManagerTest, GetEntitiesByComponentReturnsCorrectEntities) {
    EntityManager manager;

    Entity* e1 = manager.createEntity();
    Entity* e2 = manager.createEntity();
    Entity* e3 = manager.createEntity();

    e1->addComponent(ComponentsType::POSITION, std::make_unique<MockComponent>());
    e3->addComponent(ComponentsType::POSITION, std::make_unique<MockComponent>());

    e2->addComponent(ComponentsType::RENDER, std::make_unique<MockComponent>());

    auto positionEntities = manager.getEntitiesByComponent(ComponentsType::POSITION);
    auto renderEntities = manager.getEntitiesByComponent(ComponentsType::RENDER);

    EXPECT_EQ(positionEntities.size(), 2);
    EXPECT_TRUE((positionEntities[0] == e1 && positionEntities[1] == e3) ||
                (positionEntities[0] == e3 && positionEntities[1] == e1));

    EXPECT_EQ(renderEntities.size(), 1);
    EXPECT_EQ(renderEntities[0], e2);
}

TEST(EntityManagerTest, DestroyEntityRemovesFromManagerAndCaches) {
    EntityManager manager;

    Entity* e1 = manager.createEntity(EntityTag::PLAYER, EntityLayer::ENTITIES, " ");
    Entity* e2 = manager.createEntity(EntityTag::ENEMY, EntityLayer::ENTITIES, " ");

    manager.destroyEntity(e1);

    auto allEntities = manager.getEntitiesByComponent(ComponentsType::POSITION);
    auto playerEntities = manager.getEntitiesByTag(EntityTag::PLAYER);
    auto entitiesLayer = manager.getEntitiesByLayer(EntityLayer::ENTITIES);

    EXPECT_TRUE(playerEntities.empty());
    EXPECT_EQ(entitiesLayer.size(), 1);
    EXPECT_EQ(entitiesLayer[0], e2);
}
