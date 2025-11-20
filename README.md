# 🧩 Pokémon Maker — Editor de Fangames + Motor 2D en C++

Un proyecto completo que combina:

- 🖥 **Un editor visual** creado con *Electron + React + Zustand*
- 🎮 **Un motor 2D** escrito en *C++ + OpenGL*
- 🛠 Herramientas para generar, editar y compilar fangames estilo Pokémon
- 📦 Entorno de compilación **dockerizado** para garantizar portabilidad total

---

## 📦 Descripción del Proyecto

**Pokémon Maker** es una herramienta completa para crear fangames estilo Pokémon, formada por dos componentes principales:

### 🔹 1. Editor de Fangames (Electron + React)

Una aplicación de escritorio que permite:

- Crear mapas 2D basados en tiles
- Cargar y gestionar tilesets y sprites
- Editar entidades, eventos y triggers
- Previsualizar animaciones
- Organizar todos los assets del proyecto
- Exportar un proyecto estructurado (JSON/YAML)
- Lanzar la compilación del motor C++ desde el editor

El editor genera todo el contenido que luego el motor del juego utilizará para correr el fangame.

---

### 🔹 2. Motor del Juego (C++ + OpenGL)

Un motor 2D especializado en juegos tipo Pokémon:

- Renderizado de tilemaps, sprites, animaciones
- Sistema de entidades
- Carga de recursos exportados por el editor
- Soporte para scripting (opcional, con Lua)  
- Ejecución del game loop
- Compilación basada en CMake, integrada con el editor

El motor consume los datos generados por el editor y produce un ejecutable completo del fangame.

---

## 🎯 Objetivos del Proyecto

### 🎨 **Editor**
- Herramienta intuitiva y profesional
- Gestión completa de mapas, assets, animaciones y eventos
- Sistema de recursos centralizado
- Exportación estructurada del proyecto
- Integración directa con el motor C++

### ⚙️ **Motor 2D**
- Renderizado eficiente con OpenGL
- Carga de datos generados por el editor
- Arquitectura modular y extensible
- Scripting para eventos personalizados
- Compilación automatizada desde el editor

### 🧵 **Integración Editor ↔ Motor**
- El editor modifica plantillas del engine
- Lanza compilaciones automáticas (CMake + Ninja)
- Previsualización y pruebas rápidas
- Generación de un ejecutable final del juego

---

## 🧪 Resultados Esperados

El proyecto final debe permitir:

- Crear un fangame Pokémon completo **sin tocar C++**
- Diseñar mapas, sprites, tiles y eventos desde el editor
- Personalizar lógica mediante scripts
- Exportar un proyecto final reproducible
- Compilar automáticamente un ejecutable jugable
- Entregar un TFG profesional y completo

---

## 🧰 Tecnologías Utilizadas

### 🖥 Editor (Frontend)
- **Electron**  
  App de escritorio / comunicación con Node / creación de ejecutables
- **React**  
  UI moderna y modular
- **Zustand**  
  Estado global simple y eficiente
- **Vite**  
  Entorno de desarrollo ultrarrápido

### 🔧 Backend del Editor (Node.js)
- Manipulación de archivos del proyecto
- Ejecución de procesos CMake
- Integración con el motor C++
- IPC para comunicación Editor ↔ Motor

### 🎮 Motor del Juego (C++)
- **C++17/20**  
  Lógica del motor y rendimiento nativo
- **OpenGL 2D**  
  Renderizado de sprites, tilemaps y animaciones
- **CMake**  
  Build system portable
- **Lua (opcional)**  
  Para scripting de eventos del jugador y NPCs

---

## 🐳 Dockerización del Motor

El motor C++ se compila dentro de un entorno Docker que garantiza:

- Reproducibilidad total del build
- Compatibilidad con cualquier PC (Linux, Windows, macOS)
- Entorno idéntico para todos los usuarios
- Integración directa con el editor

El editor puede lanzar este Docker para compilar el juego final sin requerir toolchains en el equipo del usuario.


