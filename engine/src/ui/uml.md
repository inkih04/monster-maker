```mermaid

classDiagram

    class UiManager {
        <<singleton>>
        -unordered_map~string, unique_ptr~UiDocument~~ m_documents
        -RmlSystemInterface m_systemInterface
        -RmlRenderInterface m_renderInterface
        -Rml::Context* m_context

        +init(width, height, fontPath) void
        +resize(width, height) void
        +update() void
        +render() void
        +shutdown() void
        +openDocument(id, uiFilePath) UiDocument*
        +closeDocument(id) void
        +getDocument(id) UiDocument*
        +isOpen(id) bool
    }

    class UiDocumentLoader {
        <<static>>
        +loadDef(uiFilePath) UiDocumentDef
    }

    class UiDocumentDef {
        +string htmlPath
        +string cssPath
        +optional~string~ scriptPath
    }

    class UiDocument {
        -Rml::ElementDocument* m_doc
        -optional~string~ m_scriptPath
        -sol::environment m_env
        -sol::protected_function m_luaOnStart
        -sol::protected_function m_luaOnDestroy

        +UiDocument(doc, scriptPath)
        +~UiDocument()
        +close() void
        +isOpen() bool
        +getRaw() Rml::ElementDocument*
        -loadScript(path) void
        -callHook(fn, hookName) void
    }

    class RmlRenderInterface {
        -glm::mat4 m_projection
        -int m_width
        -int m_height

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

    class ScriptEngine {
        <<singleton>>
        -sol::state m_lua
        +getState() sol::state&
        +runScript(filePath) bool
    }

    UiManager "1" *-- "*" UiDocument : owns
    UiManager ..> UiDocumentLoader : uses
    UiManager *-- RmlRenderInterface
    UiManager *-- RmlSystemInterface
    UiDocumentLoader ..> UiDocumentDef : creates
    UiDocument ..> ScriptEngine : uses
    UiDocument ..> UiDocumentDef : built from
```mermaid