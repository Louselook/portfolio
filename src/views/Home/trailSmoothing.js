// Helpers de movimiento de la estela: muelle sin tirones y largo de cola por velocidad.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * 3) Muelle críticamente amortiguado (smoothDamp).
 *    Arranca y frena con aceleración suave, no depende de los FPS y,
 *    con maxSpeed, la punta nunca "salta" aunque el path tenga tramos planos.
 *    Uso: const s = smoothDamp(cur, target, vel, 0.35, dt, 0.9); cur = s.value; vel = s.velocity;
 */
export function smoothDamp(current, target, velocity, smoothTime, dt, maxSpeed = Infinity) {
  smoothTime = Math.max(0.0001, smoothTime);
  dt = Math.min(dt, 1 / 30); // evita saltos al volver de otra pestaña
  const omega = 2 / smoothTime;
  const x = omega * dt;
  const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const originalTo = target;
  const maxChange = maxSpeed * smoothTime;
  let change = clamp(current - target, -maxChange, maxChange);
  target = current - change;
  const temp = (velocity + omega * change) * dt;
  let vel = (velocity - omega * temp) * e;
  let value = target + (change + temp) * e;
  if (originalTo - current > 0 === value > originalTo) {
    value = originalTo;
    vel = (value - originalTo) / dt;
  }
  return { value, velocity: vel };
}

/** 5) Largo de estela según velocidad del muelle (progreso/seg). Suavizar el resultado. */
export function tailFromVelocity(velocity, { min = 0.035, max = 0.16, gain = 5 } = {}) {
  return min + clamp(Math.abs(velocity) * gain) * (max - min);
}
