import { cn } from '@/lib/utils'
import type { SVGProps } from 'react'

export type IconName =
  | 'dashboard'
  | 'box'
  | 'chef'
  | 'factory'
  | 'tag'
  | 'receipt'
  | 'wallet'
  | 'shield'
  | 'gear'
  | 'plus'
  | 'search'
  | 'bell'
  | 'check'
  | 'x'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-right'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'dots'
  | 'trash'
  | 'edit'
  | 'eye'
  | 'filter'
  | 'sort'
  | 'calendar'
  | 'clock'
  | 'user'
  | 'users'
  | 'logout'
  | 'menu'
  | 'sparkles'
  | 'trending-up'
  | 'trending-down'
  | 'cart'
  | 'package'
  | 'flame'
  | 'leaf'
  | 'star'
  | 'info'
  | 'alert'
  | 'help'
  | 'copy'

type Props = SVGProps<SVGSVGElement> & {
  name: IconName
  size?: number
  strokeWidth?: number
}

export function Icon({ name, size = 18, strokeWidth = 1.75, className, ...rest }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}

const paths: Record<IconName, JSX.Element> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  box: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3.3 7.7 12 13l8.7-5.3" />
      <path d="M12 22V13" />
    </>
  ),
  chef: (
    <>
      <path d="M6 13v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6" />
      <path d="M6 13h12" />
      <path d="M8 13V8a4 4 0 1 1 8 0v5" />
      <path d="M9 10h6" />
    </>
  ),
  factory: (
    <>
      <path d="M3 21V11l5 3V11l5 3V11l5 3v7H3Z" />
      <path d="M7 17h2" />
      <path d="M11 17h2" />
      <path d="M15 17h2" />
    </>
  ),
  tag: (
    <>
      <path d="M20.6 12.5 12.5 20.6a1 1 0 0 1-1.4 0L3 12.5V3h9.5l8.1 8.1a1 1 0 0 1 0 1.4Z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v3H5a2 2 0 0 0 0 4h15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <circle cx="17" cy="12" r="1" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 6v6c0 4.5 3.4 8.4 8 9 4.6-.6 8-4.5 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  x: (
    <>
      <path d="m6 6 12 12" />
      <path d="m6 18 12-12" />
    </>
  ),
  'arrow-up': (
    <>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </>
  ),
  'arrow-down': (
    <>
      <path d="M12 5v14" />
      <path d="m5 12 7 7 7-7" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  'chevron-left': <path d="m15 6-6 6 6 6" />,
  dots: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M5 7 6 20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-13" />
      <path d="M9 7V4h6v3" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l11-11-4-4L4 16v4Z" />
      <path d="m14 6 4 4" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  filter: <path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" />,
  sort: (
    <>
      <path d="M7 4v16" />
      <path d="m3 8 4-4 4 4" />
      <path d="M17 20V4" />
      <path d="m13 16 4 4 4-4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 11a3 3 0 1 0 0-6" />
      <path d="M22 20a5 5 0 0 0-4-4.9" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M5 12H2" />
      <path d="M22 12h-3" />
      <path d="m6.3 6.3 2.1 2.1" />
      <path d="m15.6 15.6 2.1 2.1" />
      <path d="m17.7 6.3-2.1 2.1" />
      <path d="m8.4 15.6-2.1 2.1" />
    </>
  ),
  'trending-up': (
    <>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </>
  ),
  'trending-down': (
    <>
      <path d="m3 7 6 6 4-4 8 8" />
      <path d="M14 17h7v-7" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2.7 12.4a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L21 8H6" />
      <circle cx="10" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
    </>
  ),
  package: (
    <>
      <path d="M3 7.5 12 3l9 4.5v9L12 21 3 16.5v-9Z" />
      <path d="M3 7.5 12 12l9-4.5" />
      <path d="M12 12v9" />
    </>
  ),
  flame: (
    <>
      <path d="M12 3s4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 1-3s-2 1-2 5a6 6 0 1 0 12 0c0-5-7-10-7-10Z" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 21c8 0 14-6 14-14V3h-4C7 3 3 9 3 17c0 2 0 4 2 4Z" />
      <path d="M5 21c0-7 5-12 12-12" />
    </>
  ),
  star: (
    <path d="m12 3 2.7 5.5 6 .9-4.4 4.3 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.3 9.4l6-.9L12 3Z" />
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2 21h20L12 3Z" />
      <path d="M12 10v4" />
      <path d="M12 18h.01" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 1-1 1.7" />
      <path d="M12 17h.01" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </>
  ),
}
