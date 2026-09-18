import { createScrollVideoScene } from './scroll-video';

const points = [[0,0],[.20,.08],[.45,.35],[.65,.58],[.78,.76],[.90,.92],[1,.98]] as const;
function map(p:number) { for(let i=1;i<points.length;i++){const [b,y]=points[i],[a,x]=points[i-1];if(p<=b)return x+(y-x)*(p-a)/(b-a)} return .98; }
export function createIntroVideoScene(scene: HTMLElement) {
  return createScrollVideoScene(scene, { selector: '.intro-video', dataKey: 'introProgress', mapProgress: map });
}
