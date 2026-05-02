import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight, Mail, Zap, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import JobCard from '../components/JobCard'
import api from '../api/client'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'INTERNSHIP', 'CONTRACT']

export default function Home() {
  const [jobs, setJobs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [categories, setCategories] = useState([])
  const [email, setEmail]         = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const [filters, setFilters] = useState({
    keyword: '', category: '', type: '', location: ''
  })
  const [search, setSearch] = useState({ keyword: '', location: '' })

  const fetchJobs = useCallback(async (f, p) => {
    setLoading(true)
    try {
      const params = { page: p, size: 12 }
      if (f.keyword)  params.keyword  = f.keyword
      if (f.category) params.category = f.category
      if (f.type)     params.type     = f.type
      if (f.location) params.location = f.location

      const res = await api.get('/jobs', { params })
      const { content, totalPages, totalElements } = res.data.data
      setJobs(content)
      setTotalPages(totalPages)
      setTotalElements(totalElements)
    } catch {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    api.get('/jobs/categories')
      .then(r => setCategories(r.data.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchJobs(filters, page)
  }, [filters, page, fetchJobs])

  function applySearch(e) {
    e.preventDefault()
    setPage(0)
    setFilters(prev => ({ ...prev, keyword: search.keyword, location: search.location }))
  }

  function setFilter(key, value) {
    setPage(0)
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setPage(0)
    setSearch({ keyword: '', location: '' })
    setFilters({ keyword: '', category: '', type: '', location: '' })
  }

  const hasActiveFilters = filters.keyword || filters.category || filters.type || filters.location

  async function subscribe(e) {
    e.preventDefault()
    if (!email) return
    setSubscribing(true)
    try {
      await api.post(`/subscribers?email=${encodeURIComponent(email)}`)
      toast.success('Subscribed! Check your inbox 🎉')
      setEmail('')
    } catch {
      toast.error('Subscription failed. Try again.')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                          bg-brand-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20
                          rounded-full px-4 py-1.5 text-brand-400 text-sm font-medium mb-6">
            <Zap size={13} className="animate-pulse" /> {totalElements.toLocaleString()} jobs available
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl text-white mb-4 leading-tight">
            Find your next<br />
            <span className="text-gradient">fresh opportunity</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10">
            Curated jobs in tech, design, finance & more — updated daily.
          </p>

          {/* Search bar */}
          <form onSubmit={applySearch}
                className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                className="input pl-10"
                placeholder="Job title, company, keyword..."
                value={search.keyword}
                onChange={e => setSearch(s => ({ ...s, keyword: e.target.value }))}
              />
            </div>
            <div className="relative sm:w-48">
              <input
                className="input"
                placeholder="Location"
                value={search.location}
                onChange={e => setSearch(s => ({ ...s, location: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn-primary whitespace-nowrap">
              Search Jobs
            </button>
          </form>
        </div>
      </section>

      {/* ── Filters + Jobs ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Filter size={14} className="text-gray-500" />

          {/* Type filter */}
          {JOB_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setFilter('type', filters.type === type ? '' : type)}
              className={`badge border cursor-pointer transition-all ${
                filters.type === type
                  ? 'bg-brand-500/20 text-brand-400 border-brand-500/40'
                  : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}

          {/* Category filter */}
          {categories.slice(0, 6).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter('category', filters.category === cat ? '' : cat)}
              className={`badge border cursor-pointer transition-all ${
                filters.category === cat
                  ? 'bg-brand-500/20 text-brand-400 border-brand-500/40'
                  : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}

          {hasActiveFilters && (
            <button onClick={clearFilters}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-300
                               text-xs transition-colors ml-2">
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-gray-500 text-sm mb-6">
            {totalElements.toLocaleString()} {hasActiveFilters ? 'matching' : 'total'} jobs
          </p>
        )}

        {/* Job grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                    <div className="h-3 bg-gray-800 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display font-semibold text-xl text-white mb-2">No jobs found</h3>
            <p className="text-gray-500">Try different keywords or remove some filters</p>
            <button onClick={clearFilters} className="btn-outline mt-6">Clear filters</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="btn-outline flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-gray-400 text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="btn-outline flex items-center gap-1 disabled:opacity-40"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* ── Email Subscribe Banner ────────────────────────────── */}
      <section className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-2xl
                          flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-brand-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">
            Get fresh jobs in your inbox
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            Subscribe and be the first to know when new roles drop.
          </p>
          <form onSubmit={subscribe} className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email"
              className="input flex-1"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={subscribing}>
              {subscribing ? '...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-gray-800/50 py-8 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} JobFresh.in — Fresh jobs, every day.
      </footer>
    </div>
  )
}
