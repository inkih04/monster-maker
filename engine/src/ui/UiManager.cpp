//
// Created by inkih on 16/3/26.
//

#include "UiManager.h"
#include "UiDocumentLoader.h"
#include <sol/sol.hpp>
#include <iostream>

void UiManager::init(int width, int height, float dpiScale, const std::string& fontPath) {
    m_renderInterface.SetViewport(width, height);

    Rml::SetFileInterface(&m_fileInterface);
    Rml::SetSystemInterface(&m_systemInterface);
    Rml::SetRenderInterface(&m_renderInterface);
    Rml::Initialise();

    m_context = Rml::CreateContext("main", Rml::Vector2i(width, height));

    if (!fontPath.empty()) {
        std::cerr << "[ENGINE] Loading ui font: " << fontPath << std::endl;
        Rml::LoadFontFace(fontPath);
    } else {
        const std::string defaultFont = "resources/fonts/Roboto/Roboto.ttf";
        std::cerr << "[ENGINE][WARNING] No font path provided, using default: "
                  << defaultFont << std::endl;
        Rml::LoadFontFace(defaultFont);
    }

    if (m_context)
        m_context->SetDensityIndependentPixelRatio(dpiScale);
}

void UiManager::resize(int width, int height) {
    m_renderInterface.SetViewport(width, height);
    if (m_context)
        m_context->SetDimensions(Rml::Vector2i(width, height));
}

void UiManager::update() {
    if (m_context)
        m_context->Update();
}

void UiManager::render() {
    m_renderInterface.BeginFrame();
    if (m_context)
        m_context->Render();
    m_renderInterface.EndFrame();
}

void UiManager::shutdown() {
    m_documents.clear();
    Rml::Shutdown();
}

UiDocument* UiManager::openDocument(const std::string& id, const std::string& uiFilePath, sol::optional<sol::table> initData) {
    UiDocumentDef def;
    try {
        def = UiDocumentLoader::loadDef(uiFilePath);
    } catch (const std::exception& e) {
        std::cerr << "[ENGINE][ERROR] " << e.what() << std::endl;
        return nullptr;
    }

    auto doc = std::make_unique<UiDocument>(nullptr, m_context, def.scriptPath);
    if (initData.has_value()) {
        doc->initModel(id, initData.value());
    }
    auto* rmlDoc = m_context->LoadDocument(def.htmlPath);
    if (!rmlDoc) {
        std::cerr << "[ENGINE][ERROR] RmlUi failed to load: " << def.htmlPath << std::endl;
        return nullptr;
    }
    doc->setRmlDocument(rmlDoc);
    rmlDoc->Show();

    if (m_documents.count(id))
        std::cerr << "[ENGINE][WARNING] Replacing already open document: " << id << std::endl;

    auto* ptr = doc.get();
    m_documents[id] = std::move(doc);
    return ptr;
}

void UiManager::closeDocument(const std::string& id) {
    m_documents.erase(id);
}

UiDocument* UiManager::getDocument(const std::string& id) {
    auto it = m_documents.find(id);
    return it != m_documents.end() ? it->second.get() : nullptr;
}

bool UiManager::isOpen(const std::string& id) const {
    return m_documents.count(id) > 0;
}