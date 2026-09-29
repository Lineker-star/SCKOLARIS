import logo from '../assets/logo.png'

export default function Logo({ size = 32, className = '' }) {
  return (
    <img
      src={logo}
      alt="SCKOLARIS — Universite Library"
      width={size}
      height={size}
      className={`rounded object-cover shrink-0 ${className}`}
    />
  )
}
