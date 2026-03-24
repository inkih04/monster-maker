#version 330 core
in vec2 TexCoord;
out vec4 FragColor;

uniform sampler2D texture1;
uniform vec4 spriteColor;
uniform bool useTexture;
uniform bool useUVRect;
uniform vec4 uvRect;
uniform int u_mode;
uniform float u_time;

vec4 getBase(vec2 tc) {
    if (useTexture) return texture(texture1, tc) * spriteColor;
    return spriteColor;
}

vec2 toLocal(vec2 tc) {
    if (useUVRect)
    return vec2((tc.x - uvRect.x) / uvRect.z, (tc.y - uvRect.y) / uvRect.w);
    return tc;
}

vec2 toAtlas(vec2 local) {
    if (useUVRect)
    return vec2(uvRect.x + local.x * uvRect.z, uvRect.y + local.y * uvRect.w);
    return local;
}

vec4 mode_default(vec4 base) { return base; }

vec4 mode_water(vec2 tc) {
    vec2 uv = toLocal(tc);

    float border = smoothstep(0.0, 0.10, uv.x)
    * smoothstep(1.0, 0.90, uv.x)
    * smoothstep(0.0, 0.10, uv.y)
    * smoothstep(1.0, 0.90, uv.y);

    float w1 = sin(uv.x * 5.0 + u_time * 0.6 + uv.y * 2.0) * 0.004;
    float w2 = sin(uv.y * 4.0 + u_time * 0.5 + uv.x * 3.0) * 0.003;
    vec2 distorted = clamp(uv + vec2(w1, w2) * border, vec2(0.0), vec2(1.0));

    vec4 base = getBase(toAtlas(distorted));

    float c1 = sin(uv.x * 6.0 + u_time * 0.8) * sin(uv.y * 5.0 + u_time * 0.6);
    float c2 = sin(uv.x * 4.0 - u_time * 0.5) * sin(uv.y * 7.0 + u_time * 0.4);
    float c3 = sin(uv.x * 9.0 + u_time * 0.3) * sin(uv.y * 3.0 - u_time * 0.7);

    float caustic = abs(c1) * 0.5 + abs(c2) * 0.3 + abs(c3) * 0.2;
    caustic = 0.95 + 0.08 * caustic;

    float glint = pow(max(0.0, c1 * c2), 3.0) * 0.12 * border;

    vec4 tint = vec4(0.88, 0.96, 1.0, 1.0);
    vec4 result = base * tint * caustic;
    result.rgb += glint;

    return result;
}



void main() {
    vec2 texCoord = TexCoord;
    if (useUVRect) {
        texCoord = vec2(
        uvRect.x + TexCoord.x * uvRect.z,
        uvRect.y + TexCoord.y * uvRect.w
        );
    }

    vec4 base = getBase(texCoord);

    if      (u_mode == 0) FragColor = mode_default(base);
    else if (u_mode == 1) FragColor = mode_water(texCoord);
    else                  FragColor = base;
}
