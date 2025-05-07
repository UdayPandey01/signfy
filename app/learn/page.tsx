import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Filter, Star } from "lucide-react"
import { SignCard } from "@/components/sign-card"
import { CategoryFilter } from "@/components/category-filter"

export default function LearnPage() {
  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Learn Signs</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Explore and learn sign language gestures with translations
          </p>
        </div>

        <div className="flex flex-col w-full md:w-auto gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-100 dark:border-slate-700 w-full md:w-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm font-medium text-primary">42/100</span>
            </div>
            <Progress value={42} className="h-2" />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-100 dark:border-slate-700 flex items-center gap-3 w-full md:w-auto">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-2 rounded-lg">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400">XP Earned</span>
              <p className="font-bold">1,250 points</p>
            </div>
          </div>
        </div>
      </div>

      <CategoryFilter />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {signData.map((sign) => (
          <SignCard key={sign.id} sign={sign} />
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <Button variant="outline" size="lg" className="gap-2">
          <Filter className="h-4 w-4" />
          Load More Signs
        </Button>
      </div>
    </div>
  )
}

const signData = [
  {
    id: 1,
    name: "Hello",
    nameGujarati: "નમસ્તે",
    category: "Greetings",
    imageUrl: "/placeholder.svg?height=200&width=200",
    description: "Wave your open hand side to side near your head",
    difficulty: "Easy",
  },
  {
    id: 2,
    name: "Thank You",
    nameGujarati: "આભાર",
    category: "Greetings",
    imageUrl: "/placeholder.svg?height=200&width=200",
    description: "Touch your chin or lips with your fingertips, then extend your hand forward",
    difficulty: "Easy",
  },
  {
    id: 3,
    name: "Friend",
    nameGujarati: "મિત્ર",
    category: "People",
    imageUrl: "/placeholder.svg?height=200&width=200",
    description: "Link your index fingers together, then rotate them",
    difficulty: "Medium",
  },
  {
    id: 4,
    name: "Water",
    nameGujarati: "પાણી",
    category: "Food & Drink",
    imageUrl: "/placeholder.svg?height=200&width=200",
    description: "Tap your index finger on your chin three times",
    difficulty: "Easy",
  },
  {
    id: 5,
    name: "Help",
    nameGujarati: "મદદ",
    category: "Actions",
    imageUrl: "/placeholder.svg?height=200&width=200",
    description: "Make a fist with one hand and place it on the palm of your other hand, then raise both hands",
    difficulty: "Medium",
  },
  {
    id: 6,
    name: "Family",
    nameGujarati: "પરિવાર",
    category: "People",
    imageUrl: "/placeholder.svg?height=200&width=200",
    description: "Circle your hand around to indicate a group of related people",
    difficulty: "Medium",
  },
  {
    id: 7,
    name: "Happy",
    nameGujarati: "ખુશ",
    category: "Emotions",
    imageUrl: "/placeholder.svg?height=200&width=200",
    description: "Brush your fingers up your chest and end with a smile gesture",
    difficulty: "Easy",
  },
  {
    id: 8,
    name: "School",
    nameGujarati: "શાળા",
    category: "Places",
    imageUrl: "/placeholder.svg?height=200&width=200",
    description: "Clap your hands together twice",
    difficulty: "Easy",
  },
]
