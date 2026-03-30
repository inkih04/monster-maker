//
// Created by inkih on 28/3/26.
//

#ifndef MONSTERMAKERENGINE_DIALOGMANAGER_H
#define MONSTERMAKERENGINE_DIALOGMANAGER_H

#include "DialogTypes.h"
#include <string>
#include <unordered_map>

class DialogManager {
public:
    static DialogManager& getInstance() {
        static DialogManager instance;
        return instance;
    }

    void open(const std::string& uiDocumentId,
              const std::string& rmlPath,
              const DialogChain& chain,
              const std::string& speakerVar,
              const std::string& textVar);

    bool advance(const std::string& uiDocumentId);

    void close(const std::string& uiDocumentId);
    bool isActive(const std::string& uiDocumentId) const;


    bool hasChoices(const std::string& uiDocumentId) const;

    void moveChoice(const std::string& uiDocumentId, int delta);

    int  getChoiceIndex(const std::string& uiDocumentId) const;

    std::string getSelectedTarget(const std::string& uiDocumentId) const;
    bool jumpToChain(const std::string& uiDocumentId,
                     const std::string& chainId);

    void registerFile(const std::string& uiDocumentId,
                      const DialogFile& file);

    bool interact(const std::string &uiDocumentId, const std::string &rmlPath, const DialogFile &file,
              const std::string &startChainId, const std::string &speakerVar, const std::string &textVar);

    void updateNavigation(const std::string &uiDocumentId, int upKey, int downKey);

private:
    DialogManager() = default;
    void showCurrentPage(const std::string& uiDocumentId);
    std::unordered_map<std::string, ActiveChain>  m_activeChains;
    std::unordered_map<std::string, DialogFile>   m_files;
};

#endif
