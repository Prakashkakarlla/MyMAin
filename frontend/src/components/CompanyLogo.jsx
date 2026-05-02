import { useState } from 'react'

/**
 * Shows company logo from URL.
 * Falls back to styled initials if URL is missing, broken, or slow.
 *
 * @param {string} logoUrl  - Direct image URL (png/jpg/svg/webp)
 * @param {string} company  - Company name (used to derive initials + color)
 * @param {string} size     - 'sm' | 'md' | 'lg'
 */

// Deterministic color from company name — no randomness so it's consistent across renders
function colorFromName(name) {
  const PALETTES = [
    { bg: 'from-brand-500/25 to-orange-600/25', border: 'border-brand-500/30', text: 'text-brand-400' },
    { bg: 'from-violet-500/25 to-purple-600/25', border: 'border-violet-500/30', text: 'text-violet-400' },
    { bg: 'from-blue-500/25 to-cyan-600/25',   border: 'border-blue-500/30',   text: 'text-blue-400'   },
    { bg: 'from-emerald-500/25 to-teal-600/25', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    { bg: 'from-rose-500/25 to-pink-600/25',   border: 'border-rose-500/30',   text: 'text-rose-400'   },
    { bg: 'from-amber-500/25 to-yellow-600/25', border: 'border-amber-500/30', text: 'text-amber-400'  },
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTES[Math.abs(hash) % PALETTES.length]
}

function getInitials(company) {
  return company
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const SIZE = {
  sm: { outer: 'w-11 h-11 rounded-xl', text: 'text-sm' },
  md: { outer: 'w-14 h-14 rounded-2xl', text: 'text-base' },
  lg: { outer: 'w-16 h-16 rounded-2xl', text: 'text-xl'  },
}

export default function CompanyLogo({ logoUrl, company = '', size = 'md' }) {
  const [imgFailed, setImgFailed] = useState(false)
  const palette  = colorFromName(company)
  const initials = getInitials(company)
  const s        = SIZE[size] || SIZE.md
  const showImg  = logoUrl && !imgFailed

  return (
    <div
      className={`
        ${s.outer} flex-shrink-0 overflow-hidden border
        ${showImg
          ? 'bg-white border-gray-200/10'
          : `bg-gradient-to-br ${palette.bg} ${palette.border}`}
        flex items-center justify-center
      `}
    >
      {showImg ? (
        <img
          src={logoUrl}
          alt={`${company} logo`}
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain p-1.5"
        />
      ) : (
        <span className={`font-display font-bold ${s.text} ${palette.text} select-none`}>
          {initials}
        </span>
      )}
    </div>
  )
}
