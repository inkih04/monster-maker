//
// Created by inkih on 24/3/26.
//

#include "ScriptComponet.h"
#include <iostream>

ScriptComponent::ScriptComponent(std::string path) : m_scriptPath(std::move(path)) {}


ScriptComponent::~ScriptComponent() {}


void ScriptComponent::reset() {

}

void ScriptComponent::init() {}
void ScriptComponent::update(int deltaTime) {}
void ScriptComponent::executeOnCollision(Entity* other) {}
void ScriptComponent::executeOnInteract(Entity *other) {}
void ScriptComponent::executeOnTriggerEnter(Entity* other) {}


