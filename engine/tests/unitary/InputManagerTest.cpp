#include <gtest/gtest.h>
#include "InputManager.h"
#include "../mocks/MockGLFW.h"

class InputManagerTest : public ::testing::Test {
protected:
    MockGLFWwindow* mockWindow;
    GLFWwindow* dummyWindowPtr;

    void SetUp() override {
        mockWindow = new MockGLFWwindow();
        MockGLFW::setMockWindow(mockWindow);

        dummyWindowPtr = reinterpret_cast<GLFWwindow*>(0x1);

        InputManager::initialize(dummyWindowPtr);
    }

    void TearDown() override {
        InputManager::resetInstance();
        MockGLFW::setMockWindow(nullptr);
        delete mockWindow;
    }
};

TEST_F(InputManagerTest, KeyPressed_ShouldDetectRisingEdge) {
    auto& input = InputManager::getInstance();

    mockWindow->setKeyState(GLFW_KEY_Z, GLFW_RELEASE);
    input.update();
    EXPECT_FALSE(input.isKeyPressed(GLFW_KEY_Z));

    mockWindow->setKeyState(GLFW_KEY_Z, GLFW_PRESS);
    input.update();
    EXPECT_TRUE(input.isKeyPressed(GLFW_KEY_Z));

    mockWindow->setKeyState(GLFW_KEY_Z, GLFW_PRESS);
    input.update();
    EXPECT_FALSE(input.isKeyPressed(GLFW_KEY_Z));
}

TEST_F(InputManagerTest, KeyPressed_ShouldNotDetectWhenKeyIsHeld) {
    auto& input = InputManager::getInstance();

    mockWindow->setKeyState(GLFW_KEY_W, GLFW_PRESS);
    input.update();

    mockWindow->setKeyState(GLFW_KEY_W, GLFW_PRESS);
    input.update();

    EXPECT_FALSE(input.isKeyPressed(GLFW_KEY_W));
}

TEST_F(InputManagerTest, KeyReleased_ShouldDetectFallingEdge) {
    auto& input = InputManager::getInstance();

    mockWindow->setKeyState(GLFW_KEY_X, GLFW_PRESS);
    input.update();
    EXPECT_FALSE(input.isKeyReleased(GLFW_KEY_X));

    mockWindow->setKeyState(GLFW_KEY_X, GLFW_RELEASE);
    input.update();
    EXPECT_TRUE(input.isKeyReleased(GLFW_KEY_X));

    mockWindow->setKeyState(GLFW_KEY_X, GLFW_RELEASE);
    input.update();
    EXPECT_FALSE(input.isKeyReleased(GLFW_KEY_X));
}

TEST_F(InputManagerTest, KeyReleased_ShouldNotDetectWhenKeyIsUp) {
    auto& input = InputManager::getInstance();

    mockWindow->setKeyState(GLFW_KEY_S, GLFW_RELEASE);
    input.update();

    EXPECT_FALSE(input.isKeyReleased(GLFW_KEY_S));
}

TEST_F(InputManagerTest, IsKeyDown_ShouldReturnCurrentPhysicalState) {
    auto& input = InputManager::getInstance();

    mockWindow->setKeyState(GLFW_KEY_SPACE, GLFW_RELEASE);
    EXPECT_FALSE(input.isKeyDown(GLFW_KEY_SPACE));

    mockWindow->setKeyState(GLFW_KEY_SPACE, GLFW_PRESS);
    EXPECT_TRUE(input.isKeyDown(GLFW_KEY_SPACE));

    mockWindow->setKeyState(GLFW_KEY_SPACE, GLFW_RELEASE);
    EXPECT_FALSE(input.isKeyDown(GLFW_KEY_SPACE));
}

TEST_F(InputManagerTest, MultipleKeys_ShouldHandleIndependentFlanks) {
    auto& input = InputManager::getInstance();

    mockWindow->setKeyState(GLFW_KEY_Z, GLFW_PRESS);
    mockWindow->setKeyState(GLFW_KEY_X, GLFW_RELEASE);
    input.update();

    EXPECT_TRUE(input.isKeyPressed(GLFW_KEY_Z));
    EXPECT_FALSE(input.isKeyPressed(GLFW_KEY_X));

    mockWindow->setKeyState(GLFW_KEY_Z, GLFW_PRESS);
    mockWindow->setKeyState(GLFW_KEY_X, GLFW_PRESS);
    input.update();

    EXPECT_FALSE(input.isKeyPressed(GLFW_KEY_Z));
    EXPECT_TRUE(input.isKeyPressed(GLFW_KEY_X));
}

TEST_F(InputManagerTest, MultipleKeys_ShouldHandleSimultaneousRisingEdges) {
    auto& input = InputManager::getInstance();

    mockWindow->setKeyState(GLFW_KEY_W, GLFW_RELEASE);
    mockWindow->setKeyState(GLFW_KEY_D, GLFW_RELEASE);
    input.update();

    mockWindow->setKeyState(GLFW_KEY_W, GLFW_PRESS);
    mockWindow->setKeyState(GLFW_KEY_D, GLFW_PRESS);
    input.update();

    EXPECT_TRUE(input.isKeyPressed(GLFW_KEY_W));
    EXPECT_TRUE(input.isKeyPressed(GLFW_KEY_D));
}

TEST_F(InputManagerTest, Mouse_ShouldReturnCorrectCoordinates) {
    auto& input = InputManager::getInstance();

    mockWindow->setMousePosition(100.0, 200.0);
    glm::vec2 pos = input.getMousePosition();
    EXPECT_FLOAT_EQ(pos.x, 100.0f);
    EXPECT_FLOAT_EQ(pos.y, 200.0f);

    mockWindow->setMousePosition(350.5, 480.25);
    pos = input.getMousePosition();
    EXPECT_FLOAT_EQ(pos.x, 350.5f);
    EXPECT_FLOAT_EQ(pos.y, 480.25f);
}

TEST_F(InputManagerTest, MouseButton_ShouldReturnCurrentPhysicalState) {
    auto& input = InputManager::getInstance();

    mockWindow->setMouseButtonState(GLFW_MOUSE_BUTTON_LEFT, GLFW_RELEASE);
    EXPECT_FALSE(input.isMouseButtonDown(GLFW_MOUSE_BUTTON_LEFT));

    mockWindow->setMouseButtonState(GLFW_MOUSE_BUTTON_LEFT, GLFW_PRESS);
    EXPECT_TRUE(input.isMouseButtonDown(GLFW_MOUSE_BUTTON_LEFT));

    mockWindow->setMouseButtonState(GLFW_MOUSE_BUTTON_LEFT, GLFW_RELEASE);
    EXPECT_FALSE(input.isMouseButtonDown(GLFW_MOUSE_BUTTON_LEFT));
}

TEST_F(InputManagerTest, MultipleMouseButtons_ShouldHandleIndependentStates) {
    auto& input = InputManager::getInstance();

    mockWindow->setMouseButtonState(GLFW_MOUSE_BUTTON_LEFT, GLFW_PRESS);
    mockWindow->setMouseButtonState(GLFW_MOUSE_BUTTON_RIGHT, GLFW_RELEASE);

    EXPECT_TRUE(input.isMouseButtonDown(GLFW_MOUSE_BUTTON_LEFT));
    EXPECT_FALSE(input.isMouseButtonDown(GLFW_MOUSE_BUTTON_RIGHT));
}

TEST_F(InputManagerTest, EdgeCase_RapidPresses_ShouldDetectBothFlanks) {
    auto& input = InputManager::getInstance();

    for (int i = 0; i < 3; ++i) {
        mockWindow->setKeyState(GLFW_KEY_E, GLFW_PRESS);
        input.update();
        EXPECT_TRUE(input.isKeyPressed(GLFW_KEY_E));

        mockWindow->setKeyState(GLFW_KEY_E, GLFW_RELEASE);
        input.update();
        EXPECT_TRUE(input.isKeyReleased(GLFW_KEY_E));
    }
}

TEST_F(InputManagerTest, EdgeCase_UntrackedKey_ShouldOnlyUseKeyDown) {
    auto& input = InputManager::getInstance();

    mockWindow->setKeyState(GLFW_KEY_F1, GLFW_PRESS);
    input.update();

    EXPECT_TRUE(input.isKeyDown(GLFW_KEY_F1));

    EXPECT_FALSE(input.isKeyPressed(GLFW_KEY_F1));
}