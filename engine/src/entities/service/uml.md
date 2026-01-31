```mermaid
classDiagram
    EntityManager "1" *-- "*" Entity 
    EntityManager "1" *-- "1" CollisionService 
    EntityManager "1" *-- "1" InteractionService 
    
    InteractionService "1" o-- "1" CollisionService 
    Entity "many" o-- "1" CollisionService 
    Entity "many" o-- "1" InteractionService 
   
    
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
    
    class CollisionService {
        -unordered_map~Position, Entity*~ m_collisionEntities
        -forEachGridCell(int x, int y, int w, int h, function func) void
        
        +CollisionService()
        +isAreaFree(Position targetPos, int width, int height, Entity source) bool
        +getEntityAtArea(Position targetPos, int width, int height, Entity source) Entity*
        +removeEntity(Entity entity) void
        +updatePositionCollisionCache(Position oldPos, Position newPos, Entity entity) void
        +initCollisionCache(vector~Entity*~ collisionEntities) void
    }
    
    class InteractionService {
        -CollisionService* m_collisionService
        +InteractionService(CollisionService* colService)
        +tryInteract(Entity* initiator) void
    }
    
    class EntityManager {
       -vector~unique_ptr~Entity~~ m_entities
       -std::unordered_map<EntityTag, std::vector<Entity*>> m_entitiesByTag
       -std::unordered_map<EntityLayer, std::vector<Entity*>> m_entitiesByLayer
       -std::unique_ptr<CollisionService> m_collisionService
       -std::unique_ptr<InteractionService> m_interactionService
       - void initCollisionCache();
       
       +EntityManager()
       +createEntity() Entity*
       +updateEntities(int deltaTime)
       +renderEntities()
       +getEntitiesByComponent(ComponentsType type) vector~Entity*~
    }
    
    class Entity {
       -unordered_map~ComponentsType, unique_ptr~Component~ m_components
       -CollisionService* m_collisionService;
       -InteractionService* m_interactionService;
       -bool isActive;
       +void setCollisionService(CollisionService* collisionService)
       +void setInteractionService(InteractionService* interactionService)
       +addComponent(unique_ptr~Component~, ComponentsType type) void
       +getComponent(ComponentsType type) Component*
       +update(int deltaTime)
       +hasComponent(ComponentsType type) bool
       + CollisionService* getCollisionService()
       +InteractionService* getInteractionService()
       +render() 
    }

```mermaid