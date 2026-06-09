"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileCheck2, MapPin, CalendarClock, AlertTriangle, FileText } from "lucide-react"
import { documents } from "@/lib/data"
import { SectionHeading } from "@/components/section-heading"
import { cn } from "@/lib/utils"

export function Documents() {
  const [active, setActive] = useState<string | null>(null)
  return (
    <section id="documents" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16">
      <SectionHeading
        eyebrow="Documents"
        title="Know exactly what you need — before you apply"
        description="Tap any document to see its purpose, where to get it, validity, and the mistakes that cause rejection."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((d, i) => {
          const open = active === d.id
          return (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => setActive(open ? null : d.id)}
              aria-expanded={open}
              className={cn(
                "flex flex-col rounded-3xl border bg-card p-6 text-left shadow-soft transition-all hover:-translate-y-1",
                open ? "border-primary shadow-glow" : "border-border",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/15 text-secondary">
                  <FileText className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-primary">{open ? "Hide" : "Details"}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">{d.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.purpose}</p>

              <motion.div
                initial={false}
                animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <Row icon={MapPin} label="Where to obtain" value={d.where} />
                  <Row icon={CalendarClock} label="Validity" value={d.validity} />
                  <Row icon={AlertTriangle} label="Common mistake" value={d.mistakes} tone="warn" />
                </div>
              </motion.div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

function Row({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof FileCheck2
  label: string
  value: string
  tone?: "warn"
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone === "warn" ? "text-accent-foreground" : "text-primary")} />
      <div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{value}</p>
      </div>
    </div>
  )
}
