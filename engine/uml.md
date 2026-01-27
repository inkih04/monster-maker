```mermaid
classDiagram

    Application "1"-- "1" Engine
    Engine -- InputManager
    Application "1"--"1" StateManager
    StateManager "1"--"*" State

    State <|-- ExplorationState
    State <|-- CombatState
    State <|-- MenuState
    State <|-- InventoryState
    State <|-- MenuPokemonState
    State <|-- PokemonState
    
    EntityManager "1"-- * State
    EntityManager "*"--"*" Entity
    Entity "*"--"*" Component
    Application "1"-- "1" ScriptEngine
    ScriptBindings "1"-- "1" ScriptEngine
    State -- EntityLoader
    
    Application  -- AudioService
    AudioService ..> ResourceManager 
    AudioService  --  ScriptBindings 

    class AudioService {
        <<singleton>>
        -Soloud m_soloud
        -Bus m_musicBus
        -Bus m_sfxBus
        -WavStream m_musicStream
        -int m_musicHandle
        +getInstance()$ AudioService&
        +init() void
        +shutdown() void
        +setMasterVolume(float volume) void
        +setMusicVolume(float volume) void
        +setSfxVolume(float volume) void
        +playMusic(string path, bool loop) void
        +stopMusic() void
        +pauseMusic(bool paused) void
        +playSound(string path) void
    }

    class ResourceManager {
        <<static>>
        -unordered_map~string, unique_ptr~Wav~~ m_sounds
        +loadTexture(string path)$ Texture*
        +loadSound(string path)$ Wav*
        +loadFont(string path, int size)$ TextRenderer*
    }
   
    class EntityLoader {
        <<static>>
        +loadEntitiesFromFile(string filePath, EntityManager& entityManager) void
        -parseEntity(json entityJson, EntityManager& entityManager) void
        -createPositionComponent(json data) unique_ptr~Component~
        -createRenderComponent(json data) unique_ptr~Component~
        -createColliderComponent(json data) unique_ptr~Component~
    }
    
    class ScriptEngine {
        <<singleton>>
        -sol::state m_lua
        +getInstance()$ ScriptEngine&
        +init() void
        +setupBindingsStatic() void
        +setupBindingsDynamic(Camera* cam, EntityManager& em) void
        +runScript(string filePath) bool
        +getState() sol::state&
    }

    class ScriptBindings {
        <<static>>
        +registerStatic(sol::state& lua)$ void
        +registerDynamic(sol::state& lua, Camera* cam, EntityManager& em)$ void
        -registerKeys(sol::state& lua)
        -registerEntity(sol::state& lua)
        -registerComponents(sol::state& lua)
    }
    
    class Component {
        <<abstract>>
        -Entity* m_entity
        +update(int  deltaTime)*
        +getOwner() Entity*
        +setOwner(Entity* entity) void
        +render()*  
    }
    
    class EntityManager {
    -vector~unique_ptr~Entity~~ m_entities
       
       +EntityManager()
       +createEntity() Entity*
       +updateEntities(int deltaTime)
       +renderEntities()
       +getEntitiesByComponent(ComponentsType type) vector~Entity*~
   
    }
    
    class Entity {
       -unordered_map~ComponentsType, unique_ptr~Component~ m_components
       
       +addComponent(unique_ptr~Component~, ComponentsType type) void
       +getComponent(ComponentsType type) Component*
       +update(int deltaTime)
       +hasComponent(ComponentsType type) bool
       +render() 
    }

    class StateManager {
        -stack m_stateStack
        +renderCurrentState()
        +updateCurrentState(int deltaTime)
        +pushState(State* state)
        +popState()
        +getCurrentState() State*
    }

    class State {
        <<abstract>>
        -StateManager* m_stateManager
        -EntityManager* m_entityManager
        -setEntityManager()*
        +onEnter() void*
        +render()*
        +update(int deltaTime)*
        +setStateManager(StateManager* stateManager) void*
        +getEntityManager() EntityManager*
    }

    class ExplorationState {
        update(int deltaTime) override
        render() override
        setEntityManager() override
    }

    class CombatState {


    }
    class MenuState {


    }
    class InventoryState {

    }

    class MenuPokemonState {


    }

    class PokemonState {

    }


    class Application{
      -StateManager m_stateManager
      -Engine m_engine 
      +render()
      +update()
      +run()
    }
    class Engine{
      -int m_width
      -int m_height
      -string m_title
      -std::unique_ptr<Camera> m_camera
      -GLFWwindow m_window
      -void setUpShaders()
      -void setUpCamera()
      +Engine()
      +startLoop()
    }

    class InputManager {
        -InputManager* instance$
        -GLFWwindow* window
        -unordered_map~int, bool~ currentKeyState
        -unordered_map~int, bool~ previousKeyState
        -InputManager(GLFWwindow* window)
        -updateKeyStates()
        +initialize(GLFWwindow* window)$ void
        +getInstance()$ InputManager&
        +resetInstance()$ void
        +isKeyDown(int key) bool
        +isKeyPressed(int key) bool
        +isKeyReleased(int key) bool
        +update() void
        +getMousePosition() glm::vec2
        +isMouseButtonDown(int button) bool
    }
    
```mermaid