uniform float uThickness;

varying vec3 vCenter;

void main() {

    vec3 afwidth = fwidth( vCenter.xyz );

    vec3 edge3 = smoothstep( ( uThickness - 1.0 ) * afwidth, uThickness * afwidth, vCenter.xyz );

    float edge = 1.0 - min( min( edge3.x, edge3.y ), edge3.z );

    gl_FragColor.rgb = gl_FrontFacing ? vec3( 0.0, 0.0, 0.0 ) : vec3( 0.34, 0.34, 0.34 );
    gl_FragColor.a = edge;

}