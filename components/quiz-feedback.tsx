"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

interface QuizFeedbackProps {
  isCorrect: boolean | null
}

export function QuizFeedback({ isCorrect }: QuizFeedbackProps) {
  if (isCorrect === null) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed inset-x-0 bottom-20 mx-auto w-full max-w-md p-4 rounded-xl shadow-lg ${
        isCorrect ? "bg-green-500" : "bg-red-500"
      } text-white text-center`}
    >
      <div className="flex items-center justify-center gap-2">
        {isCorrect ? (
          <>
            <Check className="h-6 w-6" />
            <span className="text-lg font-bold">Correct! +10 XP</span>
          </>
        ) : (
          <>
            <X className="h-6 w-6" />
            <span className="text-lg font-bold">Incorrect! Try again</span>
          </>
        )}
      </div>
    </motion.div>
  )
}
