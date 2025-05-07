"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

export function AnimatedHero() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = container.getBoundingClientRect()
      const x = (e.clientX - left) / width - 0.5
      const y = (e.clientY - top) / height - 0.5

      container.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative transition-transform duration-200 ease-out"
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <Image
          src="/placeholder.svg?height=400&width=600"
          alt="People using sign language"
          width={600}
          height={400}
          className="rounded-2xl shadow-lg"
        />
      </motion.div>

      <motion.div
        className="absolute -top-4 -left-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg shadow-lg"
        style={{ transform: "translateZ(20px)" }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}>
          👋
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute top-1/4 -right-4 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg shadow-lg"
        style={{ transform: "translateZ(40px)" }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}>
          🤟
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute -bottom-4 left-1/4 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg shadow-lg"
        style={{ transform: "translateZ(30px)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <motion.div
          animate={{ rotate: [0, -10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, delay: 0.5 }}
        >
          👍
        </motion.div>
      </motion.div>
    </div>
  )
}
