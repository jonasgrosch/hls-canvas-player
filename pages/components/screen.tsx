import React, { useEffect, useRef } from 'react';
import { Detection } from './player';

interface ScreenProps {
  frame?: VideoFrame;
  maxWidth: number;
  maxHeight: number;
  renderWidth: number;
  renderHeight: number;
  detections?: Detection[];
  onDoubleClick?: () => void;
  onClick?: () => void;
}

const Screen: React.FC<ScreenProps> = ({
  frame,
  maxWidth, 
  maxHeight,
  renderWidth,
  renderHeight,
  detections = [],
  onClick,
  onDoubleClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const aspectRatio = renderWidth / renderHeight;
    const containerAspectRatio = maxWidth / maxHeight;

    if (aspectRatio > containerAspectRatio) {
      canvas.style.width = maxWidth + 'px';
      canvas.style.height = maxWidth / aspectRatio + 'px';
    } else {
      canvas.style.height = maxHeight + 'px';
      canvas.style.width = maxHeight * aspectRatio + 'px';
    }
  }, [maxWidth, maxHeight, renderWidth, renderHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context || !frame) return;

    context.drawImage(frame, 0, 0, canvas.width, canvas.height);

    detections.forEach(
      (detection: Detection) => {
        context.strokeStyle = 'red';
        context.lineWidth = 4;
        context.strokeRect(
          detection.ulx,
          detection.uly,
          detection.lrx - detection.ulx,
          detection.lry - detection.uly
        );
      }
    );
  }, [frame, detections]);

  return (
      <canvas
        ref={canvasRef}
        width={renderWidth}
        height={renderHeight}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      />
  );
};

export default Screen;