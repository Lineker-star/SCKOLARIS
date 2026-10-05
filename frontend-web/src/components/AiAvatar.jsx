export default function AiAvatar({ size = 36, online = false, inverse = false, className = '' }) {
  const icon = Math.round(size * 0.58)
  const tone = inverse ? 'bg-on-primary text-primary' : 'bg-primary text-on-primary'
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full shadow-sm ${tone} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2.5v2.2" />
        <circle cx="12" cy="2.5" r="0.9" fill="currentColor" stroke="none" />
        <rect x="4.5" y="6.5" width="15" height="12" rx="4" />
        <circle cx="9.2" cy="12" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="14.8" cy="12" r="1.3" fill="currentColor" stroke="none" />
        <path d="M9.6 15.6c.7.5 1.5.8 2.4.8s1.7-.3 2.4-.8" />
        <path d="M2.5 11.5v2.5M21.5 11.5v2.5" />
      </svg>
      {online && (
        <span
          className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-surface-container-lowest bg-success"
          aria-hidden="true"
        />
      )}
    </span>
  )
}
