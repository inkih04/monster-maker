```mermaid
classDiagram

    Application "1"-- "1" Engine
    Engine -- InputManager
    Application "1"--"1" StateManager
    StateManager "1"--"*" State

    State <|-- ExplorationState
    State <|-- CombatState
    State <|-- InventoryState

    
    EntityManager "1"-- * State
    EntityManager "*"--"*" Entity
    Entity "*"--"*" Component
    Application "1"-- "1" ScriptEngine
    ScriptBindings "1"-- "1" ScriptEngine
    State -- EntityLoader
    



    class ResourceManager {
        <<static>>
        -unordered_map~string, unique_ptr~Texture~~ m_textures
        -unordered_map~ShaderPath, unique_ptr~Shader~~ m_shaders
        -unordered_map~string, unique_ptr~Wav~~ m_sounds
        +loadTexture(string path) Texture*
        +loadShader(string vertexShaderPath, string fragmentShaderPath) Shader*
        +loadSound(string path) Wav*
    }

    class EntityLoader {
        <<static>>
        +loadEntitiesFromFile(string filePath, EntityManager& entityManager) void
        -parseEntity(json entityJson, EntityManager& entityManager) void
        -createPositionComponent(json data) unique_ptr~Component~
        -createRenderComponent(json data) unique_ptr~Component~
        -createColliderComponent(json data) unique_ptr~Component~
        -createAnimationComponent(json data) unique_ptr~Component~
        -parseFrames(json framesJson) vector~SpriteRect~
        -createScriptComponent(json data) unique_ptr~Component~
        -jsonToSolTable(json obj) sol::table
    }

    class ScriptEngine {
        <<singleton>>
        -string m_pendingMap
        -sol::state m_lua
        -string m_currentMapScript
        -sol::environment m_mapEnv
        +getInstance() ScriptEngine&
        +init() void
        +setupBindingsStatic(SessionManager& sessionManager, SaveManager& saveManager, DataManager& dataManager) void
        +setupBindingsDynamic(Camera* camera, EntityManager& entityManager) void
        +runScript(string filePath) bool
        +requestMapChange(string mapPath) void
        +hasPendingMapChange() bool
        +consumePendingMap() string
        +setMapScript(string path) void
        +initMapScript() void
    }

    class ScriptBindings {
        <<static>>
        +registerStatic(sol::state& lua, SessionManager& sessionManager, SaveManager& saveManager, DataManager& dataManager) void
        +registerConfigTags(sol::state& lua) void
        +registerDynamic(sol::state& lua, Camera* camera, EntityManager& entityManager) void
    }

    class Component {
        <<abstract>>
        #Entity* m_entity
        #bool m_isActive
        +update(int deltaTime) void
        +render() void
    }

    class EntityManager {
        -vector~unique_ptr~Entity~~ m_entities
        -unordered_map~EntityTag, vector~Entity*~~ m_entitiesByTag
        -unordered_map~EntityLayer, vector~Entity*~~ m_entitiesByLayer
        -vector~Entity*~ m_rawCollisionEntities
        -bool isCacheStarted
        -bool isBordersMapStarted
        -unique_ptr~CollisionService~ m_collisionService
        -unique_ptr~InteractionService~ m_interactionService
        -unique_ptr~BordersMapService~ m_bordersMapService
        -initCollisionCache() void
        +createEntity(EntityTag tag, EntityLayer layer, string id) Entity*
        +createEntity() Entity*
        +destroyEntity(Entity* entity) void
        +updateEntities(int deltaTime) void
        +renderEntities() void
        +extractEntity(EntityTag tag, EntityLayer layer) unique_ptr~Entity~
        +adoptEntity(unique_ptr~Entity~ entity, EntityTag tag, EntityLayer layer) Entity*
        +registerCollisionEntity(Entity* entity) void
    }

    class Entity {
        -unordered_map~ComponentsType, unique_ptr~Component~~ components
        -string m_id
        -EntityTag m_tag
        -CollisionService* m_collisionService
        -InteractionService* m_interactionService
        -bool isActive
        +disableEntity() void
        +addComponent(ComponentsType type, unique_ptr~Component~ component) void
        +addTag(EntityTag tag) void
        +hasComponent(ComponentsType type) bool
        +update(int deltaTime) void
        +render() void
    }

    class StateManager {
        -stack~unique_ptr~State~~ m_states
        +renderCurrentState() void
        +updateCurrentState(int deltaTime) void
        +pushState(unique_ptr~State~ state) void
        +popState() void
    }

    class State {
        <<abstract>>
        #StateManager* m_stateManager
        #unique_ptr~EntityManager~ m_entityManager
        #setEntityManager() void
        #applyScriptContext() void
        +render() void
        +update(int deltaTime) void
        +onEnter() void
    }

    class ExplorationState {
        -bool debugMode
        -bool showCollisionDebug
        -bool m_cKeyWasDown
        -changeMap(string mapPath) void
        -renderGround() void
        -renderDecoration() void
        -renderEntities() void
        -renderShadows() void
        -renderForeground() void
        #setEntityManager() void
        #applyScriptContext() void
        #showColliders() void
        +update(int deltaTime) void
        +moveDebugCamera() void
        +render() void
        +renderCollisionDebug() void
    }

    class CombatState {

    }

    class InventoryState {

    }

    class Application {
        -unique_ptr~Engine~ m_engine
        -StateManager m_stateManager
        +update(int deltaTime) void
        +run() void
        +render() void
    }

    class Engine {
        -GLFWwindow* m_window
        -float m_dpiScale
        -int m_width
        -int m_height
        -unique_ptr~Camera~ m_camera
        -string m_title
        -initGLFW() void
        -initGLEW() void
        -setUpShaders() void
        -setUpCamera(int width, int height) void
        -framebuffer_size_callback(GLFWwindow* window, int width, int height) void
        -onResize(int width, int height) void
        +startLoop(function~void(int)~ gameUpdate, function~void()~ gameRender) void
    }

    class InputManager {
        -InputManager* instance
        -GLFWwindow* window
        -unordered_map~int, bool~ currentKeyState
        -unordered_map~int, bool~ previousKeyState
        -updateKeyStates() void
        +initialize(GLFWwindow* window) void
        +getInstance() InputManager&
        +resetInstance() void
        +getAxis2D(int up, int down, int left, int right, bool allowDiagonal) vec2
        +isKeyDown(int key) bool
        +isKeyPressed(int key) bool
        +isKeyReleased(int key) bool
        +update() void
        +getMousePosition() vec2
        +isMouseButtonDown(int button) bool
    }
    
```mermaid
