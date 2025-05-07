"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Brain, Volume2, Trophy, Hand } from "lucide-react"
import { motion } from "framer-motion"

export default function Navigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-lg rounded-t-xl border-t border-slate-200 dark:border-slate-800 z-50">
      <div className="container mx-auto">
        <nav className="flex justify-around items-center py-2">
          <NavItem href="/" icon={<Home className="h-6 w-6" />} label="Home" active={pathname === "/"} />
          <NavItem href="/learn" icon={<BookOpen className="h-6 w-6" />} label="Learn" active={pathname === "/learn"} />
          <NavItem href="/quiz" icon={<Brain className="h-6 w-6" />} label="Quiz" active={pathname === "/quiz"} />
          <NavItem
            href="/translate"
            icon={<Volume2 className="h-6 w-6" />}
            label="Translate"
            active={pathname === "/translate"}
          />
          <NavItem
            href="/sign-to-text"
            icon={<Hand className="h-6 w-6" />}
            label="Sign to Text"
            active={pathname === "/sign-to-text"}
          />
          <NavItem
            href="/profile"
            icon={<Trophy className="h-6 w-6" />}
            label="Profile"
            active={pathname === "/profile"}
          />
        </nav>
      </div>
    </div>
  )
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <div className={`${active ? "text-primary" : "text-slate-500 dark:text-slate-400"}`}>
        {icon}
        {active && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </div>
      <span className={`text-xs font-medium mt-1 ${active ? "text-primary" : "text-slate-500 dark:text-slate-400"}`}>
        {label}
      </span>
    </Link>
  )
}
