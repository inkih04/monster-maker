//
// Created by inkih on 3/12/25.
//

#ifndef POKEMONGAMEENGINE_RENDERER_H
#define POKEMONGAMEENGINE_RENDERER_H
#include <GL/glew.h>
#include <unordered_map>

#include "Camera.h"
#include "Shader.h"
#include "SpriteRect.h"
#include "Texture.h"

class Renderer {
    private:
        GLuint m_quadVAO;
        GLuint m_quadVBO;
        Shader* m_currentShader;
        std::unordered_map<std::string, Shader*> m_shaders;
        const Camera* m_activeCamera;
        Renderer();
        ~Renderer();

        Renderer(const Renderer&) = delete;
        Renderer& operator=(const Renderer&) = delete;

        void initRenderData();
        void updateCameraUniforms() const;

    public:
        static Renderer& getInstance() {
            static Renderer instance;
            return instance;
        };

        void loadShader(const std::string& name, const std::string& vertexPath, const std::string& fragmentPath);
        void setShader(const std::string& name);
        void setCamera(const Camera &camera);
        void drawSprite(const std::string& texturePath, glm::vec2 position, glm::vec2 size = glm::vec2(10.0f, 10.0f),
            float rotate = 0.0f, glm::vec3 color = glm::vec3(1.0f),const SpriteRect* spriteRect = nullptr) const;

};

#endif //POKEMONGAMEENGINE_RENDERER_H