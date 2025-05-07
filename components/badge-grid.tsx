import Image from "next/image"
import { Lock } from "lucide-react"

export function BadgeGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <div key={badge.id} className="flex flex-col items-center text-center">
          <div className={`relative w-16 h-16 mb-2 ${!badge.unlocked ? "opacity-50" : ""}`}>
            <div className={`w-16 h-16 rounded-full ${badge.color} flex items-center justify-center`}>
              <Image
                src={badge.icon || "/placeholder.svg"}
                alt={badge.name}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            {!badge.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                <Lock className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          <h3 className="font-medium text-sm">{badge.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{badge.unlocked ? badge.description : "Locked"}</p>
        </div>
      ))}
    </div>
  )
}

const badges = [
  {
    id: 1,
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "/placeholder.svg?height=50&width=50",
    color: "bg-green-100 dark:bg-green-900/30",
    unlocked: true,
  },
  {
    id: 2,
    name: "Quick Learner",
    description: "Learn 10 signs in one day",
    icon: "/placeholder.svg?height=50&width=50",
    color: "bg-blue-100 dark:bg-blue-900/30",
    unlocked: true,
  },
  {
    id: 3,
    name: "Perfect Score",
    description: "Get 100% on a quiz",
    icon: "/placeholder.svg?height=50&width=50",
    color: "bg-yellow-100 dark:bg-yellow-900/30",
    unlocked: true,
  },
  {
    id: 4,
    name: "Conversation Master",
    description: "Learn all greeting signs",
    icon: "/placeholder.svg?height=50&width=50",
    color: "bg-purple-100 dark:bg-purple-900/30",
    unlocked: true,
  },
  {
    id: 5,
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "/placeholder.svg?height=50&width=50",
    color: "bg-red-100 dark:bg-red-900/30",
    unlocked: true,
  },
  {
    id: 6,
    name: "Quiz Champion",
    description: "Complete 10 quizzes",
    icon: "/placeholder.svg?height=50&width=50",
    color: "bg-orange-100 dark:bg-orange-900/30",
    unlocked: true,
  },
  {
    id: 7,
    name: "Translator",
    description: "Translate 50 phrases",
    icon: "/placeholder.svg?height=50&width=50",
    color: "bg-teal-100 dark:bg-teal-900/30",
    unlocked: false,
  },
  {
    id: 8,
    name: "Sign Expert",
    description: "Learn 100 signs",
    icon: "/placeholder.svg?height=50&width=50",
    color: "bg-pink-100 dark:bg-pink-900/30",
    unlocked: false,
  },
]
