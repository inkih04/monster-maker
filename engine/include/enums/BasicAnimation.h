//
// Created by inkih on 12/12/25.
//

#ifndef POKEMONGAMEENGINE_BASICANIMATION_H
#define POKEMONGAMEENGINE_BASICANIMATION_H

#include <string>
#include <unordered_map>
#include <vector>

enum class BasicAnimation {
    MOVEUP,
    MOVEDOWN,
    MOVELEFT,
    MOVERIGHT,
    STANDUP,
    STANDDOWN,
    STANDLEFT,
    STANDRIGHT,
    UNKNOWN
};

namespace std {
    template <>
    struct hash<BasicAnimation> {
        size_t operator()(const BasicAnimation& anim) const noexcept {
            return static_cast<size_t>(anim);
        }
    };
}

inline std::string animationToString(BasicAnimation anim) {
    static const std::unordered_map<BasicAnimation, std::string> names = {
        {BasicAnimation::MOVEUP, "moveup"},
        {BasicAnimation::MOVEDOWN, "movedown"},
        {BasicAnimation::MOVELEFT, "moveleft"},
        {BasicAnimation::MOVERIGHT, "moveright"},
        {BasicAnimation::STANDUP, "standup"},
        {BasicAnimation::STANDDOWN, "standdown"},
        {BasicAnimation::STANDLEFT, "standleft"},
        {BasicAnimation::STANDRIGHT, "standright"},
        {BasicAnimation::UNKNOWN, "unknown"}
    };

    auto it = names.find(anim);
    return (it != names.end()) ? it->second : "unknown";
}

inline BasicAnimation stringToAnimation(const std::string& str) {
    static const std::unordered_map<std::string, BasicAnimation> values = {
        {"moveup", BasicAnimation::MOVEUP},
        {"movedown", BasicAnimation::MOVEDOWN},
        {"moveleft", BasicAnimation::MOVELEFT},
        {"moveright", BasicAnimation::MOVERIGHT},
        {"standup", BasicAnimation::STANDUP},
        {"standdown", BasicAnimation::STANDDOWN},
        {"standleft", BasicAnimation::STANDLEFT},
        {"standright", BasicAnimation::STANDRIGHT}
    };

    auto it = values.find(str);
    return (it != values.end()) ? it->second : BasicAnimation::UNKNOWN;
}

inline std::vector<std::string> getAllAnimationNames() {
    return {
        "moveup",
        "movedown",
        "moveleft",
        "moveright",
        "standup",
        "standdown",
        "standleft",
        "standright"
    };
}

#endif //POKEMONGAMEENGINE_BASICANIMATION_H
