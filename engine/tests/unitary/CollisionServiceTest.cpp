//
// Created by inkih on 26/1/26.
//

#include <gtest/gtest.h>
#include <memory>
#include <vector>

#include "../../include/service/CollisionService.h"
#include "Entity.h"
#include "PositionComponent.h"
#include "ColliderComponent.h"

class CollisionServiceTest : public ::testing::Test {
protected:
    CollisionService service;
    std::vector<std::unique_ptr<Entity>> entitiesManager;

    Entity* createObstacle(int x, int y, int w, int h, int ox = 0, int oy = 0) {
        auto entity = std::make_unique<Entity>();

        entity->addComponent(ComponentsType::POSITION,
            std::make_unique<PositionComponent>(x, y));

        entity->addComponent(ComponentsType::COLLIDER,
            std::make_unique<CollisionComponent>(w, h, ox, oy));

        Entity* rawPtr = entity.get();
        entitiesManager.push_back(std::move(entity));
        return rawPtr;
    }

    void SetUp() override {
        entitiesManager.clear();
    }

    void TearDown() override {
        entitiesManager.clear();
    }
};

TEST_F(CollisionServiceTest, AreaIsFreeWhenEmpty) {
    Position target(100, 100);
    EXPECT_TRUE(service.isAreaFree(target, 32, 32, nullptr));
}

TEST_F(CollisionServiceTest, DetectsBasicCollision) {
    Entity* wall = createObstacle(32, 32, 32, 32);
    service.initCollisionCache({wall});

    EXPECT_FALSE(service.isAreaFree(Position(32, 32), 32, 32, nullptr));
}

TEST_F(CollisionServiceTest, GridBoundaryCheck) {
    Entity* wall = createObstacle(16, 0, 16, 16);
    service.initCollisionCache({wall});

    EXPECT_TRUE(service.isAreaFree(Position(0, 0), 16, 16, nullptr));
    EXPECT_FALSE(service.isAreaFree(Position(1, 0), 16, 16, nullptr));
}

TEST_F(CollisionServiceTest, CollisionRespectsOffsets) {
    Entity* weirdTree = createObstacle(0, 0, 16, 16, 50, 50);
    service.initCollisionCache({weirdTree});

    EXPECT_TRUE(service.isAreaFree(Position(0, 0), 16, 16, nullptr));
    EXPECT_FALSE(service.isAreaFree(Position(50, 50), 16, 16, nullptr));
}

TEST_F(CollisionServiceTest, EntityDoesNotBlockItself) {
    Entity* player = createObstacle(100, 100, 32, 32);
    service.initCollisionCache({player});

    bool isFree = service.isAreaFree(Position(100, 100), 32, 32, player);
    EXPECT_TRUE(isFree);
}

TEST_F(CollisionServiceTest, UpdateCacheMovesTheCollisionBox) {
    Entity* box = createObstacle(10, 10, 16, 16);
    service.initCollisionCache({box});

    Position oldPos(10, 10);
    Position newPos(200, 200);

    service.updatePositionCollisionCache(oldPos, newPos, box);

    EXPECT_TRUE(service.isAreaFree(oldPos, 16, 16, nullptr));
    EXPECT_FALSE(service.isAreaFree(newPos, 16, 16, nullptr));
}

TEST_F(CollisionServiceTest, RemoveEntityClearsCollision) {
    Entity* enemy = createObstacle(50, 50, 16, 16);
    service.initCollisionCache({enemy});

    EXPECT_FALSE(service.isAreaFree(Position(50, 50), 16, 16, nullptr));

    service.removeEntity(enemy);

    EXPECT_TRUE(service.isAreaFree(Position(50, 50), 16, 16, nullptr));
}

TEST_F(CollisionServiceTest, LargeObjectOccupiesMultipleCells) {
    Entity* bigBoss = createObstacle(0, 0, 48, 48);
    service.initCollisionCache({bigBoss});

    EXPECT_FALSE(service.isAreaFree(Position(0, 0), 16, 16, nullptr));
    EXPECT_FALSE(service.isAreaFree(Position(20, 20), 16, 16, nullptr));
    EXPECT_FALSE(service.isAreaFree(Position(47, 47), 16, 16, nullptr));
    EXPECT_TRUE(service.isAreaFree(Position(48, 48), 16, 16, nullptr));
}

TEST_F(CollisionServiceTest, LineOfSight_ReturnsNullWhenEmpty) {
    Entity* source = createObstacle(0, 0, 16, 16);
    service.initCollisionCache({source});

    Entity* seen = service.getEntityInLineOfSight(source, Direction::RIGHT, 10);
    EXPECT_EQ(seen, nullptr);
}

TEST_F(CollisionServiceTest, LineOfSight_DetectsTargetToTheRight) {
    Entity* source = createObstacle(0, 0, 16, 16);
    Entity* target = createObstacle(64, 0, 16, 16);
    service.initCollisionCache({source, target});

    Entity* seen = service.getEntityInLineOfSight(source, Direction::RIGHT, 10);
    EXPECT_EQ(seen, target);
}

TEST_F(CollisionServiceTest, LineOfSight_DetectsTargetToTheLeft) {
    Entity* source = createObstacle(128, 0, 16, 16);
    Entity* target = createObstacle(64, 0, 16, 16);
    service.initCollisionCache({source, target});

    Entity* seen = service.getEntityInLineOfSight(source, Direction::LEFT, 10);
    EXPECT_EQ(seen, target);
}

TEST_F(CollisionServiceTest, LineOfSight_DetectsTargetBelow) {
    Entity* source = createObstacle(0, 0, 16, 16);
    Entity* target = createObstacle(0, 64, 16, 16);
    service.initCollisionCache({source, target});

    Entity* seen = service.getEntityInLineOfSight(source, Direction::BOTTOM, 10);
    EXPECT_EQ(seen, target);
}

TEST_F(CollisionServiceTest, LineOfSight_DetectsTargetAbove) {
    Entity* source = createObstacle(0, 128, 16, 16);
    Entity* target = createObstacle(0, 64, 16, 16);
    service.initCollisionCache({source, target});

    Entity* seen = service.getEntityInLineOfSight(source, Direction::TOP, 10);
    EXPECT_EQ(seen, target);
}

TEST_F(CollisionServiceTest, LineOfSight_BlockedByWallBeforeTarget) {
    Entity* source = createObstacle(0, 0, 16, 16);
    Entity* wall   = createObstacle(32, 0, 16, 16);
    Entity* target = createObstacle(96, 0, 16, 16);
    service.initCollisionCache({source, wall, target});
    Entity* seen = service.getEntityInLineOfSight(source, Direction::RIGHT, 10);
    EXPECT_EQ(seen, wall);
    EXPECT_NE(seen, target);
}

TEST_F(CollisionServiceTest, LineOfSight_ReturnsNullWhenOutOfRange) {
    Entity* source = createObstacle(0, 0, 16, 16);
    Entity* target = createObstacle(160, 0, 16, 16);
    service.initCollisionCache({source, target});
    Entity* seen = service.getEntityInLineOfSight(source, Direction::RIGHT, 5);
    EXPECT_EQ(seen, nullptr);
}

TEST_F(CollisionServiceTest, LineOfSight_ReachesTargetExactlyAtMaxRange) {
    Entity* source = createObstacle(0, 0, 16, 16);
    Entity* target = createObstacle(160, 0, 16, 16);
    service.initCollisionCache({source, target});

    Entity* seen = service.getEntityInLineOfSight(source, Direction::RIGHT, 10);
    EXPECT_EQ(seen, target);
}

TEST_F(CollisionServiceTest, LineOfSight_SourceDoesNotBlockItself) {
    Entity* source = createObstacle(64, 0, 16, 16);
    Entity* target = createObstacle(128, 0, 16, 16);
    service.initCollisionCache({source, target});
    Entity* seen = service.getEntityInLineOfSight(source, Direction::RIGHT, 10);
    EXPECT_EQ(seen, target);
}

TEST_F(CollisionServiceTest, LineOfSight_UnknownDirectionReturnsNull) {
    Entity* source = createObstacle(0, 0, 16, 16);
    Entity* target = createObstacle(64, 0, 16, 16);
    service.initCollisionCache({source, target});

    Entity* seen = service.getEntityInLineOfSight(source, Direction::UNKNOWN, 10);
    EXPECT_EQ(seen, nullptr);
}

TEST_F(CollisionServiceTest, LineOfSight_NullSourceReturnsNull) {
    Entity* seen = service.getEntityInLineOfSight(nullptr, Direction::RIGHT, 10);
    EXPECT_EQ(seen, nullptr);
}


TEST_F(CollisionServiceTest, LineOfSight_NoFalsePositivePerpendicularEntity) {
    Entity* source = createObstacle(0, 0, 16, 16);
    Entity* target = createObstacle(0, 64, 16, 16);
    service.initCollisionCache({source, target});

    Entity* seen = service.getEntityInLineOfSight(source, Direction::RIGHT, 10);
    EXPECT_EQ(seen, nullptr);
}