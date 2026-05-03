import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, X, Briefcase, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import CompanyLogo from '../components/CompanyLogo'
import { Accordion, ListEditor, RoundsEditor, FaqEditor, LinksEditor } from '../components/admin/FormControls'
import api from '../api/client'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'INTERNSHIP', 'CONTRACT', 'WORK_FROM_HOME']
const EXPERIENCE_LEVELS = ['Fresher', '1-3 years', '3-5 years', '5+ years', 'Any']
const DEGREE_TYPES = [
  { value: '', label: 'Any Degree' },
  { value: 'BE_BTECH', label: 'B.E / B.Tech' },
  { value: 'ME_MTECH_MS', label: 'M.E / M.Tech / MS' },
  { value: 'BCA_MCA', label: 'BCA / MCA' },
  { value: 'BSC', label: 'B.Sc' },
  { value: 'MBA_PGDM', label: 'MBA / PGDM' },
  { value: 'BA_MA', label: 'BA / MA' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'ANY', label: 'Any' },
]

const EMPTY_FORM = {
  // Core
  title: '', company: '', location: '', description: '',
  type: 'FULL_TIME', category: '', salary: '', applyUrl: '', logoUrl: '',
  // Eligibility
  qualification: '', degree: '', branch: '', batch: '',
  experienceLevel: 'Fresher', minPercentage: '', bond: 'No bond',
  ageLimit: 'No age limit', lastDateToApply: '', examDate: '',
  // Rich content
  aboutCompany: '',
  responsibilities:  [],
  requiredSkills:    [],
  documentsRequired: [],
  howToApply:        [],
  selectionRounds:   [],
  faqs:              [],
  importantLinks:    []
}

export default function AdminDashboard() {
  const [jobs, setJobs]         = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')

  const fetchJobs = useCallback(async (p = 0) => {
    setLoading(true)
    try {
      const res = await api.get('/admin/jobs', { params: { page: p, size: 15 } })
      const { content, totalPages } = res.data.data
      setJobs(content)
      setTotalPages(totalPages)
    } catch { toast.error('Failed to load jobs') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchJobs(page)
    api.get('/admin/dashboard')
      .then(r => setStats(r.data.data))
      .catch(() => {})
  }, [page, fetchJobs])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(job) {
    setEditing(job.id)
    setForm({
      // Core
      title: job.title, company: job.company, location: job.location,
      description: job.description, type: job.type,
      category: job.category || '', salary: job.salary || '',
      applyUrl: job.applyUrl || '', logoUrl: job.logoUrl || '',
      // Eligibility
      qualification: job.qualification || '',
      degree: job.degree || '',
      branch: job.branch || '',
      batch: job.batch || '',
      experienceLevel: job.experienceLevel || 'Fresher',
      minPercentage: job.minPercentage || '',
      bond: job.bond || 'No bond',
      ageLimit: job.ageLimit || 'No age limit',
      lastDateToApply: job.lastDateToApply || '',
      examDate: job.examDate || '',
      // Rich content
      aboutCompany:      job.aboutCompany || '',
      responsibilities:  job.responsibilities  || [],
      requiredSkills:    job.requiredSkills    || [],
      documentsRequired: job.documentsRequired || [],
      howToApply:        job.howToApply        || [],
      selectionRounds:   job.selectionRounds   || [],
      faqs:              job.faqs              || [],
      importantLinks:    job.importantLinks    || []
    })
    setModalOpen(true)
  }

  async function saveJob(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/admin/jobs/${editing}`, form)
        toast.success('Job updated')
      } else {
        await api.post('/admin/jobs', form)
        toast.success('Job created & subscribers notified! 🚀')
      }
      setModalOpen(false)
      fetchJobs(page)
    } catch (err) {
      const data = err.response?.data
      if (data?.errors?.length) {
        // 422 field-level errors from GlobalExceptionHandler
        data.errors.forEach(fe => toast.error(`${fe.field}: ${fe.message}`))
      } else {
        toast.error(data?.message || 'Save failed')
      }
    } finally {
      setSaving(false)
    }
  }

  async function toggleJob(id, currentlyActive) {
    try {
      await api.patch(`/admin/jobs/${id}/toggle`)
      toast.success(currentlyActive ? 'Job deactivated' : 'Job activated')
      fetchJobs(page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Toggle failed')
    }
  }

  async function deleteJob(id) {
    if (!confirm('Delete this job?')) return
    try {
      await api.delete(`/admin/jobs/${id}`)
      toast.success('Job deleted')
      fetchJobs(page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar isAdmin />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Dashboard</h1>
            <p className="text-gray-500 text-sm">Manage all job listings</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Job
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'brand' },
              { label: 'Active Jobs', value: stats.activeJobs, icon: CheckCircle, color: 'green' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3
                  ${color === 'brand' ? 'bg-brand-500/10' : 'bg-green-500/10'}`}>
                  <Icon size={18} className={color === 'brand' ? 'text-brand-400' : 'text-green-400'} />
                </div>
                <div className="font-display font-bold text-2xl text-white">{value}</div>
                <div className="text-gray-500 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-10 text-sm" placeholder="Search jobs..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Job</th>
                  <th className="text-left px-6 py-3 hidden sm:table-cell">Type</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Location</th>
                  <th className="text-left px-6 py-3 hidden lg:table-cell">Posted</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-gray-800 rounded animate-pulse" />
                    </td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No jobs found
                  </td></tr>
                ) : filtered.map(job => (
                  <tr key={job.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <CompanyLogo logoUrl={job.logoUrl} company={job.company} size="sm" />
                        <div>
                          <div className="font-medium text-white line-clamp-1">{job.title}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{job.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="badge bg-gray-800 text-gray-400">
                        {job.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 hidden md:table-cell">{job.location}</td>
                    <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${job.active
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-800 text-gray-500'}`}>
                        {job.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleJob(job.id, job.active)}
                                title={job.active ? 'Deactivate' : 'Activate'}
                                className={`p-1.5 transition-colors rounded ${job.active ? 'text-green-400 hover:text-gray-500' : 'text-gray-500 hover:text-green-400'}`}>
                          {job.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => openEdit(job)}
                                className="p-1.5 text-gray-500 hover:text-brand-400 transition-colors rounded">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteJob(job.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                    className="btn-outline flex items-center gap-1 disabled:opacity-40 text-sm">
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="text-gray-500 text-sm">Page {page + 1}/{totalPages}</span>
            <button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="btn-outline flex items-center gap-1 disabled:opacity-40 text-sm">
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Job Modal ──────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl
                          max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6
                            border-b border-gray-800 bg-gray-900">
              <h2 className="font-display font-semibold text-lg text-white">
                {editing ? 'Edit Job' : 'Post New Job'}
              </h2>
              <button onClick={() => setModalOpen(false)}
                      className="text-gray-500 hover:text-gray-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveJob} className="p-6 space-y-3">

              {/* ════════ Basic Info ═══════════════════════════════════════ */}
              <Accordion title="📋 Basic Information" defaultOpen>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Job Title *</label>
                    <input className="input" required value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Company *</label>
                    <input className="input" required value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1.5">
                      Location * <span className="text-gray-600 font-normal">(comma-separated)</span>
                    </label>
                    <input className="input" required placeholder="Bangalore,Hyderabad,Chennai,Pune"
                      value={form.location}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Job Type *</label>
                    <select className="input" value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Category</label>
                    <input className="input" placeholder="Engineering, Design, Finance"
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Salary</label>
                    <input className="input" placeholder="4.5 LPA or 12-18 LPA"
                      value={form.salary}
                      onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Apply URL</label>
                    <input className="input" type="url" placeholder="https://..."
                      value={form.applyUrl}
                      onChange={e => setForm(f => ({ ...f, applyUrl: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1.5">
                      Company Logo URL
                      <span className="text-gray-600 font-normal ml-1">
                        (try logo.clearbit.com/company.com)
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input className="input flex-1" type="url"
                        placeholder="https://logo.clearbit.com/cognizant.com"
                        value={form.logoUrl}
                        onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} />
                      {form.logoUrl && (
                        <div className="w-11 h-11 rounded-xl border border-gray-700 bg-white
                                        flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img src={form.logoUrl} alt="preview"
                               className="w-full h-full object-contain p-1"
                               onError={e => { e.target.style.display = 'none' }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1.5">Short Description *</label>
                    <textarea className="input min-h-[100px] resize-y" required
                      placeholder="Brief job summary (3-5 lines). Detailed sections go below."
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                </div>
              </Accordion>

              {/* ════════ Eligibility ══════════════════════════════════════ */}
              <Accordion title="🎯 Eligibility Criteria" defaultOpen>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Qualification</label>
                    <input className="input" placeholder="B.E/B.Tech/M.E/M.Tech"
                      value={form.qualification}
                      onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Degree Type</label>
                    <select className="input" value={form.degree}
                      onChange={e => setForm(f => ({ ...f, degree: e.target.value }))}>
                      {DEGREE_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Branch</label>
                    <input className="input" placeholder="Any / CSE,ECE,IT"
                      value={form.branch}
                      onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Batch</label>
                    <input className="input" placeholder="2026 or 2025,2026"
                      value={form.batch}
                      onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Experience Level</label>
                    <select className="input" value={form.experienceLevel}
                      onChange={e => setForm(f => ({ ...f, experienceLevel: e.target.value }))}>
                      {EXPERIENCE_LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Min. Percentage</label>
                    <input className="input" type="number" min="0" max="100" step="0.1"
                      placeholder="60" value={form.minPercentage}
                      onChange={e => setForm(f => ({ ...f, minPercentage: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Bond</label>
                    <input className="input" placeholder="No bond / 2 years bond"
                      value={form.bond}
                      onChange={e => setForm(f => ({ ...f, bond: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Age Limit</label>
                    <input className="input" placeholder="No age limit / Below 28"
                      value={form.ageLimit}
                      onChange={e => setForm(f => ({ ...f, ageLimit: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Last Date to Apply</label>
                    <input className="input" type="date" value={form.lastDateToApply}
                      onChange={e => setForm(f => ({ ...f, lastDateToApply: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Exam Date</label>
                    <input className="input" placeholder="Informed over mail / 20 May 2026"
                      value={form.examDate}
                      onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))} />
                  </div>
                </div>
              </Accordion>

              {/* ════════ About Company ════════════════════════════════════ */}
              <Accordion title="🏢 About Company">
                <textarea className="input min-h-[120px] resize-y"
                  placeholder="Detailed paragraph about the company, its work, culture, mission..."
                  value={form.aboutCompany}
                  onChange={e => setForm(f => ({ ...f, aboutCompany: e.target.value }))} />
              </Accordion>

              {/* ════════ Skills ═══════════════════════════════════════════ */}
              <Accordion title="✨ Required Skills"
                         badge={form.requiredSkills.length || null}>
                <ListEditor
                  label="Skills (technical & soft)"
                  hint="one skill per item"
                  placeholder="e.g. Java, Spring Boot, Communication"
                  items={form.requiredSkills}
                  onChange={v => setForm(f => ({ ...f, requiredSkills: v }))} />
              </Accordion>

              {/* ════════ Responsibilities ═════════════════════════════════ */}
              <Accordion title="📌 Roles & Responsibilities"
                         badge={form.responsibilities.length || null}>
                <ListEditor
                  label="Bullet points"
                  placeholder="e.g. Develop and maintain web applications"
                  items={form.responsibilities}
                  onChange={v => setForm(f => ({ ...f, responsibilities: v }))} />
              </Accordion>

              {/* ════════ Selection Process ════════════════════════════════ */}
              <Accordion title="📊 Selection Process"
                         badge={form.selectionRounds.length || null}>
                <RoundsEditor
                  rounds={form.selectionRounds}
                  onChange={v => setForm(f => ({ ...f, selectionRounds: v }))} />
              </Accordion>

              {/* ════════ Documents Required ═══════════════════════════════ */}
              <Accordion title="📄 Documents Required"
                         badge={form.documentsRequired.length || null}>
                <ListEditor
                  label="Documents to bring/upload"
                  placeholder="e.g. Updated resume, 10th certificate"
                  items={form.documentsRequired}
                  onChange={v => setForm(f => ({ ...f, documentsRequired: v }))} />
              </Accordion>

              {/* ════════ How to Apply ═════════════════════════════════════ */}
              <Accordion title="📝 How to Apply"
                         badge={form.howToApply.length || null}>
                <ListEditor
                  label="Application steps"
                  placeholder="e.g. Click the apply link below"
                  items={form.howToApply}
                  onChange={v => setForm(f => ({ ...f, howToApply: v }))} />
              </Accordion>

              {/* ════════ Important Links ══════════════════════════════════ */}
              <Accordion title="🔗 Important Links"
                         badge={form.importantLinks.length || null}>
                <LinksEditor
                  links={form.importantLinks}
                  onChange={v => setForm(f => ({ ...f, importantLinks: v }))} />
              </Accordion>

              {/* ════════ FAQs ═════════════════════════════════════════════ */}
              <Accordion title="❓ FAQs"
                         badge={form.faqs.length || null}>
                <FaqEditor
                  faqs={form.faqs}
                  onChange={v => setForm(f => ({ ...f, faqs: v }))} />
              </Accordion>

              {/* ── Sticky save bar ── */}
              <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-gray-900 border-t border-gray-800
                              flex gap-3">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Job' : 'Post Job & Notify'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
