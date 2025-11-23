# ==============================================================================
# ETAPA 1: Dependencias (Cacheable)
# Esta etapa solo se reconstruye si cambias vcpkg.json o el sistema base
# ==============================================================================
FROM ubuntu:22.04 AS dependencies

ENV DEBIAN_FRONTEND=noninteractive
ENV VCPKG_ROOT=/opt/vcpkg
ENV PATH="${VCPKG_ROOT}:${PATH}"

# 1. Instalar herramientas del sistema necesarias para vcpkg y compilación
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    curl \
    zip \
    unzip \
    tar \
    pkg-config \
    ninja-build \
    libx11-dev \
    libxrandr-dev \
    libxinerama-dev \
    libxcursor-dev \
    libxi-dev \
    libgl1-mesa-dev \
    libglu1-mesa-dev \
    libwayland-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Clonar y preparar vcpkg
WORKDIR /opt
RUN git clone https://github.com/microsoft/vcpkg.git \
    && cd vcpkg \
    && ./bootstrap-vcpkg.sh

# 3. Instalar librerías del proyecto
WORKDIR /dependencies
COPY vcpkg.json .

# Instalar con vcpkg
RUN /opt/vcpkg/vcpkg install --triplet x64-linux --clean-after-build \
    && chmod -R 777 /opt/vcpkg

# ==============================================================================
# ETAPA 2: Builder (Compilación del Juego)
# ==============================================================================
FROM dependencies AS builder

ENV VCPKG_ROOT=/opt/vcpkg

# Crear usuario builder
RUN useradd -m -s /bin/bash builder
WORKDIR /home/builder/engine

# Copiamos el código fuente del proyecto
COPY . .

# Limpiamos builds previos y configuramos CMake usando el TOOLCHAIN de vcpkg
RUN rm -rf build && \
    cmake -B build \
    -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_TOOLCHAIN_FILE=${VCPKG_ROOT}/scripts/buildsystems/vcpkg.cmake \
    -DVCPKG_TARGET_TRIPLET=x64-linux \
    -DVCPKG_INSTALLED_DIR=${VCPKG_ROOT}/installed \
    -DCMAKE_PREFIX_PATH=${VCPKG_ROOT}/installed/x64-linux \
    -DGLFW_BUILD_WAYLAND=OFF \
    -DCMAKE_C_COMPILER=gcc \
    -DCMAKE_CXX_COMPILER=g++ \
    -DCMAKE_CXX_FLAGS="-march=x86-64 -mtune=generic"

# Compilar
RUN cmake --build build --parallel $(nproc)

# Verificar que el ejecutable existe
RUN test -f build/PokemonGameEngine || (echo "ERROR: PokemonGameEngine not built" && exit 1)

# ==============================================================================
# ETAPA 3: Development (Para usar como entorno de desarrollo)
# ==============================================================================
FROM builder AS development

ENV VCPKG_ROOT=/opt/vcpkg

USER root
RUN apt-get update && apt-get install -y \
    vim \
    valgrind \
    gdb \
    && rm -rf /var/lib/apt/lists/*

USER builder
WORKDIR /home/builder/engine
CMD ["/bin/bash"]