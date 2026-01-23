//
// Created by inkih on 3/12/25.
//

#include "Renderer.h"

#include <iostream>
#include <string>
#include <glm/gtc/matrix_transform.hpp>
#include "ResourceManager.h"

Renderer::Renderer(): m_currentShader(nullptr), m_activeCamera(nullptr) {
    initRenderData();
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
}

Renderer::~Renderer() {
    glDeleteVertexArrays(1, &m_quadVAO);
    glDeleteBuffers(1, &m_quadVBO);
}

void Renderer::loadShader(const std::string& name, const std::string& vertexPath, const std::string& fragmentPath) {
    m_shaders[name] = ResourceManager::loadShader(vertexPath, fragmentPath);

    if (m_currentShader == nullptr) {
        setShader(name);
    }

}

void Renderer::setShader(const std::string& name) {
    auto it = m_shaders.find(name);
    if (it != m_shaders.end()) {
        m_currentShader = it->second;
        m_currentShader->use();

        if (m_activeCamera) updateCameraUniforms();
    } else {
        std::cerr << "Advertencia: Intentando usar shader no existente '" << name << "'" << std::endl;
    }
}

void Renderer::setCamera(const Camera& camera) {
    m_activeCamera = &camera;
    if (m_currentShader) {
        updateCameraUniforms();
    }
}

void Renderer::updateCameraUniforms() const {
    if(m_currentShader && m_activeCamera) {
        m_currentShader->use();
        m_currentShader->setMat4("projection", m_activeCamera->getProjectionMatrix());
        m_currentShader->setMat4("view", m_activeCamera->getViewMatrix());
    }
}

void Renderer::initRenderData() {
    float vertices[] = {
        0.0f, 1.0f, 0.0f, 1.0f,
        1.0f, 0.0f, 1.0f, 0.0f,
        0.0f, 0.0f, 0.0f, 0.0f,

        0.0f, 1.0f, 0.0f, 1.0f,
        1.0f, 1.0f, 1.0f, 1.0f,
        1.0f, 0.0f, 1.0f, 0.0f
    };

    glGenVertexArrays(1, &m_quadVAO);
    glGenBuffers(1, &m_quadVBO);

    glBindBuffer(GL_ARRAY_BUFFER, m_quadVBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    glBindVertexArray(m_quadVAO);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)(2 * sizeof(float)));
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);
}

void Renderer::draw(  glm::vec2 position, glm::vec2 size, float rotate, glm::vec3 color ) const {
    if (!m_currentShader) {
        std::cout << "ERROR::Renderer: No shader configurado" << std::endl;
      return;
    }
    m_currentShader->use();

    glm::vec2 snappedPos = glm::vec2(std::floor(position.x), std::floor(position.y));

    glm::mat4 model = glm::mat4(1.0f);
    model = glm::translate(model, glm::vec3(snappedPos, 0.0f));
    model = glm::translate(model, glm::vec3(0.5f * size.x, 0.5f * size.y, 0.0f));
    model = glm::rotate(model, glm::radians(rotate), glm::vec3(0.0f, 0.0f, 1.0f));
    model = glm::translate(model, glm::vec3(-0.5f * size.x, -0.5f * size.y, 0.0f));
    model = glm::scale(model, glm::vec3(size, 1.0f));

    m_currentShader->setMat4("model", model);
    m_currentShader->setVec4("spriteColor", glm::vec4(color, 1.f));
    m_currentShader->setBool("useTexture", false);

    glBindVertexArray(m_quadVAO);
    glDrawArrays(GL_TRIANGLES, 0, 6);
    glBindVertexArray(0);
}

void Renderer::drawSprite(
    const std::string& texturePath,
    glm::vec2 position,
    glm::vec2 size,
    float rotate,
    glm::vec3 color,
    const SpriteRect* spriteRect) const
{
    if (!m_currentShader) return;
    Texture *texture = ResourceManager::loadTexture(texturePath);

    m_currentShader->use();

    glm::vec2 snappedPos = glm::vec2(std::floor(position.x), std::floor(position.y));

    glm::mat4 model = glm::mat4(1.0f);
    model = glm::translate(model, glm::vec3(snappedPos, 0.0f));
    model = glm::translate(model, glm::vec3(0.5f * size.x, 0.5f * size.y, 0.0f));
    model = glm::rotate(model, glm::radians(rotate), glm::vec3(0.0f, 0.0f, 1.0f));
    model = glm::translate(model, glm::vec3(-0.5f * size.x, -0.5f * size.y, 0.0f));
    model = glm::scale(model, glm::vec3(size, 1.0f));

    m_currentShader->setMat4("model", model);
    m_currentShader->setVec4("spriteColor", glm::vec4(color, 1.f));
    m_currentShader->setBool("useTexture", true);

    if (spriteRect) {
        float texWidth = static_cast<float>(texture->getWidth());
        float texHeight = static_cast<float>(texture->getHeight());

        glm::vec4 uvRect(
            spriteRect->x / texWidth,           // u_min
            spriteRect->y / texHeight,          // v_min
            spriteRect->width / texWidth,       // u_size
            spriteRect->height / texHeight      // v_size
        );

        m_currentShader->setVec4("uvRect", uvRect);
        m_currentShader->setBool("useUVRect", true);
    } else {
        m_currentShader->setBool("useUVRect", false);
    }

    texture->bind(0);
    m_currentShader->setInt("texture1", 0);

    glBindVertexArray(m_quadVAO);
    glDrawArrays(GL_TRIANGLES, 0, 6);
    glBindVertexArray(0);
}
