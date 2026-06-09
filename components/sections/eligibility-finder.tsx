"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  MapPin,
  IndianRupee,
  Tags,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SectionHeading } from "@/components/section-heading"
import { cn } from "@/lib/utils"

type StepDef = {
  id: string
  title: string
  subtitle: string
  icon: typeof User
  options: { key: string; label: string }[]
}

const steps: StepDef[] = [
  {
    id: "personal",
    title: "Personal Details",
    subtitle: "Tell us a little about you",
    icon: User,
    options: [
      { key: "18-25", label: "18 – 25 years" },
      { key: "26-40", label: "26 – 40 years" },
      { key: "41-60", label: "41 – 60 years" },
      { key: "60+", label: "60+ years" },
    ],
  },
  {
    id: "location",
    title: "Location",
    subtitle: "Where do you live?",
    icon: MapPin,
    options: [
      { key: "rural", label: "Rural" },
      { key: "urban", label: "Urban" },
      { key: "semi-urban", label: "Semi-urban" },
      { key: "tribal", label: "Tribal area" },
    ],
  },
  {
    id: "income",
    title: "Annual Income",
    subtitle: "Approximate family income",
    icon: IndianRupee,
    options: [
      { key: "below1", label: "Below ₹1 Lakh" },
      { key: "1-3", label: "₹1 – 3 Lakh" },
      { key: "3-8", label: "₹3 – 8 Lakh" },
      { key: "8+", label: "Above ₹8 Lakh" },
    ],
  },
  {
    id: "category",
    title: "Category",
    subtitle: "Social category for reservation",
    icon: Tags,
    options: [
      { key: "general", label: "General" },
      { key: "obc", label: "OBC" },
      { key: "sc", label: "SC" },
      { key: "st", label: "ST" },
    ],
  },
  {
    id: "occupation",
    title: "Occupation",
    subtitle: "What best describes you?",
    icon: Briefcase,
    options: [
      { key: "student", label: "Student" },
      { key: "farmer", label: "Farmer" },
      { key: "business", label: "Entrepreneur / MSME" },
      { key: "jobseeker", label: "Job seeker" },
    ],
  },
]

export function EligibilityFinder() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const isResult = step === steps.length
  const progress = (step / steps.length) * 100

  const current = steps[step]

  function select(key: string) {
    setAnswers((a) => ({ ...a, [current.id]: key }))
  }

  function next() {
    setStep((s) => Math.min(s + 1, steps.length))
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }
  function reset() {
    setStep(0)
    setAnswers({})
  }

  return (
    <section id="checker" className="scroll-mt-24 bg-muted/40 py-16">
      <div className="mx-auto max-w-4xl px-4">
        <SectionHeading
          eyebrow="AI Eligibility Finder"
          title="Check your eligibility in 6 simple steps"
          description="Answer a few questions and our engine instantly matches you with schemes you qualify for."
        />

        <div className="glass overflow-hidden rounded-3xl p-1 shadow-soft">
          <div className="rounded-[1.35rem] bg-card p-6 sm:p-8">
            {/* progress */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-foreground">
                {isResult ? "Results" : `Step ${step + 1} of ${steps.length}`}
              </p>
              <p className="text-sm text-muted-foreground">{Math.round(isResult ? 100 : progress)}% complete</p>
            </div>
            <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${isResult ? 100 : progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <AnimatePresence mode="wait">
              {!isResult ? (
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <current.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">{current.title}</h3>
                      <p className="text-sm text-muted-foreground">{current.subtitle}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {current.options.map((o) => {
                      const active = answers[current.id] === o.key
                      return (
                        <button
                          key={o.key}
                          onClick={() => select(o.key)}
                          className={cn(
                            "flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-medium transition-all",
                            active
                              ? "border-primary bg-primary/5 text-foreground shadow-soft"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                          )}
                        >
                          {o.label}
                          <span
                            className={cn(
                              "grid h-5 w-5 place-items-center rounded-full border transition-colors",
                              active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                            )}
                          >
                            {active && <CheckCircle2 className="h-4 w-4" />}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <Button variant="ghost" onClick={back} disabled={step === 0}>
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={next} disabled={!answers[current.id]}>
                      {step === steps.length - 1 ? "See Results" : "Continue"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="text-center"
                >
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/15 text-success">
                    <Sparkles className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-extrabold text-foreground">
                    Great news — we found 14 matches
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Based on your profile, you likely qualify for income support, skilling and credit-linked
                    schemes. Review your top matches below.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Badge variant="success">3 high matches</Badge>
                    <Badge variant="secondary">8 partial matches</Badge>
                    <Badge variant="accent">2 need documents</Badge>
                  </div>
                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button asChild>
                      <a href="#dashboard">
                        View Scheme Matches
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" onClick={reset}>
                      Start over
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
