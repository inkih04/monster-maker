
```mermaid
classDiagram

Component <|-- PositionComponent
Component <|-- RenderComponent
Component <|-- ColliderComponent
Component <|-- MovementComponent
Component <|-- AnimationComponent

class AnimationComponent {
        -unordered_map<string, Animation> m_animations
        -string m_currentAnimation
        -size_t m_currentFrame
        -float m_elapsedTime
        -bool m_isPlaying
        -void updateRenderComponent()

        +AnimationComponent()
        +void addAnimation(string name, vector<SpriteRect> frames, float frameDuration, bool loop=true, int priority=0)
        +void play(string name, bool forceRestart=false)
        +void pause()
        +void resume()
        +void stop()
        +SpriteRect getCurrentFrame()
        +string getCurrentAnimationName()
        +bool isPlaying()
        +void update(int deltaTime)
        +void render()
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
        RenderComponent(const string& spriteSheetPath, float x, float y, float w, float h, float width, float height)
        +update(int deltaTime) override
        +draw()
        +render() override
    }
    

    class ComponentsType {
    <<Enum>>
        POSITION
        RENDER
        COLLIDER
        ANIMATION
        MOVEMENT
    }

    class Component {
        <<abstract>>
        -Entity* m_entity
        +update(int  deltaTime)*
        +getOwner() Entity*
        +setOwner(Entity* entity) void
        +render()*  
    }
    
     class MovementComponent {
        -Direction m_lastDirection
        -AnimationComponent* getAnimation()
        -PositionComponent* getPosition()
        -string getStandAnimation()

        +MovementComponent()
        +void move(Position pos)
        +void update(int deltaTime)
        +void render()
    }


```mermaid