import { useState } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'

/**
 * Collapsible form section.
 */
export function Accordion({ title, defaultOpen = false, badge, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button type="button"
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between p-4 bg-gray-900/50
                         hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white text-sm">{title}</span>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown size={16}
          className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="p-5 border-t border-gray-800 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Edit a List<String> — skills, responsibilities, documents, steps.
 */
export function ListEditor({ label, items = [], onChange, placeholder, hint }) {
  const update = (i, v) => onChange(items.map((it, idx) => idx === i ? v : it))
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add    = () => onChange([...items, ''])

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">
        {label}
        {hint && <span className="text-gray-600 font-normal ml-1">({hint})</span>}
      </label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input className="input flex-1 text-sm"
                   placeholder={placeholder}
                   value={item}
                   onChange={e => update(i, e.target.value)} />
            <button type="button" onClick={() => remove(i)}
                    className="px-3 text-gray-500 hover:text-red-400 transition-colors">
              <X size={15} />
            </button>
          </div>
        ))}
        <button type="button" onClick={add}
                className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1.5
                           transition-colors">
          <Plus size={14} /> Add item
        </button>
      </div>
    </div>
  )
}

/**
 * Edit selection rounds.
 */
const ICONS = ['FileText', 'Code', 'Users', 'MessageCircle', 'PhoneCall', 'Video', 'GraduationCap', 'ClipboardCheck']

export function RoundsEditor({ rounds = [], onChange }) {
  const update = (i, key, v) => onChange(rounds.map((r, idx) =>
    idx === i ? { ...r, [key]: v } : r
  ))
  const remove = (i) => onChange(rounds.filter((_, idx) => idx !== i))
  const add = () => onChange([...rounds, {
    roundNumber: rounds.length + 1, name: '', description: '',
    duration: '', tips: '', icon: 'FileText'
  }])

  return (
    <div className="space-y-3">
      {rounds.map((round, i) => (
        <div key={i} className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-400">Round {round.roundNumber || i + 1}</span>
            <button type="button" onClick={() => remove(i)}
                    className="text-gray-500 hover:text-red-400">
              <X size={14} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input text-sm" placeholder="Round name (e.g. Online Test)"
                   value={round.name || ''}
                   onChange={e => update(i, 'name', e.target.value)} />
            <input className="input text-sm" placeholder="Duration (e.g. 60 minutes)"
                   value={round.duration || ''}
                   onChange={e => update(i, 'duration', e.target.value)} />
          </div>
          <textarea className="input text-sm min-h-[60px]" placeholder="Description"
                    value={round.description || ''}
                    onChange={e => update(i, 'description', e.target.value)} />
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input text-sm" placeholder="Tip (optional)"
                   value={round.tips || ''}
                   onChange={e => update(i, 'tips', e.target.value)} />
            <select className="input text-sm" value={round.icon || 'FileText'}
                    onChange={e => update(i, 'icon', e.target.value)}>
              {ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
            </select>
          </div>
        </div>
      ))}
      <button type="button" onClick={add}
              className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1.5">
        <Plus size={14} /> Add round
      </button>
    </div>
  )
}

/**
 * Edit FAQs.
 */
export function FaqEditor({ faqs = [], onChange }) {
  const update = (i, key, v) => onChange(faqs.map((f, idx) =>
    idx === i ? { ...f, [key]: v } : f
  ))
  const remove = (i) => onChange(faqs.filter((_, idx) => idx !== i))
  const add = () => onChange([...faqs, { question: '', answer: '' }])

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-400">FAQ {i + 1}</span>
            <button type="button" onClick={() => remove(i)}
                    className="text-gray-500 hover:text-red-400">
              <X size={14} />
            </button>
          </div>
          <input className="input text-sm" placeholder="Question"
                 value={faq.question || ''}
                 onChange={e => update(i, 'question', e.target.value)} />
          <textarea className="input text-sm min-h-[60px]" placeholder="Answer"
                    value={faq.answer || ''}
                    onChange={e => update(i, 'answer', e.target.value)} />
        </div>
      ))}
      <button type="button" onClick={add}
              className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1.5">
        <Plus size={14} /> Add FAQ
      </button>
    </div>
  )
}

/**
 * Edit Important Links (label + url pairs).
 */
export function LinksEditor({ links = [], onChange }) {
  const update = (i, key, v) => onChange(links.map((l, idx) =>
    idx === i ? { ...l, [key]: v } : l
  ))
  const remove = (i) => onChange(links.filter((_, idx) => idx !== i))
  const add = () => onChange([...links, { label: '', url: '' }])

  return (
    <div className="space-y-2">
      {links.map((link, i) => (
        <div key={i} className="flex gap-2">
          <input className="input text-sm w-1/3" placeholder="Label"
                 value={link.label || ''}
                 onChange={e => update(i, 'label', e.target.value)} />
          <input className="input text-sm flex-1" placeholder="https://..."
                 value={link.url || ''} type="url"
                 onChange={e => update(i, 'url', e.target.value)} />
          <button type="button" onClick={() => remove(i)}
                  className="px-3 text-gray-500 hover:text-red-400">
            <X size={15} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
              className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1.5">
        <Plus size={14} /> Add link
      </button>
    </div>
  )
}
