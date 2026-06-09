"use client"

import { motion } from "framer-motion"
import { Search, Check, ShieldCheck, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const features = ["Official Sources", "No Agents", "No Middlemen", "Free Eligibility Check"]

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--secondary), transparent)" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-12 sm:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-5">
                <Sparkles className="h-3.5 w-3.5" />
                AI-powered eligibility discovery
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl"
            >
              Find Government Schemes You <span className="text-primary">Actually Qualify</span> For
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              AI-powered eligibility discovery for Indian citizens. We match you with schemes, explain why you
              qualify, and guide you to apply on official government portals.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-6 flex flex-wrap gap-x-5 gap-y-2"
            >
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-7"
            >
              <div className="glass flex items-center gap-2 rounded-2xl p-2 shadow-soft">
                <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  aria-label="Search schemes"
                  placeholder="Search schemes by benefit, category or keyword"
                  className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <Button className="shrink-0">
                  Search
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" asChild>
                <a href="#checker">
                  Check Eligibility
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#schemes">Explore Schemes</a>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="glass relative overflow-hidden rounded-3xl p-3 shadow-glow">
              <img
                src="/hero-illustration.png"
                alt="Indian student, farmer, and entrepreneur discovering government schemes"
                className="w-full rounded-2xl"
              />
            </div>

            <div className="glass absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-soft sm:-left-6">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-success/15 text-success">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">92% Match</p>
                <p className="text-xs text-muted-foreground">PM Kisan Samman Nidhi</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
