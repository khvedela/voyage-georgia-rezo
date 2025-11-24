export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMirror;
  uniform vec4 uImpacts[6];
  uniform float uImpactLife;

  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vNormal;
  
  // Custom attribute to replace gl_VertexID logic
  attribute float vertIndex;
  attribute float bladeCenterY;

  float wave(float waveSize, float tipDistance, float centerDistance) {
    // Tip is the fifth vertex drawn per blade (index 4 in 0-4 range)
    bool isTip = (vertIndex == 4.0);

    float waveDistance = isTip ? tipDistance : centerDistance;
    return sin((uTime / 500.0) + waveSize) * waveDistance;
  }

  void main() {
    vPosition = position;
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    // Mirror the vertex vertically around the blade's center when requested.
    // This allows rendering a mirrored (bottom) copy without duplicating buffers.
    if (uMirror > 0.5) {
      vPosition.y = bladeCenterY - (vPosition.y - bladeCenterY);
      // invert the normal for the mirrored side so lighting behaves correctly
      vNormal = -vNormal;
    }

    // Avoid moving the base vertices (vertIndex 0 and 1 are ground base verts).
    // Apply horizontal waving only to non-base vertices so blades bend naturally.
    if (vertIndex != 0.0 && vertIndex != 1.0) {
      vPosition.x += wave(uv.x * 10.0, 0.3, 0.1);
    }

    vec4 worldPos = modelMatrix * vec4(vPosition, 1.0);

    // Ground / grass impact ripples — up to 6 impacts
    for (int i = 0; i < 6; i++) {
      vec4 imp = uImpacts[i];
      float strength = imp.w;
      if (strength > 0.0001) {
        float dt = (uTime - imp.z) / 1000.0; // uTime is milliseconds
        if (dt >= 0.0) {
          float dist = distance(vec2(worldPos.x, worldPos.z), vec2(imp.x, imp.y));
          float lifeFactor = max(0.0, 1.0 - (dt / uImpactLife));
          float decay = exp(-dist * 1.5);
          // ripple oscillation (fast initial jolt and fade)
          float waveVal = sin(dt * 12.5664) * 0.6; // 2*pi*2
          float disp = strength * lifeFactor * decay * waveVal;
          vPosition.y += disp;
        }
      }
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  uniform sampler2D uCloud;
  uniform vec3 uSunColor;

  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vNormal;

  vec3 green = vec3(0.2, 0.6, 0.3);

  void main() {
    // base grass color mixed a bit by vertex height -- use absolute height so
    // mirrored (bottom-side) blades use the same styling as top-side blades.
    vec3 color = mix(green * 0.7, green, clamp(abs(vPosition.y), 0.0, 1.0));

    // mix in cloud / noise map for variety
    color = mix(color, texture2D(uCloud, vUv).rgb * 0.92, 0.4);

    // warm tint from sunset — higher blades and more top-facing surfaces catch more sun
    // Use absolute vertical displacement to give bottom-facing blades similar
    // warm tint behavior as top blades.
    float sunFactor = clamp(abs(vPosition.y) * 0.18 + vUv.y * 0.12, 0.0, 1.0);
    vec3 sunTint = mix(color, uSunColor, 0.9);
    color = mix(color, sunTint, sunFactor * 0.55);

    // directional lighting look
    vec3 lightDir = normalize(vec3(0.4, 1.0, -0.2));
    // Make lighting behave symmetrically on both sides by taking absolute of
    // the dot product with the light direction (both faces will be lit similarly).
    float lighting = clamp(abs(dot(normalize(vNormal), lightDir)), 0.0, 1.0);

    gl_FragColor = vec4(color + lighting * 0.06, 1.0);
  }
`;
