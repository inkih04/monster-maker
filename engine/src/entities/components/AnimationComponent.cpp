//
// Created by inkih on 12/12/25.
//

#include "components/AnimationComponent.h"
#include "components/RenderComponent.h"
#include "Entity.h"
#include <iostream>


AnimationComponent::AnimationComponent()
    : m_currentFrame(0)
    , m_elapsedTime(0.0f)
    , m_isPlaying(false){
}

void AnimationComponent::addAnimation(const std::string& name,
                                     const std::vector<SpriteRect>& frames,
                                     float frameDuration,
                                     bool loop,
                                     int priority) {
    Animation anim;
    anim.name = name;
    anim.frames = frames;
    anim.frameDuration = frameDuration;
    anim.loop = loop;
    anim.priority = priority;

    m_animations[name] = anim;
}

void AnimationComponent::play(const std::string& name, bool forceRestart) {
    if (m_animations.find(name) == m_animations.end()) {
        std::cerr << "Animation '" << name << "' not found!" << std::endl;
        return;
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
    if (!m_currentAnimation.empty() && !m_animations[m_currentAnimation].frames.empty()) {
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

    Animation& anim = m_animations[m_currentAnimation];

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
    Component* renderCompBase = m_entity->getComponent(ComponentsType::RENDER);

    if (!renderCompBase) {
        std::cerr << "Entity doesn't have RenderComponent!" << std::endl;
        return;
    }

    //todo:Lo mismo puedo guardar el puntero en una variable miembro para no tener que buscarlo cada vez
    auto* renderComp = dynamic_cast<RenderComponent*>(renderCompBase);

    if (!renderComp) {
        std::cerr << "Failed to cast to RenderComponent!" << std::endl;
        return;
    }

    Animation& anim = m_animations[m_currentAnimation];

    if (m_currentFrame >= anim.frames.size()) {
        std::cerr << "Invalid frame index!" << std::endl;
        return;
    }

    renderComp->setSpriteRect(anim.frames[m_currentFrame]);
}

SpriteRect AnimationComponent::getCurrentFrame() const {
    if (m_currentAnimation.empty()) return SpriteRect{-1, -1, -1, -1};

    const Animation& anim = m_animations.at(m_currentAnimation);
    return anim.frames[m_currentFrame];
}