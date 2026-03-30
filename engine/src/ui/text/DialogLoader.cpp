//
// Created by inkih on 28/3/26.
//
#include "DialogLoader.h"
#include <fstream>
#include <stdexcept>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

DialogFile DialogLoader::loadFile(const std::string& path) {
    std::ifstream file(path);
    if (!file.is_open())
        throw std::runtime_error("[DialogueLoader] Cannot open: " + path);

    json data;
    try { file >> data; }
    catch (const json::exception& e) {
        throw std::runtime_error(
            std::string("[DialogueLoader] Parse error in ") + path + ": " + e.what());
    }

    if (!data.contains("dialogues") || !data["dialogues"].is_array())
        throw std::runtime_error(
            "[DialogueLoader] Missing or invalid 'dialogues' array in: " + path);

    DialogFile result;

    for (const auto& chainJson : data["dialogues"]) {
        DialogChain chain;
        chain.id = chainJson.at("id").get<std::string>();

        for (const auto& pageJson : chainJson.value("pages", json::array())) {
            DialogPage page;
            page.speaker = pageJson.value("speaker", "");
            page.text    = pageJson.at("text").get<std::string>();

            if (pageJson.contains("choices") && pageJson["choices"].is_array()) {
                for (const auto& c : pageJson["choices"]) {
                    DialogChoice choice;
                    choice.text      = c.at("text").get<std::string>();
                    choice.nextChain = c.at("next_chain").get<std::string>();
                    page.choices.push_back(std::move(choice));
                }
            }

            chain.pages.push_back(std::move(page));
        }

        result.indexById[chain.id] = result.dialogues.size();
        result.dialogues.push_back(std::move(chain));
    }

    return result;
}