//
// Created by inkih on 6/12/25.
//

#ifndef POKEMONGAMEENGINE_SHADERPATH_H
#define POKEMONGAMEENGINE_SHADERPATH_H

#include <string>

struct ShaderPath{
    std::string vertexPath;
    std::string fragmentPath;

    bool operator==(const ShaderPath& other) const {
        return vertexPath == other.vertexPath &&
               fragmentPath == other.fragmentPath;
    }

};

namespace std {
    template<>
    struct hash<ShaderPath> {
        size_t operator()(const ShaderPath& sp) const {
            size_t h1 = hash<string>()(sp.vertexPath);
            size_t h2 = hash<string>()(sp.fragmentPath);
            return h1 ^ (h2 << 1); // Combina ambos hashes
        }
    };
}

#endif //POKEMONGAMEENGINE_SHADERPATH_H