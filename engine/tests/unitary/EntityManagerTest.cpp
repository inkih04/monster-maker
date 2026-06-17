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

TEST(EntityManagerTest, ExtractEntity_ShouldRemoveFromAllCaches) {
    EntityManager manager;

    Entity* e = manager.createEntity(EntityTag::PLAYER, EntityLayer::ENTITIES, "player1");

    std::unique_ptr<Entity> extracted = manager.extractEntity(EntityTag::PLAYER, EntityLayer::ENTITIES);

    ASSERT_NE(extracted, nullptr);
    EXPECT_EQ(extracted.get(), e);

    EXPECT_TRUE(manager.getEntitiesByTag(EntityTag::PLAYER).empty());
    EXPECT_TRUE(manager.getEntitiesByLayer(EntityLayer::ENTITIES).empty());
    EXPECT_TRUE(manager.getEntitiesByComponent(ComponentsType::POSITION).empty());
}

TEST(EntityManagerTest, ExtractEntity_NonExistentTag_ShouldReturnNull) {
    EntityManager manager;

    manager.createEntity(EntityTag::ENEMY, EntityLayer::ENTITIES, "enemy");

    std::unique_ptr<Entity> extracted = manager.extractEntity(EntityTag::PLAYER, EntityLayer::ENTITIES);

    EXPECT_EQ(extracted, nullptr);
    EXPECT_EQ(manager.getEntitiesByTag(EntityTag::ENEMY).size(), 1);
}

TEST(EntityManagerTest, ExtractEntity_EmptyManager_ShouldReturnNull) {
    EntityManager manager;

    std::unique_ptr<Entity> extracted = manager.extractEntity(EntityTag::PLAYER, EntityLayer::ENTITIES);

    EXPECT_EQ(extracted, nullptr);
}

TEST(EntityManagerTest, ExtractEntity_ShouldOnlyRemoveFirstMatchingTag) {
    EntityManager manager;

    Entity* e1 = manager.createEntity(EntityTag::ENEMY, EntityLayer::ENTITIES, "enemy1");
    Entity* e2 = manager.createEntity(EntityTag::ENEMY, EntityLayer::ENTITIES, "enemy2");

    std::unique_ptr<Entity> extracted = manager.extractEntity(EntityTag::ENEMY, EntityLayer::ENTITIES);

    ASSERT_NE(extracted, nullptr);

    auto remaining = manager.getEntitiesByTag(EntityTag::ENEMY);
    EXPECT_EQ(remaining.size(), 1);
    // el que queda debe ser e1 o e2, pero no ambos
    EXPECT_TRUE(remaining[0] == e1 || remaining[0] == e2);
    EXPECT_NE(remaining[0], extracted.get());
}

// --- adoptEntity ---

TEST(EntityManagerTest, AdoptEntity_ShouldAddToTagAndLayerCaches) {
    EntityManager manager;

    // Crear en un manager temporal y extraer
    EntityManager source;
    source.createEntity(EntityTag::PLAYER, EntityLayer::ENTITIES, "player");
    std::unique_ptr<Entity> extracted = source.extractEntity(EntityTag::PLAYER, EntityLayer::ENTITIES);
    ASSERT_NE(extracted, nullptr);

    Entity* adopted = manager.adoptEntity(std::move(extracted), EntityTag::PLAYER, EntityLayer::GROUND);

    ASSERT_NE(adopted, nullptr);
    EXPECT_EQ(manager.getEntitiesByTag(EntityTag::PLAYER).size(), 1);
    EXPECT_EQ(manager.getEntitiesByTag(EntityTag::PLAYER)[0], adopted);
    EXPECT_EQ(manager.getEntitiesByLayer(EntityLayer::GROUND).size(), 1);
    EXPECT_EQ(manager.getEntitiesByLayer(EntityLayer::GROUND)[0], adopted);
}

TEST(EntityManagerTest, AdoptEntity_ShouldBeDestroyable) {
    EntityManager source;
    source.createEntity(EntityTag::ENEMY, EntityLayer::ENTITIES, "enemy");
    std::unique_ptr<Entity> extracted = source.extractEntity(EntityTag::ENEMY, EntityLayer::ENTITIES);

    EntityManager manager;
    Entity* adopted = manager.adoptEntity(std::move(extracted), EntityTag::ENEMY, EntityLayer::ENTITIES);

    manager.destroyEntity(adopted);

    EXPECT_TRUE(manager.getEntitiesByTag(EntityTag::ENEMY).empty());
    EXPECT_TRUE(manager.getEntitiesByLayer(EntityLayer::ENTITIES).empty());
}

// --- registerCollisionEntity ---

TEST(EntityManagerTest, RegisterCollisionEntity_WithoutCollider_ShouldNotCrash) {
    EntityManager manager;

    Entity* e = manager.createEntity(EntityTag::PLAYER, EntityLayer::ENTITIES, "player");
    // Sin ColliderComponent — debe logear warning y no crashear
    EXPECT_NO_FATAL_FAILURE(manager.registerCollisionEntity(e));
}

// --- getEntitiesByTag / getEntitiesByLayer con ausencias ---

TEST(EntityManagerTest, GetEntitiesByTag_NonExistentTag_ShouldReturnEmpty) {
    EntityManager manager;

    auto result = manager.getEntitiesByTag(EntityTag::PLAYER);

    EXPECT_TRUE(result.empty());
}

TEST(EntityManagerTest, GetEntitiesByLayer_NonExistentLayer_ShouldReturnEmpty) {
    EntityManager manager;

    auto result = manager.getEntitiesByLayer(EntityLayer::GROUND);

    EXPECT_TRUE(result.empty());
}

// --- destroyEntity edge cases ---

TEST(EntityManagerTest, DestroyEntity_ShouldNotAffectOtherTags) {
    EntityManager manager;

    Entity* player = manager.createEntity(EntityTag::PLAYER, EntityLayer::ENTITIES, "player");
    Entity* enemy  = manager.createEntity(EntityTag::ENEMY,  EntityLayer::ENTITIES, "enemy");

    manager.destroyEntity(player);

    auto enemies = manager.getEntitiesByTag(EntityTag::ENEMY);
    EXPECT_EQ(enemies.size(), 1);
    EXPECT_EQ(enemies[0], enemy);
}

TEST(EntityManagerTest, DestroyEntity_AllEntitiesOfSameTag) {
    EntityManager manager;

    Entity* e1 = manager.createEntity(EntityTag::ENEMY, EntityLayer::ENTITIES, "e1");
    Entity* e2 = manager.createEntity(EntityTag::ENEMY, EntityLayer::ENTITIES, "e2");

    manager.destroyEntity(e1);
    manager.destroyEntity(e2);

    EXPECT_TRUE(manager.getEntitiesByTag(EntityTag::ENEMY).empty());
    EXPECT_TRUE(manager.getEntitiesByLayer(EntityLayer::ENTITIES).empty());
}

// --- getEntitiesByComponent edge cases ---

TEST(EntityManagerTest, GetEntitiesByComponent_NonExistentComponent_ShouldReturnEmpty) {
    EntityManager manager;

    manager.createEntity(EntityTag::PLAYER, EntityLayer::ENTITIES, "player");

    auto result = manager.getEntitiesByComponent(ComponentsType::COLLIDER);

    EXPECT_TRUE(result.empty());
}

TEST(EntityManagerTest, GetEntitiesByComponent_EmptyManager_ShouldReturnEmpty) {
    EntityManager manager;

    auto result = manager.getEntitiesByComponent(ComponentsType::POSITION);

    EXPECT_TRUE(result.empty());
}

// --- extract + adopt round-trip ---

TEST(EntityManagerTest, ExtractAndAdopt_RoundTrip_ShouldMaintainConsistency) {
    EntityManager manager;

    manager.createEntity(EntityTag::PLAYER, EntityLayer::ENTITIES, "player");
    std::unique_ptr<Entity> extracted = manager.extractEntity(EntityTag::PLAYER, EntityLayer::ENTITIES);
    ASSERT_NE(extracted, nullptr);

    EXPECT_TRUE(manager.getEntitiesByTag(EntityTag::PLAYER).empty());

    Entity* readopted = manager.adoptEntity(std::move(extracted), EntityTag::PLAYER, EntityLayer::GROUND);

    EXPECT_EQ(manager.getEntitiesByTag(EntityTag::PLAYER).size(), 1);
    EXPECT_EQ(manager.getEntitiesByLayer(EntityLayer::GROUND).size(), 1);
    EXPECT_EQ(manager.getEntitiesByLayer(EntityLayer::GROUND)[0], readopted);
}
