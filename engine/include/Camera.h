#ifndef POKEMONGAMEENGINE_CAMERA_H
#define POKEMONGAMEENGINE_CAMERA_H
#include <glm/glm.hpp>

class Camera {
public:
    Camera(float width, float height);
    ~Camera() = default;

    glm::mat4 getViewMatrix() const { return m_view; }
    glm::mat4 getProjectionMatrix() const { return m_projection; }

    void setViewportSize(float width, float height);


    void setPosition(const glm::vec2& position);
    glm::vec2 getPosition() const { return m_position; }

    void setZoom(float zoom);
    float getZoom() const { return m_zoom; }
    float getWidth() const { return m_width; }
    float getHeight() const { return m_height; }

private:
    void updateViewMatrix();
    void updateProjectionMatrix();

    glm::mat4 m_projection;
    glm::mat4 m_view;
    glm::vec2 m_position;
    float m_zoom;
    float m_width, m_height;
};

#endif