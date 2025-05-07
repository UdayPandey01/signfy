"use client"

import { Button } from "@/components/ui/button"
import { ArrowRightLeft } from "lucide-react"

interface LanguageToggleProps {
  language: "english" | "gujarati"
  onToggle: () => void
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow border border-slate-100 dark:border-slate-700">
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          language === "english" ? "bg-primary text-white" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        English
      </span>

      <Button variant="ghost" size="icon" onClick={onToggle} className="h-7 w-7 rounded-full">
        <ArrowRightLeft className="h-3 w-3" />
        <span className="sr-only">Switch language</span>
      </Button>

      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          language === "gujarati" ? "bg-primary text-white" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        ગુજરાતી
      </span>
    </div>
  )
}
