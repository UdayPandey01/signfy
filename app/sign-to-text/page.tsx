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
import { cn } from "@/lib/utils";

// Define types for gesture detection
interface GestureData {
  description: string;
  detect: (landmarks: Landmark[]) => boolean;
}

interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface GestureDetectionHistory {
  [gesture: string]: {
    detectionCount: number;
    lastDetectedAt: number;
  };
}

// Don't import MediaPipe directly - we'll load it via script tags
// import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
// import { Hands } from "@mediapipe/hands";
// import { Camera } from "@mediapipe/camera_utils";

// Declare MediaPipe global types
declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
  }
}

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
];

export default function SignToTextPage() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [language, setLanguage] = useState<string>("english");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [mediaPipeLoaded, setMediaPipeLoaded] = useState<boolean>(false);
  const [loadingMediaPipe, setLoadingMediaPipe] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [gestureDetectionHistory, setGestureDetectionHistory] = useState<GestureDetectionHistory>({});
  const [lastRecognizedGesture, setLastRecognizedGesture] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const confidenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Adding the missing handleLanguageToggle function
  const handleLanguageToggle = (newLanguage: string) => {
    setLanguage(newLanguage);
    resetRecognition();
  };

  // Helper functions for hand sign detection
  const isFingerExtended = (landmarks: Landmark[], fingerTip: number, fingerBase: number): boolean => {
    return landmarks[fingerTip].y < landmarks[fingerBase].y;
  };

  const areFingersCurled = (landmarks: Landmark[], fingerTips: number[], fingerBases: number[]): boolean => {
    return fingerTips.every((tip, i) => landmarks[tip].y > landmarks[fingerBases[i]].y);
  };

  const areFingersAligned = (landmarks: Landmark[], fingerIndices: number[], threshold: number = 0.05): boolean => {
    const avgY = fingerIndices.reduce((sum, i) => sum + landmarks[i].y, 0) / fingerIndices.length;
    return fingerIndices.every(i => Math.abs(landmarks[i].y - avgY) < threshold);
  };

  // Define basic ASL (American Sign Language) recognition patterns
  const signLanguageGestures: Record<string, GestureData> = {
    // Basic communication phrases
    "hello": {
      description: "Wave with all fingers spread",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          const fingerTips = [4, 8, 12, 16, 20]; // Thumb, index, middle, ring, pinky tips
          const fingerBases = [1, 5, 9, 13, 17]; // Finger bases
          
          // Count extended fingers
          let extendedCount = 0;
          for (let i = 0; i < fingerTips.length; i++) {
            if (isFingerExtended(landmarks, fingerTips[i], fingerBases[i])) {
              extendedCount++;
            }
          }
          
          return extendedCount >= 4;
        }
        return false;
      }
    },
    "thank you": {
      description: "Flat hand from chin outward",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          const fingerTips = [8, 12, 16, 20]; // index, middle, ring, pinky tips
          return areFingersAligned(landmarks, fingerTips);
        }
        return false;
      }
    },
    "yes": {
      description: "Fist with nodding motion",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          const fingerTips = [8, 12, 16, 20]; // index, middle, ring, pinky tips
          const fingerMiddle = [6, 10, 14, 18]; // finger middle joints
          return areFingersCurled(landmarks, fingerTips, fingerMiddle);
        }
        return false;
      }
    },
    "no": {
      description: "Index finger wagging side to side",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          const indexExtended = isFingerExtended(landmarks, 8, 5); // index tip above index base
          
          // Check other fingers are curled
          const otherTips = [12, 16, 20]; // middle, ring, pinky tips
          const otherBases = [9, 13, 17]; // middle, ring, pinky bases
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
            
          return indexExtended && othersCurled;
        }
        return false;
      }
    },
    "please": {
      description: "Flat hand circling on chest",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          const fingerTips = [8, 12, 16, 20]; 
          const palmCenter = landmarks[0];
          
          // Check if palm is facing camera (fingers roughly same z depth)
          const avgZ = fingerTips.reduce((sum, i) => sum + landmarks[i].z, 0) / fingerTips.length;
          const flatZ = fingerTips.every(i => Math.abs(landmarks[i].z - avgZ) < 0.03);
            
          // Check if hand is in lower position (could be near chest)
          const lowerPosition = palmCenter.y > 0.5;
            
          return flatZ && lowerPosition;
        }
        return false;
      }
    },
    
    // Emergency sign
    "EMERGENCY": {
      description: "Cross arms in an X shape over chest",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // For emergency, we're looking for a distinctive crossing pattern
          // This is simplified - a real detector would track both hands
          
          // Check if hand is in a fist position
          const fingerTips = [8, 12, 16, 20];
          const fingerMiddle = [6, 10, 14, 18];
          const fistFormed = areFingersCurled(landmarks, fingerTips, fingerMiddle);
          
          // Check if hand is across chest area
          const handCentered = landmarks[0].x > 0.3 && landmarks[0].x < 0.7;
          const handAtChestHeight = landmarks[0].y > 0.3 && landmarks[0].y < 0.7;
          
          return fistFormed && handCentered && handAtChestHeight;  
        }
        return false;
      }
    },
    
    // Space bar gesture
    "SPACE": {
      description: "Swipe hand horizontally with palm down",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Check for horizontal flat hand
          const fingerTips = [8, 12, 16, 20];
          const flatHand = areFingersAligned(landmarks, fingerTips);
          
          // Palm facing down (simplified)
          const palmDown = landmarks[9].y > landmarks[0].y;
          
          return flatHand && palmDown;
        }
        return false;
      }
    },
    
    // ASL Alphabet
    "A": {
      description: "Fist with thumb to the side",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Thumb extended to side, other fingers curled
          const fingerTips = [8, 12, 16, 20]; // index, middle, ring, pinky tips 
          const fingerBases = [5, 9, 13, 17]; // finger bases
          
          const fingersCurled = areFingersCurled(landmarks, fingerTips, fingerBases);
          const thumbExtended = landmarks[4].x > landmarks[3].x; // Thumb tip is to right of thumb IP
          
          return fingersCurled && thumbExtended;
        }
        return false;
      }
    },
    "B": {
      description: "Fingers together and extended, thumb across palm",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // All fingers extended and aligned
          const fingerTips = [8, 12, 16, 20]; // index, middle, ring, pinky tips
          const fingerBases = [5, 9, 13, 17]; // finger bases
          
          const fingersExtended = fingerTips.every((tip, i) => 
            isFingerExtended(landmarks, tip, fingerBases[i]));
          const fingersAligned = areFingersAligned(landmarks, fingerTips);
          
          // Thumb tucked
          const thumbTucked = landmarks[4].x < landmarks[3].x;
          
          return fingersExtended && fingersAligned && thumbTucked;
        }
        return false;
      }
    },
    "C": {
      description: "Curved hand forming C shape",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Fingers slightly curved forming a C
          const fingerTips = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky tips
          
          // Check if fingers form a curved shape
          const thumb = landmarks[4];
          const index = landmarks[8];
          const pinky = landmarks[20];
          
          // Thumb and pinky should form a C shape
          const cShape = Math.abs(thumb.y - pinky.y) < 0.15 && 
                         thumb.x < index.x && 
                         Math.abs(thumb.z - pinky.z) < 0.1;
          
          return cShape;
        }
        return false;
      }
    },
    "D": {
      description: "Index finger pointing up, other fingers curled",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Index extended, other fingers curled
          const indexExtended = isFingerExtended(landmarks, 8, 5);
          
          const otherTips = [12, 16, 20]; // middle, ring, pinky 
          const otherBases = [9, 13, 17];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          // Thumb tucked
          const thumbTucked = landmarks[4].x < landmarks[3].x;
          
          return indexExtended && othersCurled && thumbTucked;
        }
        return false;
      }
    },
    "E": {
      description: "Fingers curled, thumb tucked",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // All fingers curled
          const fingerTips = [8, 12, 16, 20];
          const fingerMiddle = [6, 10, 14, 18];
          const fingersCurled = areFingersCurled(landmarks, fingerTips, fingerMiddle);
          
          // Thumb tucked against palm
          const thumbTucked = landmarks[4].x < landmarks[3].x && 
                              landmarks[4].y > landmarks[2].y;
          
          return fingersCurled && thumbTucked;
        }
        return false;
      }
    },
    "F": {
      description: "Thumb and index finger form circle, other fingers extended",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Thumb and index form a circle
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];
          
          const circleFormed = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2) + 
            Math.pow(thumbTip.z - indexTip.z, 2)
          ) < 0.05;
          
          // Other fingers extended
          const otherTips = [12, 16, 20]; // middle, ring, pinky tips
          const otherBases = [9, 13, 17];
          const othersExtended = otherTips.every((tip, i) => 
            isFingerExtended(landmarks, tip, otherBases[i]));
          
          return circleFormed && othersExtended;
        }
        return false;
      }
    },
    "G": {
      description: "Index finger points forward, thumb extended",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Index pointing sideways (forward)
          const indexStraight = landmarks[8].x > landmarks[7].x && 
                               landmarks[7].x > landmarks[6].x;
          
          // Thumb extended upward
          const thumbExtended = landmarks[4].y < landmarks[3].y;
          
          // Other fingers curled
          const otherTips = [12, 16, 20]; // middle, ring, pinky
          const otherBases = [9, 13, 17];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return indexStraight && thumbExtended && othersCurled;
        }
        return false;
      }
    },
    "H": {
      description: "Index and middle fingers extended side by side",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Index and middle extended and parallel
          const indexExtended = isFingerExtended(landmarks, 8, 5);
          const middleExtended = isFingerExtended(landmarks, 12, 9);
          
          // Check they're side by side (similar Y values)
          const parallel = Math.abs(landmarks[8].y - landmarks[12].y) < 0.05;
          
          // Other fingers curled
          const otherTips = [16, 20]; // ring, pinky
          const otherBases = [13, 17];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return indexExtended && middleExtended && parallel && othersCurled;
        }
        return false;
      }
    },
    "I": {
      description: "Pinky finger extended, others curled",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Pinky extended
          const pinkyExtended = isFingerExtended(landmarks, 20, 17);
          
          // Other fingers curled
          const otherTips = [8, 12, 16]; // index, middle, ring
          const otherBases = [5, 9, 13];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return pinkyExtended && othersCurled;
        }
        return false;
      }
    },
    "J": {
      description: "Pinky extended and traced in J-shape",
      detect: (landmarks) => {
        // Similar to I but with movement - simplified for static detection
        if (landmarks && landmarks.length >= 21) {
          // Pinky extended
          const pinkyExtended = isFingerExtended(landmarks, 20, 17);
          
          // Other fingers curled
          const otherTips = [8, 12, 16]; // index, middle, ring
          const otherBases = [5, 9, 13];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          // Hand slightly tilted for J
          const handTilted = landmarks[20].x > landmarks[17].x;
          
          return pinkyExtended && othersCurled && handTilted;
        }
        return false;
      }
    },
    "K": {
      description: "Index and middle fingers extended forming a V",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Index and middle extended
          const indexExtended = isFingerExtended(landmarks, 8, 5);
          const middleExtended = isFingerExtended(landmarks, 12, 9);
          
          // They form a V shape (not parallel)
          const vShape = landmarks[8].x < landmarks[12].x;
          
          // Other fingers curled
          const otherTips = [16, 20]; // ring, pinky
          const otherBases = [13, 17];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return indexExtended && middleExtended && vShape && othersCurled;
        }
        return false;
      }
    },
    "L": {
      description: "Thumb and index form L shape",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Thumb extended to side
          const thumbExtended = landmarks[4].x > landmarks[3].x;
          
          // Index pointing up
          const indexExtended = isFingerExtended(landmarks, 8, 5);
          
          // They form a 90 degree angle
          const lShape = Math.abs(landmarks[4].y - landmarks[3].y) < 
                         Math.abs(landmarks[8].y - landmarks[5].y);
          
          // Other fingers curled
          const otherTips = [12, 16, 20]; // middle, ring, pinky
          const otherBases = [9, 13, 17];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return thumbExtended && indexExtended && lShape && othersCurled;
        }
        return false;
      }
    },
    "M": {
      description: "Three fingers extended and folded over thumb",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Thumb tucked
          const thumbTucked = landmarks[4].x < landmarks[3].x;
          
          // Three fingers extended and together
          const indexExtended = isFingerExtended(landmarks, 8, 5);
          const middleExtended = isFingerExtended(landmarks, 12, 9);
          const ringExtended = isFingerExtended(landmarks, 16, 13);
          
          // Fingers aligned
          const fingersAligned = areFingersAligned(landmarks, [8, 12, 16]);
          
          // Pinky curled
          const pinkyCurled = landmarks[20].y > landmarks[17].y;
          
          return thumbTucked && indexExtended && middleExtended && 
                 ringExtended && fingersAligned && pinkyCurled;
        }
        return false;
      }
    },
    "N": {
      description: "Two fingers extended and folded over thumb",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Thumb tucked
          const thumbTucked = landmarks[4].x < landmarks[3].x;
          
          // Two fingers extended and together
          const indexExtended = isFingerExtended(landmarks, 8, 5);
          const middleExtended = isFingerExtended(landmarks, 12, 9);
          
          // Fingers aligned
          const fingersAligned = areFingersAligned(landmarks, [8, 12]);
          
          // Other fingers curled
          const ringCurled = landmarks[16].y > landmarks[13].y;
          const pinkyCurled = landmarks[20].y > landmarks[17].y;
          
          return thumbTucked && indexExtended && middleExtended && 
                 fingersAligned && ringCurled && pinkyCurled;
        }
        return false;
      }
    },
    "O": {
      description: "Fingers curved to form a circle",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Fingers curved into O shape
          const fingerTips = [4, 8, 12, 16, 20];
          
          // Check if fingertips are close together
          const distances = [];
          for (let i = 0; i < fingerTips.length; i++) {
            for (let j = i + 1; j < fingerTips.length; j++) {
              const dist = Math.sqrt(
                Math.pow(landmarks[fingerTips[i]].x - landmarks[fingerTips[j]].x, 2) +
                Math.pow(landmarks[fingerTips[i]].y - landmarks[fingerTips[j]].y, 2)
              );
              distances.push(dist);
            }
          }
          
          // Average distance between fingertips should be small
          const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
          return avgDistance < 0.1;
        }
        return false;
      }
    },
    "P": {
      description: "Thumb and index extended, middle knuckle bent",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Thumb pointing outward
          const thumbExtended = landmarks[4].x > landmarks[3].x;
          
          // Index finger pointing down
          const indexPointing = landmarks[8].y > landmarks[7].y && 
                               landmarks[7].y > landmarks[6].y;
          
          // Other fingers curled
          const otherTips = [12, 16, 20]; // middle, ring, pinky
          const otherBases = [9, 13, 17];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return thumbExtended && indexPointing && othersCurled;
        }
        return false;
      }
    },
    "Q": {
      description: "Thumb and index form hook shape",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Similar to P but angled differently
          // Thumb pointing down
          const thumbDownward = landmarks[4].y > landmarks[3].y;
          
          // Index finger curved
          const indexCurved = landmarks[8].x < landmarks[7].x &&
                             landmarks[7].x < landmarks[6].x;
          
          // Other fingers curled
          const otherTips = [12, 16, 20]; // middle, ring, pinky
          const otherBases = [9, 13, 17];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return thumbDownward && indexCurved && othersCurled;
        }
        return false;
      }
    },
    "R": {
      description: "Index and middle finger crossed",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Index and middle extended
          const indexExtended = isFingerExtended(landmarks, 8, 5);
          const middleExtended = isFingerExtended(landmarks, 12, 9);
          
          // Fingers crossed (index over middle)
          const crossed = landmarks[8].x > landmarks[12].x;
          
          // Other fingers curled
          const otherTips = [16, 20]; // ring, pinky
          const otherBases = [13, 17];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return indexExtended && middleExtended && crossed && othersCurled;
        }
        return false;
      }
    },
    "S": {
      description: "Fist with thumb wrapped over fingers",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // All fingers curled
          const fingerTips = [8, 12, 16, 20];
          const fingerBases = [5, 9, 13, 17];
          const fingersCurled = areFingersCurled(landmarks, fingerTips, fingerBases);
          
          // Thumb wrapped over fingers
          const thumbWrapped = landmarks[4].x < landmarks[3].x &&
                              landmarks[4].z < landmarks[0].z;
          
          return fingersCurled && thumbWrapped;
        }
        return false;
      }
    },
    "T": {
      description: "Thumb between index and middle finger",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Thumb between index and middle
          const thumbBetween = landmarks[4].x > landmarks[5].x && 
                              landmarks[4].x < landmarks[9].x;
          
          // Fist formed with other fingers
          const fingerTips = [8, 12, 16, 20];
          const fingerMiddle = [6, 10, 14, 18];
          const fistFormed = areFingersCurled(landmarks, fingerTips, fingerMiddle);
          
          return thumbBetween && fistFormed;
        }
        return false;
      }
    },
    "U": {
      description: "Index and middle extended parallel",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Index and middle extended
          const indexExtended = isFingerExtended(landmarks, 8, 5);
          const middleExtended = isFingerExtended(landmarks, 12, 9);
          
          // Fingers parallel
          const parallel = Math.abs(landmarks[8].x - landmarks[12].x) < 0.05;
          
          // Other fingers curled
          const otherTips = [16, 20]; // ring, pinky
          const otherBases = [13, 17];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return indexExtended && middleExtended && parallel && othersCurled;
        }
        return false;
      }
    },
    "V": {
      description: "Index and middle extended in V shape",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Index and middle extended
          const indexExtended = isFingerExtended(landmarks, 8, 5);
          const middleExtended = isFingerExtended(landmarks, 12, 9);
          
          // Form V shape (not parallel)
          const vShape = Math.abs(landmarks[8].x - landmarks[12].x) > 0.05;
          
          // Other fingers curled
          const otherTips = [16, 20]; 
          const otherBases = [13, 17];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return indexExtended && middleExtended && vShape && othersCurled;
        }
        return false;
      }
    },
    "W": {
      description: "Three fingers extended forming W",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Index, middle, ring extended
          const indexExtended = isFingerExtended(landmarks, 8, 5);
          const middleExtended = isFingerExtended(landmarks, 12, 9);
          const ringExtended = isFingerExtended(landmarks, 16, 13);
          
          // Spread apart
          const spread = Math.abs(landmarks[8].x - landmarks[16].x) > 0.1;
          
          // Pinky and thumb curled
          const pinkyCurled = !isFingerExtended(landmarks, 20, 17);
          const thumbCurled = landmarks[4].x < landmarks[2].x;
          
          return indexExtended && middleExtended && ringExtended && 
                 spread && pinkyCurled && thumbCurled;
        }
        return false;
      }
    },
    "X": {
      description: "Index finger bent like a hook",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Index finger bent like a hook
          const indexHooked = landmarks[8].y > landmarks[7].y &&
                            landmarks[7].y < landmarks[6].y;
          
          // Other fingers curled
          const otherTips = [12, 16, 20]; // middle, ring, pinky
          const otherBases = [9, 13, 17];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return indexHooked && othersCurled;
        }
        return false;
      }
    },
    "Y": {
      description: "Thumb and pinky extended",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Thumb extended
          const thumbExtended = landmarks[4].x > landmarks[3].x;
          
          // Pinky extended
          const pinkyExtended = isFingerExtended(landmarks, 20, 17);
          
          // Other fingers curled
          const otherTips = [8, 12, 16]; // index, middle, ring
          const otherBases = [5, 9, 13];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return thumbExtended && pinkyExtended && othersCurled;
        }
        return false;
      }
    },
    "Z": {
      description: "Index finger drawing Z shape",
      detect: (landmarks) => {
        if (landmarks && landmarks.length >= 21) {
          // Similar to D but with horizontal movement
          // Index extended
          const indexExtended = isFingerExtended(landmarks, 8, 5);
          
          // Other fingers curled
          const otherTips = [12, 16, 20]; // middle, ring, pinky
          const otherBases = [9, 13, 17];
          const othersCurled = areFingersCurled(landmarks, otherTips, otherBases);
          
          return indexExtended && othersCurled;
        }
        return false;
      }
    }
  };

  // Update confidence for detected gestures
  const updateConfidenceForDetection = (gesture: string, isDetected: boolean) => {
    // Initialize or update gesture history
    const now = Date.now();
    
    setGestureDetectionHistory(prevHistory => {
      const newHistory = { ...prevHistory };
      
      if (!newHistory[gesture]) {
        newHistory[gesture] = {
          detectionCount: 0,
          lastDetectedAt: 0
        };
      }
      
      if (isDetected) {
        // Increment detection count if detected
        newHistory[gesture] = {
          detectionCount: newHistory[gesture].detectionCount + 1,
          lastDetectedAt: now
        };
        
        // If we have enough detections, recognize the gesture
        if (newHistory[gesture].detectionCount > 15 && 
            (lastRecognizedGesture !== gesture || now - newHistory[gesture].lastDetectedAt > 5000)) {
          
          setLastRecognizedGesture(gesture);
          setConfidence(100);
          setRecognizedText(prev => prev ? `${prev} ${gesture}` : gesture);
          
          // Reset history for all gestures after recognition
          Object.keys(newHistory).forEach(key => {
            newHistory[key] = {
              detectionCount: 0,
              lastDetectedAt: 0
            };
          });
        } else if (newHistory[gesture].detectionCount > 5) {
          // Update confidence as we get more detections
          setConfidence(Math.min(
            Math.floor((newHistory[gesture].detectionCount / 15) * 100), 
            95
          ));
        }
      } else {
        // Gradually decrease detection count if not detected
        if (newHistory[gesture].detectionCount > 0) {
          newHistory[gesture] = {
            detectionCount: Math.max(0, newHistory[gesture].detectionCount - 0.5),
            lastDetectedAt: newHistory[gesture].lastDetectedAt
          };
        }
      }
      
      return newHistory;
    });
  };

  // Process hand landmarks for sign language detection
  const processHandLandmarks = (landmarks: Landmark[]) => {
    // Check each defined gesture against the landmarks
    for (const [gestureName, gestureData] of Object.entries(signLanguageGestures)) {
      const isDetected = gestureData.detect(landmarks);
      updateConfidenceForDetection(gestureName, isDetected);
    }
  };

  const simulateRecognition = () => {
    // In real detection mode, we don't need to simulate
    // We'll just initialize the confidence to 0 and wait for real detections
    setConfidence(0);
    
    // Reset gesture history
    setGestureDetectionHistory({});
    setLastRecognizedGesture(null);
    setRecognizedText("");
  };

  const resetRecognition = () => {
    setRecognizedText("");
    setConfidence(0);
    setIsCopied(false);
    setErrorMsg("");
    
    // Clear confidence interval if running
    if (confidenceIntervalRef.current) {
      clearInterval(confidenceIntervalRef.current);
      confidenceIntervalRef.current = null;
    }
  };

  // Load MediaPipe scripts dynamically
  const loadMediaPipeScripts = () => {
    if (mediaPipeLoaded || loadingMediaPipe) return Promise.resolve();
    
    setLoadingMediaPipe(true);
    setErrorMsg("");
    
    return new Promise<void>((resolve, reject) => {
      const scripts = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'
      ];
      
      let loaded = 0;
      
      scripts.forEach(src => {
        // Check if script already exists
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          loaded++;
          if (loaded === scripts.length) {
            setMediaPipeLoaded(true);
            setLoadingMediaPipe(false);
            resolve();
          }
          return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        script.onload = () => {
          loaded++;
          if (loaded === scripts.length) {
            setMediaPipeLoaded(true);
            setLoadingMediaPipe(false);
            resolve();
          }
        };
        
        script.onerror = (error) => {
          setLoadingMediaPipe(false);
          const errorMessage = `Failed to load script: ${src}`;
          setErrorMsg(errorMessage);
          reject(new Error(errorMessage));
        };
        
        document.body.appendChild(script);
      });
    });
  };

  const startRecording = async () => {
    try {
      resetRecognition();
      setErrorMsg("");
      
      // First load MediaPipe if not already loaded
      if (!mediaPipeLoaded) {
        try {
          await loadMediaPipeScripts();
        } catch (err) {
          console.error("Failed to load MediaPipe:", err);
          setErrorMsg("Failed to load MediaPipe libraries. Please try again.");
          return;
        }
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraPermission(true);
          setIsRecording(true);
          
          // Initialize hand tracking once video is ready
          videoRef.current.onloadedmetadata = () => {
            try {
              initializeHandTracking();
              simulateRecognition();
            } catch (trackingErr) {
              console.error("Error initializing hand tracking:", trackingErr);
              setErrorMsg("Failed to initialize hand tracking. Please try again.");
              stopRecording();
            }
          };
        }
      } catch (cameraErr) {
        console.error("Error accessing camera:", cameraErr);
        setCameraPermission(false);
        setErrorMsg("Camera access denied. Please check your browser permissions.");
      }
    } catch (err) {
      console.error("General error starting recording:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
      stopRecording();
    }
  };

  const initializeHandTracking = () => {
    if (!videoRef.current || !canvasRef.current || !window.Hands) return;

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    // Safely clean up previous instances
    try {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      
      if (handsRef.current) {
        try {
          handsRef.current.close();
        } catch (err) {
          console.log("MediaPipe hands instance already cleaned up");
        }
        handsRef.current = null;
      }
    } catch (err) {
      console.error("Error cleaning up previous MediaPipe instances:", err);
    }

    try {
      // Create new Hands instance
      handsRef.current = new window.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      handsRef.current.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.8,
        minTrackingConfidence: 0.8,
      });

      handsRef.current.onResults((results: { 
        image: CanvasImageSource;
        multiHandLandmarks?: Landmark[][];
      }) => {
        if (!canvasCtx) return;

        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          for (const landmarks of results.multiHandLandmarks) {
            window.drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
              color: "#8b5cf6",
              lineWidth: 4,
            });
            window.drawLandmarks(canvasCtx, landmarks, {
              color: "#8b5cf6",
              lineWidth: 2,
            });
            
            // Process landmarks for sign language detection
            processHandLandmarks(landmarks);
          }
        }

        canvasCtx.restore();
      });

      // Start camera
      cameraRef.current = new window.Camera(videoElement, {
        onFrame: async () => {
          if (handsRef.current) {
            await handsRef.current.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480,
      });

      cameraRef.current.start();
    } catch (error) {
      console.error("Error initializing hand tracking:", error);
    }
  };

  const stopRecording = () => {
    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Safely clean up MediaPipe instances
    try {
      // Stop MediaPipe camera first
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      
      // Then close MediaPipe hands with error handling
      if (handsRef.current) {
        try {
          handsRef.current.close();
        } catch (err) {
          console.log("MediaPipe hands instance already cleaned up");
        }
        handsRef.current = null;
      }
    } catch (err) {
      console.error("Error cleaning up MediaPipe:", err);
    }
    
    setIsRecording(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopRecording();
      
      // Clear confidence interval if running
      if (confidenceIntervalRef.current) {
        clearInterval(confidenceIntervalRef.current);
        confidenceIntervalRef.current = null;
      }
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
            <Button 
              variant="link" 
              className="text-sm p-0 h-auto text-primary"
              onClick={() => setShowGuide(!showGuide)}
            >
              {showGuide ? "Hide sign guide" : "Show supported signs"}
            </Button>
          </div>
          <LanguageToggle language={language} onToggle={handleLanguageToggle} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
          <div className="p-6">
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4">
              {cameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                  <CameraIcon className="h-12 w-12 mb-4 text-slate-400" />
                  <h3 className="text-xl font-bold mb-2">Camera access denied</h3>
                  <p className="text-slate-400 mb-4">
                    Please allow camera access to use the sign language recognition feature
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
                        <h3 className="text-xl font-bold text-white mb-2">Start Signing</h3>
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
                <Button variant="destructive" onClick={stopRecording} className="flex-1">
                  Stop Camera
                </Button>
              ) : (
                <Button
                  onClick={startRecording}
                  disabled={cameraPermission === false || loadingMediaPipe}
                  className="flex-1"
                >
                  {loadingMediaPipe ? "Loading MediaPipe..." : "Start Camera"}
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
            
            {errorMsg && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">Error: {errorMsg}</p>
                <p className="text-xs mt-1">Try refreshing the page or using a different browser.</p>
              </div>
            )}

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

        {showGuide && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden mb-8 p-6">
            <h2 className="text-xl font-bold mb-4">Supported Sign Language Gestures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(signLanguageGestures).map(([name, data]) => (
                <div key={name} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <h3 className="font-bold text-lg">{name}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{data.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-slate-500">
              <p>For best results, make sure your hand is clearly visible in the camera.</p>
              <p>Hold each gesture steady for a moment to improve recognition.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}