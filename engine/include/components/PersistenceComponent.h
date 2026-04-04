//
// Created by inkih on 4/4/26.
//

#ifndef MONSTERMAKERENGINE_PERSISTENCECOMPONENT_H
#define MONSTERMAKERENGINE_PERSISTENCECOMPONENT_H
#include <string>
#include <utility>

#include "Component.h"


class PersistentComponent : public Component {
    private:
        std::string save_flag;

    public:
        PersistentComponent(std::string  flag) : save_flag(std::move(flag)) {}
        std::string get_save_flag() { return save_flag; }
        void update(int deltaTime) override {};
        void render() override {};
};

#endif //MONSTERMAKERENGINE_PERSISTENCECOMPONENT_H
