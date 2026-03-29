//
// Created by inkih on 28/3/26.
//

#include "DialogManager.h"

#include "LocalizationManager.h"
#include "UiManager.h"
#include "UiDocument.h"
#include "scripting/ScriptEngine.h"

#include <iostream>


void DialogManager::open(const std::string& uiDocumentId,
                          const std::string& rmlPath,
                          const DialogChain& chain,
                          const std::string& speakerVar,
                          const std::string& textVar)
{
    if (chain.pages.empty()) {
        std::cerr << "[ENGINE][DialogManager][WARNING] Chain '" << chain.id
                  << "' has no pages." << std::endl;
        return;
    }

    ActiveChain active;
    active.chain       = chain;
    active.currentPage = 0;
    active.speakerVar  = speakerVar;
    active.textVar     = textVar;
    m_activeChains[uiDocumentId] = std::move(active);

    const ActiveChain& stored = m_activeChains[uiDocumentId];

    auto& lua = ScriptEngine::getInstance().getState();
    sol::table initVars = lua.create_table_with(
        stored.speakerVar, std::string(""),
        stored.textVar,    std::string("")
    );

    auto& uiManager = UiManager::getInstance();
    if (!uiManager.isOpen(uiDocumentId)) {
        uiManager.openDocument(uiDocumentId, rmlPath, initVars);
    }

    UiDocument* doc = uiManager.getDocument(uiDocumentId);
    if (!doc) {
        std::cerr << "[ENGINE][DialogManager][ERROR] UiDocument not found after open: "
                  << uiDocumentId << std::endl;
        return;
    }

    showCurrentPage(uiDocumentId);
}


bool DialogManager::advance(const std::string& uiDocumentId)
{
    auto it = m_activeChains.find(uiDocumentId);
    if (it == m_activeChains.end()) {
        std::cerr << "[ENGINE][DialogManager][WARNING] advance() called on inactive id: "
                  << uiDocumentId << std::endl;
        return true;
    }

    ActiveChain& active = it->second;
    active.currentPage++;

    if (active.currentPage >= static_cast<int>(active.chain.pages.size()))
        return true;

    showCurrentPage(uiDocumentId);
    return false;
}


void DialogManager::close(const std::string& uiDocumentId)
{
    m_activeChains.erase(uiDocumentId);
    UiManager::getInstance().closeDocument(uiDocumentId);
}

bool DialogManager::isActive(const std::string& uiDocumentId) const
{
    return m_activeChains.count(uiDocumentId) > 0;
}

void DialogManager::showCurrentPage(const std::string& uiDocumentId)
{
    auto it = m_activeChains.find(uiDocumentId);
    if (it == m_activeChains.end()) return;

    const ActiveChain& active = it->second;
    const DialogPage&  page   = active.chain.pages[active.currentPage];

    auto& loc = LocalizationManager::getInstance();
    const std::string speakerText = loc.get(page.speaker);
    const std::string dialogText  = loc.get(page.text);

    UiDocument* doc = UiManager::getInstance().getDocument(uiDocumentId);
    if (!doc) {
        std::cerr << "[ENGINE][DialogManager][ERROR] UiDocument not found: "
                  << uiDocumentId << std::endl;
        return;
    }

    auto& lua = ScriptEngine::getInstance().getState();
    sol::table vars = lua.create_table_with(
        active.speakerVar, speakerText,
        active.textVar,    dialogText
    );

    doc->updateModel(vars);
}