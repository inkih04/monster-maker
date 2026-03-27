//
// Created by inkih on 13/3/26.
//

#ifndef MONSTERMAKERENGINE_UIMANAGER_H
#define MONSTERMAKERENGINE_UIMANAGER_H

#include <GL/glew.h>
#include <string>
#include <memory>
#include <unordered_map>
#include <RmlUi/Core.h>
#include "RmlSystemInterface.h"
#include "RmlRenderInterface.h"
#include "RmlFileInterface.h"
#include "UiDocument.h"

class UiManager {
public:
    static UiManager& getInstance() {
        static UiManager instance;
        return instance;
    }

    UiManager(const UiManager&) = delete;
    UiManager& operator=(const UiManager&) = delete;

    void init(int width, int height, float dpiScale, const std::string& fontPath);
    void resize(int width, int height);
    void update();
    void render();
    void shutdown();

    UiDocument* openDocument(const std::string& id, const std::string& uiFilePath);
    void closeDocument(const std::string& id);
    UiDocument* getDocument(const std::string& id);
    bool isOpen(const std::string& id) const;

    Rml::Context* getContext() { return m_context; }

private:
    UiManager() = default;

    RmlSystemInterface m_systemInterface;
    RmlRenderInterface m_renderInterface;
    RmlFileInterface   m_fileInterface;
    Rml::Context*      m_context = nullptr;

    std::unordered_map<std::string, std::unique_ptr<UiDocument>> m_documents;
};

#endif //MONSTERMAKERENGINE_UIMANAGER_H