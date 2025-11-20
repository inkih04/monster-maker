# ============================================================
# STAGE 1: Builder - Compila el motor
# ============================================================
FROM ubuntu:22.04 AS builder

# Evitar prompts interactivos
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias de compilación
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    clang \
    git \
    ninja-build \
    # Dependencias de GLFW
    libx11-dev \
    libxrandr-dev \
    libxinerama-dev \
    libxcursor-dev \
    libxi-dev \
    libgl1-mesa-dev \
    libglu1-mesa-dev \
    # Dependencias de FreeType
    libfreetype6-dev \
    # Herramientas
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario no-root para compilación
RUN useradd -m -s /bin/bash builder
USER builder
WORKDIR /home/builder/engine

# Copiar archivos del proyecto (como usuario builder)
COPY --chown=builder:builder . .

# Configurar CMake
RUN cmake -B build \
    -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DUSE_CLANG=ON \
    -DBUILD_GAME_RUNNER=ON \
    -DCMAKE_CXX_FLAGS="-march=x86-64 -mtune=generic"

# Compilar (usa todos los cores disponibles)
RUN cmake --build build --parallel $(nproc)

# Verificar que el ejecutable existe
RUN test -f build/GameRunner || (echo "ERROR: GameRunner not built" && exit 1)

# ============================================================
# STAGE 2: Runtime - Imagen final ligera
# ============================================================
FROM ubuntu:22.04 AS runtime

ENV DEBIAN_FRONTEND=noninteractive

# Instalar solo dependencias de runtime (mucho más ligero)
RUN apt-get update && apt-get install -y \
    libx11-6 \
    libxrandr2 \
    libxinerama1 \
    libxcursor1 \
    libxi6 \
    libgl1 \
    libglu1-mesa \
    libfreetype6 \
    # Para debugging (opcional, quitar en producción)
    gdb \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario para ejecutar el juego
RUN useradd -m -s /bin/bash gamerunner
USER gamerunner
WORKDIR /home/gamerunner/game

# Copiar ejecutable y recursos desde builder
COPY --from=builder --chown=gamerunner:gamerunner \
    /home/builder/engine/build/GameRunner ./GameRunner

# Copiar recursos (ajusta según tu estructura)
COPY --from=builder --chown=gamerunner:gamerunner \
    /home/builder/engine/resources ./resources

# Hacer ejecutable
RUN chmod +x ./GameRunner

# Exponer puerto si usas networking (opcional)
# EXPOSE 8080

# Healthcheck (opcional, para verificar que funciona)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD pgrep -f GameRunner || exit 1

# Comando por defecto
ENTRYPOINT ["./GameRunner"]
CMD []

# ============================================================
# STAGE 3: Development - Para desarrollo con hot-reload
# ============================================================
FROM builder AS development

USER builder
WORKDIR /home/builder/engine

# Instalar herramientas de desarrollo adicionales
USER root
RUN apt-get update && apt-get install -y \
    vim \
    valgrind \
    clang-format \
    clang-tidy \
    && rm -rf /var/lib/apt/lists/*

USER builder

# Mantener el contenedor vivo para desarrollo interactivo
CMD ["/bin/bash"]