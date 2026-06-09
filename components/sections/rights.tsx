"use client"

import { motion } from "framer-motion"
import { Scale, Megaphone, Eye, MessageSquareWarning } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"

const rights = [
  {
    icon: Scale,
    title: "Citizen Rights",
    desc: "Every eligible citizen has the right to access welfare benefits without paying any agent or bribe.",
  },
  {
    icon: Megaphone,
    title: "Scheme Awareness",
    desc: "You have the right to clear information about schemes, eligibility and benefits in your language.",
  },
  {
    icon: Eye,
    title: "Application Transparency",
    desc: "Track your application status and know the reason behind any approval or rejection decision.",
  },
  {
    icon: MessageSquareWarning,
    title: "Grievance Mechanisms",
    desc: "File complaints through official grievance portals and get time-bound resolution of your case.",
  },
]

export function Rights() {
  return (
    <section id="about" className="scroll-mt-24 bg-muted/40 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Rights & Benefits"
          title="Know your rights as a citizen"
          description="Welfare is your entitlement, not a favour. Understand the protections that back every application."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rights.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <r.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-foreground">{r.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
