//
// Created by inkih on 12/12/25.
//

#include "components/AnimationComponent.h"
#include "components/RenderComponent.h"
#include "Entity.h"
#include <iostream>


AnimationComponent::AnimationComponent()
    : m_activeSet(DEFAULT_SET)
    , m_currentFrame(0)
    , m_elapsedTime(0.0f)
    , m_isPlaying(false) {
}

void AnimationComponent::addAnimation(const std::string& name,
                                      const std::vector<SpriteRect>& frames,
                                      float frameDuration,
                                      bool loop,
                                      const std::string& set) {
    Animation anim;
    anim.name = name;
    anim.frames = frames;
    anim.frameDuration = frameDuration;
    anim.loop = loop;

    m_sets[set][name] = anim;
}

void AnimationComponent::setActiveSet(const std::string& set) {
    if (m_sets.find(set) == m_sets.end()) {
        std::cerr << "[ENGINE][WARN] Animation set '" << set << "' not found, keeping current set '"
                  << m_activeSet << "'" << std::endl;
        return;
    }

    m_activeSet = set;

    m_currentAnimation = "";
    m_currentFrame = 0;
    m_elapsedTime = 0.0f;
    m_isPlaying = false;
}

void AnimationComponent::play(const std::string& name, bool forceRestart) {
    auto setIt = m_sets.find(m_activeSet);
    if (setIt == m_sets.end()) {
        std::cerr << "[ENGINE][ERROR] Active set '" << m_activeSet << "' not found!" << std::endl;
        return;
    }

    const auto& animations = setIt->second;

    auto animIt = animations.find(name);
    if (animIt == animations.end()) {
        if (m_activeSet != DEFAULT_SET) {
            auto& defaultAnims = m_sets[DEFAULT_SET];
            animIt = defaultAnims.find(name);
            if (animIt == defaultAnims.end()) {
                std::cerr << "[ENGINE][WARN] Animation '" << name
                          << "' not found in set '" << m_activeSet
                          << "' nor in 'default'" << std::endl;
                return;
            }
        } else {
            std::cerr << "[ENGINE][WARN] Animation '" << name << "' not found in set '"
                      << m_activeSet << "'" << std::endl;
            return;
        }
    }

    if (m_currentAnimation == name && m_isPlaying && !forceRestart) {
        return;
    }

    m_currentAnimation = name;
    m_currentFrame = 0;
    m_elapsedTime = 0.0f;
    m_isPlaying = true;

    updateRenderComponent();
}

void AnimationComponent::pause() {
    m_isPlaying = false;
}

void AnimationComponent::resume() {
    auto setIt = m_sets.find(m_activeSet);
    if (setIt == m_sets.end()) return;

    if (!m_currentAnimation.empty() && !setIt->second.at(m_currentAnimation).frames.empty()) {
        m_isPlaying = true;
    }
}

void AnimationComponent::stop() {
    m_isPlaying = false;
    m_currentFrame = 0;
    m_elapsedTime = 0.0f;
}

void AnimationComponent::update(int deltaTime) {
    if (!m_isPlaying || m_currentAnimation.empty()) return;

    auto setIt = m_sets.find(m_activeSet);
    if (setIt == m_sets.end()) return;

    auto animIt = setIt->second.find(m_currentAnimation);
    if (animIt == setIt->second.end()) return;

    Animation& anim = animIt->second;

    m_elapsedTime += deltaTime;

    if (m_elapsedTime >= anim.frameDuration) {
        m_elapsedTime -= anim.frameDuration;
        m_currentFrame++;

        if (m_currentFrame >= anim.frames.size()) {
            if (anim.loop) {
                m_currentFrame = 0;
            } else {
                m_currentFrame = anim.frames.size() - 1;
                m_isPlaying = false;
            }
        }
        updateRenderComponent();
    }
}

void AnimationComponent::updateRenderComponent() {
    if (!m_entity) return;
    Component* renderCompBase = m_entity->getComponent(ComponentsType::RENDER);
    if (!renderCompBase) {
        std::cerr << "[ENGINE][ERROR] Entity doesn't have RenderComponent!" << std::endl;
        return;
    }

    auto* renderComp = dynamic_cast<RenderComponent*>(renderCompBase);
    if (!renderComp) {
        std::cerr << "[ENGINE][ERROR] Failed to cast to RenderComponent!" << std::endl;
        return;
    }

    auto setIt = m_sets.find(m_activeSet);
    if (setIt == m_sets.end()) return;

    auto animIt = setIt->second.find(m_currentAnimation);
    if (animIt == setIt->second.end()) return;

    const Animation& anim = animIt->second;

    if (m_currentFrame >= anim.frames.size()) {
        std::cerr << "[ENGINE][ERROR] Invalid frame index!" << std::endl;
        return;
    }

    renderComp->setSpriteRect(anim.frames[m_currentFrame]);
}

SpriteRect AnimationComponent::getCurrentFrame() const {
    auto setIt = m_sets.find(m_activeSet);
    if (setIt == m_sets.end()) return SpriteRect{-1, -1, -1, -1};

    auto animIt = setIt->second.find(m_currentAnimation);
    if (animIt == setIt->second.end()) return SpriteRect{-1, -1, -1, -1};

    return animIt->second.frames[m_currentFrame];
}