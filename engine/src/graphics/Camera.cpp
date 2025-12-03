//
// Created by inkih on 3/12/25.
//
#include "Camera.h"
#include <glm/gtc/matrix_transform.hpp>

Camera::Camera(float width, float height)
    :m_height(height), m_width(width) ,m_position(0.0f, 0.0f), m_zoom(1.0f) {
    m_projection = glm::ortho(0.0f, width, height, 0.0f, -1.0f, 1.0f);
    updateViewMatrix();
}


void Camera::setPosition(const glm::vec2& position) {
    m_position = position;
    updateViewMatrix();
}

void Camera::setZoom(float zoom) {
    if (zoom < 0.1f) zoom = 0.1f;
    m_zoom = zoom;
    updateViewMatrix();
}

void Camera::updateViewMatrix() {
    glm::mat4 transform = glm::mat4(1.0f);
    transform = glm::translate(transform, glm::vec3(m_width / 2.0f, m_height / 2.0f, 0.0f));
    transform = glm::scale(transform, glm::vec3(m_zoom, m_zoom, 1.0f));

    transform = glm::translate(transform, glm::vec3(-m_width / 2.0f, -m_height / 2.0f, 0.0f));


    transform = glm::translate(transform, glm::vec3(-m_position.x, -m_position.y, 0.0f));

    m_view = transform;
}