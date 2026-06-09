import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "center",
}: {
  eyebrow?: string
  title: string
  description?: string
  className?: string
  align?: "center" | "left"
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && <Badge variant="default">{eyebrow}</Badge>}
      <h2 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight text-balance text-foreground sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">{description}</p>
      )}
    </div>
  )
}
