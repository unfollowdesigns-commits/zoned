// The WebGL cosmos: a natal-chart astrolabe that follows the camera, travelling
// through a starfield with zodiac constellations and procedural planets.
// Pure three.js (no React) so it can be code-split and run outside React's render cycle.

import * as THREE from "three";
import {
  ASC,
  CHART_A,
  CHART_B,
  CONSTELLATIONS,
  HOUSES,
  NORTH_NODE,
  SIGNS,
  findAspects,
  type Body,
} from "./chart-data";
import { MODES, type SceneMode, type ModeParams } from "./modes";

export type EngineOptions = { reducedMotion: boolean; mobile: boolean; rtl: boolean; force?: boolean };
export type Engine = {
  setMode: (m: SceneMode, rtl: boolean) => void;
  dispose: () => void;
};

const TAU = Math.PI * 2;
const v3 = (hex: number) =>
  new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);
const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// ─────────────────────────────── GLSL ───────────────────────────────

const NOISE = /* glsl */ `
  float hash(vec3 p){ p = fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float noise(vec3 x){
    vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm(vec3 p){ float v=0.0; float a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }
`;

const nebulaShader = {
  vertex: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.9999,1.0); }`,
  fragment: /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime; uniform float uScroll; uniform vec2 uRes; uniform vec2 uMouse; uniform vec3 uTint;
    ${NOISE}
    void main(){
      vec2 p=(vUv-0.5)*vec2(uRes.x/uRes.y,1.0);
      p+=uMouse*0.025; p.y+=uScroll*0.45;
      float n=fbm(vec3(p*1.35,uTime*0.012));
      float n2=fbm(vec3(p*2.8-n*1.2+4.0,uTime*0.008));
      vec3 col=vec3(0.018,0.02,0.043);
      col=mix(col,vec3(0.13,0.10,0.27),smoothstep(0.42,0.95,n)*0.62);
      col+=vec3(0.30,0.19,0.15)*pow(smoothstep(0.48,1.0,n2),3.0)*0.32;
      col+=uTint*smoothstep(0.5,1.05,n*n2*1.6)*0.16;
      float vign=smoothstep(1.25,0.15,length(p*vec2(0.85,1.0)));
      col*=0.55+0.45*vign;
      gl_FragColor=vec4(col,1.0);
    }`,
};

const starShader = {
  vertex: /* glsl */ `
    attribute float aSize; attribute float aPhase; attribute vec3 aColor;
    uniform float uTime; uniform float uPR; uniform float uTwinkle;
    varying vec3 vColor; varying float vAlpha;
    void main(){
      vec4 mv=modelViewMatrix*vec4(position,1.0);
      float dist=-mv.z;
      gl_PointSize=aSize*uPR*clamp(140.0/dist,0.55,7.0);
      gl_Position=projectionMatrix*mv;
      float tw=0.62+0.38*sin(uTime*(0.5+aPhase*1.7)+aPhase*31.0);
      vAlpha=mix(1.0,tw,uTwinkle)*smoothstep(0.5,6.0,dist);
      vColor=aColor;
    }`,
  fragment: /* glsl */ `
    precision mediump float;
    varying vec3 vColor; varying float vAlpha;
    void main(){
      float d=length(gl_PointCoord-0.5);
      float halo=smoothstep(0.5,0.0,d);
      float core=smoothstep(0.14,0.0,d);
      float a=(halo*halo*0.55+core)*vAlpha;
      if(a<0.01) discard;
      gl_FragColor=vec4(vColor*a,a);
    }`,
};

// Lines with a per-vertex "t" (sweep angle or along-edge progress) for draw-in reveals.
const lineShader = {
  vertex: /* glsl */ `
    attribute float aT; attribute vec3 aColor;
    varying float vT; varying vec3 vColor;
    void main(){ vT=aT; vColor=aColor; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragment: /* glsl */ `
    precision mediump float;
    uniform vec3 uColor; uniform float uOpacity; uniform float uReveal; uniform float uUseVertexColor;
    varying float vT; varying vec3 vColor;
    void main(){
      float r=smoothstep(vT-0.015,vT,uReveal);
      float a=uOpacity*r;
      if(a<0.003) discard;
      vec3 c=mix(uColor,vColor,uUseVertexColor);
      gl_FragColor=vec4(c*a,a);
    }`,
};

const planetShader = {
  vertex: /* glsl */ `
    varying vec3 vN; varying vec3 vW; varying vec3 vObj;
    void main(){
      vObj=position;
      vN=normalize(mat3(modelMatrix)*normal);
      vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz;
      gl_Position=projectionMatrix*viewMatrix*w;
    }`,
  fragment: /* glsl */ `
    precision highp float;
    varying vec3 vN; varying vec3 vW; varying vec3 vObj;
    uniform vec3 uA; uniform vec3 uB; uniform vec3 uAtmo; uniform vec3 uLight;
    uniform float uBands; uniform float uCraters; uniform float uTime; uniform float uRadius; uniform float uFade;
    ${NOISE}
    void main(){
      vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vW); vec3 L=normalize(uLight);
      vec3 q=vObj/uRadius;
      float turb=fbm(q*3.0+vec3(uTime*0.01,0.0,0.0));
      float bands=0.5+0.5*sin(q.y*uBands+turb*3.2);
      float detail=fbm(q*9.0);
      vec3 base=mix(uA,uB,mix(detail,bands,step(0.5,uBands/20.0)));
      if(uCraters>0.0){
        float c=smoothstep(0.55,0.75,fbm(q*6.0+11.0));
        base*=1.0-c*0.35*uCraters;
        base+=vec3(0.04)*smoothstep(0.62,0.66,fbm(q*6.0+11.0))*uCraters;
      }
      float diff=smoothstep(-0.25,0.9,dot(N,L));
      float fres=pow(1.0-max(dot(N,V),0.0),2.6);
      vec3 col=base*(0.035+diff*1.05);
      col+=uAtmo*fres*(0.25+diff*0.9);
      gl_FragColor=vec4(col*uFade,uFade);
    }`,
};

const ringShader = {
  vertex: /* glsl */ `varying vec3 vP; varying vec3 vW; void main(){ vP=position; vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
  fragment: /* glsl */ `
    precision highp float;
    varying vec3 vP; varying vec3 vW;
    uniform float uInner; uniform float uOuter; uniform vec3 uColor; uniform float uFade;
    ${NOISE}
    void main(){
      float r=(length(vP.xy)-uInner)/(uOuter-uInner);
      float bands=0.55+0.45*sin(r*90.0+noise(vec3(r*40.0,0.0,0.0))*4.0);
      float gap=smoothstep(0.52,0.55,r)*(1.0-smoothstep(0.58,0.61,r));
      float a=bands*smoothstep(0.0,0.08,r)*smoothstep(1.0,0.85,r)*(1.0-gap*0.85)*0.55;
      a*=uFade;
      gl_FragColor=vec4(uColor*a,a);
    }`,
};

// ─────────────────────────────── helpers ───────────────────────────────

type Disposable = { dispose: () => void };

class LineBuilder {
  pos: number[] = [];
  t: number[] = [];
  col: number[] = [];
  seg(ax: number, ay: number, az: number, bx: number, by: number, bz: number, ta: number, tb = ta, c: THREE.Vector3 = new THREE.Vector3(1, 1, 1)) {
    this.pos.push(ax, ay, az, bx, by, bz);
    this.t.push(ta, tb);
    this.col.push(c.x, c.y, c.z, c.x, c.y, c.z);
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("aT", new THREE.Float32BufferAttribute(this.t, 1));
    g.setAttribute("aColor", new THREE.Float32BufferAttribute(this.col, 3));
    return g;
  }
}

function lineMaterial(color: number, opacity: number, useVertexColor = false) {
  return new THREE.ShaderMaterial({
    vertexShader: lineShader.vertex,
    fragmentShader: lineShader.fragment,
    uniforms: {
      uColor: { value: v3(color) },
      uOpacity: { value: opacity },
      uReveal: { value: 0 },
      uUseVertexColor: { value: useVertexColor ? 1 : 0 },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
}

const GLYPH_FONT = `"Segoe UI Symbol","Apple Symbols","Noto Sans Symbols 2","Noto Sans Symbols","DejaVu Sans","Arial Unicode MS",serif`;

function glyphTexture(glyph: string, cache: Map<string, THREE.Texture>): THREE.Texture {
  const hit = cache.get(glyph);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `76px ${GLYPH_FONT}`;
  ctx.shadowColor = "rgba(255,240,210,0.9)";
  ctx.shadowBlur = 10;
  ctx.fillText(`${glyph}︎`, 64, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(glyph, tex);
  return tex;
}

function glowTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.15, "rgba(255,244,220,0.55)");
  g.addColorStop(0.45, "rgba(255,230,190,0.12)");
  g.addColorStop(1, "rgba(255,230,190,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Chart longitude → angle on screen. Ascendant sits on the left, zodiac runs counter-clockwise. */
const lonToAngle = (lon: number) => Math.PI + ((lon - ASC) * Math.PI) / 180;

// ─────────────────────────────── wheel ───────────────────────────────

type Wheel = {
  group: THREE.Group;
  structure: THREE.ShaderMaterial;
  ticks: THREE.ShaderMaterial;
  aspects: THREE.ShaderMaterial;
  glyphs: THREE.SpriteMaterial[];
  planetGlyphs: { mat: THREE.SpriteMaterial; sprite: THREE.Sprite; body: Body }[];
  glows: { sprite: THREE.Sprite; mat: THREE.SpriteMaterial; key: string }[];
};

function buildWheel(
  bodies: Body[],
  color: number,
  opts: { houses: boolean; glyphCache: Map<string, THREE.Texture>; glow: THREE.Texture; track: (d: Disposable) => void },
): Wheel {
  const group = new THREE.Group();
  const gold = color;
  const R = { aspect: 1.0, house: 1.55, zIn: 2.05, zOut: 2.5, deg: 2.62 };

  // Structure: rings, sign boundaries, house cusps.
  const s = new LineBuilder();
  const circle = (r: number, z = 0, segs = 256) => {
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * TAU;
      const a1 = ((i + 1) / segs) * TAU;
      s.seg(Math.cos(a0) * r, Math.sin(a0) * r, z, Math.cos(a1) * r, Math.sin(a1) * r, z, i / segs, (i + 1) / segs);
    }
  };
  circle(R.aspect);
  circle(R.zIn);
  circle(R.zOut);
  circle(R.zOut + 0.012);
  circle(R.deg, 0.02);
  if (opts.houses) circle(R.house);
  circle(0.08);
  for (let i = 0; i < 12; i++) {
    const a = lonToAngle(i * 30);
    const t = (((a % TAU) + TAU) % TAU) / TAU;
    s.seg(Math.cos(a) * R.zIn, Math.sin(a) * R.zIn, 0, Math.cos(a) * R.deg, Math.sin(a) * R.deg, 0, t);
  }
  if (opts.houses) {
    HOUSES.forEach((lon, i) => {
      const a = lonToAngle(lon);
      const t = (((a % TAU) + TAU) % TAU) / TAU;
      const angular = i % 3 === 0;
      const r1 = angular ? R.deg + 0.42 : R.zIn;
      s.seg(Math.cos(a) * R.aspect, Math.sin(a) * R.aspect, 0, Math.cos(a) * r1, Math.sin(a) * r1, 0, t);
    });
  }
  const structure = lineMaterial(gold, 0.55);
  const structureGeo = s.geometry();
  group.add(new THREE.LineSegments(structureGeo, structure));
  opts.track(structureGeo);
  opts.track(structure);

  // 360 degree ticks — the signature of a degree-precise practice.
  const k = new LineBuilder();
  for (let d = 0; d < 360; d++) {
    const a = lonToAngle(d);
    const len = d % 10 === 0 ? 0.11 : d % 5 === 0 ? 0.075 : 0.04;
    const t = (((a % TAU) + TAU) % TAU) / TAU;
    k.seg(Math.cos(a) * R.zOut, Math.sin(a) * R.zOut, 0.01, Math.cos(a) * (R.zOut + len), Math.sin(a) * (R.zOut + len), 0.01, t);
  }
  const ticks = lineMaterial(gold, 0.45);
  const ticksGeo = k.geometry();
  group.add(new THREE.LineSegments(ticksGeo, ticks));
  opts.track(ticksGeo);
  opts.track(ticks);

  // Sign glyphs.
  const glyphs: THREE.SpriteMaterial[] = [];
  SIGNS.forEach((g, i) => {
    const a = lonToAngle(i * 30 + 15);
    const mat = new THREE.SpriteMaterial({
      map: glyphTexture(g, opts.glyphCache),
      color: new THREE.Color(gold),
      transparent: true,
      depthTest: false,
      depthWrite: false,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const sp = new THREE.Sprite(mat);
    const r = (R.zIn + R.zOut) / 2;
    sp.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.02);
    sp.scale.setScalar(0.24);
    group.add(sp);
    glyphs.push(mat);
    opts.track(mat);
  });

  // Planets: glyph, exact-degree marker, connector, glow.
  const p = new LineBuilder();
  const planetGlyphs: Wheel["planetGlyphs"] = [];
  const glows: Wheel["glows"] = [];
  bodies.forEach((b) => {
    const a = lonToAngle(b.lon);
    const t = (((a % TAU) + TAU) % TAU) / TAU;
    p.seg(Math.cos(a) * 1.94, Math.sin(a) * 1.94, 0, Math.cos(a) * R.zIn, Math.sin(a) * R.zIn, 0, t);
    p.seg(Math.cos(a) * R.aspect, Math.sin(a) * R.aspect, 0, Math.cos(a) * (R.aspect + 0.06), Math.sin(a) * (R.aspect + 0.06), 0, t);
    const mat = new THREE.SpriteMaterial({
      map: glyphTexture(b.glyph, opts.glyphCache),
      color: new THREE.Color(0xf6ead2),
      transparent: true,
      depthTest: false,
      depthWrite: false,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const sp = new THREE.Sprite(mat);
    sp.position.set(Math.cos(a) * 1.78, Math.sin(a) * 1.78, 0.05);
    sp.scale.setScalar(0.22);
    group.add(sp);
    planetGlyphs.push({ mat, sprite: sp, body: b });
    opts.track(mat);

    const gmat = new THREE.SpriteMaterial({
      map: opts.glow,
      color: new THREE.Color(b.key === "moon" ? 0xd9dcff : b.key === "sun" ? 0xffe2a8 : 0xf2d9a8),
      transparent: true,
      depthTest: false,
      depthWrite: false,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const gs = new THREE.Sprite(gmat);
    gs.position.set(Math.cos(a) * R.zIn, Math.sin(a) * R.zIn, 0.04);
    gs.scale.setScalar(0.22);
    group.add(gs);
    glows.push({ sprite: gs, mat: gmat, key: b.key });
    opts.track(gmat);
  });
  const pGeo = p.geometry();
  const pMat = lineMaterial(0xf6ead2, 0.6);
  group.add(new THREE.LineSegments(pGeo, pMat));
  opts.track(pGeo);
  opts.track(pMat);
  // planet connectors share the structure reveal
  pMat.uniforms.uReveal = structure.uniforms.uReveal;

  // Aspect lines inside the inner circle.
  const asp = new LineBuilder();
  const colors = { trine: v3(0x9fb4ff), sextile: v3(0x8fd6c8), square: v3(0xe0909e), opposition: v3(0xe6b977) };
  findAspects(bodies).forEach(({ a, b, type }, i, arr) => {
    const aa = lonToAngle(a.lon);
    const ab = lonToAngle(b.lon);
    const steps = 24;
    const offset = (i / arr.length) * 0.35;
    for (let sIdx = 0; sIdx < steps; sIdx++) {
      const t0 = sIdx / steps;
      const t1 = (sIdx + 1) / steps;
      const x0 = Math.cos(aa) * R.aspect * (1 - t0) + Math.cos(ab) * R.aspect * t0;
      const y0 = Math.sin(aa) * R.aspect * (1 - t0) + Math.sin(ab) * R.aspect * t0;
      const x1 = Math.cos(aa) * R.aspect * (1 - t1) + Math.cos(ab) * R.aspect * t1;
      const y1 = Math.sin(aa) * R.aspect * (1 - t1) + Math.sin(ab) * R.aspect * t1;
      asp.seg(x0, y0, 0, x1, y1, 0, offset + t0 * 0.65, offset + t1 * 0.65, colors[type]);
    }
  });
  const aspects = lineMaterial(0xffffff, 0.75, true);
  const aGeo = asp.geometry();
  group.add(new THREE.LineSegments(aGeo, aspects));
  opts.track(aGeo);
  opts.track(aspects);

  return { group, structure, ticks, aspects, glyphs, planetGlyphs, glows };
}

// ─────────────────────────────── engine ───────────────────────────────

export function createEngine(canvas: HTMLCanvasElement, options: EngineOptions): Engine {
  const disposables: Disposable[] = [];
  const track = (d: Disposable) => disposables.push(d);
  const glyphCache = new Map<string, THREE.Texture>();
  let rtl = options.rtl;
  const reduced = options.reducedMotion;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
    // Software-only GL would make the page janky; the caller falls back to the static sky instead.
    failIfMajorPerformanceCaveat: !options.force,
  });
  // Some browsers emulate WebGL on the CPU (no GPU, headless, remote desktops): use the static sky there.
  {
    const gl = renderer.getContext();
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    if (!options.force && /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i.test(name)) {
      renderer.dispose();
      throw new Error(`Software WebGL renderer (${name})`);
    }
  }
  renderer.setClearColor(0x05060c, 1);
  const maxPR = options.mobile ? 1.5 : 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPR));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1400);
  camera.position.set(0, 0, 12);
  scene.add(camera);

  // Nebula backdrop (screen-space).
  const nebulaMat = new THREE.ShaderMaterial({
    vertexShader: nebulaShader.vertex,
    fragmentShader: nebulaShader.fragment,
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2() },
      uTint: { value: v3(0x6b5cc4) },
    },
    depthWrite: false,
    depthTest: false,
  });
  const nebulaGeo = new THREE.PlaneGeometry(2, 2);
  const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
  nebula.frustumCulled = false;
  nebula.renderOrder = -10;
  scene.add(nebula);
  track(nebulaMat);
  track(nebulaGeo);

  // Starfield along the travel path + a far shell.
  const starCount = options.mobile ? 2600 : 6500;
  const sPos = new Float32Array(starCount * 3);
  const sSize = new Float32Array(starCount);
  const sPhase = new Float32Array(starCount);
  const sCol = new Float32Array(starCount * 3);
  const warm = v3(0xffe6c0);
  const cool = v3(0xc8d4ff);
  const white = v3(0xffffff);
  for (let i = 0; i < starCount; i++) {
    const far = i < starCount * 0.28;
    if (far) {
      const u = Math.random() * 2 - 1;
      const th = Math.random() * TAU;
      const r = 420 + Math.random() * 60;
      const sq = Math.sqrt(1 - u * u);
      sPos.set([r * sq * Math.cos(th), r * u, r * sq * Math.sin(th) - 150], i * 3);
    } else {
      // Milky-way-like density band tilted across the path.
      const band = Math.random() < 0.45;
      const th = Math.random() * TAU;
      const r = 7 + Math.pow(Math.random(), 0.75) * 95;
      const x = Math.cos(th) * r;
      let y = Math.sin(th) * r;
      if (band) y = y * 0.18 + x * 0.32;
      sPos.set([x, y, 40 - Math.random() * 360], i * 3);
    }
    const big = Math.random() < 0.025;
    sSize[i] = big ? 3.2 + Math.random() * 2.5 : 0.7 + Math.pow(Math.random(), 2.2) * 2.2;
    sPhase[i] = Math.random();
    const m = Math.random();
    const c = m < 0.25 ? warm : m < 0.5 ? cool : white;
    sCol.set([c.x, c.y, c.z], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  starGeo.setAttribute("aSize", new THREE.BufferAttribute(sSize, 1));
  starGeo.setAttribute("aPhase", new THREE.BufferAttribute(sPhase, 1));
  starGeo.setAttribute("aColor", new THREE.BufferAttribute(sCol, 3));
  const starMat = new THREE.ShaderMaterial({
    vertexShader: starShader.vertex,
    fragmentShader: starShader.fragment,
    uniforms: { uTime: { value: 0 }, uPR: { value: renderer.getPixelRatio() }, uTwinkle: { value: reduced ? 0 : 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(starGeo, starMat);
  stars.frustumCulled = false;
  scene.add(stars);
  track(starGeo);
  track(starMat);

  // Constellations placed along the journey; they draw in as the camera approaches.
  const glow = glowTexture();
  track(glow);
  const constellations: { mat: THREE.ShaderMaterial; starMat: THREE.ShaderMaterial; z: number }[] = [];
  CONSTELLATIONS.forEach((c, idx) => {
    const side = idx % 2 === 0 ? -1 : 1;
    const z = -60 - idx * 38;
    const origin = new THREE.Vector3(side * (17 + (idx % 3) * 4), ((idx * 7) % 13) - 5, z);
    const scale = 9 + (idx % 3) * 2;
    const rot = (idx * 0.7) % 1.2 - 0.6;
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    const place = (x: number, y: number) =>
      new THREE.Vector3(origin.x + (x * cr - y * sr) * scale, origin.y + (x * sr + y * cr) * scale, origin.z + x * 2);
    const lb = new LineBuilder();
    c.edges.forEach(([a, b], ei) => {
      const A = place(c.stars[a][0], c.stars[a][1]);
      const B = place(c.stars[b][0], c.stars[b][1]);
      const t0 = ei / c.edges.length;
      const t1 = (ei + 1) / c.edges.length;
      lb.seg(A.x, A.y, A.z, B.x, B.y, B.z, t0, t1);
    });
    const geo = lb.geometry();
    const mat = lineMaterial(0xcfae76, 0.42);
    mat.depthTest = true;
    scene.add(new THREE.LineSegments(geo, mat));
    track(geo);
    track(mat);

    const pts = new Float32Array(c.stars.length * 3);
    const sz = new Float32Array(c.stars.length);
    const ph = new Float32Array(c.stars.length);
    const cl = new Float32Array(c.stars.length * 3);
    c.stars.forEach(([x, y, m], i) => {
      const P = place(x, y);
      pts.set([P.x, P.y, P.z], i * 3);
      sz[i] = 3 + m * 3.2;
      ph[i] = Math.random();
      cl.set([1, 0.93, 0.8], i * 3);
    });
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    sg.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
    sg.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
    sg.setAttribute("aColor", new THREE.BufferAttribute(cl, 3));
    const sm = starMat.clone();
    sm.uniforms.uPR = starMat.uniforms.uPR;
    sm.uniforms.uTime = starMat.uniforms.uTime;
    const sp = new THREE.Points(sg, sm);
    sp.frustumCulled = false;
    scene.add(sp);
    track(sg);
    track(sm);
    constellations.push({ mat, starMat: sm, z });
  });

  // Procedural planets.
  const light = new THREE.Vector3(-0.6, 0.35, 0.7).normalize();
  // Planets sit off the travel axis and fade in as the camera approaches, so they frame the content.
  const planetDefs = [
    { pos: [21, -6, -72], r: 5, a: 0xc9a86f, b: 0x6d5536, atmo: 0xf3d9a4, bands: 26, craters: 0, ring: true },
    { pos: [-19, 7, -140], r: 3.4, a: 0xb9b5b0, b: 0x5e5a58, atmo: 0xcdd6ff, bands: 0, craters: 1, ring: false },
    { pos: [24, 9, -212], r: 6, a: 0x3b4fa8, b: 0x1b2357, atmo: 0x8fa6ff, bands: 14, craters: 0, ring: false },
    { pos: [-18, -9, -268], r: 2.8, a: 0xd8a59c, b: 0x8d5c62, atmo: 0xffc9c2, bands: 0, craters: 0, ring: false },
  ];
  const planetMeshes: THREE.Mesh[] = [];
  const planetFades: { pos: THREE.Vector3; fade: { value: number }; halo: THREE.SpriteMaterial }[] = [];
  const sphereGeo = new THREE.SphereGeometry(1, options.mobile ? 48 : 96, options.mobile ? 32 : 64);
  track(sphereGeo);
  planetDefs.forEach((d) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: planetShader.vertex,
      fragmentShader: planetShader.fragment,
      uniforms: {
        uA: { value: v3(d.a) },
        uB: { value: v3(d.b) },
        uAtmo: { value: v3(d.atmo) },
        uLight: { value: light },
        uBands: { value: d.bands },
        uCraters: { value: d.craters },
        uTime: starMat.uniforms.uTime,
        uRadius: { value: 1 },
        uFade: { value: 0 },
      },
      transparent: true,
    });
    const mesh = new THREE.Mesh(sphereGeo, mat);
    mesh.position.set(d.pos[0], d.pos[1], d.pos[2]);
    mesh.scale.setScalar(d.r);
    mesh.rotation.z = 0.35;
    scene.add(mesh);
    planetMeshes.push(mesh);
    track(mat);

    const halo = new THREE.SpriteMaterial({
      map: glow,
      color: new THREE.Color(d.atmo),
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const hs = new THREE.Sprite(halo);
    hs.position.copy(mesh.position);
    hs.scale.setScalar(d.r * 4.2);
    scene.add(hs);
    track(halo);
    planetFades.push({ pos: mesh.position, fade: mat.uniforms.uFade, halo });

    if (d.ring) {
      const inner = 1.35;
      const outer = 2.35;
      const rg = new THREE.RingGeometry(inner, outer, 160, 1);
      const rm = new THREE.ShaderMaterial({
        vertexShader: ringShader.vertex,
        fragmentShader: ringShader.fragment,
        uniforms: { uInner: { value: inner }, uOuter: { value: outer }, uColor: { value: v3(0xe2c999) }, uFade: mat.uniforms.uFade },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(rg, rm);
      ring.rotation.x = -1.18;
      ring.rotation.y = 0.32;
      mesh.add(ring);
      track(rg);
      track(rm);
    }
  });

  // ── The astrolabe (child of the camera so it stays composed on screen) ──
  const wheelRoot = new THREE.Group();
  camera.add(wheelRoot);
  const wheelA = buildWheel(CHART_A, 0xcfae76, { houses: true, glyphCache, glow, track });
  const wheelB = buildWheel(CHART_B, 0xa59ce6, { houses: false, glyphCache, glow, track });
  wheelRoot.add(wheelA.group);
  wheelRoot.add(wheelB.group);

  // Armillary rings around the wheel for real depth.
  const armillary: THREE.LineSegments[] = [];
  const armMat = lineMaterial(0xcfae76, 0.22);
  armMat.uniforms.uReveal.value = 1;
  track(armMat);
  [3.05, 3.3, 3.55].forEach((r, i) => {
    const lb = new LineBuilder();
    const segs = 220;
    for (let s = 0; s < segs; s++) {
      if (i === 2 && s % 4 > 1) continue; // dashed outer ring
      const a0 = (s / segs) * TAU;
      const a1 = ((s + 1) / segs) * TAU;
      lb.seg(Math.cos(a0) * r, Math.sin(a0) * r, 0, Math.cos(a1) * r, Math.sin(a1) * r, 0, 0);
    }
    const g = lb.geometry();
    track(g);
    const l = new THREE.LineSegments(g, armMat);
    l.rotation.set(i === 0 ? 1.2 : 0.3, i === 1 ? 1.1 : 0.2, i * 0.6);
    wheelRoot.add(l);
    armillary.push(l);
  });

  // Lunar nodes axis (karmic mode).
  const nodesMat = lineMaterial(0xe8b7a6, 0);
  track(nodesMat);
  {
    const lb = new LineBuilder();
    const a = lonToAngle(NORTH_NODE);
    const steps = 40;
    for (let s = 0; s < steps; s++) {
      const r0 = -2.9 + (5.8 * s) / steps;
      const r1 = -2.9 + (5.8 * (s + 1)) / steps;
      lb.seg(Math.cos(a) * r0, Math.sin(a) * r0, 0.06, Math.cos(a) * r1, Math.sin(a) * r1, 0.06, s / steps, (s + 1) / steps);
    }
    const g = lb.geometry();
    track(g);
    wheelA.group.add(new THREE.LineSegments(g, nodesMat));
  }
  const nodeGlyphs = (["☊", "☋"] as const).map((gl, i) => {
    const mat = new THREE.SpriteMaterial({
      map: glyphTexture(gl, glyphCache),
      color: new THREE.Color(0xf0c4b4),
      transparent: true,
      depthTest: false,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    track(mat);
    const sp = new THREE.Sprite(mat);
    const a = lonToAngle(NORTH_NODE + i * 180);
    sp.position.set(Math.cos(a) * 3.1, Math.sin(a) * 3.1, 0.06);
    sp.scale.setScalar(0.34);
    wheelA.group.add(sp);
    return mat;
  });

  // Progression spiral (progressed mode).
  const spiralMat = lineMaterial(0xb7aef0, 0);
  track(spiralMat);
  {
    const lb = new LineBuilder();
    const steps = 520;
    const turns = 3.25;
    for (let s = 0; s < steps; s++) {
      const t0 = s / steps;
      const t1 = (s + 1) / steps;
      const r0 = 0.12 + t0 * 2.3;
      const r1 = 0.12 + t1 * 2.3;
      const a0 = t0 * turns * TAU;
      const a1 = t1 * turns * TAU;
      lb.seg(Math.cos(a0) * r0, Math.sin(a0) * r0, 0.08, Math.cos(a1) * r1, Math.sin(a1) * r1, 0.08, t0, t1);
    }
    const g = lb.geometry();
    track(g);
    wheelA.group.add(new THREE.LineSegments(g, spiralMat));
  }
  const progMoonMat = new THREE.SpriteMaterial({
    map: glow,
    color: new THREE.Color(0xdcdfff),
    transparent: true,
    depthTest: false,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  track(progMoonMat);
  const progMoon = new THREE.Sprite(progMoonMat);
  progMoon.scale.setScalar(0.5);
  wheelA.group.add(progMoon);

  // Healing pulses.
  const pulseMat = lineMaterial(0xecd39f, 0);
  pulseMat.uniforms.uReveal.value = 1;
  track(pulseMat);
  const pulses: THREE.LineSegments[] = [];
  {
    const lb = new LineBuilder();
    for (let s = 0; s < 200; s++) {
      const a0 = (s / 200) * TAU;
      const a1 = ((s + 1) / 200) * TAU;
      lb.seg(Math.cos(a0), Math.sin(a0), 0, Math.cos(a1), Math.sin(a1), 0, 0);
    }
    const g = lb.geometry();
    track(g);
    for (let i = 0; i < 3; i++) {
      const mats = pulseMat.clone();
      mats.uniforms.uReveal.value = 1;
      track(mats);
      const l = new THREE.LineSegments(g, mats);
      wheelA.group.add(l);
      pulses.push(l);
    }
  }

  // ─────────────────────────── state ───────────────────────────

  let width = 1;
  let height = 1;
  let mode: SceneMode = "home";
  const p: ModeParams = { ...MODES.home };
  let scrollTarget = 0;
  let scroll = 0;
  let travel = 120;
  const mouse = new THREE.Vector2();
  const mouseTarget = new THREE.Vector2();
  let intro = reduced ? 1 : 0;
  const startedAt = performance.now();
  let time = 0;
  let last = performance.now();
  let raf = 0;
  let running = true;
  let dirty = true;
  // Adaptive quality: watch real frame times and step down resolution / frame rate on slow devices.
  let perfFrames = 0;
  let perfTotal = 0;
  let quality = 2; // 2 = full, 1 = reduced pixel ratio, 0 = capped at ~24 fps
  let lastRender = 0;

  function resize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    nebulaMat.uniforms.uRes.value.set(width, height);
    measure();
    dirty = true;
  }

  function measure() {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    travel = Math.min(270, Math.max(60, (doc.scrollHeight / Math.max(1, window.innerHeight)) * 34));
    scrollTarget = reduced ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
  }

  const onScroll = () => {
    measure();
    dirty = true;
  };
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    mouseTarget.set((e.clientX / width) * 2 - 1, -((e.clientY / height) * 2 - 1));
  };
  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  const bodyRO = new ResizeObserver(measure);
  bodyRO.observe(document.body);
  resize();

  function target(): ModeParams {
    const base = MODES[mode];
    const narrow = width / height < 0.85;
    const t: ModeParams = { ...base };
    if (narrow) {
      // Phones: centre the wheel above the text and keep it quieter on inner pages.
      t.x = 0;
      t.y = mode === "home" ? 1.2 : 1.3;
      t.scale = base.scale * Math.min(1, (width / height) * 1.35) * (mode === "degrees" ? 0.55 : 1);
      if (mode !== "home") t.opacity = base.opacity * 0.55;
    } else if (rtl) {
      t.x = -base.x;
    }
    return t;
  }

  function frame(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const rawDt = now - last;
    if (quality === 0 && now - lastRender < 41) return;
    lastRender = now;
    const dt = Math.min(0.05, rawDt / 1000);
    last = now;
    if (quality > 0 && !reduced) {
      perfFrames++;
      perfTotal += rawDt;
      if (perfFrames === 90) {
        if (perfTotal / perfFrames > 30) {
          quality--;
          if (quality === 1) {
            renderer.setPixelRatio(1);
            starMat.uniforms.uPR.value = 1;
            resize();
          }
        }
        perfFrames = 0;
        perfTotal = 0;
      }
    }
    if (reduced && !dirty) return;
    dirty = false;
    if (!reduced) time += dt;

    // Smooth inputs.
    const k = reduced ? 1000 : 1;
    scroll = damp(scroll, scrollTarget, 3.2 * k, dt);
    mouse.x = damp(mouse.x, mouseTarget.x, 2.4 * k, dt);
    mouse.y = damp(mouse.y, mouseTarget.y, 2.4 * k, dt);
    // Wall-clock based so slow devices still finish the reveal on time.
    intro = reduced ? 1 : Math.min(1, (now - startedAt) / 4200);
    const tp = target();
    (Object.keys(p) as (keyof ModeParams)[]).forEach((key) => {
      if (key === "tint") return;
      (p[key] as number) = damp(p[key] as number, tp[key] as number, 2.2 * k, dt);
    });
    const tint = nebulaMat.uniforms.uTint.value as THREE.Vector3;
    tint.x = damp(tint.x, tp.tint[0], 1.5 * k, dt);
    tint.y = damp(tint.y, tp.tint[1], 1.5 * k, dt);
    tint.z = damp(tint.z, tp.tint[2], 1.5 * k, dt);

    // Camera journey.
    camera.position.set(mouse.x * 0.9, mouse.y * 0.55 - scroll * 4, 12 - scroll * travel);
    camera.rotation.set(mouse.y * 0.035 - scroll * 0.08, -mouse.x * 0.05, Math.sin(time * 0.05) * 0.02);

    // Wheel composition.
    const ease = 1 - Math.pow(1 - intro, 3);
    const homeFade = mode === "home" ? 1 - smoothstep(0.02, 0.12, scroll) * 0.8 : 1 - smoothstep(0.05, 0.35, scroll) * 0.55;
    wheelRoot.position.set(p.x - mouse.x * 0.18, p.y + (mode === "home" ? scroll * 3.2 : scroll * 1.2) - mouse.y * 0.1, -8);
    wheelRoot.scale.setScalar(p.scale * (0.86 + 0.14 * ease) * (1 + scroll * 0.25));
    wheelRoot.rotation.x = p.tilt - scroll * 0.9;
    wheelRoot.rotation.y = mouse.x * 0.08 + (rtl ? 0.12 : -0.12) * Math.min(1, Math.abs(p.x) / 3);

    const spin = time * 0.012 + scroll * Math.PI * 0.6;
    const opacity = p.opacity * homeFade * ease;
    const sweep = reduced ? 1 : Math.min(1, intro * 1.25);

    wheelA.group.rotation.z = spin;
    wheelA.group.position.x = -p.wheelB * 1.25;
    wheelA.group.scale.setScalar(1 - p.wheelB * 0.25);
    wheelB.group.rotation.z = -spin * 0.8 + 0.4;
    wheelB.group.position.x = p.wheelB * 1.25;
    wheelB.group.scale.setScalar(1 - p.wheelB * 0.25);

    const applyWheel = (w: Wheel, o: number) => {
      w.structure.uniforms.uOpacity.value = 0.55 * o;
      w.structure.uniforms.uReveal.value = sweep;
      w.ticks.uniforms.uOpacity.value = 0.42 * o * p.ticks;
      w.ticks.uniforms.uReveal.value = Math.max(0, sweep * 1.1 - 0.1);
      w.aspects.uniforms.uOpacity.value = 0.75 * o * p.aspects;
      w.aspects.uniforms.uReveal.value = reduced ? 1 : Math.max(0, Math.min(1, (intro - 0.45) * 1.9));
      const gOp = o * smoothstep(0.35, 0.8, intro);
      w.glyphs.forEach((m) => (m.opacity = 0.75 * gOp));
      w.planetGlyphs.forEach(({ mat }) => (mat.opacity = 0.95 * gOp));
      w.glows.forEach(({ sprite, mat, key }, i) => {
        const moonBoost = key === "moon" ? p.moonGlow : 0;
        const pulse = 0.75 + 0.25 * Math.sin(time * 1.3 + i * 1.7);
        mat.opacity = gOp * (0.55 + p.pulse * 0.45 * pulse + moonBoost * 0.6);
        sprite.scale.setScalar(0.24 + moonBoost * 0.55 + p.pulse * 0.18 * pulse);
      });
    };
    applyWheel(wheelA, opacity);
    applyWheel(wheelB, opacity * p.wheelB);

    armMat.uniforms.uOpacity.value = 0.2 * opacity;
    armillary.forEach((l, i) => {
      l.rotation.z += dt * (0.02 + i * 0.012) * (i % 2 ? -1 : 1);
      l.rotation.x += dt * 0.01 * (i + 1);
    });

    nodesMat.uniforms.uOpacity.value = 0.7 * opacity * p.nodes;
    nodesMat.uniforms.uReveal.value = p.nodes;
    nodeGlyphs.forEach((m) => (m.opacity = opacity * p.nodes));

    spiralMat.uniforms.uOpacity.value = 0.5 * opacity * p.spiral;
    spiralMat.uniforms.uReveal.value = p.spiral;
    const pm = (time * 0.035) % 1;
    const pmA = pm * TAU;
    progMoon.position.set(Math.cos(pmA) * 2.3, Math.sin(pmA) * 2.3, 0.1);
    progMoonMat.opacity = opacity * p.spiral * 0.95;

    pulses.forEach((l, i) => {
      const ph = (time * 0.16 + i / 3) % 1;
      l.scale.setScalar(0.3 + ph * 3.0);
      (l.material as THREE.ShaderMaterial).uniforms.uOpacity.value = opacity * p.pulse * 0.45 * (1 - ph) * smoothstep(0, 0.1, ph);
    });

    // World.
    constellations.forEach((c) => {
      const d = camera.position.z - c.z;
      const reveal = smoothstep(95, 40, d);
      c.mat.uniforms.uReveal.value = reveal;
      c.mat.uniforms.uOpacity.value = 0.42 * smoothstep(-6, 8, d);
      c.starMat.uniforms.uTwinkle.value = reduced ? 0 : 0.6;
    });
    planetMeshes.forEach((m, i) => (m.rotation.y = time * (0.02 + i * 0.006)));
    planetFades.forEach((pf) => {
      const d = camera.position.z - pf.pos.z;
      const f = smoothstep(92, 58, d) * smoothstep(-30, -5, d);
      const k = f * (mode === "home" ? 1 : 0.6);
      pf.fade.value = k;
      pf.halo.opacity = 0.22 * k;
    });

    starMat.uniforms.uTime.value = time;
    nebulaMat.uniforms.uTime.value = time;
    nebulaMat.uniforms.uScroll.value = scroll;
    (nebulaMat.uniforms.uMouse.value as THREE.Vector2).copy(mouse);

    renderer.render(scene, camera);
    if (reduced && Math.abs(scroll - scrollTarget) > 0.0005) dirty = true;
  }

  const onLost = (e: Event) => {
    e.preventDefault();
    running = false;
    cancelAnimationFrame(raf);
    canvas.dispatchEvent(new CustomEvent("cosmos:lost", { bubbles: true }));
  };
  canvas.addEventListener("webglcontextlost", onLost);

  raf = requestAnimationFrame(frame);

  return {
    setMode(m, isRtl) {
      mode = m;
      rtl = isRtl;
      dirty = true;
      measure();
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      bodyRO.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      disposables.forEach((d) => d.dispose());
      glyphCache.forEach((t) => t.dispose());
      renderer.dispose();
    },
  };
}
