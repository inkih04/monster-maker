```mermaid

classDiagram

    %% ----------------------------------------------------
    %% UI Core (Actualizado)
    %% ----------------------------------------------------
    class UiManager {
        <<singleton>>
        -unordered_map~string, unique_ptr~UiDocument~~ m_documents
        -RmlSystemInterface m_systemInterface
        -RmlRenderInterface m_renderInterface
        -Rml::Context* m_context

        +init(width, height, dpiScale, fontPath) void
        +resize(width, height) void
        +update() void
        +render() void
        +shutdown() void
        +openDocument(id, uiFilePath, initData) UiDocument*
        +closeDocument(id) void
        +getDocument(id) UiDocument*
        +isOpen(id) bool
    }

    class UiDocument {
        -Rml::ElementDocument* m_doc
        -optional~string~ m_scriptPath
        -sol::environment m_env
        -sol::protected_function m_luaOnStart
        -sol::protected_function m_luaOnDestroy
        
        %% Nuevos miembros para el Data Binding
        -unordered_map~string, string~ m_modelVars
        -Rml::DataModelHandle m_modelHandle
        -string m_modelName
        -Rml::Context* m_context

        +UiDocument(doc, context, scriptPath)
        +~UiDocument()
        +setRmlDocument(doc) void
        +initModel(modelName, data) void
        +updateModel(data) void
        +close() void
        +isOpen() bool
        -loadScript(path) void
        -callHook(fn, hookName) void
    }

    %% ----------------------------------------------------
    %% Dialog System (NUEVO)
    %% ----------------------------------------------------
    class DialogManager {
        <<singleton>>
        -unordered_map~string, ActiveChain~ m_activeChains

        +open(uiDocumentId, rmlPath, chain, speakerVar, textVar) void
        +advance(uiDocumentId) bool
        +close(uiDocumentId) void
        +isActive(uiDocumentId) bool
        -showCurrentPage(uiDocumentId) void
    }

    class ActiveChain {
        <<struct>>
        +DialogChain chain
        +int currentPage
        +string speakerVar
        +string textVar
    }

    class DialogLoader {
        <<static>>
        +loadFile(path) DialogFile
    }

    class DialogFile {
        <<struct>>
        +vector~DialogChain~ dialogues
        +unordered_map~string, size_t~ indexById
        +find(id) DialogChain*
        +at(luaIndex) DialogChain*
    }

    class DialogChain {
        <<struct>>
        +string id
        +vector~DialogPage~ pages
    }

    class DialogPage {
        <<struct>>
        +string speaker
        +string text
    }

    %% ----------------------------------------------------
    %% Localization System (NUEVO)
    %% ----------------------------------------------------
    class LocalizationManager {
        <<singleton>>
        -unordered_map~string, string~ m_table
        -string m_currentLang

        +load(lang) void
        +get(key) string
        +getCurrentLang() string
    }

    %% ----------------------------------------------------
    %% Interfaces y Helpers Originales
    %% ----------------------------------------------------
    class UiDocumentLoader {
        <<static>>
        +loadDef(uiFilePath) UiDocumentDef
    }

    class UiDocumentDef {
        +string htmlPath
        +string cssPath
        +optional~string~ scriptPath
    }

    class ScriptEngine {
        <<singleton>>
        -sol::state m_lua
        +getState() sol::state&
        +runScript(filePath) bool
    }

    class RmlRenderInterface {
        +SetViewport(width, height) void
        +BeginFrame() void
        +EndFrame() void
    }

    class RmlSystemInterface {
        +GetElapsedTime() double
        +LogMessage(type, message) bool
    }

    %% ----------------------------------------------------
    %% Relaciones
    %% ----------------------------------------------------
    UiManager "1" *-- "*" UiDocument : owns
    UiManager ..> UiDocumentLoader : uses
    UiManager *-- RmlRenderInterface
    UiManager *-- RmlSystemInterface
    UiDocumentLoader ..> UiDocumentDef : creates
    UiDocument ..> ScriptEngine : uses
    UiDocument ..> UiDocumentDef : built from
    
    %% Relaciones Nuevas
    DialogManager ..> UiManager : calls openDocument / updateModel
    DialogManager ..> LocalizationManager : resolves translation keys
    DialogManager *-- ActiveChain : tracks state
    ActiveChain *-- DialogChain
    DialogChain "1" *-- "*" DialogPage
    DialogLoader ..> DialogFile : creates
    DialogFile "1" *-- "*" DialogChain : contains
```mermaid