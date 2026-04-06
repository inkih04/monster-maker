//
// Created by inkih on 28/3/26.
//
#include "LocalizationManager.h"

#include <fstream>
#include <iostream>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

void LocalizationManager::load(const std::string& lang) {
    const std::string path = lang;

    std::ifstream file(path);
    if (!file.is_open()) {
        std::cerr << "[ENGINE][LocalizationManager][ERROR] Cannot open: " << path << std::endl;
        return;
    }

    json data;
    try {
        file >> data;
    } catch (const json::exception& e) {
        std::cerr << "[ENGINE][LocalizationManager][ERROR] Parse error in " << path
                  << ": " << e.what() << std::endl;
        return;
    }

    m_table.clear();
    m_currentLang = lang;

    for (auto it = data.begin(); it != data.end(); ++it) {
        if (it.value().is_string())
            m_table.emplace(it.key(), it.value().get<std::string>());
    }

    std::cerr << "[ENGINE][LocalizationManager] Loaded " << m_table.size()
              << " entries for lang '" << lang << "'" << std::endl;
}

const std::string& LocalizationManager::get(const std::string& key) const {
    auto it = m_table.find(key);
    if (it != m_table.end())
        return it->second;

    return key;
}