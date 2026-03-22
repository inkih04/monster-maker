//
// Created by inkih on 16/3/26.
//

#include "UiDocumentLoader.h"
#include <fstream>
#include <nlohmann/json.hpp>
using json = nlohmann::json;

UiDocumentDef UiDocumentLoader::loadDef(const std::string& uiFilePath) {
    std::ifstream file(uiFilePath);
    if (!file.is_open())
        throw std::runtime_error("[UiDocumentLoader] Cannot open: " + uiFilePath);

    json data;
    file >> data;

    UiDocumentDef def;
    def.htmlPath   = data.at("htmlPath").get<std::string>();
    def.cssPath    = data.at("cssPath").get<std::string>();

    if (data.contains("scriptPath") && !data["scriptPath"].is_null())
        def.scriptPath = data["scriptPath"].get<std::string>();

    return def;
}