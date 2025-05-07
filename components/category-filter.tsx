"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const categories = ["All", "Greetings", "People", "Food & Drink", "Actions", "Emotions", "Places", "Time", "Questions"]

export function CategoryFilter() {
  const [activeCategory, setActiveCategory] = useState("All")

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search for signs..."
          className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  )
}
