// @ts-nocheck
/* Voyage Georgia Rezo — the journey model as a glTF: a miniature of Georgia built in Blender (blender/build_georgia.py),
   with five detailed destinations, their own cameras, a soft highlight per destination and a 20 s loop of small
   animations. This module loads it and drives the camera as the page scrolls, with the same interface as vgr3d.js. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export const VGRGLB = (function () {
  // Stop order on the homepage; Kutaisi is scenery in the model, so it gets a camera derived from its position.
  var STOPS = [
    { key: 'tbilisi', node: 'Tbilisi' }, { key: 'kakheti', node: 'Kakheti' }, { key: 'tusheti', node: 'Tusheti' },
    { key: 'kutaisi', node: 'Scenery_Kutaisi', derived: { dx: 0.15, dz: 0.1, up: 0.05, yaw: -0.4, elev: 40, dist: 1.9 } },
    { key: 'svaneti', node: 'Svaneti' }, { key: 'batumi', node: 'Batumi' },
  ];
  var PIN_UP = 0.26; // the label sits this far above a stop's ground

  function mount(canvas, opts) {
    opts = opts || {};
    if (!canvas) return null;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
    try { // Without a GPU (software WebGL) the model would stall the page: keep the flat map instead.
      var gl = renderer.getContext(), dbg = gl.getExtension('WEBGL_debug_renderer_info');
      var gpu = String(gl.getParameter(gl.RENDERER)) + ' ' + (dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '');
      if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpu) && !/[?&]force3d\b/.test(location.search)) { renderer.dispose(); return null; }
    } catch (e) {}
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr || 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(26, 1.5, 0.05, 100);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c2cc, 1.5));
    var sun = new THREE.DirectionalLight(0xfff4e6, 3.2);
    sun.position.set(-4.2, 6.5, 3.4); sun.castShadow = true;
    var SM = opts.shadowMap || 2048; sun.shadow.mapSize.set(SM, SM);
    var shc = sun.shadow.camera; shc.left = -6.5; shc.right = 6.5; shc.top = 4.6; shc.bottom = -4.6; shc.near = 0.5; shc.far = 30;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
    scene.add(sun); scene.add(sun.target);
    var fill = new THREE.DirectionalLight(0xdce6f5, 0.6); fill.position.set(3, 4, -2); scene.add(fill);

    var state = { ready: false, dead: false };
    var model = null, mixer = null, clock = new THREE.Clock(), cams = {}, pins = [], picks = [], highlights = [], bounds = null;
    var focus = null;

    // ---- camera rig: a smoothed position + target, with a fly-up arc between stops and a little pointer parallax ----
    var camPos = new THREE.Vector3(), camTgt = new THREE.Vector3(), wantPos = new THREE.Vector3(), wantTgt = new THREE.Vector3();
    var yaw = 0, pitch = 0, ty = 0, tp = 0, sx = opts.shift || 0, sxT = sx, arcT = 9, arcH = 0, first = true;
    var tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

    function specFrom(target, yawA, elev, dist, out) {
      var e = elev * Math.PI / 180;
      out.pos.set(target.x + Math.sin(yawA) * Math.cos(e) * dist, target.y + Math.sin(e) * dist, target.z + Math.cos(yawA) * Math.cos(e) * dist);
      out.tgt.copy(target); return out;
    }
    function overviewSpec(out) {
      // Fit the whole model into the share of the canvas the page leaves free (fitFrac), like a model on a table.
      var el = (opts.elevation || 47) * Math.PI / 180, tv = Math.tan(camera.fov * Math.PI / 360);
      var W = bounds.max.x - bounds.min.x, D = bounds.max.z - bounds.min.z;
      var dw = (W / 2 * 1.04) / (tv * camera.aspect * (opts.fitFrac || 1));
      var dh = ((D * Math.sin(el)) / 2 + 0.55) * 1.04 / tv;
      var dist = Math.max(dw, dh) * (opts.overviewZoom || 1.0);
      tmp.set((bounds.min.x + bounds.max.x) / 2, 0.05, (bounds.min.z + bounds.max.z) / 2 - 0.1);
      return specFrom(tmp, opts.overviewYaw === undefined ? -0.2 : opts.overviewYaw, opts.elevation || 47, dist, out);
    }
    var spec = { pos: new THREE.Vector3(), tgt: new THREE.Vector3() };
    function desired() {
      if (focus === null || !cams[STOPS[focus].key]) return overviewSpec(spec);
      var c = cams[STOPS[focus].key]; spec.pos.copy(c.pos); spec.tgt.copy(c.tgt);
      if (opts.center && pins[focus]) {
        // A narrow screen has no text column beside the model: aim at the stop itself and stand a little further back.
        tmp.subVectors(c.pos, c.tgt).multiplyScalar(opts.focusZoom || 1.2);
        spec.tgt.set(pins[focus].p.x, c.tgt.y, pins[focus].p.z + 0.12); spec.pos.copy(spec.tgt).add(tmp);
      }
      return spec;
    }

    // ---- loading ----
    var draco = new DRACOLoader(); draco.setDecoderPath(opts.dracoPath || '/draco/'); draco.setDecoderConfig({ type: 'wasm' });
    var loader = new GLTFLoader(); loader.setDRACOLoader(draco);
    loader.load(opts.model || '/models/georgia.glb', function (gltf) {
      if (state.dead) return;
      model = gltf.scene; scene.add(model);
      model.updateMatrixWorld(true);
      var byName = {}; model.traverse(function (o) { byName[o.name] = o; });
      model.traverse(function (o) {
        if (!o.isMesh) return;
        var mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(function (m) { m.flatShading = true; m.needsUpdate = true; });
        o.castShadow = true; o.receiveShadow = true;
        var n = o.name;
        if (/^Pick_/.test(n)) { o.visible = false; o.castShadow = false; picks.push(o); }
        else if (/^Highlight_/.test(n)) {
          mats.forEach(function (m) { m.transparent = true; m.opacity = 0; m.depthWrite = false; });
          o.castShadow = false; o.receiveShadow = false; o.renderOrder = 2; o.visible = false; highlights.push(o);
        }
        else if (n === 'ContactShadow') { o.castShadow = false; o.receiveShadow = false; o.renderOrder = -1; mats.forEach(function (m) { m.depthWrite = false; }); }
        else if (n === 'Sea' || n === 'Frame' || n === 'BorderLine' || /_(Roads|Lanes|Paths|River|Mtkvari|Enguri)$/.test(n)) o.castShadow = false;
        else if (/^Cloud/.test(n)) o.receiveShadow = false;
        if (n === 'Land' || n === 'Surround') o.castShadow = true;
      });
      // cameras and what they look at, by name
      STOPS.forEach(function (s) {
        var c = byName['Cam_' + s.key], t = byName['CamTarget_' + s.key], node = byName[s.node];
        if (c && t) cams[s.key] = { pos: c.getWorldPosition(new THREE.Vector3()), tgt: t.getWorldPosition(new THREE.Vector3()) };
        else if (node && s.derived) {
          var d = s.derived, p = node.getWorldPosition(new THREE.Vector3()); p.x += d.dx; p.z += d.dz; p.y += d.up;
          cams[s.key] = specFrom(p, d.yaw, d.elev, d.dist, { pos: new THREE.Vector3(), tgt: new THREE.Vector3() });
        }
        var pp = node ? node.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3();
        pins.push({ key: s.key, p: pp.clone().add(new THREE.Vector3(0, PIN_UP, 0)) });
      });
      var frame = byName['Frame'] || model;
      bounds = new THREE.Box3().setFromObject(frame);
      // one mixer plays every clip (each animated object exported its own); together they are the 20 s loop
      if (!reduce && gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach(function (clip) { var a = mixer.clipAction(clip); a.loop = THREE.LoopRepeat; a.play(); });
      }
      state.ready = true;
      if (/[?&]debug3d\b/.test(location.search)) window.__vgr = { scene: scene, camera: camera, picks: picks, cams: cams, pins: pins, highlights: highlights, renderer: renderer };
      if (opts.fallback) { try { opts.fallback.style.display = 'none'; } catch (e) {} }
      var d0 = desired(); camPos.copy(d0.pos); camTgt.copy(d0.tgt); arcT = 9;
      size();
      if (renderer.compileAsync) renderer.compileAsync(scene, camera).then(start, start); else start();
    }, undefined, function (err) { if (opts.onFail) opts.onFail(err); });

    // ---- sizing, pointer ----
    function size() {
      var w = canvas.clientWidth || 600, h = canvas.clientHeight || 400;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    var ro = window.ResizeObserver ? new ResizeObserver(function () { size(); if (state.ready) frame(performance.now(), true); }) : null;
    if (ro) ro.observe(canvas);
    window.addEventListener('resize', size);
    size();
    var ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hover = null;
    function pointerPick(e) {
      if (!state.ready || !picks.length) return null;
      var r = canvas.getBoundingClientRect(); if (!r.width) return null;
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      var hit = ray.intersectObjects(picks, false)[0];
      return hit ? hit.object.name.replace('Pick_', '') : null;
    }
    function onMove(e) {
      var r = canvas.getBoundingClientRect(); if (!r.width) return;
      var nx = ((e.clientX - r.left) / r.width - 0.5) * 2, ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      ty = Math.max(-1, Math.min(1, nx)) * 0.16; tp = Math.max(-1, Math.min(1, ny)) * -0.04;
      if (opts.onPick && e.target === canvas) { var h = pointerPick(e); if (h !== hover) { hover = h; canvas.style.cursor = h ? 'pointer' : ''; } }
    }
    function onLeave() { ty = 0; tp = 0; }
    function onClick(e) { if (!opts.onPick) return; var h = pointerPick(e); if (h) { var i = STOPS.findIndex(function (s) { return s.key === h; }); if (i >= 0) opts.onPick(i); } }
    if (window.matchMedia && matchMedia('(pointer:fine)').matches) { window.addEventListener('pointermove', onMove); document.addEventListener('pointerleave', onLeave); }
    canvas.addEventListener('click', onClick);

    // ---- frame loop ----
    var t0 = null, visible = true, raf = 0, last = 0;
    function frame(now, once) {
      if (!state.ready) return;
      if (t0 === null) t0 = now;
      var t = (now - t0) / 1000, dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      var journey = focus !== null;
      if (mixer) mixer.update(clock.getDelta());

      var d = desired(); wantPos.copy(d.pos); wantTgt.copy(d.tgt);
      // pointer parallax and a slow drift on the overview: turn the camera a little around its target
      var yawT = ty + (journey ? 0 : Math.sin(t * 0.25) * 0.05), pitchT = tp;
      if (reduce) { yaw = 0; pitch = 0; } else { yaw += (yawT - yaw) * 0.05; pitch += (pitchT - pitch) * 0.05; }
      tmp.subVectors(wantPos, wantTgt);
      var len = tmp.length(), a = Math.atan2(tmp.x, tmp.z) + yaw, p2 = Math.asin(Math.max(-1, Math.min(1, tmp.y / len))) + pitch;
      wantPos.set(wantTgt.x + Math.sin(a) * Math.cos(p2) * len, wantTgt.y + Math.sin(p2) * len, wantTgt.z + Math.cos(a) * Math.cos(p2) * len);
      // ease towards it; a fly-up arc lifts the camera over the country while it travels
      var k = reduce || first ? 1 : 1 - Math.exp(-dt * 3.2);
      camPos.lerp(wantPos, k); camTgt.lerp(wantTgt, k);
      arcT += dt;
      var lift = reduce ? 0 : Math.sin(Math.PI * Math.min(1, arcT / 1.7)) * arcH;
      first = false;
      camera.position.set(camPos.x, camPos.y + lift, camPos.z);
      camera.lookAt(camTgt);
      sxT = journey ? (opts.focusShift || 0) : (opts.shift || 0);
      sx += (sxT - sx) * (reduce ? 1 : 0.07);
      var cw = canvas.clientWidth || 600, chh = canvas.clientHeight || 400;
      if (Math.abs(sx) > 0.001) camera.setViewOffset(cw, chh, -sx * cw, 0, cw, chh); else camera.clearViewOffset();
      camera.updateMatrixWorld();
      // the active destination glows softly on the ground
      highlights.forEach(function (h) {
        var on = journey && h.name === 'Highlight_' + STOPS[focus].key;
        var m = h.material, o = m.opacity + ((on ? 1 : 0) - m.opacity) * (reduce ? 1 : 0.06);
        m.opacity = o; h.visible = o > 0.01;
      });
      renderer.render(scene, camera);
      if (once) return;
      var settled = camPos.distanceTo(wantPos) < 0.002 && Math.abs(sx - sxT) < 0.001;
      if (!reduce || !settled) { raf = visible ? requestAnimationFrame(frame) : 0; } else raf = 0;
    }
    function start() { if (!raf && state.ready && !state.dead) { last = 0; clock.getDelta(); raf = requestAnimationFrame(frame); } }
    var io = window.IntersectionObserver ? new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }, { threshold: 0.02 }) : null;
    if (io) io.observe(canvas);

    return {
      dispose: function () {
        state.dead = true; cancelAnimationFrame(raf); raf = 0;
        if (ro) ro.disconnect(); if (io) io.disconnect();
        window.removeEventListener('resize', size); window.removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('click', onClick);
        if (mixer) mixer.stopAllAction();
        draco.dispose(); renderer.dispose();
      },
      goTo: function (i) {
        var next = (i === null || i === undefined || i < 0) ? null : i;
        if (next !== focus && state.ready) {
          var from = camTgt, to = next === null ? overviewSpec(spec).tgt : (cams[STOPS[next].key] ? cams[STOPS[next].key].tgt : from);
          var far = from.distanceTo(to);
          arcH = Math.min(1.2, far * 0.35); arcT = 0; // a longer hop rises higher
        }
        focus = next; start(); if (reduce && state.ready) frame(performance.now(), true);
      },
      stops: function () { return STOPS.length; },
      // Screen position (CSS px, relative to the canvas) of stop i's label anchor, for overlays drawn in HTML.
      pinScreen: function (i) {
        var p = pins[i]; if (!state.ready || !p) return null;
        var v = tmp2.copy(p.p); v.project(camera);
        return { x: (v.x + 1) / 2 * (canvas.clientWidth || 1), y: (1 - v.y) / 2 * (canvas.clientHeight || 1), visible: v.z < 1 };
      },
      setOptions: function (o) { for (var k in o) opts[k] = o[k]; start(); },
    };
  }
  return { mount: mount };
})();
