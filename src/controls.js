/* ============================================================================
   CONTROLS - a small orbit camera.

   Hand-rolled rather than pulled from three's examples/, because the examples
   folder moved between releases and this only needs four verbs: orbit, dolly,
   pan and fly-to. Pointer Events, so a phone works without a touch branch.
   ========================================================================== */

export function orbitControls(THREE, camera, dom) {
  const target = new THREE.Vector3(0, 0.8, 0);
  const sph = new THREE.Spherical(3.2, 1.15, 0.9);
  const MIN_PHI = 0.08, MAX_PHI = Math.PI / 2 - 0.02;

  let dragging = null;
  const pointers = new Map();
  let pinchStart = 0, pinchRadius = 0;

  const goal = { target: null, sph: null, t: 1 };

  function apply() {
    sph.phi = Math.max(MIN_PHI, Math.min(MAX_PHI, sph.phi));
    sph.radius = Math.max(0.18, Math.min(14, sph.radius));
    camera.position.setFromSpherical(sph).add(target);
    camera.lookAt(target);
  }

  function onDown(e) {
    dom.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    goal.t = 1;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
      pinchRadius = sph.radius;
      dragging = 'pinch';
    } else {
      dragging = (e.button === 2 || e.shiftKey) ? 'pan' : 'orbit';
    }
  }

  function onMove(e) {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (dragging === 'pinch' && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStart > 0) sph.radius = pinchRadius * (pinchStart / Math.max(d, 1));
    } else if (dragging === 'orbit') {
      sph.theta -= dx * 0.0055;
      sph.phi -= dy * 0.0055;
    } else if (dragging === 'pan') {
      const scale = sph.radius * 0.0016;
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
      target.addScaledVector(right, -dx * scale);
      target.addScaledVector(up, dy * scale);
    } else {
      return;
    }
    apply();
  }

  function onUp(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStart = 0;
    if (pointers.size === 0) dragging = null;
  }

  function onWheel(e) {
    e.preventDefault();
    goal.t = 1;
    sph.radius *= Math.pow(1.0016, e.deltaY);
    apply();
  }

  dom.addEventListener('pointerdown', onDown);
  dom.addEventListener('pointermove', onMove);
  dom.addEventListener('pointerup', onUp);
  dom.addEventListener('pointercancel', onUp);
  dom.addEventListener('wheel', onWheel, { passive: false });
  dom.addEventListener('contextmenu', (e) => e.preventDefault());

  apply();

  return {
    target, sph,
    /** Ease to a new camera pose over the next few frames. */
    flyTo(newTarget, radius, theta, phi) {
      goal.startTarget = target.clone();
      goal.startSph = sph.clone();
      goal.target = newTarget.clone();
      goal.sph = new THREE.Spherical(
        radius,
        phi === undefined ? sph.phi : phi,
        theta === undefined ? sph.theta : theta);
      goal.t = 0;
    },
    set(newTarget, radius, theta, phi) {
      target.copy(newTarget);
      sph.set(radius, phi, theta);
      goal.t = 1;
      apply();
    },
    update(dt = 1 / 60) {
      if (goal.t < 1 && goal.sph) {
        goal.t = Math.min(1, goal.t + Math.max(0, dt) / 0.85);
        const e = 1 - Math.pow(1 - goal.t, 3);
        target.lerpVectors(goal.startTarget, goal.target, e);
        sph.radius = THREE.MathUtils.lerp(goal.startSph.radius, goal.sph.radius, e);
        sph.theta = THREE.MathUtils.lerp(goal.startSph.theta, goal.sph.theta, e);
        sph.phi = THREE.MathUtils.lerp(goal.startSph.phi, goal.sph.phi, e);
        apply();
      }
    },
  };
}
