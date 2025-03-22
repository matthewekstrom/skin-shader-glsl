uniform sampler2D uTexUnit;
uniform float uKa, uKd, uKs; // coefficients of each type of lighting
uniform float uShininess; // specular exponent

uniform sampler3D Noise3;
uniform float uBumpAmplitude;
uniform float uBumpFrequency;

uniform float uSkinAmbient;
uniform float uSkinDiffuse;
uniform float uSkinInvertedDiffuse;
uniform float uSkinSpecular;
uniform float uSkinShininess;

// interpolated from the vertex shader:
varying vec2 vST; // texture coords
varying vec3 vN; // normal vector
varying vec3 vL; // vector from point to light
varying vec3 vE; // vector from point to eye
varying vec3 vMC; // model coordinates

const vec3 SPECULARCOLOR = vec3(1., 0.773, 0.502);
const vec3 SMOOTHINGCOLOR = vec3(1., 0.773, 0.502);
const vec3 SSSCOLOR = vec3(1., 0.541, 0.259);

vec3 PerturbNormal2(float angx, float angy, vec3 n)
{
    float cx = cos(angx);
    float sx = sin(angx);
    float cy = cos(angy);
    float sy = sin(angy);

    // Rotate about x:
    float yp = n.y*cx - n.z*sx; // y'
    n.z = n.y*sx + n.z*cx; // z'
    n.y = yp;

    // Rotate about y:
    float xp = n.x*cy + n.z*sy; // x'
    n.z = -n.x*sy + n.z*cy; // z'
    n.x = xp;

    return normalize(n);
}

void main()
{
    // Bump mapping with noise texture
    vec4 nvx = texture3D(Noise3, uBumpFrequency * vMC);
    float angx = nvx.r + nvx.g + nvx.b + nvx.a - 2.; // -1. to +1.
    angx *= uBumpAmplitude;

    vec4 nvy = texture3D(Noise3, uBumpFrequency * vec3(vMC.xy, vMC.z + 0.5));
    float angy = nvy.r + nvy.g + nvy.b + nvy.a - 2.; // -1. to +1.
    angy *= uBumpAmplitude;

    vec3 Normal = PerturbNormal2(angx, angy, vN);
    Normal = normalize(Normal);

    // Get texture color
    vec3 myColor = texture2D(uTexUnit, vST).rgb;
    myColor = mix(myColor, SMOOTHINGCOLOR, 0.1);

    // Calculate per-fragment lighting
    vec3 Light = normalize(vL);
    vec3 Eye = normalize(vE);

    vec3 ambient = uSkinAmbient * myColor;
    float dd = max(dot(Normal, Light), 0.); // only do diffuse if the light can see the point
    vec3 diffuse = uSkinDiffuse * dd * myColor;

    float s = 0.;
    if (dd > 0.) // only do specular if the light can see the point
    {
        vec3 ref = normalize(reflect(-Light, Normal));
        float cosphi = dot(Eye, ref);
        if (cosphi > 0.)
            s = pow(max(cosphi, 0.), uSkinShininess);
    }
    vec3 specular = uSkinSpecular * s * SPECULARCOLOR.rgb;

    // Inverted diffuse lighting, for a subsurface-scattering-like effect
    float ddInverse = max(dot(Normal, -Light), 0.);
    vec3 diffuseInverse = uSkinInvertedDiffuse * ddInverse * mix(myColor, SSSCOLOR, 0.5);

    // Add lighting values
    gl_FragColor = vec4(ambient + diffuse + diffuseInverse + specular, 1.);
}