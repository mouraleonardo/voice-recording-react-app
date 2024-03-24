// src/components/AudioVisualizer.tsx
import { useEffect, useRef, useCallback } from "react";

interface AudioVisualizerProps {
  mediaUrl: string | null;
  isPlaying: boolean;
  analyser?: AnalyserNode | null;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  mediaUrl,
  isPlaying,
  analyser: externalAnalyser,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const analyser = analyserRef.current;
    if (!canvas || !ctx || !analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawVisualizer = () => {
      animationFrameId.current = requestAnimationFrame(drawVisualizer);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgb(0, 0, 0)";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    drawVisualizer();
  }, []);

  useEffect(() => {
    const cleanup = () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect(); // Important to disconnect source nodes
        sourceNodeRef.current = null;
      }
      // Only disconnect analyserRef.current if it's internally managed and not passed in from outside
      if (analyserRef.current && !externalAnalyser) {
        analyserRef.current.disconnect(); // Optional based on your web audio graph setup
      }
      if (audioContextRef.current && !externalAnalyser) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (mediaElementRef.current) {
        mediaElementRef.current.pause();
        mediaElementRef.current.src = ""; // Ensure the media element is properly cleaned up
        mediaElementRef.current = null;
      }
    };

    if (externalAnalyser) {
      analyserRef.current = externalAnalyser;
      draw();
    } else if (mediaUrl && isPlaying) {
      const setupAudio = async () => {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        await audioContextRef.current.resume(); // Ensure the audio context is resumed
        const analyser = audioContextRef.current.createAnalyser();
        const mediaElement = new Audio(mediaUrl);
        const sourceNode =
          audioContextRef.current.createMediaElementSource(mediaElement);

        // This line has been removed: audioContextRef.current = audioContextRef.current;
        analyserRef.current = analyser;
        mediaElementRef.current = mediaElement;
        sourceNodeRef.current = sourceNode;

        sourceNode.connect(analyser);
        analyser.connect(audioContextRef.current.destination);

        mediaElement
          .play()
          .then(draw)
          .catch((err) => console.error("Error playing audio:", err));
      };

      setupAudio().catch((err) =>
        console.error("Error setting up audio:", err)
      );
    } else if (mediaElementRef.current) {
      // This handles pausing the playback if isPlaying is false
      mediaElementRef.current.pause();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return cleanup;
  }, [mediaUrl, isPlaying, draw, externalAnalyser]);

  return (
    <canvas
      ref={canvasRef}
      className="border-2 rounded-lg w-full h-10 "
    ></canvas>
  );
};

export default AudioVisualizer;
