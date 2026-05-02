import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FaqList({ faqs }) {
  const [openIdx, setOpenIdx] = useState(null)
  if (!faqs || faqs.length === 0) return null

  return (
    <div className="divide-y divide-gray-800">
      {faqs.map((faq, idx) => {
        const isOpen = openIdx === idx
        return (
          <div key={idx} className="py-3 first:pt-0 last:pb-0">
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full flex items-start justify-between gap-4 text-left group"
            >
              <span className="font-medium text-white text-sm leading-relaxed
                               group-hover:text-brand-400 transition-colors">
                {faq.question}
              </span>
              <ChevronDown
                size={18}
                className={`text-gray-500 flex-shrink-0 mt-0.5 transition-transform duration-200
                           ${isOpen ? 'rotate-180 text-brand-500' : ''}`}
              />
            </button>
            <div className={`grid transition-all duration-300 ease-out
                             ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
