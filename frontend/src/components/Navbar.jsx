import { Link, useNavigate } from 'react-router-dom'
import { Zap, LogOut } from 'lucide-react'

export default function Navbar({ isAdmin = false }) {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('jf_token')

  function logout() {
    localStorage.removeItem('jf_token')
    navigate('/admin/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center group-hover:bg-brand-600 transition-colors">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">
            Job<span className="text-gradient">Fresh</span>
          </span>
          <span className="text-gray-500 text-sm hidden sm:block">.in</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isLoggedIn && isAdmin && (
            <button onClick={logout} className="btn-outline flex items-center gap-2 text-sm">
              <LogOut size={15} /> Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
