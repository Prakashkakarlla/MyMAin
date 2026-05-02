import {
  FileText, Code, Users, MessageCircle, Briefcase, ClipboardCheck,
  PhoneCall, Video, GraduationCap, CircleHelp
} from 'lucide-react'

/**
 * Visual timeline for selection rounds.
 * Maps round.icon (string from admin) to lucide-react icon component.
 */

const ICON_MAP = {
  FileText, Code, Users, MessageCircle, Briefcase,
  ClipboardCheck, PhoneCall, Video, GraduationCap
}

function iconFor(name) {
  return ICON_MAP[name] || ClipboardCheck
}

export default function SelectionTimeline({ rounds }) {
  if (!rounds || rounds.length === 0) return null

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b
                      from-brand-500/40 via-gray-700 to-transparent" />

      <div className="space-y-6">
        {rounds.map((round, idx) => {
          const Icon = iconFor(round.icon)
          return (
            <div key={idx} className="relative flex items-start gap-4">
              {/* Timeline dot with icon */}
              <div className="relative z-10 w-10 h-10 rounded-full bg-gray-900 border-2
                              border-brand-500/40 flex items-center justify-center flex-shrink-0
                              shadow-lg shadow-brand-500/10">
                <Icon size={16} className="text-brand-400" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1.5 pb-1">
                <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
                  <span className="text-xs font-medium text-brand-400 uppercase tracking-wider">
                    Round {round.roundNumber || idx + 1}
                  </span>
                  {round.duration && (
                    <span className="text-xs text-gray-500">• {round.duration}</span>
                  )}
                </div>
                <h3 className="font-display font-semibold text-white mb-1.5">
                  {round.name}
                </h3>
                {round.description && (
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {round.description}
                  </p>
                )}
                {round.tips && (
                  <div className="mt-2.5 p-3 bg-brand-500/5 border border-brand-500/15
                                  rounded-lg text-sm text-brand-200/80">
                    <span className="font-medium text-brand-400">💡 Tip:</span> {round.tips}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
