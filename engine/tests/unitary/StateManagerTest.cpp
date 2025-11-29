//
// Created by inkih on 29/11/25.
//
#include <gtest/gtest.h>
#include "StateManager.h"
#include <memory>
#include "../mocks/MockState.h"


class StateManagerTest : public ::testing::Test {
protected:
    StateManager stateManager;
};

// 1. Test estado inicial
TEST_F(StateManagerTest, InitiallyEmpty) {
    EXPECT_EQ(stateManager.getCurrentState(), nullptr);
}

// 2. Test push y getCurrentState
TEST_F(StateManagerTest, PushStateAndGetCurrent) {
    auto mockState = std::make_unique<MockState>();
    auto* statePtr = mockState.get();

    stateManager.pushState(std::move(mockState));

    EXPECT_EQ(stateManager.getCurrentState(), statePtr);
}

// 3. Test múltiples push (LIFO)
TEST_F(StateManagerTest, MultipleStatesLIFO) {
    auto state1 = std::make_unique<MockState>();
    auto state2 = std::make_unique<MockState>();
    auto* state2Ptr = state2.get();

    stateManager.pushState(std::move(state1));
    stateManager.pushState(std::move(state2));

    EXPECT_EQ(stateManager.getCurrentState(), state2Ptr);
}

// 4. Test popState
TEST_F(StateManagerTest, PopState) {
    auto state1 = std::make_unique<MockState>();
    auto state2 = std::make_unique<MockState>();
    auto* state1Ptr = state1.get();

    stateManager.pushState(std::move(state1));
    stateManager.pushState(std::move(state2));
    stateManager.popState();

    EXPECT_EQ(stateManager.getCurrentState(), state1Ptr);
}

// 5. Test popState en stack vacío
TEST_F(StateManagerTest, PopEmptyStack) {
    EXPECT_NO_THROW(stateManager.popState());
    EXPECT_EQ(stateManager.getCurrentState(), nullptr);
}

// 6. Test updateCurrentState
TEST_F(StateManagerTest, UpdateCurrentState) {
    auto mockState = std::make_unique<MockState>();
    auto* statePtr = mockState.get();

    stateManager.pushState(std::move(mockState));
    stateManager.updateCurrentState(16);

    EXPECT_TRUE(statePtr->updateCalled);
}

// 7. Test updateCurrentState en stack vacío
TEST_F(StateManagerTest, UpdateEmptyStack) {
    EXPECT_NO_THROW(stateManager.updateCurrentState(16));
}

// 8. Test renderCurrentState
TEST_F(StateManagerTest, RenderCurrentState) {
    auto mockState = std::make_unique<MockState>();
    auto* statePtr = mockState.get();

    stateManager.pushState(std::move(mockState));
    stateManager.renderCurrentState();

    EXPECT_TRUE(statePtr->renderCalled);
}

// 9. Test renderCurrentState en stack vacío
TEST_F(StateManagerTest, RenderEmptyStack) {
    EXPECT_NO_THROW(stateManager.renderCurrentState());
}

// 10. Test solo se actualiza el estado superior
TEST_F(StateManagerTest, OnlyTopStateIsUpdated) {
    auto state1 = std::make_unique<MockState>();
    auto state2 = std::make_unique<MockState>();
    auto* state1Ptr = state1.get();
    auto* state2Ptr = state2.get();

    stateManager.pushState(std::move(state1));
    stateManager.pushState(std::move(state2));
    stateManager.updateCurrentState(16);

    EXPECT_FALSE(state1Ptr->updateCalled);
    EXPECT_TRUE(state2Ptr->updateCalled);
}