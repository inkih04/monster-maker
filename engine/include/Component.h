//
// Created by inkih on 30/11/25.
//

#ifndef POKEMONGAMEENGINE_COMPONENT_H
#define POKEMONGAMEENGINE_COMPONENT_H

class Component {
        public:
            Component() = default;
            virtual ~Component() = default;
            virtual void render() = 0;
            virtual void update(int deltaTime) = 0;

};

#endif //POKEMONGAMEENGINE_COMPONENT_H