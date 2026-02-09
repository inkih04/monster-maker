#version 330 core
in vec2 TexCoord;
out vec4 FragColor;

uniform sampler2D texture1;
uniform vec4 spriteColor;
uniform bool useTexture;
uniform bool useUVRect;
uniform vec4 uvRect;

void main() {
    vec2 texCoord = TexCoord;

    if (useUVRect) {
        texCoord = vec2(
        uvRect.x + TexCoord.x * uvRect.z,
        uvRect.y + TexCoord.y * uvRect.w
        );
    }

    if (useTexture) {
        FragColor = texture(texture1, texCoord) * spriteColor;
    } else {
        FragColor = spriteColor;
    }
}