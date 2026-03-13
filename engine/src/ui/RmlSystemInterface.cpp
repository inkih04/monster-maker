//
// Created by inkih on 13/3/26.
//

#include "RmlRenderInterface.h"
#include <glm/gtc/matrix_transform.hpp>
#include "ResourceManager.h"

void RmlRenderInterface::SetViewport(int width, int height) {
    m_width = width;
    m_height = height;
    m_projection = glm::ortho(0.f, (float)width, (float)height, 0.f);
}

void RmlRenderInterface::BeginFrame() {
    glDisable(GL_DEPTH_TEST);
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
}

void RmlRenderInterface::EndFrame() {
    glDisable(GL_DEPTH_TEST);
}

Rml::CompiledGeometryHandle RmlRenderInterface::CompileGeometry(
    Rml::Span<const Rml::Vertex> vertices,
    Rml::Span<const int> indices)
{
    GeometryData* data = new GeometryData();

    glGenVertexArrays(1, &data->vao);
    glGenBuffers(1, &data->vbo);
    glGenBuffers(1, &data->ebo);

    glBindVertexArray(data->vao);

    glBindBuffer(GL_ARRAY_BUFFER, data->vbo);
    glBufferData(GL_ARRAY_BUFFER,
        vertices.size() * sizeof(Rml::Vertex),
        vertices.data(), GL_STATIC_DRAW);

    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, data->ebo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER,
        indices.size() * sizeof(int),
        indices.data(), GL_STATIC_DRAW);

    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE,
        sizeof(Rml::Vertex),
        (void*)offsetof(Rml::Vertex, position));

    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 4, GL_UNSIGNED_BYTE, GL_TRUE,
        sizeof(Rml::Vertex),
        (void*)offsetof(Rml::Vertex, colour));

    glEnableVertexAttribArray(2);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE,
        sizeof(Rml::Vertex),
        (void*)offsetof(Rml::Vertex, tex_coord));

    glBindVertexArray(0);

    data->indexCount = (GLsizei)indices.size();
    return (Rml::CompiledGeometryHandle)data;
}

void RmlRenderInterface::RenderGeometry(
    Rml::CompiledGeometryHandle handle,
    Rml::Vector2f translation,
    Rml::TextureHandle texture)
{
    auto* data = (GeometryData*)handle;
    auto* shader = ResourceManager::loadShader(
        "resources/shaders/ui.vert",
        "resources/shaders/ui.frag");

    shader->use();
    shader->setMat4("projection", m_projection);
    shader->setVec2("translation", {translation.x, translation.y});
    shader->setBool("useTexture", texture != 0);

    if (texture) {
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, (GLuint)texture);
        shader->setInt("uTexture", 0);
    }

    glBindVertexArray(data->vao);
    glDrawElements(GL_TRIANGLES, data->indexCount, GL_UNSIGNED_INT, nullptr);
    glBindVertexArray(0);
}

void RmlRenderInterface::ReleaseGeometry(Rml::CompiledGeometryHandle handle) {
    auto* data = (GeometryData*)handle;
    glDeleteVertexArrays(1, &data->vao);
    glDeleteBuffers(1, &data->vbo);
    glDeleteBuffers(1, &data->ebo);
    delete data;
}

Rml::TextureHandle RmlRenderInterface::LoadTexture(
    Rml::Vector2i& dimensions,
    const Rml::String& source)
{
    Texture* tex = ResourceManager::loadTexture(source);
    if (!tex) return 0;
    dimensions.x = tex->getWidth();
    dimensions.y = tex->getHeight();
    return (Rml::TextureHandle)tex->getID();
}

Rml::TextureHandle RmlRenderInterface::GenerateTexture(
    Rml::Span<const Rml::byte> source,
    Rml::Vector2i dimensions)
{
    GLuint id;
    glGenTextures(1, &id);
    glBindTexture(GL_TEXTURE_2D, id);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA8,
        dimensions.x, dimensions.y, 0,
        GL_RGBA, GL_UNSIGNED_BYTE, source.data());
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    return (Rml::TextureHandle)id;
}

void RmlRenderInterface::ReleaseTexture(Rml::TextureHandle handle) {
    GLuint id = (GLuint)handle;
    glDeleteTextures(1, &id);
}

void RmlRenderInterface::EnableScissorRegion(bool enable) {
    enable ? glEnable(GL_SCISSOR_TEST) : glDisable(GL_SCISSOR_TEST);
}

void RmlRenderInterface::SetScissorRegion(Rml::Rectanglei region) {
    glScissor(region.Left(), m_height - region.Bottom(),
              region.Width(), region.Height());
}