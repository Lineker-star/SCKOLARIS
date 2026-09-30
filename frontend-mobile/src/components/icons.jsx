// Portage direct de frontend-web/src/components/icons.jsx : mêmes tracés,
// juste <svg>/<path>/<circle>/<rect> → composants react-native-svg.
// `cssInterop` permet à `className="text-primary"` etc. de s'appliquer
// normalement sur <Svg>, et à stroke="currentColor" de se résoudre via le
// style `color` que NativeWind injecte (pattern officiel NativeWind pour
// react-native-svg).
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import '../nativewindInterop'

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function BookOpenIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M12 6.5c-1.8-1.4-4-2-6.5-2A1.5 1.5 0 0 0 4 6v11a1 1 0 0 0 1.4.9C7 17.2 9.3 17.5 12 19c2.7-1.5 5-1.8 6.6-1.1a1 1 0 0 0 1.4-.9V6a1.5 1.5 0 0 0-1.5-1.5c-2.5 0-4.7.6-6.5 2Z" />
      <Path d="M12 6.5V19" />
    </Svg>
  )
}

export function SearchIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Circle cx="11" cy="11" r="7" />
      <Path d="m21 21-4.35-4.35" />
    </Svg>
  )
}

export function DownloadIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M12 3v12" />
      <Path d="m7 10 5 5 5-5" />
      <Path d="M5 20h14" />
    </Svg>
  )
}

export function MapPinIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <Circle cx="12" cy="9.5" r="2.5" />
    </Svg>
  )
}

export function PhoneIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </Svg>
  )
}

export function MailIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Rect x="3" y="5" width="18" height="14" rx="2" />
      <Path d="m3 7 9 6 9-6" />
    </Svg>
  )
}

export function ClockIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 3" />
    </Svg>
  )
}

export function UserIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </Svg>
  )
}

export function LockIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Rect x="5" y="11" width="14" height="9" rx="2" />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  )
}

export function HourglassIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M6 3h12" />
      <Path d="M6 21h12" />
      <Path d="M7 3c0 4 3 5 5 6-2 1-5 2-5 6h10c0-4-3-5-5-6 2-1 5-2 5-6" />
    </Svg>
  )
}

export function XCircleIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="m9 9 6 6" />
      <Path d="m15 9-6 6" />
    </Svg>
  )
}

export function ArrowRightIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M5 12h14" />
      <Path d="m13 6 6 6-6 6" />
    </Svg>
  )
}

export function SendIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="m22 2-9.5 9.5" />
      <Path d="M22 2 15 22l-3.5-8.5L3 10Z" />
    </Svg>
  )
}

export function BuildingIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M4 21V10l8-6 8 6v11" />
      <Path d="M4 21h16" />
      <Path d="M9 21v-6h6v6" />
    </Svg>
  )
}

export function BadgeCheckIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="m9 12 2 2 4-4" />
      <Path d="M12 3.5 14 5l2.5-.5 1 2.3 2.3 1-.5 2.5 1.5 2-1.5 2 .5 2.5-2.3 1-1 2.3L14 19l-2 1.5L10 19l-2.5.5-1-2.3-2.3-1 .5-2.5L3.2 11l1.5-2-.5-2.5 2.3-1 1-2.3L10 5Z" />
    </Svg>
  )
}

export function UsersIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Circle cx="9" cy="8" r="3.5" />
      <Path d="M2.5 20c1.2-3.3 4-5 6.5-5s5.3 1.7 6.5 5" />
      <Circle cx="17" cy="8.5" r="2.7" />
      <Path d="M15.5 6a2.7 2.7 0 0 1 5 1.4c0 2-1.5 3-2.7 3.5" />
      <Path d="M17.5 15.3c2 .5 3.5 2 4 4.7" />
    </Svg>
  )
}

export function InfoIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 11v6" />
      <Path d="M12 7.5v.01" />
    </Svg>
  )
}

export function MenuIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M4 7h16" />
      <Path d="M4 12h16" />
      <Path d="M4 17h16" />
    </Svg>
  )
}

export function XIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="m6 6 12 12" />
      <Path d="m18 6-12 12" />
    </Svg>
  )
}

export function GridIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Rect x="3" y="3" width="8" height="8" rx="1.5" />
      <Rect x="13" y="3" width="8" height="8" rx="1.5" />
      <Rect x="3" y="13" width="8" height="8" rx="1.5" />
      <Rect x="13" y="13" width="8" height="8" rx="1.5" />
    </Svg>
  )
}

export function BellIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <Path d="M10 19a2 2 0 0 0 4 0" />
    </Svg>
  )
}

export function HelpCircleIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" />
      <Path d="M12 17v.01" />
    </Svg>
  )
}

export function ChevronRightIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="m9 6 6 6-6 6" />
    </Svg>
  )
}

export function ChevronDownIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="m6 9 6 6 6-6" />
    </Svg>
  )
}

export function PencilIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M4 20h4L19.5 8.5a2 2 0 0 0-4-4L4 16v4Z" />
      <Path d="m14 6 4 4" />
    </Svg>
  )
}

export function TrashIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M4 7h16" />
      <Path d="M9 7V4h6v3" />
      <Path d="M6 7l1 13h10l1-13" />
    </Svg>
  )
}

export function PlusIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M12 5v14" />
      <Path d="M5 12h14" />
    </Svg>
  )
}

export function UploadCloudIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M7 18a4.5 4.5 0 0 1-.5-8.97A5.5 5.5 0 0 1 17.3 8.3 4 4 0 0 1 17 16.5" />
      <Path d="M12 20v-8" />
      <Path d="m9 15 3-3 3 3" />
    </Svg>
  )
}

export function CalendarIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Rect x="3" y="5" width="18" height="16" rx="2" />
      <Path d="M8 3v4" />
      <Path d="M16 3v4" />
      <Path d="M3 10h18" />
    </Svg>
  )
}

export function CheckIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="m5 12 5 5 9-9" />
    </Svg>
  )
}

export function AlertTriangleIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M12 4 2.5 20h19L12 4Z" />
      <Path d="M12 10v4" />
      <Path d="M12 17v.01" />
    </Svg>
  )
}

export function ArrowLeftIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M19 12H5" />
      <Path d="m11 6-6 6 6 6" />
    </Svg>
  )
}

export function FolderIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </Svg>
  )
}

export function ShieldCheckIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <Path d="m9 12 2 2 4-4" />
    </Svg>
  )
}

export function ChartBarIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M4 20V10" />
      <Path d="M12 20V4" />
      <Path d="M20 20v-7" />
      <Path d="M3 20h18" />
    </Svg>
  )
}

export function FileIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M7 3h7l4 4v14H7Z" />
      <Path d="M14 3v4h4" />
      <Path d="M9 13h6" />
      <Path d="M9 17h6" />
    </Svg>
  )
}

export function WifiOffIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M2 8.5a17 17 0 0 1 5-3" />
      <Path d="M22 8.5a17 17 0 0 0-8.4-4.3" />
      <Path d="M6.3 13.2a11 11 0 0 1 4-2" />
      <Path d="M17.7 13.2a11 11 0 0 0-2.3-1.5" />
      <Path d="M9.5 16.8a6 6 0 0 1 3.3-1" />
      <Path d="M12 20v.01" />
      <Path d="m2 2 20 20" />
    </Svg>
  )
}

export function EyeIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  )
}

export function EyeOffIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M3 3l18 18" />
      <Path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a15.5 15.5 0 0 1-4.2 4.9" />
      <Path d="M6.3 6.3C3.4 8.1 2 12 2 12s3.5 7 10 7c1.4 0 2.6-.3 3.7-.8" />
      <Path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Svg>
  )
}

export function CameraIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <Circle cx="12" cy="13.5" r="3.5" />
    </Svg>
  )
}

export function GlobeIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M3 12h18" />
      <Path d="M12 3a14 14 0 0 1 0 18" />
      <Path d="M12 3a14 14 0 0 0 0 18" />
    </Svg>
  )
}

export function LogOutIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Path d="m16 17 5-5-5-5" />
      <Path d="M21 12H9" />
    </Svg>
  )
}

export function SunIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Circle cx="12" cy="12" r="4.5" />
      <Path d="M12 2.5v2.5" />
      <Path d="M12 19v2.5" />
      <Path d="M4.6 4.6l1.8 1.8" />
      <Path d="M17.6 17.6l1.8 1.8" />
      <Path d="M2.5 12h2.5" />
      <Path d="M19 12h2.5" />
      <Path d="M4.6 19.4l1.8-1.8" />
      <Path d="M17.6 6.4l1.8-1.8" />
    </Svg>
  )
}

export function MoonIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />
    </Svg>
  )
}

// Absent du set web (la Navbar web n'utilisait pas d'icônes de nav) —
// nécessaire ici pour l'onglet "Accueil" de la barre de navigation mobile.
export function HomeIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M4 11.5 12 4l8 7.5" />
      <Path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </Svg>
  )
}

export function MonitorIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Rect x={2.5} y={4} width={19} height={13} rx={2} />
      <Path d="M8 21h8" />
      <Path d="M12 17v4" />
    </Svg>
  )
}

export function SmartphoneIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Rect x={6} y={2.5} width={12} height={19} rx={2} />
      <Path d="M11 18.5h2" />
    </Svg>
  )
}

export function MessageCircleIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.3 0-2.5-.3-3.6-.8L3 21l1.4-5.1A8.5 8.5 0 1 1 21 12Z" />
    </Svg>
  )
}

export function WhatsAppIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M20.5 11.5a8.5 8.5 0 0 1-12.7 7.4L3.5 20l1.2-4.1A8.5 8.5 0 1 1 20.5 11.5Z" />
      <Path d="M9 8.2c.3-.3.7-.2.9.1l.8 1.3c.2.3.2.6-.1.9l-.6.6c.5 1 1.3 1.8 2.4 2.3l.6-.6c.2-.2.6-.3.9-.1l1.3.8c.3.2.4.6.1.9l-.4.5c-.4.5-1 .7-1.6.5-2.7-.8-4.8-2.9-5.6-5.6-.2-.6 0-1.2.5-1.6Z" />
    </Svg>
  )
}

// Pas de pendant côté web pour l'instant : sert uniquement au choix
// "galerie" du sélecteur de photo mobile (caméra vs galerie), une
// distinction propre aux permissions natives qui n'a pas d'équivalent sur
// un <input type="file"> web (le navigateur gère déjà ce choix lui-même).
export function ImageIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Rect x="3" y="4" width="18" height="16" rx="2" />
      <Circle cx="8.5" cy="9.5" r="1.5" />
      <Path d="m21 15-5-5L5 20" />
    </Svg>
  )
}

export function SparklesIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <Path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z" />
    </Svg>
  )
}

export function ThumbsUpIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Z" />
      <Path d="M7 10l4.5-6.5a1.5 1.5 0 0 1 2.7 1L13 8h5a2 2 0 0 1 2 2.3l-1.3 8A2 2 0 0 1 16.7 20H10a3 3 0 0 1-3-3v-7Z" />
    </Svg>
  )
}

export function ThumbsDownIcon(props) {
  return (
    <Svg {...base} {...props}>
      <Path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3Z" />
      <Path d="M17 14l-4.5 6.5a1.5 1.5 0 0 1-2.7-1L11 16H6a2 2 0 0 1-2-2.3l1.3-8A2 2 0 0 1 7.3 4H14a3 3 0 0 1 3 3v7Z" />
    </Svg>
  )
}
