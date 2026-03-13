//
// Created by inkih on 13/3/26.
//
#include "UiManager.h"

void UiManager::init(int width, int height, std::string fontPath) {
    m_renderInterface.SetViewport(width, height);

    Rml::SetSystemInterface(&m_systemInterface);
    Rml::SetRenderInterface(&m_renderInterface);
    Rml::Initialise();

    m_context = Rml::CreateContext("main", Rml::Vector2i(width, height));

    if (!fontPath.empty()) {
        std::cerr << "[ENGINE] Loading ui font. " << fontPath <<  std::endl;
        Rml::LoadFontFace(fontPath);
    }
    else {
        fontPath = "resources/fonts/Roboto/Roboto.ttf";
        std::cerr << "[ENGINE][WARNING] Font path could not be found." << std::endl;
        std::cerr << "[ENGINE][WARNING] Loading default font at " << fontPath << std::endl;
        Rml::LoadFontFace(fontPath);

    }
}

void UiManager::resize(int width, int height) {
    m_renderInterface.SetViewport(width, height);
    if (m_context) {
        m_context->SetDimensions(Rml::Vector2i(width, height));
    }
}

Rml::ElementDocument* UiManager::loadDocument(const std::string& path) {
    auto* doc = m_context->LoadDocument(path);
    if (doc) {
        doc->Show();
    }
    return doc;
}

void UiManager::update() {
    if (m_context) {
        m_context->Update();
    }
}

void UiManager::render() {
    m_renderInterface.BeginFrame();

    if (m_context) {
        m_context->Render();
    }

    m_renderInterface.EndFrame();
}

void UiManager::shutdown() {
    Rml::Shutdown();
}