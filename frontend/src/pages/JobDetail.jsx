import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Clock, DollarSign, Briefcase, ExternalLink, Share2,
  GraduationCap, AlertCircle, Building2, ListChecks, Sparkles, FileText,
  CheckCircle2, ListOrdered, Link2, CircleHelp
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import CompanyLogo from '../components/CompanyLogo'
import Section from '../components/Section'
import SelectionTimeline from '../components/SelectionTimeline'
import FaqList from '../components/FaqList'
import api from '../api/client'

const TYPE_STYLES = {
  FULL_TIME:      'bg-green-900/40 text-green-400 border-green-800/50',
  PART_TIME:      'bg-blue-900/40 text-blue-400 border-blue-800/50',
  REMOTE:         'bg-purple-900/40 text-purple-400 border-purple-800/50',
  INTERNSHIP:     'bg-yellow-900/40 text-yellow-400 border-yellow-800/50',
  CONTRACT:       'bg-red-900/40 text-red-400 border-red-800/50',
  WORK_FROM_HOME: 'bg-teal-900/40 text-teal-400 border-teal-800/50',
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const utc = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z'
  const diff = Date.now() - new Date(utc)
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Posted today'
  if (days === 1) return 'Posted yesterday'
  if (days < 7)  return `Posted ${days} days ago`
  return `Posted ${Math.floor(days / 7)} weeks ago`
}

function deadlineStatus(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - Date.now()
  const days = Math.ceil(diff / 86400000)
  if (days < 0)   return { label: 'Deadline passed', cls: 'text-red-400' }
  if (days === 0) return { label: 'Deadline: Today!', cls: 'text-orange-400' }
  if (days <= 3)  return { label: `${days} day${days > 1 ? 's' : ''} left`, cls: 'text-orange-400' }
  return { label: `${days} days left`, cls: 'text-green-400' }
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <tr className="border-b border-gray-800/50 last:border-0">
      <td className="py-3 pr-4 text-gray-500 text-sm font-medium whitespace-nowrap w-40">{label}</td>
      <td className="py-3 text-gray-200 text-sm">{value}</td>
    </tr>
  )
}

export default function JobDetail() {
  const { slug } = useParams()
  const id = slug?.match(/(\d+)$/)?.[1]
  const navigate = useNavigate()
  const [job, setJob]         = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { toast.error('Job not found'); navigate('/'); return }
    api.get(`/jobs/${id}`)
      .then(r => setJob(r.data.data))
      .catch(() => { toast.error('Job not found'); navigate('/') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  function share() {
    if (navigator.share) navigator.share({ title: job.title, url: window.location.href })
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-2/3" />
        <div className="h-4 bg-gray-800 rounded w-1/3" />
        <div className="h-64 bg-gray-800 rounded" />
      </div>
    </div>
  )
  if (!job) return null

  const deadline  = deadlineStatus(job.lastDateToApply)
  const locations = job.location ? job.location.split(',').map(l => l.trim()) : []

  // Helpers — only render section if it has content
  const has = (arr) => Array.isArray(arr) && arr.length > 0

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200
                                 transition-colors text-sm mb-6">
          <ArrowLeft size={15} /> Back to jobs
        </Link>

        {/* ── Deadline strip ────────────────────────────────────── */}
        {deadline && (
          <div className={`flex items-center gap-2 mb-4 text-sm font-medium ${deadline.cls}`}>
            <AlertCircle size={15} />
            Last date to apply: {new Date(job.lastDateToApply).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric'
            })} — {deadline.label}
          </div>
        )}

        {/* ── Header card ───────────────────────────────────────── */}
        <div className="card p-7 sm:p-8 mb-5">
          <div className="flex items-start gap-5 mb-6">
            <CompanyLogo logoUrl={job.logoUrl} company={job.company} size="lg" />
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1 leading-tight">
                {job.title}
              </h1>
              <p className="text-gray-400 text-lg">{job.company}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            <span className={`badge border text-sm py-1 px-3 ${TYPE_STYLES[job.type]}`}>
              {job.type?.replace('_', ' ')}
            </span>
            {job.category && <span className="badge bg-gray-800 text-gray-300 text-sm py-1 px-3">{job.category}</span>}
            {job.batch && <span className="badge bg-indigo-900/40 text-indigo-300 border border-indigo-800/50 text-sm py-1 px-3">Batch {job.batch}</span>}
            {job.experienceLevel && <span className="badge bg-gray-800 text-gray-300 text-sm py-1 px-3">{job.experienceLevel}</span>}
          </div>

          {locations.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {locations.map(loc => (
                <span key={loc} className="flex items-center gap-1.5 bg-gray-800/60 text-gray-300
                                           rounded-lg px-3 py-1.5 text-sm">
                  <MapPin size={12} className="text-brand-500" /> {loc}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-7 text-sm text-gray-400">
            {job.salary && <span className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-brand-500" /> {job.salary}
            </span>}
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-brand-500" /> {timeAgo(job.postedAt)}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {job.applyUrl ? (
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
                 className="btn-primary flex items-center gap-2">
                Apply Now <ExternalLink size={14} />
              </a>
            ) : (
              <span className="btn-primary opacity-60 cursor-not-allowed">See application details below</span>
            )}
            <button onClick={share} className="btn-outline flex items-center gap-2">
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>

        {/* ── About Company ─────────────────────────────────────── */}
        <Section icon={Building2} title={`About ${job.company}`} hidden={!job.aboutCompany}>
          <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
            {job.aboutCompany}
          </p>
        </Section>

        {/* ── Job Description ───────────────────────────────────── */}
        <Section icon={Briefcase} title="Job Description">
          <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
            {job.description}
          </p>
        </Section>

        {/* ── Eligibility table ─────────────────────────────────── */}
        <Section icon={GraduationCap} title="Eligibility & Job Details">
          <table className="w-full">
            <tbody>
              <InfoRow label="Job Role"      value={job.title} />
              <InfoRow label="Qualification" value={job.qualification} />
              <InfoRow label="Batch"         value={job.batch} />
              <InfoRow label="Branch"        value={job.branch} />
              <InfoRow label="Experience"    value={job.experienceLevel || 'Not Required'} />
              <InfoRow label="Salary"        value={job.salary} />
              <InfoRow label="Percentage"    value={job.minPercentage ? `${job.minPercentage}% and above` : null} />
              <InfoRow label="Age Limit"     value={job.ageLimit} />
              <InfoRow label="Bond"          value={job.bond} />
              <InfoRow label="Exam Date"     value={job.examDate} />
              <InfoRow label="Last Date"     value={job.lastDateToApply
                ? new Date(job.lastDateToApply).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : null} />
            </tbody>
          </table>
        </Section>

        {/* ── Required Skills ───────────────────────────────────── */}
        <Section icon={Sparkles} title="Required Skills" hidden={!has(job.requiredSkills)}>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills?.map(skill => (
              <span key={skill}
                    className="px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20
                               text-brand-300 text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </Section>

        {/* ── Roles & Responsibilities ──────────────────────────── */}
        <Section icon={ListChecks} title="Roles & Responsibilities" hidden={!has(job.responsibilities)}>
          <ul className="space-y-2.5">
            {job.responsibilities?.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                <CheckCircle2 size={16} className="text-brand-500 flex-shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── Selection Timeline ────────────────────────────────── */}
        <Section icon={ListOrdered} title="Selection Process" hidden={!has(job.selectionRounds)}>
          <SelectionTimeline rounds={job.selectionRounds} />
        </Section>

        {/* ── Documents Required ────────────────────────────────── */}
        <Section icon={FileText} title="Documents Required" hidden={!has(job.documentsRequired)}>
          <ul className="grid sm:grid-cols-2 gap-2">
            {job.documentsRequired?.map((d, i) => (
              <li key={i} className="flex items-center gap-2.5 text-gray-300 text-sm
                                     bg-gray-800/40 px-3 py-2 rounded-lg">
                <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        </Section>

        {/* ── How to Apply ──────────────────────────────────────── */}
        <Section icon={ListOrdered} title="How to Apply" hidden={!has(job.howToApply)}>
          <ol className="space-y-3">
            {job.howToApply?.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20
                                 border border-brand-500/30 text-brand-400 text-xs font-bold
                                 flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── Important Links ───────────────────────────────────── */}
        <Section icon={Link2} title="Important Links" hidden={!has(job.importantLinks)}>
          <div className="grid sm:grid-cols-2 gap-2">
            {job.importantLinks?.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center justify-between gap-2 p-3 bg-gray-800/40
                            hover:bg-gray-800 border border-gray-700/50 hover:border-brand-500/40
                            rounded-lg text-sm text-gray-300 hover:text-brand-400 transition-all group">
                <span className="font-medium">{link.label}</span>
                <ExternalLink size={14} className="text-gray-500 group-hover:text-brand-500 transition-colors" />
              </a>
            ))}
          </div>
        </Section>

        {/* ── FAQs ──────────────────────────────────────────────── */}
        <Section icon={CircleHelp} title="Frequently Asked Questions" hidden={!has(job.faqs)}>
          <FaqList faqs={job.faqs} />
        </Section>

        {/* ── Final CTA ─────────────────────────────────────────── */}
        {job.applyUrl && (
          <div className="text-center mt-10 mb-4">
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
               className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
              Apply Now <ExternalLink size={15} />
            </a>
          </div>
        )}
      </div>

      <footer className="border-t border-gray-800/50 py-8 text-center text-gray-600 text-sm mt-16">
        © {new Date().getFullYear()} JobFresh.in
      </footer>
    </div>
  )
}
