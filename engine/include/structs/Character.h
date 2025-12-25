//
// Created by inkih on 24/12/25.
//

#ifndef POKEMONGAMEENGINE_CHARACTER_H
#define POKEMONGAMEENGINE_CHARACTER_H
#include <GL/glew.h>
#include <glm/glm.hpp>

struct Character {
    GLuint textureID;
    glm::ivec2 size;
    glm::ivec2 bearing;
    GLuint advance;
};

#endif //POKEMONGAMEENGINE_CHARACTER_H