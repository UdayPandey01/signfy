"use client"

import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface QuizOptionProps {
  option: string
  index: number
  selected: boolean
  correct: boolean
  disabled: boolean
  onSelect: () => void
}

export function QuizOption({ option, index, selected, correct, disabled, onSelect }: QuizOptionProps) {
  const letters = ["A", "B", "C", "D"]

  return (
    <button
      className={cn(
        "flex items-center p-4 rounded-xl border-2 transition-all",
        selected && correct
          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
          : selected && !correct
            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
            : selected
              ? "border-primary"
              : "border-slate-200 dark:border-slate-700 hover:border-primary",
        disabled && !selected && "opacity-50 cursor-not-allowed",
      )}
      onClick={onSelect}
      disabled={disabled}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-medium",
          selected && correct
            ? "bg-green-500 text-white"
            : selected && !correct
              ? "bg-red-500 text-white"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
        )}
      >
        {selected && correct ? (
          <Check className="h-4 w-4" />
        ) : selected && !correct ? (
          <X className="h-4 w-4" />
        ) : (
          letters[index]
        )}
      </div>
      <span className="text-left font-medium">{option}</span>
    </button>
  )
}
