import Hls from 'hls.js';
import { useEffect, useState, useRef } from 'react';

export const useVideoResize = (
  hls: Hls | null,
  containerRef: React.RefObject<HTMLDivElement>
) => {
  const [renderWidth, setRenderWidth] = useState<number>(1920);
  const [renderHeight, setRenderHeight] = useState<number>(1080);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);

  useEffect(() => {
    const video = hls?.media as HTMLVideoElement;
    const container = containerRef.current;
    if (!video || !container) return;

    const onLoadedMetadata = () => {
      setRenderWidth(video.videoWidth);
      setRenderHeight(video.videoHeight);
    };

    video.onloadedmetadata = onLoadedMetadata;

    const resizeObserver = new ResizeObserver(() => {
      setMaxWidth(container.offsetWidth);
      setMaxHeight(container.offsetHeight);
    });

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      resizeObserver.disconnect();
    };
  }, [hls, containerRef]);

  return { renderWidth, renderHeight, maxWidth, maxHeight };
};