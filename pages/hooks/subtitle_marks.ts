import { useEffect, useState } from 'react';
import Hls from 'hls.js';
import { DurationMark } from '../components/controls';

export const useSubtitleMarks = (hls: Hls | null): DurationMark[] => {
  const [marks, setMarks] = useState<DurationMark[]>([]);

  useEffect(() => {
    const video = hls?.media as HTMLVideoElement;
    if (!video || !hls) return;

    const onSubtitles = () => {
      for (let i = marks.length; i < (video.textTracks?.[0]?.cues?.length || 0); i++) {
        const cue = video.textTracks[0].cues?.[i] as VTTCue;
        setMarks((prev) => [...prev, { value: cue.startTime, duration: cue.endTime - cue.startTime }]);
      }
    };

    hls.on(Hls.Events.SUBTITLE_FRAG_PROCESSED, onSubtitles);

    return () => {
      hls.off(Hls.Events.SUBTITLE_FRAG_PROCESSED, onSubtitles);
    };
  }, [hls, marks]);

  return marks;
};