// src/components/AudioControl.tsx
import { useState, useEffect, useRef } from "react";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import AudioVisualizer from "./AudioVisualizer";
import { FiMic, FiSquare, FiPlay, FiPause, FiTrash2 } from "react-icons/fi";
import { Card, Modal, ModalHeader, ModalBody, Button } from "flowbite-react";

const AudioControl: React.FC = () => {
  const {
    audioUrl,
    startRecording,
    stopRecording,
    deleteRecording,
    recordingState,
    analyser,
  } = useAudioRecorder();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Cleanup previous audio element if exists
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = ""; // Helps ensure the audio stops playing
    }

    if (audioUrl) {
      const audioElement = new Audio(audioUrl);
      audioElement.addEventListener("ended", () => setIsPlaying(false));
      audioRef.current = audioElement;
      return () => {
        audioElement.pause();
        audioElement.removeEventListener("ended", () => setIsPlaying(false));
        audioElement.src = ""; // Ensure cleanup
      };
    }
  }, [audioUrl]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (audio) {
      if (!isPlaying) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error("Error playing audio:", error);
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
    setIsPlaying(false); // Reset playback state
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = ""; // Cleanup the audio element
    }
    setShowModal(false); // Close the modal
  };

  return (
    <>
      <Card className="max-w-sm shadow-lg">
        <h2 className="text-2xl font-bold text-center tracking-tight text-gray-900 dark:text-white">
          Press the microphone to begin recording
        </h2>
        <div className="items-center justify-center space-y-4 sm:flex sm:space-x-4 sm:space-y-0">
          {recordingState === "idle" && (
            <button
              id="start-recording"
              className="p-3 bg-blue-500 text-white rounded-full "
              onClick={startRecording}
            >
              <FiMic />
            </button>
          )}
          {recordingState === "recording" && (
            <button
              id="stop-recording"
              className="p-3 bg-red-500 text-white rounded-full"
              onClick={stopRecording}
            >
              <FiSquare />
            </button>
          )}
          {recordingState === "recording" && analyser && (
            <AudioVisualizer
              analyser={analyser}
              isPlaying={false}
              audioUrl={null}
            />
          )}
        </div>
        <div className="items-center justify-center space-y-4 sm:flex sm:space-x-4 sm:space-y-0 gap-2">
          {audioUrl && (
            <>
              <button
                id="play-audio"
                className={`p-3 ${
                  isPlaying ? "bg-red-500" : "bg-blue-500"
                } text-white rounded-full`}
                onClick={togglePlayback}
              >
                {isPlaying ? <FiPause /> : <FiPlay />}
              </button>
              <button
                id="delete-audio"
                className="p-3 bg-gray-500 text-white rounded-full"
                onClick={() => setShowModal(true)}
              >
                <FiTrash2 />
              </button>
              <AudioVisualizer audioUrl={audioUrl} isPlaying={isPlaying} />
            </>
          )}
        </div>
        <div className="mt-2 text-center">
          {recordingState === "recording" && <p>Recording...</p>}
          {recordingState === "stopped" && audioUrl && !isPlaying && (
            <p>Playback available</p>
          )}
          {isPlaying && <p>Playing...</p>}
        </div>
      </Card>
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader>Delete Recording</ModalHeader>
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
    </>
  );
};

export default AudioControl;
