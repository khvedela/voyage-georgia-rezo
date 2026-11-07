// @ts-nocheck
/* Voyage Georgia Rezo: the homepage model. Loads the Blender miniature (public/models/georgia.glb) and runs two modes
   in one canvas:
     explore  the whole model on its plinth; drag to turn it, tap a region to plant a flag on it
     drive    a sample route scrubbed by scroll: the camera dives in, a red road draws itself across the terrain
              behind a small van, and the camera rests at each stop
   Everything the page needs comes back through a small API (see the return value of mountWorld). */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import ROUTE from '../data/drive-route.json';
import { buildTimeline, locate } from './drive-timeline';

const RED = 0xd62839, INK = 0x2a2d33, CREAM = 0xf3efe6;
const smooth = (t) => t * t * (3 - 2 * t);
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Ground height lookup: Land's triangles binned on an XZ grid, so draping the route takes milliseconds, not seconds. */
function heightField(meshes) {
  const tris = [];
  const v = new THREE.Vector3();
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  meshes.forEach((m) => {
    const g = m.geometry, pos = g.attributes.position, idx = g.index, n = idx ? idx.count : pos.count;
    const W = [];
    for (let k = 0; k < pos.count; k++) { v.fromBufferAttribute(pos, k).applyMatrix4(m.matrixWorld); W.push(v.x, v.y, v.z); }
    for (let k = 0; k + 2 < n; k += 3) {
      const a = idx ? idx.getX(k) : k, b = idx ? idx.getX(k + 1) : k + 1, c = idx ? idx.getX(k + 2) : k + 2;
      const t = [W[a * 3], W[a * 3 + 1], W[a * 3 + 2], W[b * 3], W[b * 3 + 1], W[b * 3 + 2], W[c * 3], W[c * 3 + 1], W[c * 3 + 2]];
      tris.push(t);
      x0 = Math.min(x0, t[0], t[3], t[6]); x1 = Math.max(x1, t[0], t[3], t[6]);
      z0 = Math.min(z0, t[2], t[5], t[8]); z1 = Math.max(z1, t[2], t[5], t[8]);
    }
  });
  const C = 0.05, nx = Math.max(1, Math.ceil((x1 - x0) / C)), nz = Math.max(1, Math.ceil((z1 - z0) / C));
  const grid = new Array(nx * nz);
  tris.forEach((t, k) => {
    const ia = Math.floor((Math.min(t[0], t[3], t[6]) - x0) / C), ib = Math.floor((Math.max(t[0], t[3], t[6]) - x0) / C);
    const ja = Math.floor((Math.min(t[2], t[5], t[8]) - z0) / C), jb = Math.floor((Math.max(t[2], t[5], t[8]) - z0) / C);
    for (let i = Math.max(0, ia); i <= Math.min(nx - 1, ib); i++) for (let j = Math.max(0, ja); j <= Math.min(nz - 1, jb); j++) {
      const c = j * nx + i; (grid[c] || (grid[c] = [])).push(k);
    }
  });
  return function at(x, z) {
    const i = Math.floor((x - x0) / C), j = Math.floor((z - z0) / C);
    if (i < 0 || j < 0 || i >= nx || j >= nz) return null;
    const cell = grid[j * nx + i]; if (!cell) return null;
    let best = null;
    for (const k of cell) {
      const t = tris[k];
      const d = (t[5] - t[8]) * (t[0] - t[6]) + (t[6] - t[3]) * (t[2] - t[8]);
      if (Math.abs(d) < 1e-12) continue;
      const l1 = ((t[5] - t[8]) * (x - t[6]) + (t[6] - t[3]) * (z - t[8])) / d;
      const l2 = ((t[8] - t[2]) * (x - t[6]) + (t[0] - t[6]) * (z - t[8])) / d;
      const l3 = 1 - l1 - l2;
      if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
      const y = l1 * t[1] + l2 * t[4] + l3 * t[7];
      if (best === null || y > best) best = y;
    }
    return best;
  };
}

/** A small low-poly van, built along +Z so lookAt() points it down the road. */
function makeVan() {
  const g = new THREE.Group();
  const M = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, flatShading: true });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.017, 0.015, 0.036), M(0xfbfaf6)); body.position.y = 0.0105;
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.017, 0.009, 0.008), M(0xfbfaf6)); nose.position.set(0, 0.0075, 0.021);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.0175, 0.005, 0.03), M(0x31475c)); glass.position.set(0, 0.0135, 0.002);
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.0155, 0.006, 0.002), M(0x31475c)); shield.position.set(0, 0.0128, 0.0182); shield.rotation.x = -0.5;
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.0176, 0.0025, 0.036), M(RED)); stripe.position.y = 0.0075;
  g.add(body, nose, glass, shield, stripe);
  const wg = new THREE.CylinderGeometry(0.0035, 0.0035, 0.0035, 8).rotateZ(Math.PI / 2), wm = M(0x1b1d22);
  [[-0.0085, 0.012], [0.0085, 0.012], [-0.0085, -0.011], [0.0085, -0.011]].forEach(([x, z]) => { const w = new THREE.Mesh(wg, wm); w.position.set(x, 0.0035, z); g.add(w); });
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  return g;
}

/** The route van from the model: Rezo's Mitsubishi Delica (Vehicle_Delica in georgia.glb, nose along +z), in a group
 * so the drive can place, turn and scale it. */
function vanFromModel(tpl) {
  const g = new THREE.Group(), m = tpl.clone(true);
  m.visible = true; m.position.set(0, 0, 0); m.quaternion.identity(); m.scale.set(1, 1, 1);
  g.add(m);
  return g;
}

/** A flag on a pole: what a visitor plants on each region they pick. */
function makeFlag() {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, 0.15, 6).translate(0, 0.075, 0), new THREE.MeshStandardMaterial({ color: INK, roughness: 0.6, flatShading: true }));
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 8, 6), new THREE.MeshStandardMaterial({ color: 0xe0ad37, roughness: 0.35, metalness: 0.6, flatShading: true }));
  knob.position.y = 0.152;
  const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(0.075, -0.021); shape.lineTo(0, -0.044); shape.closePath();
  const pen = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color: RED, roughness: 0.75, side: THREE.DoubleSide, flatShading: true }));
  const penPivot = new THREE.Group(); penPivot.position.y = 0.148; penPivot.add(pen);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.017, 0.007, 10).translate(0, 0.0035, 0), new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.8, flatShading: true }));
  g.add(pole, knob, penPivot, base);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  g.userData.pen = penPivot;
  return g;
}

export function mountWorld(canvas, opts) {
  opts = opts || {};
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
  try { // Without a GPU (software WebGL) the model would stall the page: the page shows the still render instead.
    const gl = renderer.getContext(), dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = String(gl.getParameter(gl.RENDERER)) + ' ' + (dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '');
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpu) && !/[?&]force3d\b/.test(location.search)) { renderer.dispose(); return null; }
  } catch (e) { /* keep going */ }
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr || 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1.5, 0.02, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c2cc, 1.5));
  const sun = new THREE.DirectionalLight(0xfff4e6, 3.2);
  sun.position.set(-4.2, 6.5, 3.4); sun.castShadow = true;
  const SM = opts.shadowMap || 2048; sun.shadow.mapSize.set(SM, SM);
  const shc = sun.shadow.camera; shc.left = -6.5; shc.right = 6.5; shc.top = 4.6; shc.bottom = -4.6; shc.near = 0.5; shc.far = 30;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xdce6f5, 0.6); fill.position.set(3, 4, -2); scene.add(fill);

  const TL = buildTimeline((opts.stops || []).length || 6);
  const st = { ready: false, dead: false, p: 0, q: 0, sel: [], framing: { sx: 0, sy: 0, fitW: 0.9, fitH: 0.8, driveSx: 0, driveSy: 0 } };
  let model = null, mixer = null, bounds = null;
  const regions = [], stops = [], highlights = {};
  let ground = null, curve = null, U = [], routeMesh = null, routeWide = null, ghostMesh = null, routeSegs = 0, RADIAL = 6, van = null;
  const clock = new THREE.Clock();

  // ---- camera poses ----
  const pose = () => ({ pos: new THREE.Vector3(), tgt: new THREE.Vector3() });
  const O = pose();             // overview
  const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3();
  const want = pose(), tmpA = pose(), tmpB = pose();
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();

  function orbit(target, yaw, elevDeg, dist, out) {
    const e = elevDeg * Math.PI / 180;
    out.pos.set(target.x + Math.sin(yaw) * Math.cos(e) * dist, target.y + Math.sin(e) * dist, target.z + Math.cos(yaw) * Math.cos(e) * dist);
    out.tgt.copy(target); return out;
  }
  function fitOverview() {
    if (!bounds) return;
    const el = 47 * Math.PI / 180, tv = Math.tan(camera.fov * Math.PI / 360), f = st.framing;
    const W = bounds.max.x - bounds.min.x, D = bounds.max.z - bounds.min.z;
    const dw = (W / 2) / (tv * camera.aspect * f.fitW);
    const dh = ((D * Math.sin(el)) / 2 + 0.5) / (tv * f.fitH);
    v1.set((bounds.min.x + bounds.max.x) / 2, 0.05, (bounds.min.z + bounds.max.z) / 2 - 0.08);
    orbit(v1, -0.3, 47, Math.max(dw, dh), O);
  }
  /** Ease between two poses: target moves in a straight line, the view direction turns, distance changes in log space. */
  function blend(A, B, t, out) {
    out.tgt.lerpVectors(A.tgt, B.tgt, t);
    v1.subVectors(A.pos, A.tgt); v2.subVectors(B.pos, B.tgt);
    const la = v1.length(), lb = v2.length();
    v1.normalize(); v2.normalize();
    v3.copy(v1).lerp(v2, t).normalize();
    out.pos.copy(out.tgt).addScaledVector(v3, Math.exp(Math.log(la) + (Math.log(lb) - Math.log(la)) * t));
    return out;
  }
  function stopPose(i) { return stops[i] ? stops[i].cam : O; }
  function routeAt(u, out) { return curve ? curve.getPointAt(clamp(u, 0, 1), out) : out.set(0, 0, 0); }

  /** Where the drive is at progress p: camera pose, route head and van. */
  let head = 0;
  function drivePose(p, out) {
    const { seg, t } = locate(TL, p);
    const i = seg.i;
    if (seg.kind === 'in') { blend(O, stopPose(0), smoother(t), out); head = U[0] || 0; }
    else if (seg.kind === 'out') { blend(stopPose(i), O, smoother(t), out); head = 1; }
    else if (seg.kind === 'dwell') {
      const C = stopPose(i); out.pos.copy(C.pos); out.tgt.copy(C.tgt);
      // a slow turn while you read, coupled to the scroll so it never moves on its own
      v1.subVectors(out.pos, out.tgt); v1.applyAxisAngle(THREE.Object3D.DEFAULT_UP, (t - 0.5) * 0.16); out.pos.copy(out.tgt).add(v1);
      head = U[i] || 0;
    } else {
      const e = smoother(t), A = stopPose(i), B = stopPose(i + 1);
      blend(A, B, e, out);
      head = (U[i] || 0) + ((U[i + 1] || 0) - (U[i] || 0)) * e;
      // follow the van, and rise over the country on the longer legs
      routeAt(head, v2);
      const arc = Math.sin(Math.PI * t), far = A.tgt.distanceTo(B.tgt);
      out.tgt.lerp(v2, 0.7 * arc);
      v1.subVectors(out.pos, out.tgt).multiplyScalar(1 + clamp(far * 0.5, 0.35, 2.4) * arc);
      out.pos.copy(out.tgt).add(v1);
    }
    return out;
  }

  // ---- loading ----
  const draco = new DRACOLoader(); draco.setDecoderPath('/draco/'); draco.setDecoderConfig({ type: 'wasm' });
  const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
  loader.load('/models/georgia.glb', (gltf) => {
    if (st.dead) return;
    model = gltf.scene; scene.add(model); model.updateMatrixWorld(true);
    const byName = {}; model.traverse((o) => { byName[o.name] = o; });
    const land = [];
    model.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => { m.flatShading = true; m.needsUpdate = true; });
      o.castShadow = true; o.receiveShadow = true;
      const n = o.name, pn = o.parent ? o.parent.name : '';
      if (n === 'Land' || pn === 'Land' || /^Land_\d+$/.test(n)) land.push(o);
      if (/^Pick_/.test(n)) { o.visible = false; }
      else if (/^Highlight_/.test(n)) {
        mats.forEach((m) => { m.transparent = true; m.opacity = 0; m.depthWrite = false; });
        o.castShadow = false; o.receiveShadow = false; o.renderOrder = 2; o.visible = false; highlights[n.replace('Highlight_', '')] = o;
      } else if (n === 'ContactShadow') {
        // The baked shadow is dark-on-white, made for a white page. Redraw it as a tinted shadow whose darkness becomes
        // transparency, so it sits on the sky-coloured page without a pale rectangle around it.
        const map = mats[0] && mats[0].map;
        o.material = new THREE.ShaderMaterial({
          uniforms: { map: { value: map }, tint: { value: new THREE.Color(0x2a2622) }, strength: { value: 0.55 } },
          vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'uniform sampler2D map; uniform vec3 tint; uniform float strength; varying vec2 vUv; void main() { vec4 t = texture2D(map, vUv); float a = clamp(1.0 - dot(t.rgb, vec3(0.333)), 0.0, 1.0) * t.a * strength; gl_FragColor = vec4(tint, a); }',
          transparent: true, depthWrite: false,
        });
        o.castShadow = false; o.receiveShadow = false; o.renderOrder = -1;
      }
      else if (n === 'Sea' || n === 'Frame' || n === 'BorderLine' || /_(Roads|Lanes|Paths|River)$/.test(n)) o.castShadow = false;
      else if (/^Cloud/.test(n)) o.receiveShadow = false;
    });
    ground = heightField(land);
    const groundAt = (x, z, fallback) => { const y = ground(x, z); return y === null ? fallback : y; };

    bounds = new THREE.Box3().setFromObject(byName.Frame || model);

    // regions you can pick, each with a flag waiting underground
    (opts.regions || []).forEach((r) => {
      const node = byName[r.node]; if (!node) return;
      const p = node.getWorldPosition(new THREE.Vector3()); p.y = groundAt(p.x, p.z, p.y);
      const flag = makeFlag(); flag.position.copy(p); flag.scale.setScalar(0.0001); flag.visible = false; scene.add(flag);
      const hlKey = Object.keys(highlights).find((k) => r.node.toLowerCase() === k.toLowerCase());
      regions.push({ id: r.id, ground: p, pin: p.clone(), flag, on: st.sel.includes(r.id), k: 0, vel: 0, hl: hlKey ? highlights[hlKey] : null, hover: false });
    });

    // stops on the drive, each with its camera from the model (Kutaisi is scenery, so its camera is derived)
    (opts.stops || []).forEach((s) => {
      const node = byName[s.node];
      const p = node ? node.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3();
      p.y = groundAt(p.x, p.z, p.y);
      const c = byName['Cam_' + s.key], t = byName['CamTarget_' + s.key];
      const cam = pose();
      if (c && t) { c.getWorldPosition(cam.pos); t.getWorldPosition(cam.tgt); }
      else { v1.set(p.x + 0.15, p.y + 0.05, p.z + 0.1); orbit(v1, -0.4, 40, 1.9, cam); }
      // stand a little further back than the Blender cameras, so each stop shows its surroundings too
      v1.subVectors(cam.pos, cam.tgt).multiplyScalar(1.3); cam.pos.copy(cam.tgt).add(v1);
      stops.push({ key: s.key, ground: p, pin: p.clone().add(new THREE.Vector3(0, 0.2, 0)), cam });
    });

    // the route: resample the road evenly, drape it on the land, lift it a hair, and smooth out the steps
    const P = ROUTE.points, raw = [];
    const idxAt = [];
    for (let k = 0; k < P.length - 1; k++) {
      if (ROUTE.stops.includes(k)) idxAt[ROUTE.stops.indexOf(k)] = raw.length;
      const [ax, az] = P[k], [bx, bz] = P[k + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.012));
      for (let j = 0; j < n; j++) raw.push([ax + (bx - ax) * j / n, az + (bz - az) * j / n]);
    }
    idxAt[ROUTE.stops.length - 1] = raw.length; raw.push(P[P.length - 1]);
    const ys = raw.map(([x, z]) => groundAt(x, z, 0.05));
    const pts = raw.map(([x, z], k) => {
      let s = 0, n = 0;
      for (let d = -3; d <= 3; d++) { const y = ys[clamp(k + d, 0, ys.length - 1)]; s += y; n++; }
      return new THREE.Vector3(x, Math.max(s / n, ys[k]) + 0.007, z);
    });
    curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const lens = curve.getLengths(pts.length - 1), L = lens[lens.length - 1];
    U = idxAt.map((k) => lens[clamp(k, 0, lens.length - 1)] / L);
    routeSegs = Math.min(2400, pts.length * 3);
    routeMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, routeSegs, 0.0062, RADIAL, false),
      new THREE.MeshStandardMaterial({ color: RED, roughness: 0.55, emissive: RED, emissiveIntensity: 0.25 }));
    routeMesh.castShadow = true; routeMesh.geometry.setDrawRange(0, 0); scene.add(routeMesh);
    // from far away the road needs to be bolder to read, so a wider copy fades in with distance
    routeWide = new THREE.Mesh(new THREE.TubeGeometry(curve, routeSegs, 0.017, RADIAL, false),
      new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0, depthWrite: false }));
    routeWide.renderOrder = 2; routeWide.geometry.setDrawRange(0, 0); scene.add(routeWide);
    ghostMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, routeSegs, 0.0035, 4, false),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
    ghostMesh.renderOrder = 1; scene.add(ghostMesh);
    const vanTpl = byName.Vehicle_Delica;
    if (vanTpl) vanTpl.visible = false;
    van = vanTpl ? vanFromModel(vanTpl) : makeVan(); van.visible = false; scene.add(van);

    if (!reduce && gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => { const a = mixer.clipAction(clip); a.loop = THREE.LoopRepeat; a.play(); });
    }
    size(); fitOverview(); camPos.copy(O.pos); camTgt.copy(O.tgt);
    st.ready = true;
    if (/[?&]debug3d\b/.test(location.search)) window.__world = { scene, camera, regions, stops, curve, U, TL, byName };
    const go = () => { if (st.dead) return; start(); if (opts.onReady) opts.onReady(); };
    if (renderer.compileAsync) renderer.compileAsync(scene, camera).then(go, go); else go();
  }, undefined, (err) => { if (opts.onFail) opts.onFail(err); });

  // ---- sizing ----
  function size() {
    const w = canvas.clientWidth || 600, h = canvas.clientHeight || 400;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (st.ready || bounds) fitOverview();
  }
  const ro = window.ResizeObserver ? new ResizeObserver(() => { size(); start(); }) : null;
  if (ro) ro.observe(canvas);

  // ---- explore: drag to turn the model, tap near a region to pick it ----
  let yaw = 0, pitch = 0, yawV = 0, dragYaw = 0, dragPitch = 0, drag = null, parX = 0, parY = 0;
  function onDown(e) {
    if (st.p > 0.001 || !st.ready) return;
    drag = { x: e.clientX, y: e.clientY, yaw: dragYaw, pitch: dragPitch, moved: false, id: e.pointerId, t: performance.now(), lx: e.clientX };
  }
  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    if (r.width && e.pointerType === 'mouse') { parX = ((e.clientX - r.left) / r.width - 0.5) * 2; parY = ((e.clientY - r.top) / r.height - 0.5) * 2; }
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 6) { drag.moved = true; try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } canvas.classList.add('is-dragging'); }
    if (drag.moved) {
      dragYaw = clamp(drag.yaw - dx * 0.004, -0.75, 0.75);
      if (e.pointerType === 'mouse') dragPitch = clamp(drag.pitch + dy * 0.0016, -0.12, 0.2);
      const now = performance.now(); yawV = -(e.clientX - drag.lx) * 0.004 / Math.max(8, now - drag.t) * 16; drag.t = now; drag.lx = e.clientX;
      start();
    }
  }
  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const was = drag; drag = null; canvas.classList.remove('is-dragging');
    if (!was.moved && opts.onPick) {
      const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      let best = null, bd = 44;
      regions.forEach((g) => { const s = project(g.ground); if (s && s.visible) { const d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = g; } } });
      if (best) opts.onPick(best.id);
    }
  }
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  // ---- frame loop ----
  let raf = 0, visible = true, last = 0, time = 0;
  function frame(now) {
    raf = 0;
    if (!st.ready || st.dead) return;
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; time += dt;
    if (mixer) mixer.update(dt);
    // the drive follows the scroll with a little lag, so a flick of the wheel becomes a glide, not a jump
    st.q = reduce ? st.p : st.q + (st.p - st.q) * (1 - Math.exp(-dt * 2.6));
    if (Math.abs(st.p - st.q) < 1e-5) st.q = st.p;
    const explore = st.q <= 0.0005, f = st.framing;

    if (explore) {
      // inertia after a drag, then a slow drift home and a gentle sway, like a model turning on a stand
      if (!drag && !reduce) { dragYaw = clamp(dragYaw + yawV, -0.75, 0.75); yawV *= 0.92; if (Math.abs(yawV) < 1e-4) { dragYaw *= 0.995; dragPitch *= 0.99; } }
      const sway = reduce ? 0 : Math.sin(time * 0.22) * 0.06;
      want.pos.copy(O.pos); want.tgt.copy(O.tgt);
      yaw = dragYaw + sway + (reduce ? 0 : parX * 0.05); pitch = dragPitch + (reduce ? 0 : -parY * 0.02);
      v1.subVectors(want.pos, want.tgt);
      const len = v1.length(), a = Math.atan2(v1.x, v1.z) + yaw, el = Math.asin(clamp(v1.y / len, -1, 1)) + pitch;
      want.pos.set(want.tgt.x + Math.sin(a) * Math.cos(el) * len, want.tgt.y + Math.sin(el) * len, want.tgt.z + Math.cos(a) * Math.cos(el) * len);
      head = 0;
    } else {
      drivePose(st.q, want);
      dragYaw *= 0.9; dragPitch *= 0.9;
    }
    const k = reduce ? 1 : 1 - Math.exp(-dt * (explore ? 5 : 4));
    camPos.lerp(want.pos, k); camTgt.lerp(want.tgt, k);
    camera.position.copy(camPos); camera.lookAt(camTgt);
    // frame off-centre so the model sits clear of the copy: the offset eases between modes
    // the finish frames the model like the opening, beside the closing card
    const lc = locate(TL, st.q), wide = explore || (lc.seg.kind === 'out' && lc.t > 0.3) || (lc.seg.kind === 'in' && lc.t < 0.3);
    const tx = wide ? f.sx : f.driveSx, ty = wide ? f.sy : f.driveSy;
    st.vx = st.vx === undefined ? tx : st.vx + (tx - st.vx) * (reduce ? 1 : 0.08);
    st.vy = st.vy === undefined ? ty : st.vy + (ty - st.vy) * (reduce ? 1 : 0.08);
    const cw = canvas.clientWidth || 600, ch = canvas.clientHeight || 400;
    if (Math.abs(st.vx) > 1e-4 || Math.abs(st.vy) > 1e-4) camera.setViewOffset(cw, ch, -st.vx * cw, -st.vy * ch, cw, ch); else camera.clearViewOffset();
    camera.updateMatrixWorld();

    // the road behind the van
    const shown = explore ? 0 : head;
    const drawn = Math.floor(shown * routeSegs) * RADIAL * 6;
    if (routeMesh) routeMesh.geometry.setDrawRange(0, drawn);
    if (routeWide) {
      routeWide.geometry.setDrawRange(0, drawn);
      routeWide.material.opacity = clamp((camPos.distanceTo(camTgt) - 5) / 5, 0, 0.95);
      routeWide.visible = !explore && routeWide.material.opacity > 0.01;
    }
    if (ghostMesh) { const m = ghostMesh.material, o = explore ? 0 : 0.6; m.opacity += (o - m.opacity) * (reduce ? 1 : 0.1); ghostMesh.visible = m.opacity > 0.01; }
    if (van && curve) {
      const show = !explore && st.q < 0.995;
      van.visible = show;
      if (show) {
        routeAt(head, v1); curve.getTangentAt(clamp(head, 0, 1), v2);
        van.position.copy(v1).add(v3.set(0, -0.004, 0));
        if (v2.lengthSq() > 1e-8) van.lookAt(v1.x + v2.x, v1.y, v1.z + v2.z);
        van.scale.setScalar(clamp(camera.position.distanceTo(v1) / 1.6, 1, 4));
      }
    }
    // flags pop up on a spring and wave; picked regions glow on the ground
    const flagScale = clamp(camera.position.distanceTo(camTgt) / 5.2, 0.8, 3.2);
    regions.forEach((g, i) => {
      const target = g.on ? 1 : 0;
      if (reduce) g.k = target; else { g.vel += (target - g.k) * 0.18; g.vel *= 0.72; g.k += g.vel; }
      g.flag.visible = g.k > 0.01;
      g.flag.scale.setScalar(Math.max(0.0001, g.k) * flagScale);
      if (!reduce) g.flag.userData.pen.rotation.y = Math.sin(time * 2.4 + i * 1.3) * 0.28;
      // the label rides on top of the flag as it springs up
      g.pin.set(g.ground.x, g.ground.y + 0.05 + Math.max(0, g.k) * 0.13 * flagScale, g.ground.z);
      if (g.hl) { const m = g.hl.material, o = explore && (g.on || g.hover) ? 0.9 : 0; m.opacity += (o - m.opacity) * (reduce ? 1 : 0.1); g.hl.visible = m.opacity > 0.01; }
    });
    renderer.render(scene, camera);
    if (opts.onFrame) opts.onFrame();
    if (visible) raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && st.ready && !st.dead && visible) { last = 0; raf = requestAnimationFrame(frame); } }
  const io = window.IntersectionObserver ? new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) start(); }, { threshold: 0.01 }) : null;
  if (io) io.observe(canvas);

  const vp = new THREE.Vector3();
  function project(p) {
    if (!st.ready || !p) return null;
    vp.copy(p).project(camera);
    return { x: (vp.x + 1) / 2 * (canvas.clientWidth || 1), y: (1 - vp.y) / 2 * (canvas.clientHeight || 1), visible: vp.z < 1 && vp.z > -1 };
  }

  return {
    /** 0 = explore the whole model; above 0 = the drive, to 1 = pulled back over the finished route. */
    setProgress(p) { st.p = clamp(p, 0, 1); start(); },
    setSelected(ids) { st.sel = ids.slice(); regions.forEach((g) => { g.on = st.sel.includes(g.id); }); start(); },
    setHover(id) { regions.forEach((g) => { g.hover = g.id === id; }); start(); },
    setFraming(f) { Object.assign(st.framing, f); if (st.ready) fitOverview(); start(); },
    regionScreen(id) { const g = regions.find((r) => r.id === id); return g ? project(g.pin) : null; },
    stopScreen(i) { return stops[i] ? project(stops[i].pin) : null; },
    vanScreen() { return van && van.visible ? project(van.position) : null; },
    dispose() {
      st.dead = true; cancelAnimationFrame(raf); raf = 0;
      if (ro) ro.disconnect(); if (io) io.disconnect();
      canvas.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp);
      if (mixer) mixer.stopAllAction();
      draco.dispose(); renderer.dispose();
    },
  };
}
