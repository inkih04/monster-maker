#include <gtest/gtest.h>
#include "DialogBox.h"

class DialogBoxTest : public ::testing::Test {
protected:
    void SetUp() override {
        dialogBox = std::make_unique<DialogBox>(
            glm::vec2(100.0f, 100.0f),
            glm::vec2(400.0f, 150.0f),
            "dummy.ttf",
            24
        );
    }

    std::unique_ptr<DialogBox> dialogBox;
};



TEST_F(DialogBoxTest, InitialStateIsCorrect) {
    EXPECT_FALSE(dialogBox->isActive());
    EXPECT_FALSE(dialogBox->isComplete());
    EXPECT_FALSE(dialogBox->isVisible());
}


TEST_F(DialogBoxTest, SetTextResetsState) {
    dialogBox->setText("Hello");
    dialogBox->start();
    dialogBox->update(1.0f);

    dialogBox->setText("New");

    EXPECT_FALSE(dialogBox->isComplete());
}




TEST_F(DialogBoxTest, StartActivatesDialog) {
    dialogBox->setText("Test");
    dialogBox->start();

    EXPECT_TRUE(dialogBox->isActive());
    EXPECT_TRUE(dialogBox->isVisible());
}

TEST_F(DialogBoxTest, CompleteSetsState) {
    dialogBox->setText("Test");
    dialogBox->complete();

    EXPECT_TRUE(dialogBox->isComplete());
}


TEST_F(DialogBoxTest, NormalSpeedCompletes) {
    dialogBox->setText("Hello");
    dialogBox->setSpeed(DialogSpeed::NORMAL);
    dialogBox->start();

    dialogBox->update(3000.f);

    EXPECT_TRUE(dialogBox->isComplete());
}

TEST_F(DialogBoxTest, SlowSpeedNeedsMoreTime) {
    dialogBox->setText("Hi");
    dialogBox->setSpeed(DialogSpeed::SLOW);
    dialogBox->start();

    dialogBox->update(80.f);
    EXPECT_FALSE(dialogBox->isComplete());

    dialogBox->update(80000.f);
    EXPECT_TRUE(dialogBox->isComplete());
}

TEST_F(DialogBoxTest, InstantSpeedCompletesImmediately) {
    dialogBox->setText("Instant");
    dialogBox->setSpeed(DialogSpeed::INSTANT);
    dialogBox->start();

    dialogBox->update(0.001f);

    EXPECT_TRUE(dialogBox->isComplete());
}



TEST_F(DialogBoxTest, HideDoesNotDeactivate) {
    dialogBox->start();
    dialogBox->hide();

    EXPECT_TRUE(dialogBox->isActive());
    EXPECT_FALSE(dialogBox->isVisible());
}

TEST_F(DialogBoxTest, ShowSetsVisible) {
    dialogBox->show();
    EXPECT_TRUE(dialogBox->isVisible());
}



TEST_F(DialogBoxTest, UpdateWithZeroDeltaTime) {
    dialogBox->setText("Test");
    dialogBox->start();
    dialogBox->update(0.0f);

    EXPECT_FALSE(dialogBox->isComplete());
}

TEST_F(DialogBoxTest, MultipleCompleteCallsSafe) {
    dialogBox->setText("Test");
    dialogBox->start();

    dialogBox->complete();
    dialogBox->complete();

    EXPECT_TRUE(dialogBox->isComplete());
}
