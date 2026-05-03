import { Link } from 'react-router-dom'
import { MapPin, Clock, DollarSign, ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import CompanyLogo from './CompanyLogo'

const TYPE_STYLES = {
  FULL_TIME:   'bg-green-900/40 text-green-400 border-green-800/50',
  PART_TIME:   'bg-blue-900/40 text-blue-400 border-blue-800/50',
  REMOTE:      'bg-purple-900/40 text-purple-400 border-purple-800/50',
  INTERNSHIP:  'bg-yellow-900/40 text-yellow-400 border-yellow-800/50',
  CONTRACT:    'bg-red-900/40 text-red-400 border-red-800/50',
}

function slugify(str) {
  return (str || '').toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function jobSlug(job) {
  const title   = slugify(job.title)
  const company = slugify(job.company)
  const type    = job.type ? job.type.toLowerCase().replace(/_/g, '-') : ''
  return `${title}-${company}-${type}-${job.id}`
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const utc = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z'
  const diff = Date.now() - new Date(utc)
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function JobCard({ job }) {

  return (
    <Link to={`/jobs/${jobSlug(job)}`} className="card block p-5 group">
      <div className="flex items-start gap-4">
        {/* Company logo — shows image or initials fallback */}
        <CompanyLogo logoUrl={job.logoUrl} company={job.company} size="sm" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display font-semibold text-white group-hover:text-brand-400
                           transition-colors line-clamp-1">
              {job.title}
            </h3>
            <ExternalLink size={14} className="text-gray-600 group-hover:text-brand-500
                                               transition-colors flex-shrink-0 mt-0.5" />
          </div>

          <p className="text-gray-400 text-sm mb-3">{job.company}</p>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={clsx('badge border', TYPE_STYLES[job.type] || 'bg-gray-800 text-gray-400')}>
              {job.type?.replace('_', ' ')}
            </span>
            {job.category && (
              <span className="badge bg-gray-800 text-gray-400">{job.category}</span>
            )}
            {job.batch && (
              <span className="badge bg-indigo-900/30 text-indigo-400">Batch {job.batch}</span>
            )}
            {job.experienceLevel && (
              <span className="badge bg-gray-800/50 text-gray-500">{job.experienceLevel}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {job.location?.split(',')[0]}{job.location?.includes(',') ? ' +more' : ''}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1">
                <DollarSign size={11} /> {job.salary}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={11} /> {timeAgo(job.postedAt)}
            </span>
            {job.lastDateToApply && (() => {
              const diff = Math.ceil((new Date(job.lastDateToApply) - Date.now()) / 86400000)
              if (diff >= 0 && diff <= 7) return (
                <span className={`flex items-center gap-1 font-medium ${diff <= 2 ? 'text-red-400' : 'text-orange-400'}`}>
                  ⏰ {diff === 0 ? 'Ends today' : `${diff}d left`}
                </span>
              )
              return null
            })()}
          </div>
        </div>
      </div>
    </Link>
  )
}
