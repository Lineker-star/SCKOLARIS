export default function InfoCallout({ icon, children }) {
  return (
    <div className="flex gap-3 rounded-md bg-surface-container-high border border-outline-variant p-4 text-sm text-on-surface-variant text-left">
      <span className="text-primary shrink-0 mt-0.5">{icon}</span>
      <p>{children}</p>
    </div>
  )
}
