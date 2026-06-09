import { cn } from "@/lib/utils"

/**
 * FinScheme logo — a minimal mark combining a lotus, a compass needle,
 * and a document fold. Communicates "find the right government benefit."
 */
export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <LogoMark className="h-5 w-5" />
      </span>
      {withWordmark && (
        <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
          Fin<span className="text-primary">Scheme</span>
        </span>
      )}
    </span>
  )
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* document fold */}
      <path
        d="M6 3.5h7.5L18 8v9.5a1.5 1.5 0 0 1-1.5 1.5h-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      {/* compass / lotus petals radiating from center */}
      <path
        d="M12 12 12 6.2M12 12l4.1 4.1M12 12 7.9 16.1M12 12l-3.4-1.4M12 12l3.4-1.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* compass needle (north) */}
      <path d="M12 5.4 13.4 8.4 12 7.6 10.6 8.4 12 5.4Z" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}
