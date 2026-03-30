#ifndef MONSTERMAKERENGINE_UIDOCUMENT_H
#define MONSTERMAKERENGINE_UIDOCUMENT_H

#include <RmlUi/Core.h>
#include <sol/sol.hpp>
#include <string>
#include <optional>
#include <unordered_map>
#include <vector>

class UiDocument {
public:
    UiDocument(Rml::ElementDocument* doc, Rml::Context* context, const std::optional<std::string>& scriptPath);
    ~UiDocument();

    void setRmlDocument(Rml::ElementDocument* doc);
    void close();

    void initModel(const std::string& modelName, const sol::table& data);
    void updateModel(const sol::table& data);

    bool isOpen() const { return m_doc != nullptr; }

private:
    void loadScript(const std::string& path);
    void callHook(sol::protected_function& fn, const std::string& hookName);

    Rml::ElementDocument* m_doc = nullptr;
    Rml::Context* m_context = nullptr;
    std::optional<std::string> m_scriptPath;

    std::string m_modelName;
    Rml::DataModelHandle m_modelHandle;

    std::unordered_map<std::string, std::string> m_modelStrings;
    std::unordered_map<std::string, bool> m_modelBools;
    std::unordered_map<std::string, int> m_modelInts;
    std::unordered_map<std::string, std::vector<std::string>> m_modelStringLists;

    sol::environment m_env;
    sol::protected_function m_luaOnStart;
    sol::protected_function m_luaOnDestroy;
};

#endif //MONSTERMAKERENGINE_UIDOCUMENT_H