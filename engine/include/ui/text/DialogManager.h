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

private:
    DialogManager() = default;

    void showCurrentPage(const std::string& uiDocumentId);

    struct ActiveChain {
        DialogChain chain;
        int currentPage = 0;
        std::string speakerVar;
        std::string textVar;
    };

    std::unordered_map<std::string, ActiveChain> m_activeChains;
};
 

#endif //MONSTERMAKERENGINE_DIALOGMANAGER_H
