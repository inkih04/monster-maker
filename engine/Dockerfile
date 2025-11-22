
FROM ubuntu:22.04 AS builder


ENV DEBIAN_FRONTEND=noninteractive


RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    ninja-build \
    libx11-dev \
    libxrandr-dev \
    libxinerama-dev \
    libxcursor-dev \
    libxi-dev \
    libgl1-mesa-dev \
    libglu1-mesa-dev \
    libglew-dev \
    libwayland-dev \
    libfreetype6-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash builder
USER builder
WORKDIR /home/builder/engine

COPY --chown=builder:builder . .

RUN rm -rf build && \
    cmake -B build \
    -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DGLFW_BUILD_WAYLAND=OFF \
    -DCMAKE_C_COMPILER=gcc \
    -DCMAKE_CXX_COMPILER=g++ \
    -DCMAKE_CXX_FLAGS="-march=x86-64 -mtune=generic"


RUN cmake --build build --parallel $(nproc)


RUN test -f build/PokemonGameEngine || (echo "ERROR: PokemonGameEngine not built" && exit 1)


FROM ubuntu:22.04 AS runtime

ENV DEBIAN_FRONTEND=noninteractive


RUN apt-get update && apt-get install -y \
    libx11-6 \
    libxrandr2 \
    libxinerama1 \
    libxcursor1 \
    libxi6 \
    libgl1 \
    libglu1-mesa \
    libfreetype6 \
    libglew2.2 \
    libwayland-client0 \
    gdb \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash gamerunner
USER gamerunner
WORKDIR /home/gamerunner/game


COPY --from=builder --chown=gamerunner:gamerunner \
    /home/builder/engine/build/PokemonGameEngine ./PokemonGameEngine

COPY --from=builder --chown=gamerunner:gamerunner \
    /home/builder/engine/resources ./resources

RUN chmod +x ./PokemonGameEngine

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD pgrep -f PokemonGameEngine || exit 1

ENTRYPOINT ["./PokemonGameEngine"]
CMD []


FROM builder AS development

USER builder
WORKDIR /home/builder/engine

USER root
RUN apt-get update && apt-get install -y \
    vim \
    valgrind \
    clang-format \
    clang-tidy \
    clang \
    llvm \
    && rm -rf /var/lib/apt/lists/*

USER builder
CMD ["/bin/bash"]