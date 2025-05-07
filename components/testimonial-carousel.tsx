"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    text: "This app has transformed how I communicate with my deaf cousin. The gamified approach makes learning sign language actually fun!",
    author: "Priya Patel",
    role: "Family Member",
  },
  {
    id: 2,
    text: "As a teacher working with deaf students, this tool has been invaluable. The Gujarati support is especially helpful for our community.",
    author: "Raj Sharma",
    role: "Special Education Teacher",
  },
  {
    id: 3,
    text: "I've tried many sign language apps, but this one keeps me coming back with its rewards system and fun challenges.",
    author: "Anita Desai",
    role: "Student",
  },
]

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const next = () => {
    setIsAutoPlaying(false)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setIsAutoPlaying(false)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700">
        <Quote className="h-10 w-10 text-primary/30 mb-4" />

        <div className="min-h-[160px]">
          <p className="text-lg mb-6 italic">"{testimonials[current].text}"</p>

          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {testimonials[current].author.charAt(0)}
            </div>
            <div className="ml-4">
              <p className="font-bold">{testimonials[current].author}</p>
              <p className="text-sm text-slate-500">{testimonials[current].role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-2">
        <Button variant="outline" size="icon" onClick={prev} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Previous</span>
        </Button>

        {testimonials.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAutoPlaying(false)
              setCurrent(index)
            }}
            className={`w-2 h-2 p-0 rounded-full ${
              index === current ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span className="sr-only">Testimonial {index + 1}</span>
          </Button>
        ))}

        <Button variant="outline" size="icon" onClick={next} className="rounded-full">
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  )
}
