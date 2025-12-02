//
// Created by inkih on 2/12/25.
//

#ifndef POKEMONGAMEENGINE_SHADER_H
#define POKEMONGAMEENGINE_SHADER_H
#include <GL/glew.h>
#include <glm/glm.hpp>
#include <string>
#include <unordered_map>

class Shader {
    private:
        GLuint m_programID;
        mutable std::unordered_map<std::string, GLint> m_uniformCache;
        GLint getUniformLocation(const std::string &name) const;
    public:
        Shader(const std::string &vertexPath, const std::string &fragmentPath);
        ~Shader();
        Shader(const Shader&) = delete;
        Shader& operator=(const Shader&) = delete;

        void use() const;
        void setInt(const std::string& name, int value) const;
        void setBool(const std::string& name, bool value) const;
        void setFloat(const std::string& name, float value) const;
        void setVec2(const std::string& name, const glm::vec2& value) const;
        void setVec3(const std::string& name, const glm::vec3& value) const;
        void setVec4(const std::string& name, const glm::vec4& value) const;
        void setMat3(const std::string& name, const glm::mat3& value) const;
        void setMat4(const std::string& name, const glm::mat4& value) const;

        GLuint getID() const { return m_programID; }
};

#endif //POKEMONGAMEENGINE_SHADER_H