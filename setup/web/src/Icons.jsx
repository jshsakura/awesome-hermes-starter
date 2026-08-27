// Straight lines only. No arcs, no circles, no rounded joins — every mark here
// is built from segments and right angles so it sits with the square panels and
// hairline rules rather than fighting them.
//
// currentColor throughout, so a step turns cream when active and green when
// done without any per-icon styling.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  viewBox: '0 0 32 32',
}

export function KeyIcon(props) {
  // Bit and ward, drawn as a bar with teeth.
  return (
    <svg {...base} {...props}>
      <path d="M6 11h10v10H6z" />
      <path d="M16 16h10" />
      <path d="M22 16v4" />
      <path d="M26 16v3" />
      <path d="M9.5 14.5h3v3h-3z" />
    </svg>
  )
}

export function ModelIcon(props) {
  // One chosen node above two fallbacks, wired.
  return (
    <svg {...base} {...props}>
      <path d="M12 5h8v6h-8z" />
      <path d="M5 21h7v6H5z" />
      <path d="M20 21h7v6h-7z" />
      <path d="M16 11v5M8.5 16v5M23.5 16v5M8.5 16h15" />
    </svg>
  )
}

export function TelegramIcon(props) {
  // A paper dart as three straight folds.
  return (
    <svg {...base} {...props}>
      <path d="M4 15 28 5l-5 22-8-7z" />
      <path d="M15 20 28 5" />
      <path d="M15 20v6l-4-4" />
    </svg>
  )
}

export function ToolsIcon(props) {
  // Modules snapping onto a bus.
  return (
    <svg {...base} {...props}>
      <path d="M5 6h9v9H5z" />
      <path d="M18 6h9v9h-9z" />
      <path d="M11.5 21h9v6h-9z" />
      <path d="M9.5 15v3h13v-3M16 18v3" />
    </svg>
  )
}

export function DoneIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5h22v22H5z" />
      <path d="M11 16.5 14.5 20 21.5 12" />
    </svg>
  )
}

export function LockIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7 14h18v12H7z" />
      <path d="M11 14V9h10v5" />
      <path d="M16 18v4" />
    </svg>
  )
}

// The mark: Winged Sprout (초보자의 새싹 + 헤르메스의 황금 날개).
// A fresh beginner sprout seamlessly combined with swift Hermes wings taking flight.
export function Mark(props) {
  return (
    <svg {...base} {...props} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 27V11" />
      {/* Sprout leaves */}
      <path d="M16 12C13 7.5 9.5 8 8.5 10.5C8 12.5 11.5 13.8 16 14.5" />
      <path d="M16 10.5C18.5 6 22 6.5 23 9C23.5 11 20 12.5 16 13" />
      {/* Hermes upper wings */}
      <path d="M16 18.5C11 18.5 6.5 15 3.5 9.5C7.5 8.5 12 12 16 16" />
      <path d="M16 18.5C21 18.5 25.5 15 28.5 9.5C24.5 8.5 20 12 16 16" />
      {/* Hermes lower wings */}
      <path d="M16 22C12.5 22 8 19.5 6 16C8.5 15.5 12 17.5 16 20" />
      <path d="M16 22C19.5 22 24 19.5 26 16C23.5 15.5 20 17.5 16 20" />
    </svg>
  )
}


export function ChatIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 6h22v16H13l-6 5v-5H5z" />
      <path d="M10 12h12M10 16h8" />
    </svg>
  )
}

export function GearIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M13 4h6v3.2l3 1.7 2.8-1.6 3 5.2-2.8 1.6v3.4l2.8 1.6-3 5.2-2.8-1.6-3 1.7V28h-6v-3.2l-3-1.7-2.8 1.6-3-5.2 2.8-1.6v-3.4L4.2 12.5l3-5.2L10 8.9l3-1.7z" />
      <path d="M12.5 12.5h7v7h-7z" />
    </svg>
  )
}

export function RefreshIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 16a10 10 0 0 1 17-7" />
      <path d="M23 4v5h-5" />
      <path d="M26 16a10 10 0 0 1-17 7" />
      <path d="M9 28v-5h5" />
    </svg>
  )
}

export function SendIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 16 28 6l-4 20-8-7z" />
      <path d="M16 19 28 6" />
    </svg>
  )
}

export function NewIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 5h14l6 6v16H6z" />
      <path d="M20 5v6h6" />
      <path d="M16 15v8M12 19h8" />
    </svg>
  )
}

export function ExternalIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M17 6h9v9" />
      <path d="M26 6 14 18" />
      <path d="M22 19v7H6V10h7" />
    </svg>
  )
}

export const STEP_ICONS = {
  key: KeyIcon,
  model: ModelIcon,
  telegram: TelegramIcon,
  mcp: ToolsIcon,
  done: DoneIcon,
}

// Flags as inline SVG rather than emoji: emoji flags do not render at all on
// Windows, which is a large share of anyone opening a NAS admin page. Squared
// off to match everything else.
export function FlagKR(props) {
  return (
    <svg viewBox="0 0 24 16" {...props}>
      <rect x="0.5" y="0.5" width="23" height="15" fill="#fff" stroke="currentColor" strokeWidth="1" />
      <path d="M12 8a2.4 2.4 0 0 1 4.8 0 2.4 2.4 0 0 1-4.8 0Z" fill="#cd2e3a" />
      <path d="M7.2 8a2.4 2.4 0 0 1 4.8 0 2.4 2.4 0 0 1-4.8 0Z" fill="#0047a0" />
      <g stroke="#111" strokeWidth="0.7">
        <path d="M3.4 4.2l1.5 2.2M4.6 3.4l1.5 2.2" />
        <path d="M19.4 11.6l-1.5-2.2M18.2 12.4l-1.5-2.2" />
      </g>
    </svg>
  )
}

export function FlagUS(props) {
  return (
    <svg viewBox="0 0 24 16" {...props}>
      <rect width="24" height="16" fill="#fff" />
      <g fill="#b22234">
        <rect y="0" width="24" height="1.85" />
        <rect y="3.7" width="24" height="1.85" />
        <rect y="7.4" width="24" height="1.85" />
        <rect y="11.1" width="24" height="1.85" />
        <rect y="14.15" width="24" height="1.85" />
      </g>
      <rect width="10" height="8.6" fill="#3c3b6e" />
      <rect x="0.5" y="0.5" width="23" height="15" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
