//
// Created by inkih on 11/2/26.
//

#ifndef MONSTERMAKERENGINE_DEBUGHELPER_H
#define MONSTERMAKERENGINE_DEBUGHELPER_H
#include <string>

class DebugHelper {
public:
    DebugHelper(const DebugHelper&) = delete;
    DebugHelper& operator=(const DebugHelper&) = delete;

    static DebugHelper& getInstance() {
        static DebugHelper instance;
        return instance;
    }

    void setCurrentMap(const std::string& mapPath) {
        currentMap = mapPath;
    }

    std::string getCurrentMap() const {
        return currentMap;
    }

private:
    DebugHelper() = default;
    std::string currentMap = "";
};

#endif //MONSTERMAKERENGINE_DEBUGHELPER_H