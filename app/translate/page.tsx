"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { LanguagesIcon, Volume2, RefreshCw } from "lucide-react"
import { LanguageToggle } from "@/components/language-toggle"

export default function TranslatePage() {
  const [text, setText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [language, setLanguage] = useState<"english" | "gujarati">("english")

  const handleTranslate = () => {
    if (!text.trim()) return

    setIsTranslating(true)

    // Simulate translation delay
    setTimeout(() => {
      setIsTranslating(false)
    }, 1500)
  }

  const handleLanguageToggle = () => {
    setLanguage(language === "english" ? "gujarati" : "english")
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Text to Sign</h1>
            <p className="text-slate-600 dark:text-slate-300">Translate text to sign language and speech</p>
          </div>

          <LanguageToggle language={language} onToggle={handleLanguageToggle} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
          <div className="p-6">
            <Textarea
              placeholder={`Type your text in ${language === "english" ? "English" : "Gujarati"}...`}
              className="min-h-[120px] resize-none border-slate-200 dark:border-slate-700"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex justify-end mt-4">
              <Button onClick={handleTranslate} disabled={!text.trim() || isTranslating} className="gap-2">
                {isTranslating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <LanguagesIcon className="h-4 w-4" />
                    Translate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Translation Result</h2>

            <div className="flex flex-col items-center">
              {text ? (
                <>
                  <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden mb-6">
                    <Image
                      src="/placeholder.svg?height=300&width=500"
                      alt="Sign language animation"
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div className="w-full flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <div>
                      <p className="font-medium">{language === "english" ? text : "Translated Gujarati text"}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {language === "english" ? "Gujarati translation here" : "English translation here"}
                      </p>
                    </div>

                    <Button variant="outline" size="icon" className="rounded-full">
                      <Volume2 className="h-4 w-4" />
                      <span className="sr-only">Play audio</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <LanguagesIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Enter text above to see the sign language translation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
