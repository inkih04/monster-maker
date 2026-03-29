//
// Created by inkih on 16/3/26.
//

#ifndef MONSTERMAKERENGINE_UIDOCUMENT_H
#define MONSTERMAKERENGINE_UIDOCUMENT_H

#include <RmlUi/Core.h>
#include <sol/sol.hpp>
#include <optional>
#include <string>
#include <unordered_map>

// Wraps a single Rml::ElementDocument.
// Owns its own data model: variables live in m_modelVars and are destroyed with the document.
// Scripts are loaded into an isolated sol::environment so they cannot pollute each other.
class UiDocument {
    public:
        // doc      — must not be null; this class takes ownership of the document lifecycle.
        // context  — the Rml::Context that created doc; needed to create/remove the data model.
        // scriptPath — optional Lua script executed in the document's own environment.
        UiDocument(Rml::ElementDocument* doc,
                   Rml::Context*         context,
                   const std::optional<std::string>& scriptPath);

        ~UiDocument();

        void setRmlDocument(Rml::ElementDocument *doc);

        // Closes the underlying Rml document and fires the onDestroy Lua hook.
        // Safe to call more than once.
        void close();

        bool isOpen() const { return m_doc != nullptr; }

        // ------------------------------------------------------------------
        // Data model API
        // ------------------------------------------------------------------

        // Creates a new data model named `modelName` and registers every
        // string key→value pair found in `data`.
        // Call once after construction (or not at all for documents without bindings).
        // Calling a second time on the same document is a no-op with a warning.
        void initModel(const std::string& modelName, const sol::table& data);

        // Updates variables that were registered in initModel() and marks them dirty
        // so RmlUi re-renders all dependent elements.
        // Keys not present in m_modelVars are silently ignored.
        void updateModel(const sol::table& data);

    private:
        void loadScript(const std::string& path);
        void callHook(sol::protected_function& fn, const std::string& hookName);

        // ---- RmlUi state ----
        Rml::ElementDocument* m_doc     = nullptr;
        Rml::Context*         m_context = nullptr;

        // ---- Data model ----
        std::unordered_map<std::string, Rml::String> m_modelVars;
        Rml::DataModelHandle                          m_modelHandle;
        std::string                                   m_modelName;

        // ---- Scripting ----
        std::optional<std::string>  m_scriptPath;
        sol::environment            m_env;
        sol::protected_function     m_luaOnStart;
        sol::protected_function     m_luaOnDestroy;
};

#endif //MONSTERMAKERENGINE_UIDOCUMENT_H