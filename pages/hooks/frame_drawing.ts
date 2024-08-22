import { useEffect, useState } from "react";
import { Detection } from "../components/player";
import Hls from "hls.js";

export const useFrameDrawing = (hls: Hls | null) => {
  const [frame, setFrame] = useState<VideoFrame | undefined>(undefined);
  const [detections, setDetections] = useState<Detection[]>([]);

  useEffect(() => {
    const video = hls?.media as HTMLVideoElement;
    if (!video) return;

    const drawFrame = () => {
      try {
        const newFrame = new VideoFrame(video);
        setFrame((currentFrame) => {
          currentFrame?.close();
          return newFrame;
        });

        const detections = JSON.parse(
          (video.textTracks[0].activeCues?.[0] as VTTCue)?.text || '[]'
        ) as Detection[];
        setDetections(detections);
      } catch (_) {
        setDetections([]);
      }

      if (!video.paused && !video.ended) {
        requestAnimationFrame(drawFrame);
      }
    };

    video.addEventListener("loadeddata", drawFrame);
    video.addEventListener("seeked", drawFrame);
    video.addEventListener("play", drawFrame);

    return () => {
      video.removeEventListener("loadeddata", drawFrame);
      video.removeEventListener("seeked", drawFrame);
      video.removeEventListener("play", drawFrame);
      frame?.close();
    };
  }, [hls]);

  return { frame, detections };
};