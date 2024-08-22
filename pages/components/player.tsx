import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls, { HlsConfig } from 'hls.js';
import styles from "./Player.module.scss";
import Controls from './controls';
import Screen from './screen';
import { useSubtitleMarks } from '../hooks/subtitle_marks';
import { useFrameDrawing } from '../hooks/frame_drawing';
import { useVideoResize } from '../hooks/video_resize';

interface PlayerProps {
  playlist: string;
  hlsConfig?: Partial<HlsConfig>;
}

export interface Detection {
  ulx: number;
  uly: number;
  lrx: number;
  lry: number;
}

const Player: React.FC<PlayerProps> = ({ playlist, hlsConfig }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [hls, setHls] = useState<Hls | null>(null);

  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);

  const marks = useSubtitleMarks(hls);

  const { frame, detections } = useFrameDrawing(hls);
  const { renderWidth, renderHeight, maxWidth, maxHeight } = useVideoResize(hls, containerRef);

  useEffect(() => {
    if (!Hls.isSupported()) {
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const hlsInstance = new Hls(hlsConfig);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
      hlsInstance.loadSource(playlist);
    });

    setHls(hlsInstance);
    (window as any).hls = hlsInstance;

    return () => {
      hlsInstance.destroy();
      setHls(null);
    };
  }, [playlist, hlsConfig]);

  const onFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      return containerRef.current?.requestFullscreen();
    }
    return document.exitFullscreen();
  }, []);

  const seek = (video: HTMLVideoElement | null, position: number) => {
    if (!video) return;
    video.currentTime = position;
  };

  const onPlay = useCallback(() => videoRef.current?.play(), []);
  const onPause = useCallback(() => videoRef.current?.pause(), []);
  const onSeek = useCallback((position: number) => seek(videoRef.current, position), []);

  return (
    <div
      ref={containerRef}
      className={styles.player}
    >
      <video
        ref={videoRef}
        muted
        onTimeUpdate={(e) => setPosition((e.target as HTMLVideoElement).currentTime)}
        onDurationChange={(e) => setDuration((e.target as HTMLVideoElement).duration)}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        style={{ visibility: 'hidden', width: '0', height: '0' }}
      />
      <Screen
        frame={frame}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        renderWidth={renderWidth}
        renderHeight={renderHeight}
        detections={detections}
        onDoubleClick={onFullscreen}
        onClick={() => (paused ? onPlay() : onPause())}
      />
      <Controls
        hidden={!controlsVisible}
        position={position}
        duration={duration}
        paused={paused}
        onFullscreen={onFullscreen}
        onPlay={onPlay}
        onPause={onPause}
        onSeek={onSeek}
        marks={marks}
      />
    </div>
  );
};

export default Player;