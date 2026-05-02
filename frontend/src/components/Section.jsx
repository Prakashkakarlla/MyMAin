/**
 * Section wrapper for the job detail page.
 * Auto-hides if no children/empty data — keeps layout clean.
 */
export default function Section({ icon: Icon, title, children, hidden, className = '' }) {
  if (hidden) return null
  return (
    <div className={`card p-6 sm:p-7 mb-5 ${className}`}>
      <h2 className="font-display font-semibold text-lg text-white mb-5 flex items-center gap-2.5">
        {Icon && <Icon size={18} className="text-brand-500" />}
        {title}
      </h2>
      {children}
    </div>
  )
}
