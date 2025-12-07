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
    Component <|-- PositionComponent
    Component <|-- RenderComponent
    Component <|-- ColliderComponent
    State -- EntityLoader
    
    
    class EntityLoader {
        +static loadEntitiesFromFile(string filePath, EntityManager& entityManager) void
    }
    
    
    class PositionComponent {
        -float m_x
        -float m_y
        -float m_rotation
        +PositionComponent(float x, float y, float rotation)
        +PositionComponent(const Position& position)
        +setPosition(float x, float y, float rotation)
        +setPosition(const Position& position)
        +getPosition() Position
        +update(int deltaTime) override
        +render() override
    }
    
    class ColliderComponent {
        -float m_width
        -float m_height
        +ColliderComponent(float width, float height)
        +update(int deltaTime) override
        +render() override
    }
    
    class RenderComponent {
        -string m_spriteSheetPath
        -SpriteRect spriteRect
        -float m_height
        -float m_width
        RenderComponent(const string& spriteSheetPath, SpriteRect spriteRect)
        RenderComponent(const string& spriteSheetPath, float x, float y)
        +update(int deltaTime) override
        +render() override
    }
    

    class ComponentsType {
    <<Enum>>
        POSITION
        RENDER
        SPRITE
        COLLIDER
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