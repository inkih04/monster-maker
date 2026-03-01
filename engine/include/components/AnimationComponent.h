//
// Created by inkih on 12/12/25.
//
#ifndef POKEMONGAMEENGINE_ANIMATIONCOMPONENT_H
#define POKEMONGAMEENGINE_ANIMATIONCOMPONENT_H

#include "components/Component.h"
#include "structs/Animation.h"
#include <unordered_map>
#include <vector>
#include <string>

static const std::string DEFAULT_SET = "default";

class AnimationComponent: public Component {
    private:
        std::unordered_map<std::string, std::unordered_map<std::string, Animation>> m_sets;
        std::string m_activeSet;
        std::string m_currentAnimation;
        size_t m_currentFrame;
        float m_elapsedTime;
        bool m_isPlaying;
        void updateRenderComponent();

    public:
        AnimationComponent();
        void addAnimation(const std::string& name,
                          const std::vector<SpriteRect>& frames,
                          float frameDuration,
                          bool loop = true,
                          const std::string& set = DEFAULT_SET);

        void setActiveSet(const std::string& set);
        const std::string& getActiveSet() const { return m_activeSet; }

        void play(const std::string& name, bool forceRestart = false);
        void pause();
        void resume();
        void stop();

        SpriteRect getCurrentFrame() const;
        std::string getCurrentAnimationName() const { return m_currentAnimation; }
        bool isPlaying() const { return m_isPlaying; }

        void update(int deltaTime) override;
        void render() override {}
    };


#endif //POKEMONGAMEENGINE_ANIMATIONCOMPONENT_H