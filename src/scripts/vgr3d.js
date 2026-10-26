// @ts-nocheck
/* Voyage Georgia Rezo — 3D journey model: a sculpted model of Georgia on a plinth, with a small scene at every stop (three r160). */
import * as THREE from 'three';
import META from './terrain-meta.json';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const VGR3D = (function () {
  var G = {"geo":[[[272.7,274.9],[265.3,231.1],[263.1,224.4],[259.9,218.7],[255.7,214.2],[250.6,211.3],[241.0,209.5],[230.6,203.6],[228.1,203.2],[222.5,205.6],[221.1,204.7],[215.4,196.1],[212.5,185.6],[205.1,171.7],[201.9,171.8],[197.0,174.0],[193.8,172.9],[190.0,167.2],[187.8,165.9],[183.9,159.3],[174.7,155.7],[162.1,154.0],[150.6,155.4],[141.5,148.4],[136.3,147.2],[126.1,142.4],[121.4,141.9],[118.1,146.1],[113.8,137.9],[109.7,133.2],[110.3,127.8],[108.3,122.8],[103.5,115.8],[92.7,111.9],[86.8,107.0],[74.0,103.9],[83.3,79.0],[85.0,76.3],[88.0,74.4],[96.6,72.1],[105.3,72.1],[136.4,83.5],[141.4,84.1],[153.6,78.9],[158.2,78.4],[169.3,85.8],[182.3,90.2],[186.3,92.5],[203.6,106.2],[207.5,107.1],[220.7,105.4],[225.0,106.3],[237.4,113.4],[246.4,111.6],[250.2,113.1],[254.3,120.5],[266.1,125.8],[271.7,131.5],[275.1,133.4],[289.0,132.6],[305.8,135.8],[318.3,135.0],[329.9,139.1],[333.9,139.3],[338.0,138.5],[351.9,131.7],[373.3,129.9],[381.9,131.1],[396.0,141.9],[406.2,146.7],[413.6,141.8],[423.4,139.9],[433.3,141.3],[444.0,149.3],[454.8,153.2],[453.5,161.0],[454.7,162.8],[460.9,167.1],[474.5,179.8],[479.4,182.5],[520.2,193.7],[528.9,197.9],[538.5,207.4],[550.3,210.3],[555.9,213.1],[557.4,218.1],[554.4,222.2],[546.5,228.8],[546.1,233.8],[549.7,238.2],[566.7,241.5],[573.5,246.1],[575.9,245.8],[577.8,244.1],[582.6,237.9],[588.1,235.4],[600.2,234.8],[606.1,233.1],[610.2,228.9],[612.6,224.1],[615.5,220.6],[626.7,220.4],[645.3,212.5],[657.1,212.6],[667.0,217.0],[674.2,224.8],[677.3,234.7],[678.9,236.4],[680.0,235.2],[682.0,225.8],[686.5,215.2],[689.7,210.9],[695.2,212.0],[711.2,222.9],[715.9,223.0],[723.0,220.6],[727.1,222.1],[730.7,225.3],[743.2,240.3],[748.2,249.9],[752.4,251.6],[768.0,247.8],[785.9,249.8],[795.7,253.7],[800.9,259.9],[800.5,263.9],[786.0,301.8],[787.2,305.8],[796.1,310.6],[810.0,320.4],[818.8,322.7],[820.6,324.4],[824.1,333.3],[827.2,336.1],[829.6,336.2],[833.2,334.3],[837.2,337.1],[841.2,336.5],[842.4,337.4],[843.3,341.1],[846.3,342.5],[862.2,341.1],[871.0,350.4],[874.6,352.1],[882.1,352.7],[885.2,354.4],[888.2,358.6],[880.7,373.0],[875.3,379.7],[871.4,382.4],[860.1,381.6],[857.7,384.2],[856.5,390.0],[856.5,398.6],[858.2,406.3],[861.6,409.1],[864.1,405.4],[865.9,405.3],[869.0,411.7],[871.3,423.2],[873.5,426.1],[880.1,430.7],[884.1,432.0],[890.0,437.6],[902.3,442.9],[908.5,446.6],[910.5,451.3],[912.5,450.6],[916.8,455.5],[921.6,464.1],[919.0,465.5],[918.4,470.9],[915.2,474.6],[912.3,490.5],[909.8,494.0],[902.5,493.5],[899.8,495.2],[896.6,502.4],[893.8,502.5],[891.5,501.1],[885.9,494.4],[875.8,490.3],[862.7,476.8],[850.9,476.0],[848.1,476.7],[839.1,481.9],[829.9,481.4],[811.2,474.5],[802.4,469.0],[797.1,464.5],[794.1,459.6],[796.9,456.1],[801.6,454.0],[801.5,453.0],[790.3,450.1],[772.1,442.9],[766.2,436.9],[757.6,438.0],[747.2,433.2],[743.1,433.0],[739.0,434.4],[701.8,465.3],[684.8,463.5],[682.4,466.1],[683.4,468.5],[688.2,470.8],[689.5,472.7],[688.2,474.5],[666.4,474.6],[658.6,472.1],[655.8,473.3],[650.8,479.9],[648.2,479.2],[646.4,474.8],[645.1,474.9],[641.7,478.4],[638.6,479.3],[633.0,478.1],[624.7,473.7],[620.1,477.1],[617.1,477.6],[608.7,472.3],[603.9,470.9],[602.4,472.0],[601.4,476.4],[596.9,479.7],[594.2,480.2],[588.9,478.7],[575.6,482.7],[563.9,483.0],[558.4,485.3],[552.6,490.5],[550.1,491.6],[526.4,488.9],[521.0,489.1],[511.7,492.2],[510.4,491.9],[511.9,487.5],[510.1,483.4],[503.2,478.2],[495.6,477.3],[483.9,480.7],[482.1,479.3],[479.1,471.8],[476.5,468.8],[467.8,467.7],[474.7,464.1],[478.2,460.1],[478.1,459.2],[470.5,456.8],[455.1,444.9],[449.5,435.7],[445.5,432.0],[440.8,430.1],[438.1,425.0],[433.3,429.7],[430.9,428.9],[425.3,424.3],[430.4,417.7],[432.1,412.7],[429.7,411.5],[412.0,410.0],[402.4,411.6],[399.9,413.6],[398.6,416.4],[397.4,423.4],[396.1,426.1],[389.6,434.8],[387.0,436.6],[383.8,436.8],[361.6,428.0],[352.4,428.1],[348.5,425.0],[342.6,426.1],[337.2,425.2],[330.9,427.5],[321.9,424.1],[315.1,427.5],[311.1,433.2],[304.8,438.3],[298.3,432.9],[291.4,431.3],[290.9,426.9],[283.0,428.6],[267.9,422.6],[276.2,407.5],[279.9,402.5],[287.5,397.4],[289.7,392.3],[295.6,382.5],[296.1,377.6],[299.9,370.3],[299.9,355.8],[297.6,338.9],[288.7,323.2],[286.0,320.6],[284.1,303.9],[277.5,280.6],[272.7,274.9]]],"routes":{"Tbilisi>Stepantsminda":[[681,387],[678,386],[677,382],[678,373],[676,371],[676,369],[674,368],[673,361],[671,359],[675,343],[674,328],[676,323],[678,319],[678,317],[675,315],[672,315],[669,313],[666,310],[663,303],[665,289],[665,283],[666,280],[666,275],[659,268],[645,264],[639,253],[639,250],[642,247],[645,244],[648,242],[649,239],[651,239],[661,231],[663,228],[662,228]],"Stepantsminda>Telavi":[[662,228],[663,228],[661,231],[651,239],[649,239],[648,242],[645,244],[642,247],[639,250],[639,253],[645,264],[659,268],[666,275],[666,280],[665,283],[665,289],[663,303],[666,310],[669,313],[672,315],[675,315],[678,317],[678,319],[676,323],[679,325],[685,323],[688,323],[690,319],[695,318],[701,322],[704,322],[706,324],[714,327],[715,330],[730,333],[752,345],[765,352],[767,354]],"Telavi>Kutaisi":[[767,354],[765,352],[752,345],[730,333],[715,330],[714,327],[706,324],[704,322],[701,322],[695,318],[690,319],[688,323],[685,323],[679,325],[676,323],[674,328],[675,338],[674,345],[671,359],[667,359],[655,357],[652,358],[649,357],[646,353],[632,342],[612,336],[601,337],[596,340],[592,341],[579,338],[565,331],[531,342],[516,332],[514,326],[513,324],[497,324],[492,320],[482,323],[476,322],[475,323],[475,327],[469,328],[460,321],[447,312],[426,304],[422,298],[419,296],[419,294]],"Kutaisi>Batumi":[[419,294],[419,296],[411,298],[402,300],[388,308],[369,314],[360,310],[355,307],[349,297],[342,291],[339,292],[332,296],[308,301],[300,303],[293,307],[287,315],[290,320],[292,326],[294,329],[300,338],[301,342],[302,366],[301,376],[300,391],[291,404],[288,405],[283,404],[283,405]],"Telavi>Sighnaghi":[[767,354],[765,352],[757,354],[750,364],[748,364],[747,371],[744,375],[745,379],[748,383],[747,386],[769,390],[777,400],[810,404],[815,408],[820,407],[826,404],[824,405]],"Sighnaghi>Gori":[[824,405],[826,404],[820,407],[815,408],[810,404],[777,400],[769,390],[760,387],[742,386],[734,384],[722,391],[714,394],[710,393],[709,384],[708,382],[701,378],[692,376],[683,370],[674,368],[673,361],[671,359],[667,359],[655,357],[652,358],[649,357],[646,353],[632,342],[612,336],[601,337],[596,340],[596,343]],"Gori>Kutaisi":[[596,343],[596,340],[592,341],[579,338],[565,331],[531,342],[516,332],[514,326],[513,324],[497,324],[493,320],[482,323],[476,322],[475,323],[475,327],[469,328],[460,321],[447,312],[426,304],[422,298],[419,296],[419,294]],"Tbilisi>Mtskheta":[[681,387],[678,386],[677,382],[678,373],[676,371],[676,369],[674,368],[672,366]],"Tbilisi>Telavi":[[681,387],[678,386],[685,393],[696,394],[702,393],[714,394],[722,391],[734,384],[742,386],[747,386],[748,383],[745,379],[744,375],[747,371],[748,364],[750,364],[757,354],[765,352],[767,354]],"Telavi>Omalo":[[767,354],[765,352],[752,345],[730,333],[736,331],[744,332],[750,331],[758,329],[761,327],[759,314],[754,307],[761,298],[762,296],[760,293],[761,291],[765,286],[771,282],[778,270],[781,270],[787,276]],"Omalo>Kutaisi":[[787,276],[781,270],[778,270],[771,282],[765,286],[761,291],[760,293],[762,296],[761,298],[754,307],[759,314],[761,327],[758,329],[750,331],[744,332],[736,331],[730,333],[715,330],[714,327],[706,324],[704,322],[701,322],[695,318],[690,319],[688,323],[685,323],[679,325],[676,323],[674,328],[675,338],[674,345],[671,359],[667,359],[655,357],[652,358],[649,357],[646,353],[632,342],[612,336],[601,337],[596,340],[592,341],[579,338],[565,331],[531,342],[516,332],[514,326],[513,324],[497,324],[492,320],[482,323],[476,322],[475,323],[475,327],[469,328],[460,321],[447,312],[426,304],[422,298],[419,296],[419,294]],"Kutaisi>Mestia":[[419,294],[419,296],[411,298],[402,300],[388,308],[369,314],[360,310],[355,307],[349,297],[342,291],[339,292],[334,296],[327,293],[315,288],[303,277],[302,274],[302,271],[306,266],[317,245],[319,242],[326,237],[336,220],[337,217],[337,214],[336,211],[336,207],[334,200],[337,190],[338,188],[352,181],[353,173],[364,167],[371,162],[380,158],[389,159],[392,160],[393,162],[396,164],[400,164],[403,167],[406,165],[407,166],[417,161],[420,162]],"Mestia>Batumi":[[420,162],[417,161],[407,166],[406,165],[403,167],[400,164],[396,164],[393,162],[392,160],[389,159],[380,158],[371,162],[364,167],[353,173],[352,181],[338,188],[337,190],[334,200],[336,207],[336,211],[337,214],[337,217],[336,220],[326,237],[319,242],[317,245],[306,266],[302,271],[302,274],[303,277],[315,288],[334,296],[300,303],[293,307],[287,313],[287,315],[290,320],[292,326],[294,329],[300,338],[301,342],[302,366],[301,376],[300,391],[291,404],[288,405],[283,404],[283,405]]},"places":{"Tbilisi":[681,387],"Mtskheta":[672,366],"Stepantsminda":[662,228],"Gudauri":[642,259],"Ananuri":[670,312],"Telavi":[767,354],"Sighnaghi":[824,405],"Tsinandali":[780,358],"Gori":[596,343],"Uplistsikhe":[607,346],"Kutaisi":[419,294],"Batumi":[283,405],"Mestia":[420,162],"Ushguli":[457,184],"Omalo":[787,276],"Borjomi":[507,367],"Vardzia":[491,445],"Gelati":[426,290],"Zugdidi":[312,254],"Poti":[287,315],"Sukhumi":[205,170],"Akhaltsikhe":[453,401],"Juta":[675,247],"Kazbek":[647,221],"Ushba":[406,150],"Shkhara":[467,170],"DavidGareja":[754,434],"Martvili":[377,269]}};
  var RED = 0xD62839, INK = 0x14161A, S = 0.01, BASE = 0.05, EX = 9; // vertical exaggeration: a model wants drama
  var MPU = 0.01532 / 1000 * EX; // world height per metre (map is 1 unit = 0.653 km, drawn at 0.01 world)

  function loadImg(url) {
    return new Promise(function (ok, no) { var i = new Image(); i.crossOrigin = 'anonymous'; i.onload = function () { ok(i); }; i.onerror = no; i.src = url; });
  }
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  var DPR = Math.min(window.devicePixelRatio || 1, 2) * 1.5;
  function labelTexture(name, sub, active) {
    var f1 = '600 13px Inter, "Inter Tight", system-ui, sans-serif', f2 = '500 11px Inter, system-ui, sans-serif';
    var m = document.createElement('canvas').getContext('2d');
    m.font = f1; var w1 = m.measureText(name).width; m.font = f2; var w2 = sub ? m.measureText(sub).width + 8 : 0;
    var pad = 10, dotW = active ? 14 : 0, w = Math.ceil(pad * 2 + dotW + w1 + w2), h = 26, sh = 8;
    var c = document.createElement('canvas'); c.width = (w + sh * 2) * DPR; c.height = (h + sh * 2) * DPR;
    var x = c.getContext('2d'); x.scale(DPR, DPR); x.translate(sh, sh);
    x.shadowColor = 'rgba(20,22,26,' + (active ? .28 : .14) + ')'; x.shadowBlur = 8; x.shadowOffsetY = 2;
    x.fillStyle = active ? '#14161A' : '#FFFFFF'; rr(x, 0, 0, w, h, 6); x.fill();
    x.shadowColor = 'transparent';
    if (!active) { x.strokeStyle = '#D4D4D8'; x.lineWidth = 1; rr(x, 0.5, 0.5, w - 1, h - 1, 6); x.stroke(); }
    var cx = pad;
    if (active) { x.fillStyle = '#D62839'; x.beginPath(); x.arc(cx + 4, h / 2, 4, 0, Math.PI * 2); x.fill(); cx += dotW; }
    x.textBaseline = 'middle'; x.font = f1; x.fillStyle = active ? '#FFFFFF' : '#14161A'; x.fillText(name, cx, h / 2 + 0.5);
    if (sub) { x.font = f2; x.fillStyle = active ? '#A1A1AA' : '#71717A'; x.fillText(sub, cx + w1 + 8, h / 2 + 0.5); }
    var t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    return { tex: t, w: w + sh * 2, h: h + sh * 2 };
  }
  function markerTexture(active) {
    var S2 = 24, c = document.createElement('canvas'); c.width = c.height = S2 * DPR;
    var x = c.getContext('2d'); x.scale(DPR, DPR);
    if (active) {
      x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(12, 12, 9, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#D62839'; x.beginPath(); x.arc(12, 12, 6.5, 0, Math.PI * 2); x.fill();
      x.strokeStyle = 'rgba(20,22,26,.25)'; x.lineWidth = 1; x.beginPath(); x.arc(12, 12, 9.5, 0, Math.PI * 2); x.stroke();
    } else {
      x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(12, 12, 5.5, 0, Math.PI * 2); x.fill();
      x.strokeStyle = '#14161A'; x.lineWidth = 1.6; x.stroke();
      x.fillStyle = '#D62839'; x.beginPath(); x.arc(12, 12, 2.4, 0, Math.PI * 2); x.fill();
    }
    var t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    return { tex: t, px: S2 };
  }

  function mount(canvas, opts) {
    opts = opts || {};
    if (!canvas) return null;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
    // Without a GPU (software WebGL) the model would stall the page: keep the flat map instead.
    try {
      var gl = renderer.getContext(), dbg = gl.getExtension('WEBGL_debug_renderer_info');
      var gpu = String(gl.getParameter(gl.RENDERER)) + ' ' + (dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '');
      if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpu) && !/[?&]force3d\b/.test(location.search)) { renderer.dispose(); return null; }
    } catch (e) {}
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr || 2));
    // Shadows are baked once (the light never moves), so they cost nothing per frame.
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
    if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(26, 1.5, 0.1, 100);
    var root = new THREE.Group(); scene.add(root);

    var T = META.tr; // raster bounds of the height map (map units)
    var RING = G.geo[0];
    // The sea piece cut out with the country: Georgia's coast, then a soft outer edge out in the Black Sea.
    function nearest(pt) { var bi = 0, bd = 1e9; RING.forEach(function (q, k) { var d = Math.hypot(q[0] - pt[0], q[1] - pt[1]); if (d < bd) { bd = d; bi = k; } }); return bi; }
    var iS = nearest([267.9, 422.6]), iN = nearest([74.0, 103.9]);
    var COAST = RING.slice(iS, RING.length - 1).concat(RING.slice(0, iN + 1));
    // the outer edge follows the coast ~70 units out to sea, smoothed, so the water reads as a strip cut with the land
    var OUT = COAST.map(function (q, k) {
      var sx = 0, sy = 0, n = 0;
      for (var d = -6; d <= 6; d++) { var r = COAST[Math.max(0, Math.min(COAST.length - 1, k + d))]; sx += r[0]; sy += r[1]; n++; }
      return [sx / n - 64, sy / n + 14];
    }).filter(function (q, k, a) { return k % 3 === 0 || k === a.length - 1; }).reverse();
    var SEA_POLY = COAST.concat([[COAST[COAST.length - 1][0] - 40, COAST[COAST.length - 1][1] - 6]], OUT, [[COAST[0][0] - 30, COAST[0][1] + 24]]);
    var bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9;
    RING.concat(SEA_POLY).forEach(function (q) { bx0 = Math.min(bx0, q[0]); bx1 = Math.max(bx1, q[0]); by0 = Math.min(by0, q[1]); by1 = Math.max(by1, q[1]); });
    // The camera frames the whole model.
    var cx = (bx0 + bx1) / 2, cy = (by0 + by1) / 2, W = (bx1 - bx0) * S, D = (by1 - by0) * S;
    function wx(x) { return (x - cx) * S; }
    function wz(y) { return (y - cy) * S; }
    function inside(x, y, poly) { // even-odd point in polygon
      poly = poly || RING; var c = false;
      for (var a = 0, b = poly.length - 1; a < poly.length; b = a++) {
        var A = poly[a], B = poly[b];
        if ((A[1] > y) !== (B[1] > y) && x < (B[0] - A[0]) * (y - A[1]) / (B[1] - A[1]) + A[0]) c = !c;
      }
      return c;
    }

    scene.add(new THREE.HemisphereLight(0xffffff, 0xaab4c0, 1.15));
    var sun = new THREE.DirectionalLight(0xfff6ea, 2.5);
    sun.position.set(-4.2, 6.5, 3.4);
    sun.castShadow = true;
    var SM = opts.shadowMap || 2048; sun.shadow.mapSize.set(SM, SM);
    var shc = sun.shadow.camera; shc.left = -6; shc.right = 6; shc.top = 4.2; shc.bottom = -4.2; shc.near = 0.5; shc.far = 30;
    sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.012;
    scene.add(sun); scene.add(sun.target);

    var state = { ready: false, dead: false };
    var heights = null, hw = 0, hh = 0;
    function hAt(x, y) { // metres at map coords
      if (!heights) return 0;
      var u = (x - T.minx) / (T.maxx - T.minx) * (hw - 1), v = (y - T.miny) / (T.maxy - T.miny) * (hh - 1);
      u = Math.max(0, Math.min(hw - 1.001, u)); v = Math.max(0, Math.min(hh - 1.001, v));
      var i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j;
      var a = heights[j * hw + i], b = heights[j * hw + i + 1], c = heights[(j + 1) * hw + i], d = heights[(j + 1) * hw + i + 1];
      return (a * (1 - fu) + b * fu) * (1 - fv) + (c * (1 - fu) + d * fu) * fv;
    }
    function yAt(x, y) { return BASE + Math.max(0, hAt(x, y)) * MPU; } // the model's surface under a map point
    function groundW(X, Z) { return yAt(X / S + cx, Z / S + cy); }     // ... under a world point

    // containers filled after the terrain loads
    var lineMats = [], tubes = [], pins = [], stopDist = [], totalLen = 0, samples = [];
    var van = null, vanRing = null, vanShadow = null, STEM = opts.stem || 0.13, headN = null, headA = null;
    var focus = null; // null = overview, else stop index

    // ---------------------------------------------------------------------------------------------
    // The land: a smooth surface over a triangle grid, cut exactly to Georgia's border (marching
    // triangles against the outline), with the cut faces showing the terrain's cross-section.
    var SLAB = opts.slab || 0.32, SLAB_BOTTOM = BASE - SLAB;
    var C = function (hex) { return new THREE.Color(hex); };
    var BANDS = [[0, C(0xaab06e)], [200, C(0x97a85e)], [600, C(0x76924a)], [1100, C(0x557739)], [1800, C(0x63793f)], [2200, C(0x8f9170)], [2500, C(0xa29d92)], [2800, C(0xeef1f3)], [3300, C(0xffffff)]];
    var ROCK = C(0x8f897d), EARTH = C(0x6e5c49), PLINTH = C(0xe9e5dc), SEA = C(0x34587e);
    function landColor(h, slope, out) {
      var k = 1; while (k < BANDS.length - 1 && h >= BANDS[k][0]) k++;
      var t = Math.max(0, Math.min(1, (h - BANDS[k - 1][0]) / (BANDS[k][0] - BANDS[k - 1][0]))); t = t * t * (3 - 2 * t);
      out.copy(BANDS[k - 1][1]).lerp(BANDS[k][1], t);
      // steep high ground is bare rock; snow only holds where it is not too steep
      if (h > 1500) out.lerp(ROCK, Math.max(0, Math.min(1, (slope - 0.42) * 2.6)) * Math.min(1, (h - 1500) / 600) * 0.85);
      return out;
    }
    function buildLand() {
      var STEP = opts.cell || 2.5, E = 1.5;
      var x0 = bx0 - STEP, y0 = by0 - STEP, NX = Math.ceil((bx1 - bx0) / STEP) + 3, NY = Math.ceil((by1 - by0) / STEP) + 3;
      // inside flags per grid vertex, by scanline
      var IN = new Uint8Array(NX * NY);
      for (var j = 0; j < NY; j++) {
        var y = y0 + j * STEP, xs = [];
        for (var a = 0, b = RING.length - 1; a < RING.length; b = a++) {
          var A = RING[a], B = RING[b];
          if ((A[1] > y) !== (B[1] > y)) xs.push((B[0] - A[0]) * (y - A[1]) / (B[1] - A[1]) + A[0]);
        }
        xs.sort(function (p, q) { return p - q; });
        for (var i = 0, m = 0, inn = false; i < NX; i++) { var x = x0 + i * STEP; while (m < xs.length && xs[m] <= x) { inn = !inn; m++; } IN[j * NX + i] = inn ? 1 : 0; }
      }
      var pos = [], nor = [], col = [], idx = [], vn = 0, tmp = new THREE.Color(), nrm = new THREE.Vector3();
      function surfVert(x, y) {
        var h = Math.max(0, hAt(x, y));
        var gx = (hAt(x + E, y) - hAt(x - E, y)) * MPU / (2 * E * S), gz = (hAt(x, y + E) - hAt(x, y - E)) * MPU / (2 * E * S);
        nrm.set(-gx, 1, -gz).normalize();
        landColor(h, 1 - nrm.y, tmp);
        pos.push(wx(x), BASE + h * MPU, wz(y)); nor.push(nrm.x, nrm.y, nrm.z); col.push(tmp.r, tmp.g, tmp.b);
        return vn++;
      }
      var VI = new Int32Array(NX * NY).fill(-1), XI = new Map();
      function gv(k) { if (VI[k] < 0) VI[k] = surfVert(x0 + (k % NX) * STEP, y0 + Math.floor(k / NX) * STEP); return VI[k]; }
      function gxy(k) { return [x0 + (k % NX) * STEP, y0 + Math.floor(k / NX) * STEP]; }
      // exact border crossing on the grid edge from inside vertex ka to outside vertex kb
      function cross(ka, kb) {
        var key = ka * 4194304 + kb, hit = XI.get(key); if (hit) return hit;
        var P = gxy(ka), Q = gxy(kb), best = 1, dx = Q[0] - P[0], dy = Q[1] - P[1];
        for (var a = 0, b = RING.length - 1; a < RING.length; b = a++) {
          var A = RING[b], B = RING[a], ex = B[0] - A[0], ey = B[1] - A[1], den = dx * ey - dy * ex;
          if (Math.abs(den) < 1e-12) continue;
          var t = ((A[0] - P[0]) * ey - (A[1] - P[1]) * ex) / den, u = ((A[0] - P[0]) * dy - (A[1] - P[1]) * dx) / den;
          if (t >= 0 && t <= 1 && u >= 0 && u <= 1 && t < best) best = t;
        }
        var xy = [P[0] + dx * best, P[1] + dy * best];
        hit = { v: surfVert(xy[0], xy[1]), xy: xy }; XI.set(key, hit); return hit;
      }
      var segs = []; // border segments [xyA, xyB, inward point]
      function triangle(ka, kb, kc) {
        var ks = [ka, kb, kc], f = [IN[ka], IN[kb], IN[kc]], n = f[0] + f[1] + f[2];
        if (n === 0) return;
        if (n === 3) { idx.push(gv(ka), gv(kb), gv(kc)); return; }
        var poly = [], cut = [];
        for (var e = 0; e < 3; e++) {
          var p = ks[e], q = ks[(e + 1) % 3];
          if (f[e]) poly.push(gv(p));
          if (f[e] !== f[(e + 1) % 3]) { var h = f[e] ? cross(p, q) : cross(q, p); poly.push(h.v); cut.push(h.xy); }
        }
        for (var t = 1; t < poly.length - 1; t++) idx.push(poly[0], poly[t], poly[t + 1]);
        var inn = gxy(f[0] ? ka : f[1] ? kb : kc);
        if (cut.length === 2) segs.push([cut[0], cut[1], inn]);
      }
      for (var j = 0; j < NY - 1; j++) for (var i = 0; i < NX - 1; i++) {
        var a = j * NX + i, b = a + 1, c2 = a + NX + 1, d = a + NX;
        if ((i + j) & 1) { triangle(a, b, c2); triangle(a, c2, d); } else { triangle(a, b, d); triangle(b, c2, d); }
      }
      // keep every surface triangle facing up
      for (var t = 0; t < idx.length; t += 3) {
        var A = idx[t] * 3, B = idx[t + 1] * 3, Cc = idx[t + 2] * 3;
        var cy2 = (pos[B + 2] - pos[A + 2]) * (pos[Cc] - pos[A]) - (pos[B] - pos[A]) * (pos[Cc + 2] - pos[A + 2]);
        if (cy2 < 0) { var sw = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = sw; }
      }
      // the cut: terrain colour fading into earth above sea level, then the pale plinth
      function wallQuad(A, B, yA0, yA1, yB0, yB1, n, cTop, cBot) {
        var base = vn;
        pos.push(wx(A[0]), yA0, wz(A[1]), wx(A[0]), yA1, wz(A[1]), wx(B[0]), yB1, wz(B[1]), wx(B[0]), yB0, wz(B[1]));
        for (var q = 0; q < 4; q++) { nor.push(n[0], 0, n[1]); var cc = q === 1 || q === 2 ? cTop : cBot; col.push(cc.r, cc.g, cc.b); }
        vn += 4;
        // winding so the face points along n
        var ux = wx(B[0]) - wx(A[0]), uz = wz(B[1]) - wz(A[1]);
        if (ux * n[1] - uz * n[0] < 0) idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
        else idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
      }
      var cA = new THREE.Color(), cB = new THREE.Color(), soil = EARTH.clone();
      segs.forEach(function (sg) {
        var A = sg[0], B = sg[1], ex = B[0] - A[0], ey = B[1] - A[1], L = Math.hypot(ex, ey); if (L < 1e-6) return;
        var n = [ey / L, -ex / L], mx = (A[0] + B[0]) / 2 - sg[2][0], my = (A[1] + B[1]) / 2 - sg[2][1];
        if (n[0] * mx + n[1] * my < 0) n = [-n[0], -n[1]];
        var hA = Math.max(0, hAt(A[0], A[1])), hB = Math.max(0, hAt(B[0], B[1]));
        landColor((hA + hB) / 2, 0, cA).multiplyScalar(0.72);
        wallQuad(A, B, BASE, BASE + hA * MPU, BASE, BASE + hB * MPU, n, cA, cB.copy(soil));
        wallQuad(A, B, SLAB_BOTTOM, BASE, SLAB_BOTTOM, BASE, n, PLINTH, PLINTH);
      });
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      g.setIndex(vn > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1));
      var land = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }));
      land.castShadow = true; land.receiveShadow = true; root.add(land);
    }

    // The Black Sea: a calm navy piece cut out with the coast, sitting a hair below the beach.
    function buildSea() {
      var sh = new THREE.Shape(SEA_POLY.map(function (q) { return new THREE.Vector2(wx(q[0]), -wz(q[1])); }));
      var g = new THREE.ExtrudeGeometry(sh, { depth: SLAB - 0.008, bevelEnabled: false, curveSegments: 1 });
      g.rotateX(-Math.PI / 2); g.translate(0, SLAB_BOTTOM, 0);
      var sea = new THREE.Mesh(g, [new THREE.MeshLambertMaterial({ color: SEA }), new THREE.MeshLambertMaterial({ color: PLINTH })]);
      sea.receiveShadow = true; root.add(sea);
    }

    // ---------------------------------------------------------------------------------------------
    // The stops: a small hand-built scene at each, like the pieces on an architect's model. Every
    // piece is modelled in local units (before LM), then merged into one mesh per material.
    var LM = opts.lmScale || 2.3;
    var LABEL_H = { Tbilisi: 0.15, Telavi: 0.13, Omalo: 0.13, Kutaisi: 0.13, Mestia: 0.16, Batumi: 0.21 };
    function buildStops() {
      var MAT = {
        stone: 0xefe8d8, stoneY: 0xe8d9b4, stoneD: 0xcdc2ab, stoneG: 0x9f988b, stoneT: 0x8c867a, stoneS: 0xd8cfbd,
        ochre: 0xe2c287, rose: 0xe8c9bd, sky: 0xcfdde4, roof: 0xb4532f, roofD: 0x93432a, roofG: 0x6f8c7d, roofGrey: 0x8c939a,
        slate: 0x4e535a, gold: 0xe0ad37, clay: 0xb5643a, brick: 0xc5895a, wood: 0x7a5233, vine: 0x6e9437, grape: 0x5a2b5c,
        leaf: 0x4f8a35, leafL: 0x77a345, pine: 0x2c5a30, trunk: 0x7c5c3c, palmT: 0x9a7a55, white: 0xf8f6f1, glass: 0x9fcfe8,
        glassD: 0x6f9fbe, steel: 0xc9cdd3, water: 0x4f86b5, sand: 0xead8ad, ink: 0x2a2d33, red: RED, wool: 0xf3f0e8, horse: 0x6b4630
      };
      var SHINY = { gold: 70, glass: 90, glassD: 90, steel: 50, water: 40 };
      var buckets = {}, e = new THREE.Euler(), q = new THREE.Quaternion(), m = new THREE.Matrix4(), v = new THREE.Vector3(), sv = new THREE.Vector3();
      var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
      function pick(a) { return a[Math.floor(rnd() * a.length)]; }

      // primitives, standing on y = 0
      function box(w, h, d) { return new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0); }
      function cyl(r, h, seg, rb) { return new THREE.CylinderGeometry(r, rb === undefined ? r : rb, h, seg || 12).translate(0, h / 2, 0); }
      function cone(r, h, seg) { return new THREE.ConeGeometry(r, h, seg || 12).translate(0, h / 2, 0); }
      function ball(r, ws, hs) { return new THREE.SphereGeometry(r, ws || 10, hs || 8); }
      function dome(r) { return new THREE.SphereGeometry(r, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2); }
      function flat(g) { var f = g.toNonIndexed(); f.computeVertexNormals(); return f; }
      function sq(rTop, rBot, h) { return flat(cyl(rTop * Math.SQRT2, h, 4, rBot * Math.SQRT2).rotateY(Math.PI / 4)); } // square, tapering
      function gable(w, h, d) { // a pitched roof: ridge along z, w across it
        var g = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), p = g.attributes.position;
        for (var k = 0; k < p.count; k++) if (p.getY(k) > h / 2) p.setX(k, 0);
        return flat(g);
      }
      function leafX(len, w) { return new THREE.ConeGeometry(w, len, 4).rotateZ(-Math.PI / 2).translate(len / 2, 0, 0).scale(1, 0.22, 1); }
      // a transformed copy, in a model's local frame
      function T(g, x, y, z, o) {
        o = o || {}; var c = g.index ? g.toNonIndexed() : g.clone();
        e.set(o.rx || 0, o.ry || 0, o.rz || 0); q.setFromEuler(e);
        var s3 = o.s === undefined ? 1 : o.s; if (Array.isArray(s3)) sv.set(s3[0], s3[1], s3[2]); else sv.setScalar(s3);
        m.compose(v.set(x || 0, y || 0, z || 0), q, sv); c.applyMatrix4(m); return c;
      }
      // set a model (a list of [geometry, material]) down at an offset from the stop; it settles to the lowest
      // ground under its footprint, so on a slope it is built into the hill rather than floating
      function place(parts, X0, Z0, dx, dz, o) {
        o = o || {};
        var X = X0 + dx * LM, Z = Z0 + dz * LM;
        if (!inside(X / S + cx, Z / S + cy)) return false;
        var f = (o.foot === undefined ? 0.01 : o.foot) * LM, gy = groundW(X, Z);
        if (f > 0) gy = Math.min(gy, groundW(X + f, Z + f), groundW(X - f, Z + f), groundW(X + f, Z - f), groundW(X - f, Z - f));
        e.set(0, o.ry || 0, 0); q.setFromEuler(e); sv.setScalar(LM * (o.s || 1));
        m.compose(v.set(X, gy + ((o.y || 0) - (o.sink === undefined ? 0.002 : o.sink)) * LM, Z), q, sv);
        parts.forEach(function (p) {
          var g = p[0].index ? p[0].toNonIndexed() : p[0].clone();
          if (g.attributes.uv) g.deleteAttribute('uv');
          g.applyMatrix4(m); (buckets[p[1]] = buckets[p[1]] || []).push(g);
        });
        return true;
      }
      function at(name) { var p = G.places[name]; return [wx(p[0]), wz(p[1])]; }

      // ---- the kit ----
      function house(o) {
        o = o || {}; var w = o.w || 0.022, d = o.d || 0.017, h = o.h || 0.015, wall = o.wall || 'stone', P = [];
        P.push([box(w, h, d), wall]);
        P.push([T(gable(d * 1.16, h * 0.5, w * 1.12), 0, h, 0, { ry: Math.PI / 2 }), o.roof || 'roof']);
        var n = Math.max(1, Math.round(w / 0.008));
        for (var k = 0; k < n; k++) {
          var x = -w / 2 + (k + 0.5) * w / n;
          P.push([T(box(0.003, 0.0045, 0.0008), x, h * 0.58, d / 2 + 0.0003), 'ink']);
          if (h > 0.013) P.push([T(box(0.003, 0.0045, 0.0008), x, h * 0.18, d / 2 + 0.0003), 'ink']);
        }
        if (o.balcony) { // the carved wooden balconies of old Tbilisi
          P.push([T(box(w * 0.9, 0.0016, 0.006), 0, h * 0.42, d / 2 + 0.003), 'wood']);
          P.push([T(box(w * 0.9, 0.0035, 0.0008), 0, h * 0.42 + 0.0016, d / 2 + 0.0058), 'wood']);
          for (var b = 0; b < 4; b++) P.push([T(box(0.0009, h * 0.5, 0.0009), -w * 0.42 + b * w * 0.28, h * 0.42, d / 2 + 0.0058), 'wood']);
        }
        if (o.chimney) P.push([T(box(0.003, 0.008, 0.003), w * 0.25, h + 0.002, 0), o.roof === 'slate' ? 'stoneG' : 'stoneD']);
        return P;
      }
      // a Georgian cross-domed church: nave and transept, gabled roofs, a tall drum with arched windows and a cone dome
      function church(o) {
        var L = o.L, B = o.B, H = o.H, wall = o.wall, roof = o.roof, P = [];
        if (o.plinth) P.push([box(L * 1.35, o.plinth, L * 1.15), o.plinthMat || 'stoneD']);
        var y0 = o.plinth || 0;
        P.push([T(box(L, H, B), 0, y0, 0), wall], [T(box(B, H, L * 0.78), 0, y0, 0), wall]);
        P.push([T(gable(B * 1.08, B * 0.36, L * 1.03), 0, y0 + H, 0, { ry: Math.PI / 2 }), roof]);
        P.push([T(gable(B * 1.08, B * 0.36, L * 0.8), 0, y0 + H, 0), roof]);
        P.push([T(cyl(B * 0.36, H * 0.86, 14), L / 2, y0, 0), wall], [T(cone(B * 0.39, B * 0.2, 14), L / 2, y0 + H * 0.86, 0), roof]); // apse
        var yb = y0 + H + B * 0.22, dr = o.drumR || B * 0.3, dh = o.drumH || H * 0.75;
        P.push([T(box(B * 0.78, B * 0.24, B * 0.78), 0, y0 + H, 0), wall]);
        P.push([T(cyl(dr, dh, 16), 0, yb, 0), wall]);
        for (var k = 0; k < 8; k++) { var a = k / 8 * Math.PI * 2; P.push([T(box(0.0022, dh * 0.42, 0.0008), Math.sin(a) * (dr + 0.0002), yb + dh * 0.32, Math.cos(a) * (dr + 0.0002), { ry: a }), 'ink']); }
        P.push([T(cone(dr * 1.18, o.domeH || dr * 1.9, 16), 0, yb + dh, 0), o.domeMat || roof]);
        var top = yb + dh + (o.domeH || dr * 1.9);
        P.push([T(box(0.0016, 0.011, 0.0016), 0, top - 0.001, 0), 'gold'], [T(box(0.0065, 0.0016, 0.0016), 0, top + 0.006, 0), 'gold']);
        for (var w = 0; w < 4; w++) { // tall arched windows along the nave
          var x = -L * 0.38 + w * L * 0.18; if (Math.abs(x) < B * 0.6) continue;
          P.push([T(box(0.0026, H * 0.42, 0.0008), x, y0 + H * 0.36, B / 2 + 0.0003), 'ink']);
        }
        P.push([T(box(0.0008, H * 0.5, B * 0.22), -L / 2 - 0.0003, y0, 0), 'ink']); // west door
        return P;
      }
      function svanTower(H) {
        var P = [[sq(0.0062, 0.0074, H - 0.012), 'stoneS']];
        P.push([T(box(0.0142, 0.012, 0.0142), 0, H - 0.012, 0), 'stoneS']);            // the wider fighting storey
        P.push([T(box(0.0156, 0.0016, 0.0156), 0, H - 0.0122, 0), 'stoneD']);          // corbel line
        P.push([T(gable(0.0166, 0.0085, 0.0166), 0, H, 0), 'slate']);
        for (var f = 0; f < 4; f++) {
          var a = f * Math.PI / 2, nx = Math.sin(a), nz = Math.cos(a);
          P.push([T(box(0.0026, 0.0048, 0.0008), nx * 0.0072, H - 0.008, nz * 0.0072, { ry: a }), 'ink']);
          P.push([T(box(0.0016, 0.004, 0.0008), nx * 0.0066, H * 0.48, nz * 0.0066, { ry: a }), 'ink']);
        }
        return P;
      }
      function tushTower(H) {
        var P = [[sq(0.0095, 0.0115, H), 'stoneT']], steps = 6;
        for (var k = 0; k < steps; k++) { // stepped slate roof, each course slightly overhanging
          var w = 0.0225 * (1 - k / (steps + 0.6));
          P.push([T(box(w, 0.0034, w), 0, H + k * 0.0034, 0), 'slate']);
        }
        P.push([T(cone(0.0028, 0.012, 6), 0, H + steps * 0.0034, 0), 'slate']);
        for (var f = 0; f < 4; f++) {
          var a = f * Math.PI / 2;
          for (var r = 0; r < 3; r++) P.push([T(box(0.0028, 0.0045, 0.0008), Math.sin(a) * 0.0104, H * (0.3 + r * 0.22), Math.cos(a) * 0.0104, { ry: a }), 'ink']);
        }
        return P;
      }
      function pine(h) {
        h = h || 0.04; var P = [[cyl(0.0014, h * 0.25, 5), 'trunk']];
        for (var k = 0; k < 3; k++) P.push([T(cone(0.0105 * (1 - k * 0.24) * h / 0.04, h * 0.42, 8), 0, h * (0.18 + k * 0.24), 0), 'pine']);
        return P;
      }
      function cypress(h) { h = h || 0.045; return [[T(ball(0.0058, 8, 8), 0, 0.006, 0, { s: [1, 1.2, 1] }), 'pine'], [cone(0.0058, h, 8), 'pine']]; }
      function tree(h) { // a round-crowned walnut or plane tree
        h = h || 0.03; return [[cyl(0.0015, h * 0.5, 5), 'trunk'], [T(ball(h * 0.36, 9, 7), 0, h * 0.68, 0, { s: [1, 0.86, 1] }), pick(['leaf', 'leafL'])]];
      }
      function palm(h, lean, ry) {
        var P = [], x = 0, y = 0, segs = 6, seg = h / segs;
        for (var k = 0; k < segs; k++) { // a trunk that curves as it rises
          var a = lean * (k + 1) / segs;
          P.push([T(cyl(0.0013 - k * 0.00008, seg * 1.04, 6, 0.0016 - k * 0.00008), x, y, 0, { rz: a }), 'palmT']);
          x -= Math.sin(a) * seg; y += Math.cos(a) * seg;
        }
        for (var f = 0; f < 9; f++) { // fronds: rising, then drooping at the tips
          var fa = f / 9 * Math.PI * 2 + rnd() * 0.3, up = 0.15 + rnd() * 0.25;
          var l1 = 0.015, l2 = 0.014, ex = Math.cos(up) * l1, ey = Math.sin(up) * l1;
          var frond = [T(leafX(l1, 0.0042), 0, 0, 0, { rz: up }), T(leafX(l2, 0.0038), ex, ey, 0, { rz: -0.55 - rnd() * 0.3 })];
          frond.forEach(function (g) { P.push([T(g, x, y, 0, { ry: fa }), 'leaf']); });
        }
        for (var c = 0; c < 3; c++) P.push([T(ball(0.0018, 6, 5), x + Math.cos(c * 2.1) * 0.0022, y - 0.002, Math.sin(c * 2.1) * 0.0022), 'trunk']);
        return P.map(function (p) { return [T(p[0], 0, 0, 0, { ry: ry || 0 }), p[1]]; });
      }
      function qvevri(s, lying) {
        var egg = new THREE.LatheGeometry([[0, 0], [0.007, 0.002], [0.015, 0.012], [0.018, 0.027], [0.016, 0.041], [0.0105, 0.052], [0.0085, 0.056], [0.0102, 0.0585], [0.0102, 0.061], [0.0082, 0.061]].map(function (p) { return new THREE.Vector2(p[0] * s, p[1] * s); }), 18);
        var mouth = T(cyl(0.0081 * s, 0.0006, 14), 0, 0.0606 * s, 0);
        if (!lying) return [[egg, 'clay'], [mouth, 'ink']];
        return [[T(egg, 0, 0.018 * s, -0.03 * s, { rx: Math.PI / 2 - 0.12 }), 'clay'], [T(mouth, 0, 0.018 * s, -0.03 * s, { rx: Math.PI / 2 - 0.12 }), 'ink']];
      }
      function sheep() {
        return [[T(ball(0.005, 8, 6), 0, 0.0065, 0, { s: [1.35, 0.95, 1] }), 'wool'], [T(box(0.0032, 0.0034, 0.0028), 0.0071, 0.0078, 0), 'ink'],
          [T(box(0.0011, 0.004, 0.0011), 0.004, 0, 0.0022), 'ink'], [T(box(0.0011, 0.004, 0.0011), 0.004, 0, -0.0022), 'ink'],
          [T(box(0.0011, 0.004, 0.0011), -0.004, 0, 0.0022), 'ink'], [T(box(0.0011, 0.004, 0.0011), -0.004, 0, -0.0022), 'ink']];
      }
      function horse() {
        var P = [[T(box(0.016, 0.0068, 0.0058), 0, 0.0095, 0), 'horse'], [T(box(0.0045, 0.011, 0.0042), 0.0075, 0.0128, 0, { rz: -0.55 }), 'horse'],
          [T(box(0.0068, 0.0036, 0.0036), 0.0128, 0.0205, 0, { rz: -0.35 }), 'horse'], [T(box(0.0015, 0.0085, 0.0013), -0.0086, 0.006, 0, { rz: 0.35 }), 'ink']];
        [[0.0058, 0.0021], [0.0058, -0.0021], [-0.0058, 0.0021], [-0.0058, -0.0021]].forEach(function (l) { P.push([T(box(0.0017, 0.0098, 0.0017), l[0], 0, l[1]), 'horse']); });
        return P;
      }
      function river(X0, Z0, pts, wdt) { // a smooth ribbon of water draped over the ground
        var curve = new THREE.CatmullRomCurve3(pts.map(function (p) { return new THREE.Vector3(X0 + p[0] * LM, 0, Z0 + p[1] * LM); }), false, 'centripetal');
        var N = 80, half = wdt * LM / 2, pos = [], prev = null;
        for (var k = 0; k <= N; k++) {
          var c = curve.getPointAt(k / N), t = curve.getTangentAt(k / N), nx = -t.z, nz = t.x;
          var L = [c.x + nx * half, c.z + nz * half], R = [c.x - nx * half, c.z - nz * half];
          var ok = inside(c.x / S + cx, c.z / S + cy), y = Math.max(groundW(c.x, c.z), groundW(L[0], L[1]), groundW(R[0], R[1])) + 0.0025 * LM;
          var cur = ok ? [L[0], y, L[1], R[0], y, R[1]] : null;
          if (cur && prev) pos.push(prev[0], prev[1], prev[2], prev[3], prev[4], prev[5], cur[0], cur[1], cur[2], prev[3], prev[4], prev[5], cur[3], cur[4], cur[5], cur[0], cur[1], cur[2]);
          prev = cur;
        }
        if (!pos.length) return;
        var g = new THREE.BufferGeometry();
        for (var i = 0; i < pos.length; i += 9) { // wind every triangle to face up
          var ux = pos[i + 3] - pos[i], uz = pos[i + 5] - pos[i + 2], vx = pos[i + 6] - pos[i], vz = pos[i + 8] - pos[i + 2];
          if (uz * vx - ux * vz < 0) for (var j = 0; j < 3; j++) { var tmp = pos[i + 3 + j]; pos[i + 3 + j] = pos[i + 6 + j]; pos[i + 6 + j] = tmp; }
        }
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.computeVertexNormals();
        (buckets.water = buckets.water || []).push(g);
      }
      function flagAt(X0, Z0) { // the stop itself: a little red pennant where the route arrives
        place([[cyl(0.0011, 0.05, 6), 'white'], [T(box(0.017, 0.011, 0.0012), 0.0085, 0.039, 0), 'red']], X0, Z0, 0, 0, { foot: 0 });
      }

      // 1 · Tbilisi — Sameba's gold dome, Narikala on its ridge, Mother of Georgia, the Mtkvari and the Bridge of Peace,
      // the brick domes of the sulphur baths and old-town houses with carved balconies
      (function () {
        var o = at('Tbilisi'), X = o[0], Z = o[1];
        river(X, Z, [[-0.2, 0.11], [-0.09, 0.06], [-0.02, 0.012], [0.05, -0.012], [0.12, 0.0], [0.21, -0.03]], 0.02);
        place(church({ L: 0.064, B: 0.03, H: 0.036, wall: 'stone', roof: 'roofGrey', plinth: 0.012, drumR: 0.0115, drumH: 0.034, domeH: 0.034, domeMat: 'gold' }), X, Z, -0.075, -0.075, { ry: 0.1, foot: 0.03 });
        // a second tier around the drum, as at Sameba
        place([[T(box(0.034, 0.012, 0.034), 0, 0.048, 0), 'stone'], [T(gable(0.036, 0.008, 0.036), 0, 0.06, 0), 'roofGrey']], X, Z, -0.075, -0.075, { ry: 0.1, foot: 0.03 });
        // Narikala: crenellated walls and round towers along the ridge, with St Nicholas below
        var wall = [[0.06, -0.06], [0.09, -0.052], [0.12, -0.056], [0.15, -0.07]];
        for (var k = 0; k < wall.length - 1; k++) {
          var a = wall[k], b = wall[k + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = -Math.atan2(b[1] - a[1], b[0] - a[0]);
          var P = [[box(len, 0.014, 0.0055), 'stoneG']];
          for (var c = 0; c < 6; c++) P.push([T(box(0.0028, 0.003, 0.006), -len / 2 + (c + 0.5) * len / 6, 0.014, 0), 'stoneG']);
          place(P.map(function (p) { return [T(p[0], 0, 0, 0, { ry: ang }), p[1]]; }), X, Z, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, { foot: 0.012 });
        }
        wall.forEach(function (t) {
          var P = [[cyl(0.0068, 0.026, 12), 'stoneG']];
          for (var c = 0; c < 8; c++) { var an = c / 8 * Math.PI * 2; P.push([T(box(0.0024, 0.003, 0.0024), Math.cos(an) * 0.0058, 0.026, Math.sin(an) * 0.0058), 'stoneG']); }
          place(P, X, Z, t[0], t[1], { foot: 0.006 });
        });
        place(church({ L: 0.022, B: 0.012, H: 0.014, wall: 'stoneY', roof: 'roof', drumR: 0.0045, drumH: 0.01, domeH: 0.01 }), X, Z, 0.105, -0.035, { foot: 0.01 });
        // Kartlis Deda, the Mother of Georgia: a slim aluminium figure, sword raised
        place([[box(0.008, 0.006, 0.008), 'stoneD'], [T(cyl(0.0026, 0.04, 8, 0.0046), 0, 0.006, 0), 'steel'], [T(ball(0.0026, 8, 6), 0, 0.049, 0), 'steel'],
          [T(box(0.018, 0.0018, 0.0018), 0, 0.04, 0), 'steel'], [T(box(0.0012, 0.022, 0.0012), 0.0088, 0.04, 0), 'steel'], [T(cyl(0.0034, 0.0016, 8), -0.0088, 0.0395, 0), 'steel']],
          X, Z, 0.175, -0.085, { ry: 0.3, foot: 0.006 });
        // the Bridge of Peace: a deck and a glass canopy in a long wave
        var bx = -0.012, bz = 0.009, ba = -Math.atan2(-0.024, 0.07) + Math.PI / 2;
        var wave = []; for (var k2 = 0; k2 <= 24; k2++) { var t = k2 / 24; wave.push(new THREE.Vector3((t - 0.5) * 0.06, 0.009 + Math.sin(t * Math.PI * 3) * 0.0035 + Math.sin(t * Math.PI) * 0.004, 0)); }
        var canopy = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wave), 48, 0.0022, 6);
        place([[T(box(0.06, 0.0018, 0.0075), 0, 0.0055, 0), 'white'], [T(canopy, 0, 0, 0.0028), 'glass'], [T(canopy, 0, 0, -0.0028), 'glass']]
          .map(function (p) { return [T(p[0], 0, 0, 0, { ry: ba }), p[1]]; }), X, Z, bx, bz, { foot: 0, sink: 0 });
        // sulphur baths: brick domes with little lanterns
        [[-0.06, 0.035], [-0.042, 0.048], [-0.026, 0.06], [-0.05, 0.066]].forEach(function (d) {
          place([[T(dome(0.0105), 0, 0.002, 0), 'brick'], [T(cyl(0.0022, 0.004, 8), 0, 0.0115, 0), 'brick'], [T(cone(0.0028, 0.003, 8), 0, 0.0155, 0), 'brick'], [box(0.024, 0.003, 0.024), 'brick']], X, Z, d[0], d[1], { foot: 0.008 });
        });
        // the old town
        for (var h = 0; h < 15; h++) {
          var hx = 0.02 + rnd() * 0.12, hz = 0.02 + rnd() * 0.08;
          place(house({ w: 0.018 + rnd() * 0.012, d: 0.016, h: 0.013 + rnd() * 0.012, wall: pick(['stone', 'ochre', 'rose', 'sky', 'stoneY']), roof: pick(['roof', 'roofD']), balcony: rnd() > 0.35, chimney: rnd() > 0.6 }),
            X, Z, hx, hz, { ry: (rnd() - 0.5) * 0.7 });
        }
        for (var t2 = 0; t2 < 7; t2++) place(tree(0.022 + rnd() * 0.01), X, Z, -0.14 + rnd() * 0.1, -0.03 + rnd() * 0.08, { foot: 0 });
        flagAt(X, Z);
      })();

      // 2 · Kakheti — Alaverdi in its walled yard, vine rows heavy with grapes, qvevri, a stone marani and walnut trees
      (function () {
        var o = at('Telavi'), X = o[0], Z = o[1];
        for (var r = 0; r < 11; r++) for (var k = 0; k < 10; k++) {
          var P = [[T(box(0.0145, 0.0052, 0.0042), 0, 0.0055, 0), 'vine'], [T(box(0.0009, 0.0062, 0.0009), -0.0065, 0, 0), 'wood']];
          if ((r + k) % 2 === 0) P.push([T(ball(0.0016, 6, 5), 0.002, 0.0046, 0.0024), 'grape'], [T(ball(0.0016, 6, 5), -0.003, 0.0046, -0.0024), 'grape']);
          place(P, X, Z, -0.19 + k * 0.0152, 0.03 + r * 0.0125, { foot: 0, sink: 0.0008 });
        }
        // Alaverdi Cathedral, tall and plain, inside its wall
        var ax = 0.02, az = -0.12;
        place(church({ L: 0.07, B: 0.032, H: 0.05, wall: 'stoneY', roof: 'roofG', drumR: 0.012, drumH: 0.03, domeH: 0.026 }), X, Z, ax, az, { ry: -0.15, foot: 0.03 });
        var yard = [[-0.06, -0.045], [0.06, -0.045], [0.06, 0.045], [-0.06, 0.045]];
        for (var w = 0; w < 4; w++) {
          var a = yard[w], b = yard[(w + 1) % 4], mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          place([[T(box(len, 0.008, 0.003), 0, 0, 0, { ry: -Math.atan2(b[1] - a[1], b[0] - a[0]) }), 'stoneD']], X, Z, ax + mx, az + mz, { foot: 0 });
        }
        // qvevri, one waiting on its side, beside the marani
        [[0.06, -0.012, 1], [0.08, 0.0, 0.85], [0.064, 0.016, 0.95]].forEach(function (j) { place(qvevri(j[2]), X, Z, j[0], j[1], { foot: 0, sink: 0.005 }); });
        place(qvevri(0.9, true), X, Z, 0.1, -0.022, { ry: 0.6, foot: 0 });
        var marani = house({ w: 0.05, d: 0.03, h: 0.022, wall: 'stoneD', roof: 'roof', balcony: true });
        marani.push([T(box(0.009, 0.012, 0.0008), -0.012, 0, 0.0153), 'ink'], [T(cyl(0.0045, 0.0008, 12).rotateX(Math.PI / 2), -0.012, 0.012, 0.0153), 'ink']);
        place(marani, X, Z, 0.09, -0.06, { ry: 0.12, foot: 0.02 });
        [[0.035, -0.06], [0.045, -0.035], [0.13, -0.07], [0.135, -0.04], [-0.03, -0.02], [-0.05, -0.04]].forEach(function (t) { place(cypress(), X, Z, t[0], t[1], { foot: 0 }); });
        for (var t2 = 0; t2 < 5; t2++) place(tree(0.028 + rnd() * 0.01), X, Z, 0.13 + rnd() * 0.06, 0.0 + rnd() * 0.08, { foot: 0 });
        flagAt(X, Z);
      })();

      // 3 · Tusheti — the towers of Keselo above Omalo, slate-roofed houses, horses and a flock on the summer pasture
      (function () {
        var o = at('Omalo'), X = o[0], Z = o[1];
        [[0.04, -0.045, 0.09], [0.062, -0.058, 0.105], [0.085, -0.044, 0.085], [0.058, -0.028, 0.075], [0.108, -0.056, 0.095]].forEach(function (t) { place(tushTower(t[2]), X, Z, t[0], t[1], { foot: 0.008 }); });
        for (var k = 0; k < 6; k++) {
          var P = house({ w: 0.026, d: 0.02, h: 0.016, wall: pick(['stoneT', 'stoneG']), roof: 'slate', chimney: true });
          P[1] = [T(box(0.029, 0.0028, 0.023), 0, 0.016, 0), 'slate']; // flat slate roofs here
          P.push([T(box(0.02, 0.0014, 0.005), 0, 0.009, 0.0125), 'wood']);
          place(P, X, Z, -0.03 + rnd() * 0.09, -0.08 + rnd() * 0.035, { ry: (rnd() - 0.5) * 0.6, foot: 0.012 });
        }
        for (var s = 0; s < 12; s++) place(sheep(), X, Z, -0.07 + rnd() * 0.12, 0.035 + rnd() * 0.06, { ry: rnd() * 6.28, foot: 0, sink: 0.001 });
        place(horse(), X, Z, 0.08, 0.04, { ry: 0.4, foot: 0 }); place(horse(), X, Z, 0.1, 0.052, { ry: 2.6, foot: 0 });
        for (var t = 0; t < 8; t++) place(pine(0.032 + rnd() * 0.014), X, Z, -0.12 + rnd() * 0.06, -0.06 + rnd() * 0.12, { foot: 0 });
        flagAt(X, Z);
      })();

      // 4 · Kutaisi — Bagrati on Ukimerioni hill, Gelati up the valley, the Rioni and the White Bridge, the Colchis Fountain
      (function () {
        var o = at('Kutaisi'), X = o[0], Z = o[1];
        river(X, Z, [[-0.06, -0.16], [-0.035, -0.08], [-0.03, -0.01], [-0.045, 0.06], [-0.03, 0.15]], 0.017);
        place(church({ L: 0.09, B: 0.044, H: 0.042, wall: 'stoneY', roof: 'roofG', plinth: 0.008, drumR: 0.0165, drumH: 0.034, domeH: 0.03 }), X, Z, 0.045, -0.07, { foot: 0.035 });
        place([[box(0.016, 0.03, 0.016), 'stoneY'], [T(cone(0.012, 0.012, 4).rotateY(Math.PI / 4), 0, 0.03, 0), 'roofG']], X, Z, 0.0, -0.09, { foot: 0.008 }); // bell tower
        // Gelati: a larger church and a smaller one in a monastery wall
        place(church({ L: 0.06, B: 0.03, H: 0.034, wall: 'stoneD', roof: 'roofG', drumR: 0.011, drumH: 0.024, domeH: 0.022 }), X, Z, 0.15, -0.13, { ry: 0.2, foot: 0.025 });
        place(church({ L: 0.03, B: 0.016, H: 0.02, wall: 'stoneD', roof: 'roofG', drumR: 0.006, drumH: 0.014, domeH: 0.012 }), X, Z, 0.19, -0.1, { ry: 0.2, foot: 0.014 });
        // the White Bridge: a pale arch over the Rioni
        place([[T(new THREE.TorusGeometry(0.018, 0.0022, 6, 18, Math.PI), 0, -0.006, 0), 'white'], [T(box(0.04, 0.0022, 0.009), 0, 0.012, 0), 'white']]
          .map(function (p) { return [T(p[0], 0, 0, 0, { ry: Math.PI / 2 - 0.15 }), p[1]]; }), X, Z, -0.03, -0.01, { foot: 0, sink: 0 });
        // the Colchis Fountain: a round pool ringed with golden figures
        var F = [[cyl(0.024, 0.0035, 28), 'stoneD'], [T(cyl(0.021, 0.0006, 28), 0, 0.0035, 0), 'water']];
        for (var k = 0; k < 12; k++) { var a = k / 12 * Math.PI * 2; F.push([T(cyl(0.0016, 0.009, 6, 0.0024), Math.cos(a) * 0.016, 0.0035, Math.sin(a) * 0.016), 'gold']); }
        F.push([T(cyl(0.0035, 0.016, 8, 0.005), 0, 0.0035, 0), 'gold']);
        place(F, X, Z, 0.05, 0.035, { foot: 0 });
        for (var h = 0; h < 12; h++) place(house({ w: 0.018 + rnd() * 0.012, h: 0.012 + rnd() * 0.008, wall: pick(['stone', 'stoneY', 'ochre', 'rose']), roof: pick(['roof', 'roofD']), balcony: rnd() > 0.6 }), X, Z, 0.0 + rnd() * 0.12, 0.06 + rnd() * 0.06, { ry: (rnd() - 0.5) * 0.6 });
        [[-0.005, -0.12], [0.1, -0.11], [0.11, -0.03], [-0.01, -0.04], [0.09, 0.03]].forEach(function (t) { place(cypress(), X, Z, t[0], t[1], { foot: 0 }); });
        for (var t2 = 0; t2 < 6; t2++) place(tree(0.026 + rnd() * 0.01), X, Z, 0.12 + rnd() * 0.08, 0.0 + rnd() * 0.09, { foot: 0 });
        flagAt(X, Z);
      })();

      // 5 · Svaneti — Mestia's towers, each beside its family house (machubi), among the pines
      (function () {
        var o = at('Mestia'), X = o[0], Z = o[1];
        [[0.03, -0.035, 0.12], [0.055, -0.055, 0.135], [0.078, -0.03, 0.11], [0.1, -0.052, 0.128], [0.062, -0.005, 0.1], [0.125, -0.022, 0.108], [0.008, -0.06, 0.118], [0.14, -0.06, 0.122]].forEach(function (t, k) {
          var P = svanTower(t[2]), hx = (k % 2 ? 1 : -1) * 0.016;
          house({ w: 0.028, d: 0.02, h: 0.015, wall: 'stoneS', roof: 'slate', chimney: true }).forEach(function (p) { P.push([T(p[0], hx, 0, 0.004), p[1]]); });
          place(P, X, Z, t[0], t[1], { ry: (rnd() - 0.5) * 0.4, foot: 0.016 });
        });
        place(house({ w: 0.03, d: 0.016, h: 0.019, wall: 'stoneS', roof: 'slate' }), X, Z, 0.09, 0.02, { ry: 0.2, foot: 0.012 }); // a small hall church
        for (var k2 = 0; k2 < 22; k2++) place(pine(0.034 + rnd() * 0.02), X, Z, -0.1 + rnd() * 0.3, -0.12 + rnd() * 0.22, { foot: 0 });
        flagAt(X, Z);
      })();

      // 6 · Batumi — palms along the boulevard and beach, the Alphabet Tower's double helix, the big wheel,
      // the lighthouse, umbrellas on the pebbles, and the glass towers behind
      (function () {
        var o = at('Batumi'), X = o[0], Z = o[1];
        // the beach, the boulevard and its palms, laid along the real coastline north of the Turkish border
        var B0 = G.places.Batumi, line = [];
        for (var c = 0; c < COAST.length - 1; c++) {
          var a = COAST[c], b = COAST[c + 1], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3);
          for (var s2 = 0; s2 < n; s2++) { var px = a[0] + (b[0] - a[0]) * s2 / n, py = a[1] + (b[1] - a[1]) * s2 / n; if (py > B0[1] - 46 && py < B0[1] + 16) line.push([px, py]); }
        }
        line.forEach(function (pt, k) {
          var nb = line[Math.min(line.length - 1, k + 1)], pv = line[Math.max(0, k - 1)], tx = nb[0] - pv[0], ty = nb[1] - pv[1], tl = Math.hypot(tx, ty) || 1;
          var nx = -ty / tl, ny = tx / tl; if (!inside(pt[0] + nx * 4, pt[1] + ny * 4)) { nx = -nx; ny = -ny; } // inland
          var ang = -Math.atan2(ty, tx);
          var off = function (d) { return [(pt[0] + nx * d - B0[0]) * S / LM, (pt[1] + ny * d - B0[1]) * S / LM]; };
          var o1 = off(1.6), o2 = off(4.2), o3 = off(6.4), o4 = off(1.2);
          place([[T(box(3.6 * S / LM, 0.0012, 2.8 * S / LM), 0, 0, 0, { ry: ang }), 'sand']], X, Z, o1[0], o1[1], { foot: 0, sink: 0.0004 });
          place([[T(box(3.6 * S / LM, 0.0014, 1.1 * S / LM), 0, 0, 0, { ry: ang }), 'stoneD']], X, Z, o2[0], o2[1], { foot: 0, sink: 0.0004 });
          if (k % 2 === 0) place(palm(0.05 + rnd() * 0.014, (rnd() - 0.5) * 0.5, rnd() * 6.28), X, Z, o3[0], o3[1], { foot: 0 });
          if (k % 3 === 1) place([[cyl(0.0007, 0.012, 4), 'white'], [T(cone(0.0085, 0.0035, 10), 0, 0.011, 0), k % 2 ? 'red' : 'white'], [T(box(0.008, 0.0015, 0.0035), 0.006, 0, 0.004), 'white']], X, Z, o4[0], o4[1], { foot: 0 });
        });
        // the Alphabet Tower
        var TH = 0.17, P = [[cyl(0.013, 0.005, 20), 'white'], [T(cyl(0.0042, TH, 12), 0, 0.005, 0), 'white']];
        [0, Math.PI].forEach(function (ph) {
          var hp = []; for (var k3 = 0; k3 <= 120; k3++) { var t3 = k3 / 120; hp.push(new THREE.Vector3(Math.cos(t3 * Math.PI * 7 + ph) * 0.0108, 0.006 + t3 * TH * 0.88, Math.sin(t3 * Math.PI * 7 + ph) * 0.0108)); }
          P.push([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp), 200, 0.0016, 5), 'steel']);
        });
        P.push([T(ball(0.0135, 18, 14), 0, TH + 0.008, 0), 'glass'], [T(new THREE.TorusGeometry(0.0138, 0.0012, 6, 28).rotateX(Math.PI / 2), 0, TH + 0.008, 0), 'white'], [T(cyl(0.0007, 0.03, 4), 0, TH + 0.02, 0), 'white']);
        place(P, X, Z, 0.05, 0.03, { foot: 0.01 });
        // the big wheel
        var R = 0.034, hub = R + 0.009, W = [[T(cyl(0.003, 0.012, 10).rotateX(Math.PI / 2), 0, hub - 0.006, 0), 'steel']];
        [-0.004, 0.004].forEach(function (zo) {
          W.push([T(new THREE.TorusGeometry(R, 0.0015, 6, 48), 0, hub, zo), 'white']);
          for (var sp = 0; sp < 12; sp++) W.push([T(box(0.0009, R, 0.0009).translate(0, -R / 2, 0), 0, hub, zo, { rz: sp / 12 * Math.PI * 2 }), 'white']);
          W.push([T(box(0.0024, hub + 0.002, 0.0024), 0, 0, zo * 3.2, { rx: zo > 0 ? -0.3 : 0.3 }), 'white']);
        });
        for (var cb = 0; cb < 12; cb++) { var an = cb / 12 * Math.PI * 2; W.push([T(box(0.0062, 0.0066, 0.0062), Math.cos(an) * R, hub + Math.sin(an) * R - 0.0045, 0), 'red']); }
        place(W, X, Z, 0.09, -0.035, { ry: 0.55, foot: 0.006 });
        // the lighthouse, red and white
        var Lh = [[cyl(0.006, 0.003, 12), 'white']];
        for (var b = 0; b < 5; b++) Lh.push([T(cyl(0.0043 - b * 0.0003, 0.0075, 12, 0.0046 - b * 0.0003), 0, 0.003 + b * 0.0075, 0), b % 2 ? 'white' : 'red']);
        Lh.push([T(cyl(0.0032, 0.006, 10), 0, 0.0405, 0), 'glass'], [T(cone(0.0042, 0.006, 10), 0, 0.0465, 0), 'red']);
        var lh = line[Math.floor(line.length * 0.62)] || B0; place(Lh, X, Z, (lh[0] + 3 - B0[0]) * S / LM, (lh[1] - B0[1]) * S / LM, { foot: 0 });
        // the glass towers behind the boulevard
        [[0.085, 0.07, 0.07, 'glass'], [0.105, 0.05, 0.1, 'glassD'], [0.125, 0.078, 0.086, 'glass'], [0.135, 0.03, 0.062, 'glassD'], [0.11, 0.1, 0.055, 'glass']].forEach(function (t) {
          var B = [[box(0.017, t[2], 0.017), t[3]]];
          for (var f = 1; f < t[2] / 0.012; f++) B.push([T(box(0.0176, 0.0012, 0.0176), 0, f * 0.012, 0), 'white']);
          B.push([T(box(0.012, 0.004, 0.012), 0, t[2], 0), 'white']);
          place(B, X, Z, t[0], t[1], { ry: 0.25, foot: 0.008 });
        });
        flagAt(X, Z);
      })();

      Object.keys(buckets).forEach(function (k) {
        var g = mergeGeometries(buckets[k], false); if (!g) return;
        var mat = SHINY[k] ? new THREE.MeshPhongMaterial({ color: MAT[k], shininess: SHINY[k], specular: 0x555555 }) : new THREE.MeshLambertMaterial({ color: MAT[k] });
        var mesh = new THREE.Mesh(g, mat);
        mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh);
      });
    }

    function build(imgH) {
      // heights (metres), lightly smoothed so the sculpted surface has no quantisation ripples
      hw = imgH.width; hh = imgH.height;
      var c = document.createElement('canvas'); c.width = hw; c.height = hh;
      var cx2 = c.getContext('2d', { willReadFrequently: true }); cx2.drawImage(imgH, 0, 0);
      var px = cx2.getImageData(0, 0, hw, hh).data, raw = new Float32Array(hw * hh); heights = new Float32Array(hw * hh);
      for (var i = 0; i < hw * hh; i++) raw[i] = px[i * 4] * 256 + px[i * 4 + 1];
      for (var j = 0; j < hh; j++) for (var i = 0; i < hw; i++) {
        var sum = 0, n = 0;
        for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) {
          var ii = i + ox, jj = j + oy; if (ii < 0 || jj < 0 || ii >= hw || jj >= hh) continue; sum += raw[jj * hw + ii]; n++;
        }
        heights[j * hw + i] = sum / n;
      }

      buildLand();
      // the rest in separate tasks, so a phone's main thread is never blocked for long
      later(function () { buildSea(); buildStops(); later(finish); });
    }
    function later(fn) { setTimeout(function () { if (!state.dead) fn(); }, 0); }
    function finish() {
      // a soft contact shadow, so the model floats just above the page
      var sc = document.createElement('canvas'); sc.width = sc.height = 128;
      var sg = sc.getContext('2d'), grd = sg.createRadialGradient(64, 64, 16, 64, 64, 64);
      grd.addColorStop(0, 'rgba(20,22,26,0.45)'); grd.addColorStop(1, 'rgba(20,22,26,0)');
      sg.fillStyle = grd; sg.fillRect(0, 0, 128, 128);
      var shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.2, D * 1.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, opacity: 0.5, depthWrite: false }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, SLAB_BOTTOM - 0.14, 0); shadow.renderOrder = -1; root.add(shadow);

      // routes follow the terrain
      // The road data has many small kinks; at model scale they read as jitter. Densify, ease the line
      // sideways (ends pinned to the stops), then ease its height so it glides over the relief.
      function lift(pts) {
        var d = [];
        for (var q = 0; q < pts.length - 1; q++) {
          var p0 = pts[q], p1 = pts[q + 1], n = Math.max(1, Math.ceil(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 1.5));
          for (var s = 0; s < n; s++) d.push([p0[0] + (p1[0] - p0[0]) * s / n, p0[1] + (p1[1] - p0[1]) * s / n]);
        }
        d.push(pts[pts.length - 1]);
        function smooth(arr, R, get) {
          return arr.map(function (_, k) {
            var r = Math.min(R, k, arr.length - 1 - k), acc = 0;
            for (var o = -r; o <= r; o++) acc += get(arr[k + o]);
            return acc / (2 * r + 1);
          });
        }
        var R = opts.routeSmooth || 7;
        var xs = smooth(d, R, function (p) { return p[0]; }), ys = smooth(d, R, function (p) { return p[1]; });
        xs = smooth(xs, R, function (v) { return v; }); ys = smooth(ys, R, function (v) { return v; });
        var ground = xs.map(function (x, k) { return yAt(x, ys[k]); });
        var hy = smooth(ground, 5, function (v) { return v; });
        return xs.map(function (x, k) { return new THREE.Vector3(wx(x), Math.max(hy[k], ground[k]) + 0.007, wz(ys[k])); });
      }
      var routeMat = new LineMaterial({ color: RED, linewidth: opts.routeWidth || 2.6, worldUnits: false });
      routeMat.resolution.set(canvas.clientWidth || 600, canvas.clientHeight || 400); lineMats.push(routeMat);
      (opts.routes || []).forEach(function (key) {
        var pts = G.routes[key]; if (!pts) return;
        var v = lift(pts), curve = new THREE.CatmullRomCurve3(v, false, 'centripetal', 0.5), len = curve.getLength();
        // a constant-width line in screen pixels, like a pen line on the model, at any zoom
        var nseg = Math.max(40, v.length * 2), flat = [];
        curve.getSpacedPoints(nseg).forEach(function (pt) { flat.push(pt.x, pt.y, pt.z); });
        var geo = new LineGeometry(); geo.setPositions(flat);
        var mesh = new Line2(geo, routeMat); mesh.renderOrder = 3; mesh.visible = !opts.hideRoute; root.add(mesh);
        tubes.push({ mesh: mesh, curve: curve, len: len, count: nseg, from: totalLen });
        totalLen += len;
      });
      tubes.forEach(function (t) { t.mesh.geometry.instanceCount = 0; });
      tubes.forEach(function (t) { var n = Math.max(2, Math.round(t.len / 0.03)); for (var s = 0; s <= n; s++) { var p = t.curve.getPointAt(s / n); samples.push({ d: t.from + t.len * s / n, p: p }); } });

      // markers: ground dot, thin stem, screen-sized head and label tag
      var stemMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.6 });
      var dotMat = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.35, depthWrite: false });
      headN = markerTexture(false); headA = markerTexture(true);
      (opts.pins || []).forEach(function (pn, i) {
        var p = G.places[pn[0]]; if (!p) return;
        var g = new THREE.Group(); g.position.set(wx(p[0]), yAt(p[0], p[1]) + (opts.hidePins ? (LABEL_H[pn[0]] || 0.13) * LM : 0), wz(p[1]));
        var stem = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, STEM, 0)]), stemMat);
        stem.renderOrder = 5; g.add(stem);
        var dot = new THREE.Mesh(new THREE.CircleGeometry(0.012, 20), dotMat); dot.rotation.x = -Math.PI / 2; dot.position.y = 0.003; g.add(dot);
        var head = new THREE.Sprite(new THREE.SpriteMaterial({ map: headN.tex, depthTest: false, transparent: true, sizeAttenuation: false }));
        head.position.y = STEM; head.renderOrder = 12; g.add(head);
        if (opts.hidePins) g.visible = false;
        root.add(g);
        pins.push({ g: g, stem: stem, head: head, name: pn[1], sub: pn[2] || '', idx: i, label: null, labelA: null, lw: 0, lh: 0, law: 0 });
      });
      // distance along the route for each stop (in order when the stops follow the route)
      var lastD = 0;
      pins.forEach(function (pp) {
        var best = 0, bd = 1e9, gp = pp.g.position;
        samples.forEach(function (sm) {
          if (opts.sequential && sm.d < lastD - 1e-6) return;
          var dd = (sm.p.x - gp.x) * (sm.p.x - gp.x) + (sm.p.z - gp.z) * (sm.p.z - gp.z);
          if (dd < bd) { bd = dd; best = sm.d; }
        });
        stopDist.push(best); if (opts.sequential) lastD = best;
      });
      function buildLabels() {
        pins.forEach(function (pp) {
          var a = labelTexture(pp.name, pp.sub, false), b = labelTexture(pp.name, pp.sub, true);
          var mk = function (t, order) { var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.tex, depthTest: false, transparent: true, sizeAttenuation: false })); sp.center.set(0.5, -0.5); sp.position.y = STEM; sp.renderOrder = order; pp.g.add(sp); return sp; };
          pp.label = mk(a, 13); pp.lw = a.w; pp.lh = a.h;
          pp.labelA = mk(b, 14); pp.law = b.w; pp.labelA.visible = false;
        });
      }
      if (opts.labels !== false) {
        var done = false, go = function () { if (!done) { done = true; buildLabels(); } };
        if (document.fonts && document.fonts.load) { Promise.all([document.fonts.load('600 13px "Inter"'), document.fonts.load('500 11px "Inter"')]).then(go, go); setTimeout(go, 1500); } else go();
      }

      // the van: a long-wheelbase Sprinter silhouette
      van = new THREE.Group();
      var white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0.05, emissive: 0xe4e7ec, emissiveIntensity: 0.5 });
      var glass = new THREE.MeshStandardMaterial({ color: 0x1d2026, roughness: 0.18, metalness: 0.35, emissive: 0x2b3340, emissiveIntensity: 0.35 });
      var dark = new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.6 });
      var hub = new THREE.MeshStandardMaterial({ color: 0xc9ccd3, roughness: 0.4, metalness: 0.3, emissive: 0x9ea2aa, emissiveIntensity: 0.4 });
      var red = new THREE.MeshStandardMaterial({ color: RED, roughness: 0.45, emissive: 0x5a0d16, emissiveIntensity: 0.6 });
      var lamp = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3c4, emissiveIntensity: 1.2 });
      var tail = new THREE.MeshStandardMaterial({ color: RED, emissive: RED, emissiveIntensity: 0.9 });
      // side profile (z = length, y = height), extruded across the width
      var sp = new THREE.Shape();
      sp.moveTo(-0.112, 0.016); sp.lineTo(-0.112, 0.082); sp.quadraticCurveTo(-0.112, 0.098, -0.096, 0.098);
      sp.lineTo(0.046, 0.098); sp.quadraticCurveTo(0.062, 0.098, 0.072, 0.088);
      sp.lineTo(0.098, 0.062); sp.quadraticCurveTo(0.104, 0.056, 0.112, 0.056);
      sp.lineTo(0.124, 0.054); sp.quadraticCurveTo(0.132, 0.052, 0.132, 0.044);
      sp.lineTo(0.132, 0.024); sp.quadraticCurveTo(0.132, 0.016, 0.124, 0.016); sp.lineTo(-0.112, 0.016);
      var bodyGeo = new THREE.ExtrudeGeometry(sp, { depth: 0.070, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3, curveSegments: 8 });
      bodyGeo.rotateY(-Math.PI / 2); bodyGeo.translate(0.035 + 0.004, 0, 0);
      bodyGeo.computeBoundingBox(); var bb = bodyGeo.boundingBox; bodyGeo.translate(-(bb.min.x + bb.max.x) / 2, 0, 0);
      var body = new THREE.Mesh(bodyGeo, white); van.add(body);
      // glazing
      var ws = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.036, 0.004), glass); ws.position.set(0, 0.0775, 0.0875); ws.rotation.x = -0.78; van.add(ws);
      var sw = new THREE.Mesh(new THREE.BoxGeometry(0.0805, 0.022, 0.118), glass); sw.position.set(0, 0.075, -0.028); van.add(sw);
      var pillar = new THREE.Mesh(new THREE.BoxGeometry(0.0812, 0.024, 0.005), white); pillar.position.set(0, 0.075, -0.012); van.add(pillar);
      var rw = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.022, 0.004), glass); rw.position.set(0, 0.076, -0.1125); van.add(rw);
      // trim
      var stripe = new THREE.Mesh(new THREE.BoxGeometry(0.0806, 0.007, 0.206), red); stripe.position.set(0, 0.038, -0.004); van.add(stripe);
      var roofRed = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.0032, 0.13), red); roofRed.position.set(0, 0.1005, -0.03); van.add(roofRed);
      var grille = new THREE.Mesh(new THREE.BoxGeometry(0.040, 0.010, 0.004), dark); grille.position.set(0, 0.038, 0.133); van.add(grille);
      [-0.027, 0.027].forEach(function (x) {
        var h = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.007, 0.004), lamp); h.position.set(x, 0.047, 0.1335); van.add(h);
        var t = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.014, 0.004), tail); t.position.set(x * 1.15, 0.055, -0.1135); van.add(t);
        var m = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.010, 0.006), dark); m.position.set(x * 1.72, 0.070, 0.088); van.add(m);
      });
      // wheels
      var tyre = new THREE.CylinderGeometry(0.021, 0.021, 0.016, 18); tyre.rotateZ(Math.PI / 2);
      var cap = new THREE.CylinderGeometry(0.0115, 0.0115, 0.0172, 14); cap.rotateZ(Math.PI / 2);
      [[-0.038, 0.088], [0.038, 0.088], [-0.038, -0.068], [0.038, -0.068]].forEach(function (w) {
        var ty2 = new THREE.Mesh(tyre, dark); ty2.position.set(w[0], 0.021, w[1]); van.add(ty2);
        var cp = new THREE.Mesh(cap, hub); cp.position.set(w[0], 0.021, w[1]); van.add(cp);
      });
      van.traverse(function (o) { if (o.isMesh) { o.castShadow = false; } });
      van.scale.setScalar(0.001); van.visible = false; van.userData.base = 1.9; root.add(van);
      vanRing = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.07, 40), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0, depthWrite: false }));
      vanRing.rotation.x = -Math.PI / 2; vanRing.visible = false; root.add(vanRing);
      vanShadow = new THREE.Mesh(new THREE.CircleGeometry(0.075, 24), new THREE.MeshBasicMaterial({ color: 0x14161a, transparent: true, opacity: 0.16, depthWrite: false }));
      vanShadow.rotation.x = -Math.PI / 2; vanShadow.visible = false; root.add(vanShadow);

      state.ready = true;
      if (focus !== null) { Ptarget = stopDist[focus] || 0; P = Ptarget; }
      if (opts.fallback) { try { opts.fallback.style.display = 'none'; } catch (e) {} }
      renderer.shadowMap.needsUpdate = true;
      size();
      if (renderer.compileAsync) renderer.compileAsync(scene, camera).then(start, start); else start();
    }

    // sizing + camera
    var yaw = 0, pitch = 0, ty = 0, tp = 0, sx = (opts.shift || 0), sxT = sx;
    var camT = new THREE.Vector3(0, 0.05, 0), camTTarget = new THREE.Vector3(0, 0.05, 0), zoom = (opts.overviewZoom || 1.0), zoomT = (opts.overviewZoom || 1.0), elev = (opts.elevation || 50), elevT = elev;
    function size() {
      var w = canvas.clientWidth || 600, h = canvas.clientHeight || 400;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      lineMats.forEach(function (m) { m.resolution.set(w, h); });
    }
    function place() {
      var el = elev * Math.PI / 180, tv = Math.tan(camera.fov * Math.PI / 360);
      // fitFrac < 1 fits the country into that share of the canvas width (the rest is taken by page text).
      var dw = (W / 2 * 1.06) / (tv * camera.aspect * (focus === null ? (opts.fitFrac || 1) : 1));
      var dh = ((D * Math.sin(el)) / 2 + 0.62) * 1.06 / tv;
      var dist = Math.max(dw, dh) * zoom;
      var a = yaw, p2 = el + pitch;
      camera.position.set(camT.x + Math.sin(a) * Math.cos(p2) * dist, camT.y + Math.sin(p2) * dist, camT.z + Math.cos(a) * Math.cos(p2) * dist);
      camera.lookAt(camT);
    }
    var ro = window.ResizeObserver ? new ResizeObserver(function () { size(); if (state.ready) frame(performance.now(), true); }) : null;
    if (ro) ro.observe(canvas);
    window.addEventListener('resize', size);
    size();

    function onMove(e) {
      var r = canvas.getBoundingClientRect(); if (!r.width) return;
      var nx = ((e.clientX - r.left) / r.width - 0.5) * 2, ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      ty = Math.max(-1, Math.min(1, nx)) * 0.2; tp = Math.max(-1, Math.min(1, ny)) * -0.05;
    }
    function onLeave() { ty = 0; tp = 0; }
    if (!reduce && window.matchMedia && matchMedia('(pointer:fine)').matches) { window.addEventListener('pointermove', onMove); document.addEventListener('pointerleave', onLeave); }

    // animation state
    var t0 = null, visible = true, raf = 0, DRAW = 5.5, LOOP = 20;
    var tSpeed = 0, P = 0, Pdrawn = 0, Ptarget = 0, popT = -1, lastLoop = -1, vq = new THREE.Quaternion(), tmpQ = new THREE.Quaternion(), initDone = false;
    function ease(x) { return 1 - Math.pow(1 - x, 3); }
    function backOut(x) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
    function pop(now) { popT = now; }
    function routePoint(d, out) {
      var tb = tubes[0];
      for (var i = 0; i < tubes.length; i++) if (d >= tubes[i].from) tb = tubes[i];
      var q = Math.max(0, Math.min(1, (d - tb.from) / tb.len));
      out.p = tb.curve.getPointAt(q); var qa = Math.min(1, q + 0.03), qb = Math.max(0, q - 0.03); out.t = tb.curve.getPointAt(qa).clone().sub(tb.curve.getPointAt(qb)).normalize(); return out;
    }
    var camFrom = new THREE.Vector3(), moveV = new THREE.Vector3(), P0 = 0;
    var pv = new THREE.Vector3(), tmpO = {}, vpos = new THREE.Vector3(), prevD = 0, dirSign = 1;

    function frame(now, once) {
      if (!state.ready) return;
      if (t0 === null) t0 = now;
      var t = (now - t0) / 1000;
      var journey = focus !== null;

      // route progress + van distance
      if (!journey) {
        if (reduce) { Pdrawn = totalLen; P = totalLen * 0.0; }
        else if (t < DRAW) { var e = ease(t / DRAW); Pdrawn = e * totalLen; P = Pdrawn; }
        else { Pdrawn = totalLen; var lp = ((t - DRAW) / LOOP); var li = Math.floor(lp); P = (lp - li) * totalLen; if (li !== lastLoop) { lastLoop = li; pop(now); } }
        if (!initDone && t < 0.6 && !reduce) { /* wait for first pop at start */ }
      } else {
        var dt = Math.min(0.05, (now - (frame.last || now)) / 1000);
        var speed = tSpeed || totalLen / 9;
        var diff = Ptarget - P;
        var stepD = Math.sign(diff) * Math.min(Math.abs(diff), Math.max(speed * dt * Math.min(1, Math.abs(diff) / (totalLen * 0.08) + 0.15), 0));
        if (reduce) P = Ptarget; else P += stepD;
        Pdrawn = Math.max(Pdrawn, P);
      }
      frame.last = now;

      tubes.forEach(function (tb) {
        var drawTo = journey ? P : Pdrawn;
        var f = Math.max(0, Math.min(1, (drawTo - tb.from) / tb.len));
        tb.mesh.geometry.instanceCount = Math.floor(f * tb.count);
      });
      // markers
      var chN = canvas.clientHeight || 400, kpx = 2 * Math.tan(camera.fov * Math.PI / 360) / chN;
      pins.forEach(function (p, i) {
        var s3 = reduce ? 1 : ease(Math.max(0, Math.min(1, (t - 0.1 * p.idx - 0.3) / 0.6)));
        var act = journey && focus === i;
        p.stem.scale.y = Math.max(0.001, s3);
        p.head.position.y = STEM * s3;
        p.head.material.map = headN.tex; p.head.visible = !act;
        var hp = act ? 24 : 20; p.head.scale.set(hp * kpx, hp * kpx, 1);
        p._o = s3;
        if (p.label) {
          p.label.position.y = p.labelA.position.y = STEM * s3;
          p.label.scale.set(p.lw * kpx, p.lh * kpx, 1); p.labelA.scale.set(p.law * kpx, p.lh * kpx, 1);
          p.label.visible = !act; p.labelA.visible = act;
          p.label.center.set(0.5, -0.32); p.labelA.center.set(0.5, -0.32);
        }
      });

      // van
      if (van && tubes.length) {
        routePoint(Math.max(0, Math.min(totalLen, P)), tmpO);
        var moving = journey ? Math.abs(Ptarget - P) > 0.02 : true;
        if (journey) { if (Ptarget - P > 0.02) dirSign = 1; else if (P - Ptarget > 0.02) dirSign = -1; }
        else dirSign = 1;
        vpos.copy(tmpO.p); vpos.y += 0.012 * van.userData.base * 0.6;
        if (journey && !moving) vpos.y += 0 ; // idle
        van.position.copy(vpos);
        var tx = tmpO.t.x * dirSign, tz = tmpO.t.z * dirSign, ty2 = tmpO.t.y * dirSign;
        var horiz = Math.hypot(tx, tz) || 1;
        var targetYaw = Math.atan2(tx, tz), targetPitch = Math.max(-0.26, Math.min(0.26, -Math.atan2(ty2, horiz) * 0.35));
        if (journey && !moving) targetPitch = 0;
        tmpQ.setFromEuler(new THREE.Euler(targetPitch, targetYaw, 0, 'YXZ'));
        if (!initDone) { vq.copy(tmpQ); initDone = true; } else vq.slerp(tmpQ, 0.14);
        van.quaternion.copy(vq);
        // bob
        van.position.y += moving && !reduce ? Math.abs(Math.sin(t * 9)) * 0.0035 : 0;
        // pop scale
        var sc2 = 1;
        if (!reduce) {
          var pt = popT < 0 ? 1 : (now - popT) / 1000;
          if (popT < 0 && !journey && t >= 0.4) { pop(now); pt = 0; }
          sc2 = pt >= 0.7 ? 1 : Math.max(0.001, backOut(Math.min(1, pt / 0.7)));
          if (!journey && t < 0.4) sc2 = 0.001;
          vanRing.visible = pt < 1.1 && sc2 > 0.01; vanRing.position.set(vpos.x, vpos.y - 0.004, vpos.z);
          var rs = 1 + pt * 2.4; vanRing.scale.setScalar(rs * van.userData.base); vanRing.material.opacity = Math.max(0, 0.32 * (1 - pt / 1.1));
        } else { vanRing.visible = false; }
        van.visible = sc2 > 0.002; van.scale.setScalar(sc2 * van.userData.base);
        vanShadow.visible = van.visible; vanShadow.position.set(vpos.x, vpos.y - 0.006, vpos.z); vanShadow.scale.setScalar(sc2 * van.userData.base);
        // hideVan: the van still travels the road invisibly, so the camera keeps gliding along it between stops.
        if (opts.hideVan) { van.visible = false; vanShadow.visible = false; vanRing.visible = false; }
      }

      // camera focus
      if (journey && pins[focus]) {
        // Glide in a straight line from where the camera was to the next stop, paced by the route as it draws,
        // rather than tracing every bend of the road.
        var gp = pins[focus].g.position, span = Ptarget - P0;
        var fm = Math.abs(span) < 1e-6 ? 1 : Math.max(0, Math.min(1, (P - P0) / span)); fm = fm * fm * (3 - 2 * fm);
        moveV.set(gp.x, gp.y * 0.7 + 0.04, gp.z);
        camTTarget.copy(camFrom).lerp(moveV, fm);
        // Fly-to arc: rise while the next stop is far away, then settle onto it.
        var away = totalLen ? Math.min(1, Math.abs(Ptarget - P) / (totalLen * 0.22)) : 0;
        zoomT = (opts.focusZoom || 0.42) * (1 + 0.85 * away); elevT = (opts.focusElev || 36) + 10 * away;
      } else { camTTarget.set(0, 0.05, 0); zoomT = (opts.overviewZoom || 1.0); elevT = opts.elevation || 50; }
      var k2 = reduce ? 1 : 0.07;
      camT.lerp(camTTarget, k2); zoom += (zoomT - zoom) * k2; elev += (elevT - elev) * k2;
      var yawBase = journey ? -0.12 : (opts.overviewYaw === undefined ? -0.2 : opts.overviewYaw);
      if (!reduce) { yaw += (yawBase + ty + (journey ? 0 : Math.sin(t * 0.28) * 0.06) - yaw) * 0.05; pitch += (tp - pitch) * 0.05; } else { yaw = yawBase; }
      sxT = journey ? (opts.focusShift || 0) : (opts.shift || 0);
      sx += (sxT - sx) * (reduce ? 1 : 0.07);
      var cw = canvas.clientWidth || 600, chh = canvas.clientHeight || 400;
      if (Math.abs(sx) > 0.001) camera.setViewOffset(cw, chh, -sx * cw, 0, cw, chh); else camera.clearViewOffset();
      place();
      camera.updateMatrixWorld();
      pins.forEach(function (p) {
        var o = p._o === undefined ? 1 : p._o;
        if (opts.safeLeft) { pv.setFromMatrixPosition(p.head.matrixWorld); pv.project(camera); var fx = (pv.x + 1) / 2; o *= Math.max(0, Math.min(1, (fx - (opts.safeLeft - 0.06)) / 0.06)); }
        p.head.material.opacity = o; p.stem.material.opacity = 0.6;
        if (p.label) { p.label.material.opacity = o; p.labelA.material.opacity = o; }
      });
      renderer.render(scene, camera);
      if (once) return;
      if (!reduce || journey && Math.abs(Ptarget - P) > 0.02) { if (visible) raf = requestAnimationFrame(frame); else raf = 0; } else raf = 0;
    }
    function start() { if (!raf && state.ready && !state.dead) raf = requestAnimationFrame(frame); }
    var io = window.IntersectionObserver ? new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }, { threshold: 0.02 }) : null;
    if (io) io.observe(canvas);

    loadImg(opts.terrainH).then(function (im) { if (!state.dead) build(im); }, function () { /* keep the flat map fallback */ });

    return {
      dispose: function () { state.dead = true; cancelAnimationFrame(raf); raf = 0; if (ro) ro.disconnect(); if (io) io.disconnect(); window.removeEventListener('resize', size); window.removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave); renderer.dispose(); },
      goTo: function (i) {
        if (i === null || i === undefined || i < 0) { if (focus !== null) { t0 = performance.now() - DRAW * 1000 - 50; lastLoop = -1; popT = -1; } focus = null; Pdrawn = totalLen; start(); if (reduce && state.ready) frame(performance.now(), true); return; }
        var prev = focus; if (state.ready && stopDist.length) { var jump = prev === null || Math.abs(i - prev) > 1; if (jump) { var from = i > (prev === null ? -1 : prev) ? (i > 0 ? stopDist[i - 1] : 0) : (stopDist[i + 1] !== undefined ? stopDist[i + 1] : totalLen); P = from; Pdrawn = Math.max(Pdrawn, from); popT = performance.now(); } } focus = i; Ptarget = stopDist[i] || 0; camFrom.copy(camT); P0 = P; tSpeed = Math.max(totalLen / 14, Math.abs(Ptarget - P) / 3.0); start(); if (reduce && state.ready) frame(performance.now(), true);
      },
      stops: function () { return stopDist.length; },
      // Screen position (CSS px, relative to the canvas) of stop i's pin head, for overlays drawn in HTML.
      pinScreen: function (i) {
        var p = pins[i]; if (!state.ready || !p) return null;
        var v = new THREE.Vector3(); v.setFromMatrixPosition((opts.hidePins ? p.g : p.head).matrixWorld); v.project(camera);
        return { x: (v.x + 1) / 2 * (canvas.clientWidth || 1), y: (1 - v.y) / 2 * (canvas.clientHeight || 1), visible: v.z < 1 };
      },
      // Re-frame the camera when the page layout changes (e.g. focusShift / safeLeft after a resize).
      setOptions: function (o) { for (var k in o) opts[k] = o[k]; start(); }
    };
  }
  return { mount: mount };
})();
