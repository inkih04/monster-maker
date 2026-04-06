//
// Created by inkih on 28/3/26.
//

#ifndef MONSTERMAKERENGINE_LOCALIZATIONMANAGER_H
#define MONSTERMAKERENGINE_LOCALIZATIONMANAGER_H

#include <string>
#include <unordered_map>

class LocalizationManager {
public:
    static LocalizationManager& getInstance() {
        static LocalizationManager instance;
        return instance;
    }
    void load(const std::string& lang);
    const std::string& get(const std::string& key) const;

    const std::string& getCurrentLang() const { return m_currentLang; }

private:
    LocalizationManager() = default;

    std::unordered_map<std::string, std::string> m_table;
    std::string m_currentLang;
};

#endif //MONSTERMAKERENGINE_LOCALIZATIONMANAGER_H
