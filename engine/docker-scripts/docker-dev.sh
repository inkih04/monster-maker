#!/bin/bash
set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Starting Development Session (Enhanced X11 Debug)${NC}"

# 1. Ubicar directorios
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"
cd "${PROJECT_ROOT}"

# 2. Asegurar imagen
if ! docker image inspect pokemon-engine:dev >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Dev image not found. Building once...${NC}"
    docker build --target development -t pokemon-engine:dev .
fi

# 3. Diagnóstico COMPLETO del sistema X11
echo -e "${YELLOW}>>> Diagnóstico del sistema host:${NC}"
echo "DISPLAY: $DISPLAY"
echo "Hostname: $(hostname)"

# Verificar que X11 está corriendo
if ! pgrep -x "Xorg" > /dev/null && ! pgrep -x "X" > /dev/null; then
    echo -e "${RED}❌ ERROR: No se detecta servidor X corriendo${NC}"
    exit 1
fi

# Verificar socket X11
XSOCK=/tmp/.X11-unix
if [ ! -d "$XSOCK" ]; then
    echo -e "${RED}❌ ERROR: $XSOCK no existe${NC}"
    exit 1
fi

# Detectar el número real del display
DISPLAY_NUM=$(echo $DISPLAY | sed 's/^.*://; s/\..*$//')
X11_SOCKET="${XSOCK}/X${DISPLAY_NUM}"

echo "Socket X11: $X11_SOCKET"
if [ ! -S "$X11_SOCKET" ]; then
    echo -e "${RED}❌ ERROR: Socket X11 no encontrado: $X11_SOCKET${NC}"
    ls -la $XSOCK/
    exit 1
fi

echo -e "${GREEN}✅ Socket X11 encontrado y accesible${NC}"
ls -la "$X11_SOCKET"

# 4. Configurar permisos temporales (solo para testing)
echo -e "${YELLOW}>>> Configurando permisos X11...${NC}"
xhost +local:docker > /dev/null 2>&1 || echo "⚠️  xhost falló, pero continuando..."

# 5. Detectar y copiar .Xauthority del host
XAUTH_DOCKER="/tmp/.docker.xauth"

# Intentar diferentes ubicaciones de .Xauthority
XAUTH_LOCATIONS=(
    "$HOME/.Xauthority"
    "/run/user/$(id -u)/gdm/Xauthority"
    "$XAUTHORITY"
    "/var/run/gdm/auth-for-$USER-*/database"
)

XAUTH_HOST=""
for loc in "${XAUTH_LOCATIONS[@]}"; do
    if [ -f "$loc" ]; then
        XAUTH_HOST="$loc"
        echo -e "${GREEN}✅ Archivo de autorización encontrado: $loc${NC}"
        break
    fi
done

if [ -z "$XAUTH_HOST" ]; then
    echo -e "${RED}❌ ERROR: No se encontró archivo .Xauthority en ninguna ubicación conocida${NC}"
    echo "Ubicaciones buscadas:"
    printf '%s\n' "${XAUTH_LOCATIONS[@]}"
    echo ""
    echo "Creando archivo de autorización nuevo..."

    # Extraer la cookie manualmente
    XAUTH_LIST=$(xauth list $DISPLAY 2>/dev/null | head -n 1)
    if [ -z "$XAUTH_LIST" ]; then
        echo -e "${RED}❌ ERROR: No se pudo obtener cookie de xauth${NC}"
        exit 1
    fi

    # Crear archivo nuevo con la cookie
    touch "$XAUTH_DOCKER"
    chmod 644 "$XAUTH_DOCKER"

    # Extraer y agregar la cookie
    HEX_KEY=$(echo $XAUTH_LIST | awk '{print $3}')
    xauth -f "$XAUTH_DOCKER" add :0 MIT-MAGIC-COOKIE-1 $HEX_KEY
    xauth -f "$XAUTH_DOCKER" add $(hostname)/unix:0 MIT-MAGIC-COOKIE-1 $HEX_KEY
else
    # Copiar el archivo encontrado
    cp "$XAUTH_HOST" "$XAUTH_DOCKER"
    chmod 644 "$XAUTH_DOCKER"
fi

echo "Entradas en el archivo de autorización:"
xauth -f "$XAUTH_DOCKER" list | head -n 5

echo ""
echo -e "${GREEN}🔨 Compiling and Running...${NC}"
echo ""

# 6. EJECUTAR con configuración simplificada
HOST_NAME=$(hostname)

docker run \
    --rm \
    -it \
    --name pokemon-engine-dev \
    --hostname "$HOST_NAME" \
    --network host \
    --privileged \
    --ipc=host \
    --pid=host \
    --security-opt seccomp=unconfined \
    --security-opt apparmor=unconfined \
    -e DISPLAY="$DISPLAY" \
    -e XAUTHORITY=/tmp/.docker.xauth \
    -e QT_X11_NO_MITSHM=1 \
    -e XDG_RUNTIME_DIR=/tmp/runtime-builder \
    -e LIBGL_ALWAYS_INDIRECT=0 \
    -v "${XSOCK}:${XSOCK}:rw" \
    -v "${XAUTH_DOCKER}:/tmp/.docker.xauth:ro" \
    -v "$(pwd):/home/builder/engine" \
    -w /home/builder/engine \
    --device /dev/dri:/dev/dri \
    --cap-add=SYS_ADMIN \
    pokemon-engine:dev \
    /bin/bash -c '
        set -e

        echo "========================================="
        echo ">>> DIAGNÓSTICO INTERNO DEL CONTENEDOR"
        echo "========================================="

        echo "Usuario: $(whoami) (UID=$(id -u))"
        echo "Hostname: $(hostname)"
        echo "DISPLAY: $DISPLAY"
        echo "XAUTHORITY: $XAUTHORITY"
        echo ""

        # Verificar socket X11
        echo ">>> Verificando socket X11..."
        DISPLAY_NUM=$(echo $DISPLAY | sed "s/^.*://; s/\..*$//")
        X11_SOCK="/tmp/.X11-unix/X${DISPLAY_NUM}"

        if [ -S "$X11_SOCK" ]; then
            echo "✅ Socket encontrado: $X11_SOCK"
            ls -la "$X11_SOCK"
        else
            echo "❌ Socket NO encontrado: $X11_SOCK"
            echo "Contenido de /tmp/.X11-unix/:"
            ls -la /tmp/.X11-unix/ || echo "Directorio no existe"
        fi

        # Verificar archivo de autorización
        if [ -f "$XAUTHORITY" ]; then
            echo "✅ Archivo XAUTHORITY encontrado"
            ls -l "$XAUTHORITY"
            echo ""
            echo "Contenido (primeras 3 líneas):"
            xauth -f "$XAUTHORITY" list 2>/dev/null | head -n 3 || echo "No se pudo leer con xauth"
        else
            echo "❌ Archivo XAUTHORITY no encontrado"
        fi

        # Test directo de conexión X11
        echo ""
        echo ">>> Probando conexión X11 directa..."

        # Instalar herramientas de diagnóstico si no están
        if ! command -v xdpyinfo >/dev/null 2>&1; then
            echo "Instalando x11-utils para diagnóstico..."
            apt-get update -qq && apt-get install -y -qq x11-utils 2>&1 | grep -v "^debconf:" || true
        fi

        if command -v xdpyinfo >/dev/null 2>&1; then
            echo "Ejecutando xdpyinfo..."
            if timeout 3 xdpyinfo -display "$DISPLAY" >/dev/null 2>&1; then
                echo "✅ xdpyinfo funciona correctamente"
                xdpyinfo -display "$DISPLAY" | grep -E "name of display|version number|vendor" | head -n 5
            else
                echo "❌ xdpyinfo falló con error:"
                timeout 3 xdpyinfo -display "$DISPLAY" 2>&1 | head -n 15
            fi
        else
            echo "⚠️  No se pudo instalar xdpyinfo"
        fi

        # Probar acceso directo al socket
        echo ""
        echo ">>> Probando acceso al socket..."
        if [ -w "/tmp/.X11-unix/X${DISPLAY_NUM}" ]; then
            echo "✅ Socket es escribible"
        else
            echo "❌ Socket NO es escribible"
        fi

        # Verificar permisos efectivos
        echo ""
        echo ">>> Permisos efectivos:"
        id
        groups

        # Verificar librerías GL
        echo ""
        echo ">>> Verificando OpenGL..."
        if command -v glxinfo >/dev/null 2>&1; then
            echo "glxinfo disponible:"
            timeout 2 glxinfo 2>&1 | grep -i "opengl\|direct rendering" | head -n 5 || echo "Timeout/Error"
        fi

        echo ""
        echo "========================================="
        echo ">>> CONFIGURANDO CMAKE"
        echo "========================================="

        if [ ! -d "build" ]; then
            cmake -B build -G Ninja \
                -DCMAKE_BUILD_TYPE=Debug \
                -DGLFW_BUILD_WAYLAND=OFF \
                -DCMAKE_C_COMPILER=gcc \
                -DCMAKE_CXX_COMPILER=g++ \
                -DCMAKE_CXX_FLAGS="-march=x86-64 -mtune=generic"
        fi

        echo ""
        echo "========================================="
        echo ">>> COMPILANDO"
        echo "========================================="

        cmake --build build --parallel $(nproc)

        echo ""
        echo "========================================="
        echo ">>> EJECUTANDO"
        echo "========================================="

        if [ -f "build/PokemonGameEngine" ]; then
            echo "✅ Ejecutable encontrado: build/PokemonGameEngine"
            ls -lh build/PokemonGameEngine
            echo ""
            echo "🚀 Lanzando juego..."
            echo ""

            # Crear runtime dir si no existe
            mkdir -p /tmp/runtime-builder

            ./build/PokemonGameEngine
        else
            echo "❌ ERROR: Ejecutable no encontrado"
            echo "Contenido de build/:"
            ls -la build/ || echo "Directorio build no existe"
            exit 1
        fi
    '

EXIT_CODE=$?

# Limpiar permisos
xhost -local:docker > /dev/null 2>&1 || true

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Sesión finalizada correctamente${NC}"
else
    echo -e "${RED}❌ Sesión finalizada con errores (código: $EXIT_CODE)${NC}"
fi

exit $EXIT_CODE