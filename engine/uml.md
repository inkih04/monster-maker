```mermaid
classDiagram

    Application<--Engine
    Engine <--InputManager
    Application <-- StateManager
    StateManager <-- State

    State <|-- ExplorationState
    State <|-- CombatState
    State <|-- MenuState
    State <|-- InventoryState
    State <|-- MenuPokemonState
    State <|-- PokemonState

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