import type { LucideIcon } from "lucide-react"
import {
  GraduationCap,
  Wheat,
  Building2,
  HeartHandshake,
  Briefcase,
  Users,
} from "lucide-react"

export type Category = {
  id: string
  label: string
  icon: LucideIcon
  count: number
  blurb: string
  tone: "primary" | "secondary" | "accent" | "success"
}

export const categories: Category[] = [
  {
    id: "student",
    label: "Student Schemes",
    icon: GraduationCap,
    count: 214,
    blurb: "Scholarships, fee waivers & education loans",
    tone: "primary",
  },
  {
    id: "farmer",
    label: "Farmer Schemes",
    icon: Wheat,
    count: 186,
    blurb: "Income support, crop insurance & subsidies",
    tone: "success",
  },
  {
    id: "msme",
    label: "MSME Schemes",
    icon: Building2,
    count: 142,
    blurb: "Credit guarantees, grants & tax relief",
    tone: "secondary",
  },
  {
    id: "women",
    label: "Women Schemes",
    icon: HeartHandshake,
    count: 173,
    blurb: "Maternity, safety & entrepreneurship support",
    tone: "accent",
  },
  {
    id: "employment",
    label: "Employment Schemes",
    icon: Briefcase,
    count: 158,
    blurb: "Skilling, apprenticeship & self-employment",
    tone: "primary",
  },
  {
    id: "senior",
    label: "Senior Citizen Schemes",
    icon: Users,
    count: 96,
    blurb: "Pensions, healthcare & savings benefits",
    tone: "secondary",
  },
]

export type Scheme = {
  id: string
  name: string
  department: string
  match: number
  benefit: string
  benefitNote: string
  documents: number
  tags: string[]
  verified: boolean
  eligible: string[]
  notEligible: string[]
  actions: string[]
}

export const schemes: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM Kisan Samman Nidhi",
    department: "Ministry of Agriculture & Farmers Welfare",
    match: 92,
    benefit: "₹6,000",
    benefitNote: "Annual income support",
    documents: 5,
    tags: ["Farmer", "Income Support", "Direct Benefit"],
    verified: true,
    eligible: [
      "You are a landholding farmer family",
      "Your name appears in the land records",
      "Aadhaar is linked to your active bank account",
    ],
    notEligible: ["Institutional landholders are excluded", "Income-tax payers in the last year are excluded"],
    actions: ["Link Aadhaar to your bank account", "Verify land record (Khatauni) details"],
  },
  {
    id: "pmegp",
    name: "PMEGP Credit Subsidy",
    department: "Ministry of MSME · KVIC",
    match: 87,
    benefit: "₹25 Lakh",
    benefitNote: "Up to, with 15–35% subsidy",
    documents: 6,
    tags: ["MSME", "Entrepreneur", "Credit"],
    verified: true,
    eligible: ["You are above 18 years of age", "Your project is a new manufacturing/service unit"],
    notEligible: ["Existing units already availing subsidy are excluded"],
    actions: ["Upload project report (DPR)", "Complete EDP training certificate"],
  },
  {
    id: "nsp-scholarship",
    name: "National Means-cum-Merit Scholarship",
    department: "Department of School Education & Literacy",
    match: 78,
    benefit: "₹12,000",
    benefitNote: "Per year for students",
    documents: 4,
    tags: ["Student", "Scholarship", "Merit"],
    verified: true,
    eligible: ["You are enrolled in Class 9–12", "Family income is within the prescribed limit"],
    notEligible: ["Private unaided school students are excluded", "Income above ₹3.5L per annum is excluded"],
    actions: ["Add income certificate", "Upload latest marksheet"],
  },
]

export type DocItem = {
  id: string
  name: string
  purpose: string
  where: string
  validity: string
  mistakes: string
}

export const documents: DocItem[] = [
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    purpose: "Primary identity & DBT linkage for most schemes.",
    where: "UIDAI enrolment centre or uidai.gov.in",
    validity: "Lifetime (keep mobile linked)",
    mistakes: "Name spelling mismatch with bank records.",
  },
  {
    id: "income",
    name: "Income Certificate",
    purpose: "Proves family income for means-tested benefits.",
    where: "Tehsildar / SDM office or state e-district portal",
    validity: "Usually 1 financial year",
    mistakes: "Submitting an expired or last-year certificate.",
  },
  {
    id: "caste",
    name: "Caste Certificate",
    purpose: "Establishes SC/ST/OBC category eligibility.",
    where: "Revenue department / Sub-Divisional Office",
    validity: "Generally permanent",
    mistakes: "Wrong category selection vs. central/state list.",
  },
  {
    id: "domicile",
    name: "Domicile Certificate",
    purpose: "Confirms your state of residence for state schemes.",
    where: "District Magistrate / e-district portal",
    validity: "Permanent (unless residence changes)",
    mistakes: "Address not matching Aadhaar or ration card.",
  },
  {
    id: "farmer-reg",
    name: "Farmer Registration",
    purpose: "Links land records for agriculture benefits.",
    where: "Agriculture dept / PM Kisan / state Krishi portal",
    validity: "Renew when land records change",
    mistakes: "7/12 extract not updated after land transfer.",
  },
  {
    id: "pan",
    name: "PAN Card",
    purpose: "Required for credit-linked & business schemes.",
    where: "NSDL / UTIITSL or incometax.gov.in",
    validity: "Lifetime",
    mistakes: "PAN not seeded with Aadhaar (becomes inactive).",
  },
]

export type Trap = {
  id: string
  title: string
  detail: string
}

export const traps: Trap[] = [
  {
    id: "income",
    title: "Income mismatch",
    detail: "Declared income differs from your certificate — applications get auto-flagged for rejection.",
  },
  {
    id: "category",
    title: "Wrong category selection",
    detail: "Choosing OBC instead of the state-specific list voids your reservation benefit.",
  },
  {
    id: "expired",
    title: "Expired certificate",
    detail: "Income & domicile certificates older than a year are rejected by most portals.",
  },
  {
    id: "incomplete",
    title: "Incomplete documents",
    detail: "Missing a single mandatory upload sends the entire application back to draft.",
  },
]

export type Story = {
  id: string
  name: string
  role: string
  location: string
  quote: string
  scheme: string
  avatar: string
}

export const stories: Story[] = [
  {
    id: "1",
    name: "Aarti Deshmukh",
    role: "BSc Student",
    location: "Nagpur, Maharashtra",
    quote:
      "I had no idea I qualified for a merit scholarship. FinScheme matched me in two minutes and listed exactly which documents I was missing.",
    scheme: "Means-cum-Merit Scholarship",
    avatar: "/indian-woman-student-portrait.png",
  },
  {
    id: "2",
    name: "Ramesh Patil",
    role: "Marginal Farmer",
    location: "Wardha, Maharashtra",
    quote:
      "The eligibility check warned me my land record wasn't linked. I fixed it and finally started receiving PM Kisan installments.",
    scheme: "PM Kisan Samman Nidhi",
    avatar: "/indian-farmer-man-portrait.png",
  },
  {
    id: "3",
    name: "Sneha Kulkarni",
    role: "Small Business Owner",
    location: "Pune, Maharashtra",
    quote:
      "No agents, no middlemen — I applied for a PMEGP loan myself through the official portal after FinScheme explained every step.",
    scheme: "PMEGP Credit Subsidy",
    avatar: "/indian-woman-entrepreneur-portrait.png",
  },
]

export const stats = [
  { value: 1300, suffix: "+", label: "Schemes", sub: "Central & state-wide" },
  { value: 290, suffix: "+", label: "Ministries", sub: "Departments mapped" },
  { value: 36, suffix: "", label: "States & UTs", sub: "Full coverage" },
  { value: 12, suffix: "M+", label: "Citizens Served", sub: "Eligibility checks run" },
]
