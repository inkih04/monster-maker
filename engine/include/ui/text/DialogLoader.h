//
// Created by inkih on 28/3/26.
//

#ifndef MONSTERMAKERENGINE_DIALOGLOADER_H
#define MONSTERMAKERENGINE_DIALOGLOADER_H

#include <string>

#include "DialogTypes.h"

class DialogLoader {
public:
    static DialogFile loadFile(const std::string& path);

private:
    DialogLoader() = delete;
};

#endif //MONSTERMAKERENGINE_DIALOGLOADER_H
