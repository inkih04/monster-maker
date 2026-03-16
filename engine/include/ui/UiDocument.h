//
// Created by inkih on 16/3/26.
//

#ifndef MONSTERMAKERENGINE_UIDOCUMENT_H
#define MONSTERMAKERENGINE_UIDOCUMENT_H

#include <GL/glew.h>
#include <string>
#include <optional>
#include <RmlUi/Core.h>
#include <sol/sol.hpp>

class UiDocument {
public:
    UiDocument(Rml::ElementDocument* doc, const std::optional<std::string>& scriptPath);
    ~UiDocument();

    UiDocument(const UiDocument&) = delete;
    UiDocument& operator=(const UiDocument&) = delete;

    void close();
    bool isOpen() const { return m_doc != nullptr; }
    Rml::ElementDocument* getRaw() { return m_doc; }

private:
    Rml::ElementDocument* m_doc = nullptr;
    std::optional<std::string> m_scriptPath;

    sol::environment       m_env;
    sol::protected_function m_luaOnStart;
    sol::protected_function m_luaOnDestroy;

    void loadScript(const std::string& path);
    void callHook(sol::protected_function& fn, const std::string& hookName);
};

#endif //MONSTERMAKERENGINE_UIDOCUMENT_H