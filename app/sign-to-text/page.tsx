"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Camera as CameraIcon,
  RefreshCw,
  Copy,
  CheckCircle2,
  Hand,
} from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { motion } from "framer-motion";
import { Hands, Landmark } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
import { cn } from "@/lib/utils";

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], 
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12], 
  [0, 13], [13, 14], [14, 15], [15, 16], 
  [0, 17], [17, 18], [18, 19], [19, 20], 
];

export default function SignToTextPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState<"english" | "gujarati">("english");
  const [isCopied, setIsCopied] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const handleLanguageToggle = () => {
    setLanguage(language === "english" ? "gujarati" : "english");
  };

  const simulateRecognition = () => {
    setRecognizedText(language === "english" ? "Hello" : "હેલ્લો");
    setConfidence(98);
  };

  const resetRecognition = () => {
    setRecognizedText("");
    setConfidence(0);
    setIsCopied(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraPermission(true);
        setIsRecording(true);
        setRecognizedText("");
        setTimeout(() => {
          simulateRecognition();
        }, 3000);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraPermission(false);
    }
  };

  const stopRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  useEffect(() => {
    if (!isRecording || !videoRef.current || !canvasRef.current) return;

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
    });

    const canvasCtx = canvasRef.current.getContext("2d");

    hands.onResults((results) => {
      if (!canvasRef.current || !videoRef.current || !canvasCtx) return;
    
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
    
      canvasCtx.save();
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#8b5cf6",
            lineWidth: 4,
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: "#8b5cf6",
            lineWidth: 2,
          });
        }
      }
      canvasCtx.restore();
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current! });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sign to Text</h1>
            <p className="text-slate-600 dark:text-slate-300">
              Perform sign language gestures and we'll convert them to text
            </p>
          </div>
          <LanguageToggle language={language} onToggle={handleLanguageToggle} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
          <div className="p-6">
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4">
              {cameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                  <CameraIcon className="h-12 w-12 mb-4 text-slate-400" />
                  <h3 className="text-xl font-bold mb-2">
                    Camera access denied
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Please allow camera access to use the sign language
                    recognition feature
                  </p>
                  <Button onClick={startRecording}>Try Again</Button>
                </div>
              )}

              {cameraPermission !== false && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover",
                      !isRecording && "opacity-75"
                    )}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />

                  {!isRecording && !recognizedText && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-black/50 p-6 rounded-xl text-center"
                      >
                        <Hand className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-bold text-white mb-2">
                          Start Signing
                        </h3>
                        <p className="text-slate-300 mb-4">
                          Position your hands in the frame and start signing
                        </p>
                        <Button
                          onClick={startRecording}
                          size="lg"
                          className="animate-pulse"
                        >
                          Start Camera
                        </Button>
                      </motion.div>
                    </div>
                  )}

                  {isRecording && confidence < 95 && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 p-3 rounded-lg">
                        <div className="flex justify-between text-xs text-white mb-1">
                          <span>Recognizing sign language...</span>
                          <span>{confidence}%</span>
                        </div>
                        <Progress value={confidence} className="h-2" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2 mb-6">
              {isRecording ? (
                <Button
                  variant="destructive"
                  onClick={stopRecording}
                  className="flex-1"
                >
                  Stop Camera
                </Button>
              ) : (
                <Button
                  onClick={startRecording}
                  disabled={cameraPermission === false}
                  className="flex-1"
                >
                  Start Camera
                </Button>
              )}

              <Button
                variant="outline"
                onClick={resetRecognition}
                disabled={!isRecording && !recognizedText}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            {recognizedText && (
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-center">
                <p className="text-lg font-medium text-slate-800 dark:text-white mb-2">
                  {recognizedText}
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(recognizedText);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
