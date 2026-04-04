//
// Created by inkih on 30/11/25.
//


#include <gtest/gtest.h>
#include "Entity.h"
#include "../mocks/MockComponent.h"

TEST(EntityTest, AddAndGetComponent) {
    Entity entity;

    auto mockComp = std::make_unique<MockComponent>();
    MockComponent* rawPtr = mockComp.get();

    entity.addComponent(ComponentsType::POSITION, std::move(mockComp));

    Component* c = entity.getComponent(ComponentsType::POSITION);
    ASSERT_EQ(c, rawPtr);

    EXPECT_TRUE(entity.hasComponent(ComponentsType::POSITION));
}

TEST(EntityTest, HasComponentReturnsFalseWhenMissing) {
    Entity entity;

    EXPECT_FALSE(entity.hasComponent(ComponentsType::RENDER));
}



