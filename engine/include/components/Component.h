//
// Created by inkih on 30/11/25.
//

#ifndef POKEMONGAMEENGINE_COMPONENT_H
#define POKEMONGAMEENGINE_COMPONENT_H

class Entity;

class Component {
        protected:
            Entity* m_entity = nullptr;
            bool m_isActive = true;


        public:
            Component() = default;
            void setOwner(Entity* entity) { m_entity = entity; }
            Entity* getOwner() const { return m_entity; }
            void setIsActive(bool isActive) { m_isActive = isActive; }
            bool isActive() const { return m_isActive; }
            virtual ~Component() = default;
            virtual void render() = 0;
            virtual void update(int deltaTime) = 0;

};

#endif //POKEMONGAMEENGINE_COMPONENT_H