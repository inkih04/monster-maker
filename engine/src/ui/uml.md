```mermaid

classDiagram

    %% -------------------------------------------------------
    %% UI Core
    %% -------------------------------------------------------
    class UiManager {
        <<singleton>>
        -unordered_map~string, unique_ptr~UiDocument~~ m_documents
        -RmlSystemInterface m_systemInterface
        -RmlRenderInterface m_renderInterface
        -RmlFileInterface   m_fileInterface
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
        +getContext() Rml::Context*
    }

    class UiDocument {
        -Rml::ElementDocument* m_doc
        -Rml::Context*         m_context
        -optional~string~      m_scriptPath
        -string                m_modelName
        -Rml::DataModelHandle  m_modelHandle
        -unordered_map~string,string~          m_modelStrings
        -unordered_map~string,bool~            m_modelBools
        -unordered_map~string,int~             m_modelInts
        -unordered_map~string,vector~string~~  m_modelStringLists
        -sol::environment          m_env
        -sol::protected_function   m_luaOnStart
        -sol::protected_function   m_luaOnDestroy

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

    class UiDocumentLoader {
        <<static>>
        +loadDef(uiFilePath) UiDocumentDef
    }

    class UiDocumentDef {
        <<struct>>
        +string htmlPath
        +string cssPath
        +optional~string~ scriptPath
    }

    %% -------------------------------------------------------
    %% Dialog System
    %% -------------------------------------------------------
    class DialogManager {
        <<singleton>>
        -unordered_map~string, ActiveChain~ m_activeChains
        -unordered_map~string, DialogFile~  m_files

        +interact(uiDocId, rmlPath, file, startChainId, speakerVar, textVar) bool
        +open(uiDocId, rmlPath, chain, speakerVar, textVar) void
        +advance(uiDocId) bool
        +close(uiDocId) void
        +isActive(uiDocId) bool
        +hasChoices(uiDocId) bool
        +moveChoice(uiDocId, delta) void
        +getChoiceIndex(uiDocId) int
        +getSelectedTarget(uiDocId) string
        +jumpToChain(uiDocId, chainId) bool
        +registerFile(uiDocId, file) void
        +updateNavigation(uiDocId, upKey, downKey) void
        -showCurrentPage(uiDocId) void
    }

    class ActiveChain {
        <<struct>>
        +DialogChain chain
        +int currentPage
        +int choiceCursor
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
        +vector~DialogChoice~ choices
    }

    class DialogChoice {
        <<struct>>
        +string text
        +string nextChain
    }

    %% -------------------------------------------------------
    %% Localization
    %% -------------------------------------------------------
    class LocalizationManager {
        <<singleton>>
        -unordered_map~string, string~ m_table
        -string m_currentLang

        +load(lang) void
        +get(key) string&
        +getCurrentLang() string
    }

    %% -------------------------------------------------------
    %% Scripting
    %% -------------------------------------------------------
    class ScriptEngine {
        <<singleton>>
        -sol::state m_lua
        +getState() sol::state&
        +runScript(filePath) bool
    }

    %% -------------------------------------------------------
    %% Render & Interfaces
    %% -------------------------------------------------------
    class RmlRenderInterface {
        -int m_width
        -int m_height
        -glm::mat4 m_projection
        +SetViewport(width, height) void
        +BeginFrame() void
        +EndFrame() void
        +CompileGeometry(vertices, indices) CompiledGeometryHandle
        +RenderGeometry(handle, translation, texture) void
        +ReleaseGeometry(handle) void
        +LoadTexture(dimensions, source) TextureHandle
        +GenerateTexture(source, dimensions) TextureHandle
        +ReleaseTexture(handle) void
        +EnableScissorRegion(enable) void
        +SetScissorRegion(region) void
    }

    class RmlSystemInterface {
        +GetElapsedTime() double
        +LogMessage(type, message) bool
    }

    class RmlFileInterface {
        +Open(path) FileHandle
        +Close(handle) void
        +Read(buffer, size, handle) size_t
        +Seek(handle, offset, origin) bool
        +Tell(handle) size_t
    }

    %% -------------------------------------------------------
    %% Relaciones UI Core
    %% -------------------------------------------------------
    UiManager "1" *-- "*" UiDocument       : owns
    UiManager *-- RmlRenderInterface
    UiManager *-- RmlSystemInterface
    UiManager *-- RmlFileInterface
    UiManager ..> UiDocumentLoader         : uses
    UiDocumentLoader ..> UiDocumentDef     : creates
    UiDocument ..> ScriptEngine            : uses (getState)
    UiDocument ..> UiDocumentDef           : built from

    %% -------------------------------------------------------
    %% Relaciones Dialog System
    %% -------------------------------------------------------
    DialogManager *-- ActiveChain          : tracks state
    DialogManager "1" o-- "*" DialogFile   : registered files
    DialogManager ..> UiManager            : openDocument / getDocument / closeDocument
    DialogManager ..> LocalizationManager  : get(key)
    ActiveChain *-- DialogChain
    DialogFile "1" *-- "*" DialogChain     : contains
    DialogChain "1" *-- "*" DialogPage
    DialogPage "1" *-- "*" DialogChoice
    DialogLoader ..> DialogFile            : creates
```mermaid