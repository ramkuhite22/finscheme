"use client"

import { motion } from "framer-motion"
import { AlertTriangle, ShieldAlert } from "lucide-react"
import { traps } from "@/lib/data"
import { SectionHeading } from "@/components/section-heading"

export function RejectionAlerts() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionHeading
        eyebrow="Rejection Trap Alerts"
        title="Avoid the mistakes that get applications rejected"
        description="Most rejections are preventable. We flag these traps before you submit."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {traps.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="relative overflow-hidden rounded-3xl border border-accent/30 bg-accent/5 p-6"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/20 text-accent-foreground">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-base font-bold text-foreground">{t.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.detail}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 flex items-start gap-3 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">FinScheme pre-checks every application</span> against
          these common traps and tells you precisely what to fix — so you apply once, correctly.
        </p>
      </div>
    </section>
  )
}
