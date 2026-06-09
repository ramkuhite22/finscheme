import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Sora } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FinScheme — Find Government Schemes You Actually Qualify For",
  description:
    "AI-powered eligibility discovery for Indian citizens. Match with government schemes, understand eligibility, required documents, and apply through official portals. No agents, no middlemen.",
  keywords: [
    "government schemes",
    "eligibility checker",
    "India schemes",
    "PM Kisan",
    "scholarships",
    "MSME schemes",
    "subsidy",
  ],
  authors: [{ name: "FinScheme" }],
  openGraph: {
    title: "FinScheme — Find Government Schemes You Actually Qualify For",
    description: "AI-powered eligibility discovery for Indian citizens.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#050a14" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${sora.variable} bg-background`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
