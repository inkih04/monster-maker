
```mermaid
classDiagram

Component <|-- PositionComponent
Component <|-- RenderComponent
Component <|-- ColliderComponent
Component <|-- MovementComponent
Component <|-- AnimationComponent
Component <|-- ScriptComponent

class ScriptComponent {
        -string m_scriptPath
        -sol::environment m_env
        -sol::table m_props
        -sol::protected_function m_luaStart
        -sol::protected_function m_luaUpdate
        -sol::protected_function m_luaDestroy
        -sol::protected_function m_luaOnCollision
        -sol::protected_function m_luaOnTriggerEnter
        -sol::protected_function m_luaOnInteract
        -bool m_initialized
        -bool m_startCalled
        +ScriptComponent(string path)
        +ScriptComponent(string path, sol::table props)
        +executeOnCollision(Entity* other) void
        +executeOnInteract(Entity* other) void
        +executeOnTriggerEnter(Entity* other) void
        +init() void
        +update(int deltaTime) void
        +render() void
        +reset() void
    }

    class AnimationComponent {
        -unordered_map~string, unordered_map~string, Animation~~ m_sets
        -string m_activeSet
        -string m_currentAnimation
        -size_t m_currentFrame
        -float m_elapsedTime
        -bool m_isPlaying
        -updateRenderComponent() void
        +AnimationComponent()
        +addAnimation(string name, vector~SpriteRect~ frames, float frameDuration, bool loop, string set) void
        +play(string name, bool forceRestart) void
        +pause() void
        +resume() void
        +stop() void
        +update(int deltaTime) void
        +render() void
    }
  
    class PositionComponent {
        -float m_x
        -float m_y
        -Direction m_direction
        +PositionComponent(float x, float y)
        +PositionComponent(Position position)
        +update(int deltaTime) void
        +render() void
    }
    
    class ColliderComponent {
        -int m_width
        -int m_height
        -int m_offsetX
        -int m_offsetY
        -bool isTrigger
        +ColliderComponent(int width, int height, int ofX, int ofY, bool trigger)
        +update(int deltaTime) void
        +render() void
    }
    
    class RenderComponent {
        -string m_spriteSheetPath
        -SpriteRect spriteRect
        -int shaderMode
        -float m_height
        -float m_width
        -getPrettyPosition() vec2
        -draw() void
        +RenderComponent(string sheetPath, SpriteRect spriteRect, float width, float height, int shaderMode)
        +RenderComponent(string sheetPath, float x, float y, float w, float h, float width, float height, int shaderMode)
        +update(int deltaTime) void
        +render() void
    }

    class ComponentsType {
        <<Enum>>
        POSITION
        RENDER
        COLLIDER
        ANIMATION
        MOVEMENT
        SCRIPT
        INTERACTION
        PERSISTENCE
    }

    class Component {
        <<abstract>>
        #Entity* m_entity
        #bool m_isActive
        +Component()
        +update(int deltaTime) void
        +render() void
    }
    
    class MovementComponent {
        -AnimationComponent* m_animationComponent
        -PositionComponent* m_positionComponent
        -Entity* m_lastCollidedEntity
        -checkDirectionUp(Position newPos, Position oldPos) bool
        -checkDirectionDown(Position newPos, Position oldPos) bool
        -checkDirectionRight(Position newPos, Position oldPos) bool
        -checkDirectionLeft(Position newPos, Position oldPos) bool
        +MovementComponent()
        +updateAnimation(Position pos, Position oldPos) void
        +handleCollision(Position pos, CollisionService* collisionService, ColliderComponent* collider, bool canMove) void
        +move(Position pos) bool
        +update(int deltaTime) void
        +render() void
    }


```mermaid