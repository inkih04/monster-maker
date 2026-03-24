//
// Created by inkih on 19/2/26.
//

#include <gtest/gtest.h>
#include <gmock/gmock.h>
#include <glm/vec2.hpp>
#include <memory>
#include <vector>

#include "BordersMapService.h"
#include "ComponentsType.h"
#include "Position.h"
#include "Entity.h"
#include "components/PositionComponent.h"

using ::testing::Return;
using ::testing::_;

class FakePositionComponent : public PositionComponent {
public:
    explicit FakePositionComponent(int x, int y)
        : PositionComponent(static_cast<float>(x), static_cast<float>(y)) {}
};

class EntityWithPosition : public Entity {
public:
    explicit EntityWithPosition(int x, int y) {
        addComponent(ComponentsType::POSITION,
                     std::make_unique<FakePositionComponent>(x, y));
    }
};

static Entity* makeEntity(std::vector<std::unique_ptr<Entity>>& owner, int x, int y)
{
    auto e = std::make_unique<EntityWithPosition>(x, y);
    Entity* ptr = e.get();
    owner.push_back(std::move(e));
    return ptr;
}

static std::vector<Entity*> toRaw(const std::vector<std::unique_ptr<Entity>>& v)
{
    std::vector<Entity*> raw;
    raw.reserve(v.size());
    for (const auto& e : v) raw.push_back(e.get());
    return raw;
}

class BordersMapServiceTest : public ::testing::Test {
protected:
    BordersMapService service;
    std::vector<std::unique_ptr<Entity>> entityOwner;
};

TEST_F(BordersMapServiceTest, InitWithEmptyListDoesNotCrash)
{
    std::vector<Entity*> empty;
    EXPECT_NO_THROW(service.initBordersMapService(empty));
}

TEST_F(BordersMapServiceTest, InitWithSingleEntitySetsCorrectBounds)
{
    makeEntity(entityOwner, 100, 200);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_FALSE(service.isOutOfBounds(Position(100, 200), glm::vec2(0.0f, 0.0f)));
}

TEST_F(BordersMapServiceTest, InitCalculatesCorrectTopLeftAndBottomRight)
{
    makeEntity(entityOwner,  50,  50);
    makeEntity(entityOwner, 300, 400);
    makeEntity(entityOwner, 150,  10);
    makeEntity(entityOwner,   0, 300);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_FALSE(service.isOutOfBounds(Position(  0,  10), glm::vec2(0.0f, 0.0f)));
    EXPECT_FALSE(service.isOutOfBounds(Position(300, 400), glm::vec2(0.0f, 0.0f)));
    EXPECT_FALSE(service.isOutOfBounds(Position(150, 200), glm::vec2(0.0f, 0.0f)));
}

TEST_F(BordersMapServiceTest, PositionInsideBoundsReturnsFalse)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_FALSE(service.isOutOfBounds(Position(250, 250), glm::vec2(0.0f, 0.0f)));
}

TEST_F(BordersMapServiceTest, PositionOnLeftBorderIsInsideBounds)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_FALSE(service.isOutOfBounds(Position(0, 250), glm::vec2(0.0f, 0.0f)));
}



TEST_F(BordersMapServiceTest, PositionBeyondRightBorderIsOutOfBounds)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_TRUE(service.isOutOfBounds(Position(517, 250), glm::vec2(0.0f, 0.0f)));
}

TEST_F(BordersMapServiceTest, PositionBeyondLeftBorderIsOutOfBounds)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_TRUE(service.isOutOfBounds(Position(-1, 250), glm::vec2(0.0f, 0.0f)));
}

TEST_F(BordersMapServiceTest, PositionAboveTopBorderIsOutOfBounds)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_TRUE(service.isOutOfBounds(Position(250, -1), glm::vec2(0.0f, 0.0f)));
}

TEST_F(BordersMapServiceTest, PositionBelowBottomBorderIsOutOfBounds)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_TRUE(service.isOutOfBounds(Position(250, 517), glm::vec2(0.0f, 0.0f)));
}

TEST_F(BordersMapServiceTest, OffsetPositionStillInsideBounds)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_FALSE(service.isOutOfBounds(Position(250, 250), glm::vec2(16.0f, 16.0f)));
}

TEST_F(BordersMapServiceTest, OffsetExceedsRightBorder)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_TRUE(service.isOutOfBounds(Position(506, 250), glm::vec2(16.0f, 0.0f)));
}

TEST_F(BordersMapServiceTest, OffsetExceedsLeftBorder)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_TRUE(service.isOutOfBounds(Position(10, 250), glm::vec2(16.0f, 0.0f)));
}

TEST_F(BordersMapServiceTest, OffsetExceedsBottomBorder)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_TRUE(service.isOutOfBounds(Position(250, 506), glm::vec2(0.0f, 16.0f)));
}

TEST_F(BordersMapServiceTest, OffsetExceedsTopBorder)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_TRUE(service.isOutOfBounds(Position(250, 10), glm::vec2(0.0f, 16.0f)));
}

TEST_F(BordersMapServiceTest, SetPositionExpandsRightBorder)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_TRUE(service.isOutOfBounds(Position(700, 300), glm::vec2(0.0f, 0.0f)));

    service.setPosition(Position(700, 500));

    EXPECT_FALSE(service.isOutOfBounds(Position(700, 300), glm::vec2(0.0f, 0.0f)));
}

TEST_F(BordersMapServiceTest, SetPositionExpandsTopLeftBorder)
{
    makeEntity(entityOwner, 100, 100);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    EXPECT_TRUE(service.isOutOfBounds(Position(50, 50), glm::vec2(0.0f, 0.0f)));

    service.setPosition(Position(0, 0));

    EXPECT_FALSE(service.isOutOfBounds(Position(50, 50), glm::vec2(0.0f, 0.0f)));
}


TEST_F(BordersMapServiceTest, ClampCameraReturnsTargetWhenInsideBounds)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    Position result = service.clampCameraPosition(Position(250, 250), 240, 135);

    EXPECT_EQ(result.x, 250);
    EXPECT_EQ(result.y, 250);
}

TEST_F(BordersMapServiceTest, ClampCameraClipsLeftBorder)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    Position result = service.clampCameraPosition(Position(100, 250), 240, 135);

    EXPECT_EQ(result.x, 240);
}



TEST_F(BordersMapServiceTest, ClampCameraClipsTopBorder)
{
    makeEntity(entityOwner,   0,   0);
    makeEntity(entityOwner, 500, 500);
    service.initBordersMapService(toRaw(entityOwner));

    Position result = service.clampCameraPosition(Position(250, 50), 240, 135);

    EXPECT_EQ(result.y, 135);
}


