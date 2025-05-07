"use client"

import { useState } from "react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Clock, Flame, Trophy } from "lucide-react"
import { QuizOption } from "@/components/quiz-option"
import { QuizFeedback } from "@/components/quiz-feedback"

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex)
    const correct = optionIndex === quizQuestions[currentQuestion].correctAnswer
    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      setScore(score + 10 + streak * 2)
      setStreak(streak + 1)
    } else {
      setStreak(0)
    }

    // Move to next question after delay
    setTimeout(() => {
      setShowFeedback(false)
      setSelectedOption(null)
      setIsCorrect(null)

      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        // Quiz completed - would show results screen in a full implementation
        setCurrentQuestion(0)
      }
    }, 2000)
  }

  const currentQuizQuestion = quizQuestions[currentQuestion]

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quiz Mode</h1>
            <p className="text-slate-600 dark:text-slate-300">Test your sign language knowledge</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow border border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-bold">{score}</span>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow border border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-bold">{streak}</span>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow border border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="font-bold">30s</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
            <span>{Math.round((currentQuestion / quizQuestions.length) * 100)}% Complete</span>
          </div>
          <Progress value={(currentQuestion / quizQuestions.length) * 100} className="h-2" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">{currentQuizQuestion.question}</h2>

            {currentQuizQuestion.type === "image-to-text" && (
              <div className="flex justify-center mb-6">
                <div className="relative w-64 h-64 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden">
                  <Image
                    src={currentQuizQuestion.imageUrl || "/placeholder.svg"}
                    alt="Sign to identify"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 p-6 pt-0">
            {currentQuizQuestion.options.map((option, index) => (
              <QuizOption
                key={index}
                option={option}
                index={index}
                selected={selectedOption === index}
                correct={isCorrect !== null && index === currentQuizQuestion.correctAnswer}
                disabled={showFeedback}
                onSelect={() => handleOptionSelect(index)}
              />
            ))}
          </div>
        </div>

        {showFeedback && <QuizFeedback isCorrect={isCorrect} />}
      </div>
    </div>
  )
}

const quizQuestions = [
  {
    question: "What does this sign mean?",
    type: "image-to-text",
    imageUrl: "/placeholder.svg?height=300&width=300",
    options: ["Hello", "Thank you", "Please", "Sorry"],
    correctAnswer: 0,
  },
  {
    question: "Which sign represents 'Water'?",
    type: "text-to-image",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 2,
  },
  {
    question: "What does this sign mean?",
    type: "image-to-text",
    imageUrl: "/placeholder.svg?height=300&width=300",
    options: ["Family", "Friend", "Teacher", "Student"],
    correctAnswer: 1,
  },
  {
    question: "Which sign represents 'Thank You'?",
    type: "text-to-image",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 3,
  },
  {
    question: "What does this sign mean?",
    type: "image-to-text",
    imageUrl: "/placeholder.svg?height=300&width=300",
    options: ["Happy", "Sad", "Angry", "Surprised"],
    correctAnswer: 0,
  },
]
