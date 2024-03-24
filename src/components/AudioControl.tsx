// src/components/AudioControl.tsx
import { useState, useEffect, useRef } from 'react';
import { useMediaRecorder } from './hooks/useAudioRecorder';
import AudioVisualizer from './AudioVisualizer';
import { FiMic, FiSquare, FiPlay, FiPause, FiTrash2 } from 'react-icons/fi';
import { Card, Modal, ModalHeader, ModalBody, Button } from 'flowbite-react';

const AudioControl: React.FC = () => {
  const {
    mediaUrl,
    startRecording,
    stopRecording,
    deleteRecording,
    recordingState,
    analyser,
  } = useMediaRecorder();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (mediaUrl) {
      const audioElement = new Audio(mediaUrl);
      audioElement.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current = audioElement;
      return () => {
        audioElement.pause();
        audioElement.removeEventListener('ended', () => setIsPlaying(false));
        audioElement.src = '';
      };
    }
  }, [mediaUrl]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (audio) {
      if (!isPlaying) {
        audio.play().then(() => setIsPlaying(true)).catch((error) => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleDeleteConfirm = () => {
    deleteRecording();
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setShowModal(false);
  };

  return (
    <div className="p-2.5">
      <Card role="region" aria-labelledby="audioControlHeading" className="max-w-full md:max-w-xl lg:max-w-2xl xl:max-w-4xl mx-auto shadow-lg" >
        <h2 id="audioControlHeading" className="text-xl md:text-2xl lg:text-3xl font-bold text-center tracking-tight text-gray-900 dark:text-white">
          Press the microphone to begin recording
        </h2>
        <div className="flex items-center justify-center space-x-4 mt-4">
          {recordingState === 'idle' && (
            <button
              id="start-recording"
              className="p-3 bg-blue-500 text-white rounded-full"
              onClick={startRecording}
              aria-label="Start recording"
            >
              <FiMic />
            </button>
          )}
          {recordingState === 'recording' && (
            <button
              id="stop-recording"
              className="p-3 bg-red-500 text-white rounded-full"
              onClick={stopRecording}
              aria-label="Stop recording"
            >
              <FiSquare />
            </button>
          )}
          {mediaUrl && (
            <>
              <button
                id="play-audio"
                className={`p-3 ${isPlaying ? 'bg-red-500' : 'bg-blue-500'} text-white rounded-full`}
                onClick={togglePlayback}
                aria-label={isPlaying ? 'Pause playback' : 'Play recording'}
              >
                {isPlaying ? <FiPause /> : <FiPlay />}
              </button>
              <button
                id="delete-audio"
                className="p-3 bg-gray-500 text-white rounded-full"
                onClick={() => setShowModal(true)}
                aria-label="Delete recording"
              >
                <FiTrash2 />
              </button>
            </>
          )}
          {recordingState === 'recording' && analyser && (
            <AudioVisualizer analyser={analyser} isPlaying={false} mediaUrl={null} />
          )}
        </div>
        {mediaUrl && (
          <div className="mt-2 text-center">
            <AudioVisualizer mediaUrl={mediaUrl} isPlaying={isPlaying} />
          </div>
        )}
      </Card>
      <Modal role="dialoge" show={showModal} onClose={() => setShowModal(false)} aria-labelledby="deleteConfirmation">
        <ModalHeader id="deleteConfirmation">Delete Recording</ModalHeader>
        <ModalBody>
          <div className="text-center">
            <p>Are you sure you want to delete this recording?</p>
            <div className="flex justify-center gap-4 mt-4">
              <Button color="blue" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button color="failure" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AudioControl;
