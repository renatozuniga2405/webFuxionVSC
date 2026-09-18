import { createScrollVideoScene } from './scroll-video';

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

// The source whip-pan is intentionally crossed faster than the preparation beats.
const VIDEO_MAP = [
  [0, 0], [.09, .13], [.20, .26], [.36, .43], [.52, .60], [.72, .78], [.86, .88], [1, .98],
] as const;

function mapProgress(progress: number) {
  const p = clamp(progress, 0, 1);
  for (let index = 1; index < VIDEO_MAP.length; index++) {
    const [rightProgress, rightVideo] = VIDEO_MAP[index];
    const [leftProgress, leftVideo] = VIDEO_MAP[index - 1];
    if (p <= rightProgress) return leftVideo + (rightVideo - leftVideo) * ((p - leftProgress) / (rightProgress - leftProgress));
  }
  return .98;
}

export function createNocarbVideoScene(scene: HTMLElement) {
  return createScrollVideoScene(scene, {
    selector: '.nocarb-video',
    dataKey: 'nocarbVideoProgress',
    mapProgress,
  });
}
