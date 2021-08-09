//---------------------------------------------------
// Metaballs in GLSL with distance fields
// 
// v1.0  2021-04-02  Initial version by Reine Larsson
// Thanks to mrange for improving distance fields
//---------------------------------------------------

#ifdef GL_ES
precision highp float;
#endif

varying vec2 v_texcoord;
uniform vec2 iResolution;
uniform float iTime;
uniform vec4 iMouse;

float circle(vec2 pos, float r) {
  return length(pos) - r;
}

// Polynominal smooth min, https://www.iquilezles.org/www/articles/smin/smin.htm
float pmin(float a, float b, float k) {
  float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
  return mix( b, a, h ) - k*h*(1.0-h);
}

// Creates a distance field of "metaballs"
float df(vec2 p) {
  float d = 1E6;
  for (int i = 0; i < 6; ++i) {
    float a = 1.2*(iTime + 2.0*float(i));
    float d0 = circle(p - vec2(cos(a), sin(a*sqrt(0.2))), 0.63);
    // Combine the circles with smooth min
    d = pmin(d, d0, 0.15);
  }
 
  for (int i = 0; i < 4; ++i) {
    d = abs(d) - 0.00093/d;
  }
  return d;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 q = fragCoord/iResolution.xy;
  vec2 p = -1.0 + 2.0*q;
  p.x *= iResolution.x/iResolution.y;
  float aa = 2.0/iResolution.y;
  vec3 col = vec3(0.2,0.2,0.2);
  float d = df(p);
  col = mix(col, vec3(1.0,0.2,0.0), smoothstep(-aa, aa, -d));
  fragColor = vec4(col, 1.0);
}

void main(void) { 
  mainImage(gl_FragColor, v_texcoord*iResolution.xy); 
}

