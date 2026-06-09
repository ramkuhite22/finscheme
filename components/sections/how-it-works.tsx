"use client"

import { motion } from "framer-motion"
import { ClipboardList, ScanSearch, Sparkles, ExternalLink } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"

const steps = [
  {
    icon: ClipboardList,
    title: "Enter Details",
    desc: "Share basic profile information — age, location, income, category and occupation.",
  },
  {
    icon: ScanSearch,
    title: "Check Eligibility",
    desc: "Our engine evaluates 1,300+ schemes against your profile in real time.",
  },
  {
    icon: Sparkles,
    title: "Get Scheme Matches",
    desc: "Receive ranked matches with benefit estimates and required documents.",
  },
  {
    icon: ExternalLink,
    title: "Apply via Official Portal",
    desc: "We redirect you to the verified government portal to complete your application.",
  },
]

export function HowItWorks() {
  return (
    <section id="learn" className="scroll-mt-24 bg-muted/40 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="How FinScheme Works"
          title="From profile to benefit in four steps"
          description="A transparent, agent-free path that keeps you in control the entire way."
        />
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-border md:block" aria-hidden />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative"
            >
              <div className="relative z-10 mb-4 flex items-center gap-3 md:block">
                <span className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card text-primary shadow-soft">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground md:left-10 md:top-9">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
