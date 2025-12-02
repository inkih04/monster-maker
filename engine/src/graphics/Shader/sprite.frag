#version 330 core
in vec2 TexCoord;
out vec4 FragColor;

uniform sampler2D texture1;
uniform vec4 spriteColor;
uniform bool useTexture;

void main() {
    if (useTexture) {
        FragColor = texture(texture1, TexCoord) * spriteColor;
    } else {
        FragColor = spriteColor;
    }
}
