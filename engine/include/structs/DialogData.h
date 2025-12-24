//
// Created by inkih on 24/12/25.
//

#ifndef POKEMONGAMEENGINE_DIALOGDATA_H
#define POKEMONGAMEENGINE_DIALOGDATA_H
#include <functional>
#include <string>

struct DialogData {
    std::string text;
    std::function<void()> onComplete;
};

#endif //POKEMONGAMEENGINE_DIALOGDATA_H