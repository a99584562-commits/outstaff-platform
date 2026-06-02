// Ultra-light line icons (stroke 1.4), drawn inline to avoid heavy icon fonts.
type P = { className?: string }
const S = ({ children, className }: { children: React.ReactNode } & P) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {children}
  </svg>
)

export const IconOverview = (p: P) => (
  <S {...p}><path d="M4 13h7V4H4zM13 20h7v-9h-7zM13 4v4h7V4zM4 20h7v-4H4z" /></S>
)
export const IconTimesheet = (p: P) => (
  <S {...p}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4M8 13h2M14 13h2M8 17h2M14 17h2" /></S>
)
export const IconCalendar = (p: P) => (
  <S {...p}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /><circle cx="12" cy="15" r="1.6" /></S>
)
export const IconFunnel = (p: P) => (
  <S {...p}><path d="M3 5h18l-7 8v6l-4 2v-8z" /></S>
)
export const IconContract = (p: P) => (
  <S {...p}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 13h6M9 17h6M9 9h2" /></S>
)
export const IconDocs = (p: P) => (
  <S {...p}><path d="M8 3h6l4 4v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v4h4" /><path d="M4 8v11a2 2 0 0 0 2 2h9" /></S>
)
export const IconBilling = (p: P) => (
  <S {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /><circle cx="16" cy="15" r="1" /></S>
)
export const IconMargin = (p: P) => (
  <S {...p}><path d="M4 19V5M4 19h16M8 16l3-4 3 2 5-7" /><path d="M19 9V6h-3" /></S>
)
export const IconArrow = (p: P) => (
  <S {...p}><path d="M5 12h14M13 6l6 6-6 6" /></S>
)
export const IconLock = (p: P) => (
  <S {...p}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15" r="1" /></S>
)
export const IconCheck = (p: P) => (
  <S {...p}><path d="M5 12.5 10 17 19 7" /></S>
)
export const IconSpark = (p: P) => (
  <S {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></S>
)
export const IconBitrix = (p: P) => (
  <S {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12a4 4 0 0 1 8 0M12 8v8" /></S>
)
