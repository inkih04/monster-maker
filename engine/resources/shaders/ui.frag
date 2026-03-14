#version 330 core
in vec4 vColor;
in vec2 vTexCoord;

uniform sampler2D uTexture;
uniform bool useTexture;

out vec4 FragColor;

void main() {
    if (useTexture)
    FragColor = texture(uTexture, vTexCoord) * vColor;
    else
    FragColor = vColor;
}