"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface SignCardProps {
  sign: {
    id: number
    name: string
    nameGujarati: string
    category: string
    imageUrl: string
    description: string
    difficulty: string
  }
}

export function SignCard({ sign }: SignCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [hasEarnedXP, setHasEarnedXP] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)

    if (!hasEarnedXP) {
      setHasEarnedXP(true)
      // Here you would typically update the user's XP in a real app
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300"
    }
  }

  return (
    <div className="perspective-1000 h-[280px]">
      <motion.div
        className="relative w-full h-full cursor-pointer"
        onClick={handleFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Front of card */}
        <div
          className={`absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden ${
            isFlipped ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{sign.name}</h3>
              <Badge variant="outline" className={getDifficultyColor(sign.difficulty)}>
                {sign.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{sign.nameGujarati}</p>
          </div>

          <div className="relative h-[160px] bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Image
              src={sign.imageUrl || "/placeholder.svg"}
              alt={sign.name}
              width={160}
              height={160}
              className="object-cover"
            />
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary" className="text-xs">
                {sign.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={`absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 flex flex-col justify-between rotate-y-180 ${
            isFlipped ? "opacity-100" : "opacity-0"
          }`}
        >
          <div>
            <h3 className="font-bold text-lg mb-1">
              {sign.name} / {sign.nameGujarati}
            </h3>
            <Badge variant="outline" className="mb-4">
              {sign.category}
            </Badge>
            <p className="text-slate-600 dark:text-slate-300">{sign.description}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Tap to flip back</span>
              {hasEarnedXP && (
                <motion.div
                  className="flex items-center gap-1 text-yellow-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 10 }}
                >
                  <Star className="h-4 w-4 fill-yellow-500" />
                  <span className="font-bold text-sm">+10 XP</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
