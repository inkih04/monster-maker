//
// Created by inkih on 24/12/25.
//

#ifndef POKEMONGAMEENGINE_TEXTMANAGER_H
#define POKEMONGAMEENGINE_TEXTMANAGER_H

#include <memory>
#include <queue>
#include <string>
#include <functional>
#include <glm/glm.hpp>
#include "DialogBox.h"
#include "TextRenderer.h"
#include "Renderer.h"
#include "enums/DialogSpeed.h"
#include "structs/DialogData.h"

enum class DialogPosition {
    TOP,
    CENTER,
    BOTTOM,
    CUSTOM
};

struct DialogConfig {
    DialogPosition position = DialogPosition::BOTTOM;
    glm::vec2 customPosition = glm::vec2(0.0f);
    glm::vec2 size = glm::vec2(700.0f, 150.0f);
    DialogSpeed speed = DialogSpeed::NORMAL;
    glm::vec3 backgroundColor = glm::vec3(1.0f, 1.0f, 1.0f);
    glm::vec3 borderColor = glm::vec3(0.0f, 0.0f, 0.0f);
    glm::vec3 textColor = glm::vec3(0.0f, 0.0f, 0.0f);
    float borderThickness = 3.0f;
    float padding = 20.0f;
};

class TextManager {
private:
    std::unique_ptr<DialogBox> m_dialogBox;
    TextRenderer* m_textRenderer;
    Renderer* m_renderer;

    std::queue<DialogData> m_dialogQueue;
    DialogConfig m_config;

    int m_screenWidth;
    int m_screenHeight;

    bool m_autoAdvance;
    float m_autoAdvanceDelay;
    float m_autoAdvanceTimer;

    void processNextDialog();
    glm::vec2 calculatePosition(DialogPosition position, const glm::vec2& size) const;
    void applyConfig();

public:
    TextManager(int screenWidth, int screenHeight);
    ~TextManager() = default;

    // No permitir copias
    TextManager(const TextManager&) = delete;
    TextManager& operator=(const TextManager&) = delete;

    // Inicialización
    void initialize(const std::string& fontPath, unsigned int fontSize);

    // Métodos principales para mostrar diálogos
    void showDialog(const std::string& text);
    void showDialog(const std::string& text, DialogPosition position);
    void showDialog(const std::string& text, const glm::vec2& customPosition);
    void showDialogWithCallback(const std::string& text, std::function<void()> onComplete);

    // Cola de diálogos (para conversaciones)
    void queueDialog(const std::string& text);
    void queueDialog(const DialogData& dialogData);
    void queueDialogs(const std::vector<std::string>& texts);
    void clearQueue();

    // Control del diálogo actual
    void advanceDialog();      // Completar texto o avanzar al siguiente
    void completeCurrentText(); // Solo completar el texto actual
    void skipDialog();          // Saltar al siguiente diálogo inmediatamente
    void hideDialog();
    void showCurrentDialog();

    // Actualización
    void update(float deltaTime);
    void render();

    // Configuración
    void setConfig(const DialogConfig& config);
    void setPosition(DialogPosition position);
    void setCustomPosition(const glm::vec2& position);
    void setSize(const glm::vec2& size);
    void setSpeed(DialogSpeed speed);
    void setColors(const glm::vec3& bg, const glm::vec3& border, const glm::vec3& text);
    void setAutoAdvance(bool enabled, float delay = 2.0f);

    // Getters de estado
    bool isDialogActive() const;
    bool isDialogComplete() const;
    bool isDialogVisible() const;
    bool hasQueuedDialogs() const;
    int getQueueSize() const;

    // Getters de configuración
    const DialogConfig& getConfig() const { return m_config; }
    DialogBox* getDialogBox() const { return m_dialogBox.get(); }
};

#endif //POKEMONGAMEENGINE_TEXTMANAGER_H