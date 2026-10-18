// Authored effects, never telemetry or a connection to the physical NAS.
export const MAX_BROWSER_DEPTH = 3;
export const nextDepth = depth => Math.min(MAX_BROWSER_DEPTH, Math.max(0, depth) + 1);
export const fanLoad = (depth, playing = false) => playing ? 1 : Math.min(1, Math.max(0, depth) / MAX_BROWSER_DEPTH);
export const diskActivity = (volume, fileOpen) => volume === 'hdd' && !!fileOpen;
export const SCREEN = [388, 181, 365, 176];
export function fitRect(rect, width, height, padding = 40) {
  const [x, y, w, h] = rect;
  const scale = Math.max(.01, Math.min((width - padding * 2) / w, (height - padding * 2) / h));
  return { scale, x: width / 2 - (x + w / 2) * scale, y: height / 2 - (y + h / 2) * scale };
}
