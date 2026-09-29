const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-14 w-14 text-lg',
  lg: 'h-24 w-24 text-3xl',
}

export default function Avatar({ user, size = 'sm', className = '' }) {
  const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase()

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={`${user.first_name} ${user.last_name}`}
        loading="lazy"
        decoding="async"
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }

  return (
    <span
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-surface-container-high font-semibold text-on-surface-variant shrink-0 ${className}`}
    >
      {initials || '?'}
    </span>
  )
}
