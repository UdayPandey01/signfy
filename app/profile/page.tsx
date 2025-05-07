import type React from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Award, Calendar, ChevronRight, Flame, Star, Trophy, Users } from "lucide-react"
import { BadgeGrid } from "@/components/badge-grid"

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 flex flex-col items-center text-center w-full md:w-auto">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">JS</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 font-bold px-2 py-1 rounded-full text-xs">
                Level 5
              </div>
            </div>

            <h2 className="text-xl font-bold mb-1">Jay Shah</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Sign Language Explorer</p>

            <Button variant="outline" size="sm" className="w-full">
              Edit Profile
            </Button>
          </div>

          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <StatCard icon={<Trophy className="h-5 w-5 text-primary" />} label="Total XP" value="1,250" />
              <StatCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="Day Streak" value="7" />
              <StatCard icon={<Award className="h-5 w-5 text-purple-500" />} label="Badges" value="12" />
              <StatCard icon={<Users className="h-5 w-5 text-blue-500" />} label="Rank" value="#42" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Level Progress</h3>
                <div className="text-sm font-medium text-primary">Level 5</div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>1,250 XP</span>
                  <span>2,000 XP needed for Level 6</span>
                </div>
                <Progress value={62.5} className="h-2" />
              </div>

              <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined April 2023</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span>Top 10% of learners</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Your Badges</h2>
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <BadgeGrid />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Learning Stats</h2>

            <div className="space-y-4">
              <StatBar label="Greetings" value={90} color="bg-green-500" />
              <StatBar label="People" value={75} color="bg-blue-500" />
              <StatBar label="Food & Drink" value={60} color="bg-yellow-500" />
              <StatBar label="Actions" value={45} color="bg-purple-500" />
              <StatBar label="Emotions" value={30} color="bg-red-500" />
              <StatBar label="Places" value={15} color="bg-orange-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">{icon}</div>
        <div>
          <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
          <p className="font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  )
}
