"use client"

import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { categories } from "@/lib/data"
import { SectionHeading } from "@/components/section-heading"
import { cn } from "@/lib/utils"

const toneMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  accent: "bg-accent/15 text-accent-foreground",
  success: "bg-success/15 text-success",
}

export function Categories() {
  return (
    <section id="schemes" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16">
      <SectionHeading
        eyebrow="Popular Categories"
        title="Explore schemes by who you are"
        description="Browse curated benefit categories spanning every ministry, department, state and union territory."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => {
          const Icon = c.icon
          return (
            <motion.a
              key={c.id}
              href="#checker"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="flex items-start justify-between">
                <span className={cn("grid h-12 w-12 place-items-center rounded-2xl", toneMap[c.tone])}>
                  <Icon className="h-6 w-6" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-foreground">{c.label}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.blurb}</p>
              <p className="mt-4 text-sm font-semibold text-primary">{c.count} active schemes</p>
            </motion.a>
          )
        })}
      </div>
    </section>
  )
}
