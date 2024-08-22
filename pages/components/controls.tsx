import { Box, IconButton, Slider, SliderMark, SxProps } from '@mui/material';
import styles from "./Controls.module.scss";
import { FullscreenRounded, PlayArrowRounded, PauseRounded } from '@mui/icons-material';
import { Mark } from '@mui/base/useSlider/useSlider.types';

export interface DurationMark extends Mark {
    duration: number;
}

interface ControlsProps {
    hidden: boolean;
    position: number;
    duration: number;
    paused: boolean;
    onFullscreen: () => void;
    onPlay: () => void;
    onPause: () => void;
    onSeek: (position: number) => void;
    marks?: DurationMark[];
}

const Controls: React.FC<ControlsProps> = ({ hidden, position, duration, paused, onFullscreen, onPlay, onPause, onSeek, marks = [] }) => {

    const formatDuration = (value: number) => {
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value - minutes * 60);
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    }

    const sliderMarkStyles = marks.reduce((acc, mark, index) => {
        return {
            ...acc,
            [`& .MuiSlider-mark[data-index="${index}"]`]: {
                transform: 'translate(0, -50%)',
                width: `calc(${mark.duration / duration * 100}% + 1px)`,
            }
        }
    }, {});
    
    const stopPropagation = (e: React.MouseEvent, callback: () => void) => {
        e.stopPropagation();
        callback();
    }

    return (
        <Box className={styles.controls} onDoubleClick={onFullscreen} sx={{
            opacity: hidden ? 0 : 1,
        }} >
            <Box className={styles.top} onClick={() => paused ? onPlay() : onPause()}>
                <IconButton onClick={(e) => stopPropagation(e, paused ? onPlay : onPause)} color='inherit' size='large'>
                    {paused ? <PlayArrowRounded fontSize='large'></PlayArrowRounded> : <PauseRounded fontSize='large'></PauseRounded>}
                </IconButton>
                {formatDuration(position)} / {formatDuration(duration)}
                <IconButton onClick={(e) => stopPropagation(e, onFullscreen)} color='inherit' size='large'>
                    <FullscreenRounded fontSize='large'></FullscreenRounded>
                </IconButton>
            </Box>
            <Box>
                <Slider
                    aria-label="time-indicator"
                    size="medium"
                    value={position}
                    min={0}
                    step={0.1}
                    max={duration}
                    onChange={(_, value) => onSeek(value as number)}
                    className={styles.slider}
                   sx={{
                        color: 'white',
                        ...sliderMarkStyles
                    }}
                    marks={marks}
                />
            </Box>
        </Box>
    );

}


export default Controls;