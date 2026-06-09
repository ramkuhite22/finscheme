"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ListChecks,
  Building2,
  BadgeCheck,
  ChevronDown,
} from "lucide-react"
import { schemes, type Scheme } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SectionHeading } from "@/components/section-heading"
import { CircularProgress } from "@/components/circular-progress"
import { cn } from "@/lib/utils"

function ExplanationPanel({ scheme }: { scheme: Scheme }) {
  return (
    <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
      <div>
        <h5 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <CheckCircle2 className="h-4 w-4 text-success" />
          Why you&apos;re eligible
        </h5>
        <ul className="space-y-2">
          {scheme.eligible.map((e) => (
            <li key={e} className="flex gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              {e}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <XCircle className="h-4 w-4 text-destructive" />
          Common disqualifiers
        </h5>
        <ul className="space-y-2">
          {scheme.notEligible.map((e) => (
            <li key={e} className="flex gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
              {e}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <ListChecks className="h-4 w-4 text-accent-foreground" />
          Required actions
        </h5>
        <ul className="space-y-2">
          {scheme.actions.map((e) => (
            <li key={e} className="flex gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {e}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <Building2 className="h-4 w-4 text-primary" />
          Government department
        </h5>
        <p className="text-sm text-muted-foreground">{scheme.department}</p>
        {scheme.verified && (
          <Badge variant="success" className="mt-3">
            <BadgeCheck className="h-3.5 w-3.5" />
            Official source verified
          </Badge>
        )}
      </div>
    </div>
  )
}

function SchemeCard({ scheme, index }: { scheme: Scheme; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-3xl border border-border bg-card p-6 shadow-soft"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {scheme.tags.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">{scheme.name}</h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{scheme.department}</p>
        </div>
        <CircularProgress value={scheme.match} label="match" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="text-xs text-muted-foreground">Estimated benefit</p>
          <p className="font-display text-xl font-extrabold text-primary">{scheme.benefit}</p>
          <p className="text-xs text-muted-foreground">{scheme.benefitNote}</p>
        </div>
        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="text-xs text-muted-foreground">Documents</p>
          <p className="flex items-center gap-1.5 font-display text-xl font-extrabold text-foreground">
            <FileText className="h-4 w-4 text-secondary" />
            {scheme.documents}
          </p>
          <p className="text-xs text-muted-foreground">Required to apply</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button className="flex-1">
          Apply Now
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          Why?
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-5">
              <ExplanationPanel scheme={scheme} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

export function SchemeDashboard() {
  return (
    <section id="dashboard" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16">
      <SectionHeading
        eyebrow="Scheme Match Dashboard"
        title="Your personalised scheme recommendations"
        description="Each card shows your match score, estimated benefit, and a transparent breakdown of why you qualify."
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {schemes.map((s, i) => (
          <SchemeCard key={s.id} scheme={s} index={i} />
        ))}
      </div>
    </section>
  )
}
