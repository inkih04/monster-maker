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
    Component <|-- SpriteComponent
    Component <|-- ColliderComponent
    
    
    class PositionComponent {
        +float x
        +float y
    }
    
    class ColliderComponent {
        +int width
        +int height
    }
    
    class RenderComponent {
        +string texturePath
        +int width
        +int height
    }
    
    class SpriteComponent {
        +string spriteSheetPath
        +int frameWidth
        +int frameHeight
        +int currentFrame
        +float animationSpeed
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
    }
    
    class EntityManager {
    -vector~unique_ptr~Entity~~ m_entities
       
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
        +render()*
        +update(int deltaTime)*
    }

    class ExplorationState {
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