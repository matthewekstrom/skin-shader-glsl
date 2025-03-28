// will be interpolated into the fragment shader:
varying vec2 vST; // texture coords
varying vec3 vN; // normal vector
varying vec3 vL; // vector from point to light
varying vec3 vE; // vector from point to eye
varying vec3 vMC; // model coordinates

const vec3 LIGHTPOSITION = vec3(3., 2., 1.);

void main()
{
	vST = gl_MultiTexCoord0.st;
	vMC = gl_Vertex.xyz;
	vec4 ECposition = gl_ModelViewMatrix * gl_Vertex; // eye coordinate position
	vN = normalize(gl_NormalMatrix * gl_Normal); // normal vector
	vL = LIGHTPOSITION - ECposition.xyz; // vector from the point to the light position
	vE = vec3(0., 0., 0.) - ECposition.xyz; // vector from the point to the eye position
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}
