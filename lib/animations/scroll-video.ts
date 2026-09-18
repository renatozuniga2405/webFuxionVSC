const SEEK_THRESHOLD = 0.03;

type ScrollVideoOptions = {
  selector: string;
  dataKey: string;
  mapProgress?: (progress: number) => number;
};

/**
 * Binds a paused video to a GSAP-owned progress object.
 *
 * The browser may still be resolving a previous seek when ScrollTrigger
 * produces a new value. In that case we retain only the latest target rather
 * than issuing a queue of intermediate `currentTime` writes.
 */
export function createScrollVideoScene(scene: HTMLElement, options: ScrollVideoOptions) {
  const video = scene.querySelector<HTMLVideoElement>(options.selector)!;
  const state = { progress: 0 };
  const mapProgress = options.mapProgress ?? ((progress: number) => progress);
  let duration = Number.isFinite(video.duration) ? video.duration : 0;
  let destroyed = false;
  let seeking = false;
  let pendingTarget: number | null = null;

  const seek = (target: number) => {
    if (destroyed || !Number.isFinite(target)) return;
    if (seeking) {
      pendingTarget = target;
      return;
    }
    if (Math.abs(video.currentTime - target) <= SEEK_THRESHOLD) return;
    seeking = true;
    video.currentTime = target;
  };

  const render = () => {
    if (!duration || destroyed) return;
    const target = duration * mapProgress(state.progress);
    seek(target);
    scene.dataset[options.dataKey] = state.progress.toFixed(5);
  };

  const onMetadata = () => {
    duration = video.duration;
    render();
  };
  const onLoadedData = () => scene.classList.add('is-video-ready');
  const onSeeked = () => {
    seeking = false;
    const target = pendingTarget;
    pendingTarget = null;
    if (target !== null) seek(target);
  };

  video.pause();
  video.addEventListener('loadedmetadata', onMetadata);
  video.addEventListener('loadeddata', onLoadedData);
  video.addEventListener('seeked', onSeeked);
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onMetadata();
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onLoadedData();

  return {
    state,
    render,
    resize: render,
    prepare() {
      // Metadata is enough while a chapter is distant. Escalating only the
      // upcoming chapter avoids four full assets competing at initial load.
      if (video.preload !== 'auto') video.preload = 'auto';
    },
    destroy() {
      destroyed = true;
      pendingTarget = null;
      video.pause();
      video.removeEventListener('loadedmetadata', onMetadata);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('seeked', onSeeked);
      scene.classList.remove('is-video-ready');
      delete scene.dataset[options.dataKey];
      video.removeAttribute('style');
    },
  };
}
