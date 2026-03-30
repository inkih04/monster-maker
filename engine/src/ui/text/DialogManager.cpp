//
// Created by inkih on 28/3/26.
//

#include "DialogManager.h"
#include "LocalizationManager.h"
#include "UiManager.h"
#include "UiDocument.h"
#include "scripting/ScriptEngine.h"
#include "InputManager.h"
#include <iostream>


void DialogManager::registerFile(const std::string& uiDocumentId,
                                  const DialogFile& file) {
    m_files[uiDocumentId] = file;
}


void DialogManager::open(const std::string& uiDocumentId,
                          const std::string& rmlPath,
                          const DialogChain& chain,
                          const std::string& speakerVar,
                          const std::string& textVar)
{
    if (chain.pages.empty()) {
        std::cerr << "[DialogManager][WARNING] Chain '" << chain.id
                  << "' has no pages.\n";
        return;
    }

    ActiveChain active;
    active.chain        = chain;
    active.currentPage  = 0;
    active.choiceCursor = 0;
    active.speakerVar   = speakerVar;
    active.textVar      = textVar;
    m_activeChains[uiDocumentId] = std::move(active);

    const ActiveChain& stored = m_activeChains[uiDocumentId];

    auto& lua = ScriptEngine::getInstance().getState();
    sol::table choicesTable = lua.create_table();

    sol::table initVars = lua.create_table_with(
        stored.speakerVar, std::string(""),
        stored.textVar,    std::string(""),
        "has_choices",     false,
        "choice_index",    0,
        "choices",         choicesTable
    );

    auto& uiManager = UiManager::getInstance();
    if (!uiManager.isOpen(uiDocumentId))
        uiManager.openDocument(uiDocumentId, rmlPath, initVars);

    UiDocument* doc = uiManager.getDocument(uiDocumentId);
    if (!doc) {
        std::cerr << "[DialogManager][ERROR] UiDocument not found: "
                  << uiDocumentId << "\n";
        return;
    }

    showCurrentPage(uiDocumentId);
}

bool DialogManager::advance(const std::string& uiDocumentId)
{
    auto it = m_activeChains.find(uiDocumentId);
    if (it == m_activeChains.end()) return true;

    ActiveChain& active = it->second;

    if (!active.chain.pages[active.currentPage].choices.empty()) {
        std::cerr << "[DialogManager][WARNING] advance() on a choices page. "
                     "Use jumpToChain() instead.\n";
        return false;
    }

    active.currentPage++;
    active.choiceCursor = 0;

    if (active.currentPage >= static_cast<int>(active.chain.pages.size()))
        return true;

    showCurrentPage(uiDocumentId);
    return false;
}


void DialogManager::close(const std::string& uiDocumentId)
{
    m_activeChains.erase(uiDocumentId);
    m_files.erase(uiDocumentId);
    UiManager::getInstance().closeDocument(uiDocumentId);
}


bool DialogManager::isActive(const std::string& uiDocumentId) const
{
    return m_activeChains.count(uiDocumentId) > 0;
}


bool DialogManager::hasChoices(const std::string& uiDocumentId) const
{
    auto it = m_activeChains.find(uiDocumentId);
    if (it == m_activeChains.end()) return false;
    const auto& active = it->second;
    return !active.chain.pages[active.currentPage].choices.empty();
}


void DialogManager::moveChoice(const std::string& uiDocumentId, int delta)
{
    auto it = m_activeChains.find(uiDocumentId);
    if (it == m_activeChains.end()) return;

    ActiveChain& active = it->second;
    const auto& choices = active.chain.pages[active.currentPage].choices;
    if (choices.empty()) return;

    int n = static_cast<int>(choices.size());
    active.choiceCursor = ((active.choiceCursor + delta) % n + n) % n;

    UiDocument* doc = UiManager::getInstance().getDocument(uiDocumentId);
    if (!doc) return;

    auto& lua = ScriptEngine::getInstance().getState();
    sol::table vars = lua.create_table_with("choice_index", active.choiceCursor);
    doc->updateModel(vars);
}


int DialogManager::getChoiceIndex(const std::string& uiDocumentId) const
{
    auto it = m_activeChains.find(uiDocumentId);
    return it != m_activeChains.end() ? it->second.choiceCursor : 0;
}


std::string DialogManager::getSelectedTarget(const std::string& uiDocumentId) const
{
    auto it = m_activeChains.find(uiDocumentId);
    if (it == m_activeChains.end()) return {};

    const ActiveChain& active = it->second;
    const auto& choices = active.chain.pages[active.currentPage].choices;
    if (choices.empty()) return {};
    return choices[active.choiceCursor].nextChain;
}


bool DialogManager::jumpToChain(const std::string& uiDocumentId,
                                 const std::string& chainId)
{
    auto fileIt = m_files.find(uiDocumentId);
    if (fileIt == m_files.end()) {
        std::cerr << "[DialogManager][ERROR] No DialogFile registered for: "
                  << uiDocumentId << "\n";
        return false;
    }

    const DialogChain* target = fileIt->second.find(chainId);
    if (!target) {
        std::cerr << "[DialogManager][ERROR] Chain id not found: " << chainId << "\n";
        return false;
    }

    auto& active       = m_activeChains[uiDocumentId];
    active.chain       = *target;
    active.currentPage = 0;
    active.choiceCursor = 0;

    showCurrentPage(uiDocumentId);
    return true;
}


void DialogManager::showCurrentPage(const std::string& uiDocumentId)
{
    auto it = m_activeChains.find(uiDocumentId);
    if (it == m_activeChains.end()) return;

    const ActiveChain& active = it->second;
    const DialogPage&  page   = active.chain.pages[active.currentPage];

    auto& loc = LocalizationManager::getInstance();

    UiDocument* doc = UiManager::getInstance().getDocument(uiDocumentId);
    if (!doc) {
        std::cerr << "[DialogManager][ERROR] UiDocument not found: "
                  << uiDocumentId << "\n";
        return;
    }

    auto& lua = ScriptEngine::getInstance().getState();
    sol::table choicesTable = lua.create_table();

    for (std::size_t i = 0; i < page.choices.size(); ++i) {
        choicesTable[i + 1] = loc.get(page.choices[i].text);
    }

    sol::table vars = lua.create_table_with(
        active.speakerVar, loc.get(page.speaker),
        active.textVar,    loc.get(page.text),
        "has_choices",     !page.choices.empty(),
        "choice_index",    active.choiceCursor,
        "choices",         choicesTable
    );

    doc->updateModel(vars);
}

bool DialogManager::interact(const std::string& uiDocumentId,
                             const std::string& rmlPath,
                             const DialogFile& file,
                             const std::string& startChainId,
                             const std::string& speakerVar,
                             const std::string& textVar)
{
    if (!isActive(uiDocumentId)) {
        const DialogChain* chain = file.find(startChainId);
        if (!chain) return false;

        registerFile(uiDocumentId, file);
        open(uiDocumentId, rmlPath, *chain, speakerVar, textVar);
        return true;
    }

    if (hasChoices(uiDocumentId)) {
        std::string target = getSelectedTarget(uiDocumentId);
        if (!target.empty()) {
            jumpToChain(uiDocumentId, target);
            return true;
        } else {
            close(uiDocumentId);
            return false;
        }
    } else {
        bool finished = advance(uiDocumentId);
        if (finished) {
            close(uiDocumentId);
            return false;
        }
        return true;
    }
}

void DialogManager::updateNavigation(const std::string& uiDocumentId, int upKey, int downKey) {
    if (!isActive(uiDocumentId) || !hasChoices(uiDocumentId)) return;

    auto& input = InputManager::getInstance();
    if (input.isKeyPressed(upKey)) {
        moveChoice(uiDocumentId, -1);
    } else if (input.isKeyPressed(downKey)) {
        moveChoice(uiDocumentId, 1);
    }
}