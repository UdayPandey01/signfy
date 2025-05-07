import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Star } from "lucide-react"
import { TestimonialCarousel } from "@/components/testimonial-carousel"
import { AnimatedHero } from "@/components/animated-hero"

export default function HomePage() {
  return (
    <div className="relative overflow-hidden pb-16">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="floating-shape absolute top-20 left-10 w-20 h-20 rounded-full bg-purple-200 opacity-60"></div>
        <div className="floating-shape absolute top-40 right-20 w-16 h-16 rounded-full bg-yellow-200 opacity-60"></div>
        <div className="floating-shape absolute bottom-40 left-1/4 w-24 h-24 rounded-full bg-blue-200 opacity-60"></div>
        <div className="floating-shape absolute top-1/3 right-1/3 w-12 h-12 rounded-full bg-green-200 opacity-60"></div>
      </div>

      {/* Hero section */}
      <section className="container mx-auto px-4 pt-12 pb-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>Fun way to learn sign language</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 animate-title">
          Learn Sign Language.
          <br />
          Connect More.
        </h1>

        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mb-10 animate-fade-in-up">
          A fun, interactive way to learn sign language and bridge communication gaps. Perfect for families and friends
          of deaf and mute individuals.
        </p>

        <Link href="/learn">
          <Button size="lg" className="animate-bounce-slow group text-lg px-8 py-6 rounded-2xl">
            Start Learning
            <Star className="ml-2 h-5 w-5 group-hover:rotate-45 transition-transform" />
          </Button>
        </Link>

        <div className="mt-16 relative">
          <AnimatedHero />
          <div className="absolute -bottom-5 -right-5 bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-xl rotate-3 shadow-md animate-bounce-slow">
            Fun & Accessible!
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <FeatureCard
            number="1"
            title="Learn Signs"
            description="Explore our library of sign language gestures with English and Gujarati translations."
            color="bg-green-500"
            delay={0}
          />
          <FeatureCard
            number="2"
            title="Practice with Quizzes"
            description="Test your knowledge with fun interactive quizzes and earn XP points."
            color="bg-blue-500"
            delay={0.1}
          />
          <FeatureCard
            number="3"
            title="Translate Text to Signs"
            description="Convert text to sign language animations and audio in English or Gujarati."
            color="bg-purple-500"
            delay={0.2}
          />
          <FeatureCard
            number="4"
            title="Sign to Text"
            description="Perform sign language gestures and see them converted to text in real-time."
            color="bg-pink-500"
            delay={0.3}
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <TestimonialCarousel />
      </section>

      {/* CTA section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-6 animate-pulse">Ready to start your journey?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who are breaking communication barriers through our fun, gamified learning
            experience.
          </p>
          <Link href="/learn">
            <Button size="lg" variant="default" className="text-lg px-8 py-6 rounded-2xl animate-shimmer">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  number,
  title,
  description,
  color,
  delay,
}: {
  number: string
  title: string
  description: string
  color: string
  delay: number
}) {
  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow transform hover:-translate-y-1 transition-transform duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className={`${color} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-4`}
      >
        {number}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  )
}
