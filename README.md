# 🧩 Pokémon Maker — Editor de Fangames + Motor 2D en C++

Un proyecto completo que combina:

- 🖥 **Un editor visual** creado con *Electron + React + Zustand*
- 🎮 **Un motor 2D** escrito en *C++ + OpenGL*
- 🛠 Herramientas para generar, editar y compilar fangames estilo Pokémon
- 📦 Entorno de compilación **dockerizado** para garantizar portabilidad total

---

## 📦 Descripción del Proyecto

**Pokémon Maker** es una herramienta completa para crear fangames estilo Pokémon, formada por dos componentes principales:

### 🔹 1. Editor de Fangames (Electron + React)

Una aplicación de escritorio que permite:

- Crear mapas 2D basados en tiles
- Cargar y gestionar tilesets y sprites
- Editar entidades, eventos y triggers
- Previsualizar animaciones
- Organizar todos los assets del proyecto
- Exportar un proyecto estructurado (JSON/YAML)
- Lanzar la compilación del motor C++ desde el editor

El editor genera todo el contenido que luego el motor del juego utilizará para correr el fangame.

---

### 🔹 2. Motor del Juego (C++ + OpenGL)

Un motor 2D especializado en juegos tipo Pokémon:

- Renderizado de tilemaps, sprites, animaciones
- Sistema de entidades
- Carga de recursos exportados por el editor
- Soporte para scripting (opcional, con Lua)  
- Ejecución del game loop
- Compilación basada en CMake, integrada con el editor

El motor consume los datos generados por el editor y produce un ejecutable completo del fangame.

---

## 🎯 Objetivos del Proyecto

### 🎨 **Editor**
- Herramienta intuitiva y profesional
- Gestión completa de mapas, assets, animaciones y eventos
- Sistema de recursos centralizado
- Exportación estructurada del proyecto
- Integración directa con el motor C++

### ⚙️ **Motor 2D**
- Renderizado eficiente con OpenGL
- Carga de datos generados por el editor
- Arquitectura modular y extensible
- Scripting para eventos personalizados
- Compilación automatizada desde el editor

### 🧵 **Integración Editor ↔ Motor**
- El editor modifica plantillas del engine
- Lanza compilaciones automáticas (CMake + Ninja)
- Previsualización y pruebas rápidas
- Generación de un ejecutable final del juego

---

## 🧪 Resultados Esperados

El proyecto final debe permitir:

- Crear un fangame Pokémon completo **sin tocar C++**
- Diseñar mapas, sprites, tiles y eventos desde el editor
- Personalizar lógica mediante scripts
- Exportar un proyecto final reproducible
- Compilar automáticamente un ejecutable jugable
- Entregar un TFG profesional y completo

---

## 🧰 Tecnologías Utilizadas

### 🖥 Editor (Frontend)
- **Electron**  
  App de escritorio / comunicación con Node / creación de ejecutables
- **React**  
  UI moderna y modular
- **Zustand**  
  Estado global simple y eficiente
- **Vite**  
  Entorno de desarrollo ultrarrápido

### 🔧 Backend del Editor (Node.js)
- Manipulación de archivos del proyecto
- Ejecución de procesos CMake
- Integración con el motor C++
- IPC para comunicación Editor ↔ Motor

### 🎮 Motor del Juego (C++)
- **C++17/20**  
  Lógica del motor y rendimiento nativo
- **OpenGL 2D**  
  Renderizado de sprites, tilemaps y animaciones
- **CMake**  
  Build system portable
- **Lua (opcional)**  
  Para scripting de eventos del jugador y NPCs

---

## 🐳 Dockerización del Motor

El motor C++ se compila dentro de un entorno Docker que garantiza:

- Reproducibilidad total del build
- Compatibilidad con cualquier PC (Linux, Windows, macOS)
- Entorno idéntico para todos los usuarios
- Integración directa con el editor

El editor puede lanzar este Docker para compilar el juego final sin requerir toolchains en el equipo del usuario.


## 📐 Arquitectura del Sistema

### Sistema de Estados y Gestión Principal
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