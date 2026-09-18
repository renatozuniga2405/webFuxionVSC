import { createScrollVideoScene } from './scroll-video';

const points = [[0,0],[.10,.15],[.22,.29],[.38,.45],[.54,.61],[.74,.79],[.88,.90],[1,.98]] as const;
function map(p: number) { for (let i = 1; i < points.length; i++) { const [b, y] = points[i], [a, x] = points[i - 1]; if (p <= b) return x + (y - x) * (p - a) / (b - a); } return .98; }

export function createBeautyVideoScene(scene: HTMLElement) {
  return createScrollVideoScene(scene, { selector: '.beauty-video', dataKey: 'beautyProgress', mapProgress: map });
}
