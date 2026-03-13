//
// Created by inkih on 13/3/26.
//

#ifndef MONSTERMAKERENGINE_UIMANAGER_H
#define MONSTERMAKERENGINE_UIMANAGER_H

#include <RmlUi/Core.h>
#include <string>
#include "RmlSystemInterface.h"
#include "RmlRenderInterface.h"

class UiManager {
public:
    static UiManager& getInstance() {
        static UiManager instance;
        return instance;
    }

    void init(int width, int height, std::string fontPath);
    Rml::ElementDocument* loadDocument(const std::string& path);
    void resize(int width, int height);
    void update();
    void render();
    void shutdown();

    Rml::Context* getContext() { return m_context; }

private:
    UiManager() = default;

    UiManager(const UiManager&) = delete;
    UiManager& operator=(const UiManager&) = delete;

    RmlSystemInterface m_systemInterface;
    RmlRenderInterface m_renderInterface;
    Rml::Context* m_context = nullptr;
};

#endif //MONSTERMAKERENGINE_UIMANAGER_H