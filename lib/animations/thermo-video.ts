import { createScrollVideoScene } from './scroll-video';

export function createThermoVideoScene(scene: HTMLElement) {
  return createScrollVideoScene(scene, { selector: '.thermo-video', dataKey: 'thermoVideoProgress' });
}
