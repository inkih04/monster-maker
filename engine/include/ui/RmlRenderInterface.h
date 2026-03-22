//
// Created by inkih on 13/3/26.
//

#ifndef MONSTERMAKERENGINE_RMLRENDERINTERFACE_H
#define MONSTERMAKERENGINE_RMLRENDERINTERFACE_H

#include <GL/glew.h>
#include <RmlUi/Core/RenderInterface.h>
#include <glm/glm.hpp>

class RmlRenderInterface : public Rml::RenderInterface {
    public:
        void SetViewport(int width, int height);
        void BeginFrame();
        void EndFrame();

        Rml::CompiledGeometryHandle CompileGeometry(
            Rml::Span<const Rml::Vertex> vertices,
            Rml::Span<const int> indices) override;

        void RenderGeometry(
            Rml::CompiledGeometryHandle handle,
            Rml::Vector2f translation,
            Rml::TextureHandle texture) override;

        void ReleaseGeometry(Rml::CompiledGeometryHandle handle) override;

        Rml::TextureHandle LoadTexture(
            Rml::Vector2i& dimensions,
            const Rml::String& source) override;

        Rml::TextureHandle GenerateTexture(
            Rml::Span<const Rml::byte> source,
            Rml::Vector2i dimensions) override;

        void ReleaseTexture(Rml::TextureHandle handle) override;

        void EnableScissorRegion(bool enable) override;

        void SetScissorRegion(Rml::Rectanglei region) override;

    private:
        struct GeometryData {
            GLuint vao, vbo, ebo;
            GLsizei indexCount;
        };

        glm::mat4 m_projection{1.f};
        int m_width = 0, m_height = 0;
    };

#endif //MONSTERMAKERENGINE_RMLRENDERINTERFACE_H