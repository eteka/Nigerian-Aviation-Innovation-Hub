import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, Plane, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  `block rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-naija-emerald/15 text-naija-green' : 'text-gray-700 hover:text-naija-green'
  }`

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  const handleLogout = async () => {
    close()
    await logout()
    navigate('/')
  }

  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
      <NavLink to="/projects" className={linkClass} onClick={close}>Projects</NavLink>
      <NavLink to="/guidelines" className={linkClass} onClick={close}>Guidelines</NavLink>
      {user?.role === 'regulator' && (
        <NavLink to="/admin" className={linkClass} onClick={close}>Admin</NavLink>
      )}
    </>
  )

  const account = user ? (
    <>
      <span className="px-4 py-2 text-sm font-medium text-gray-600">{user.name}</span>
      <button
        onClick={handleLogout}
        className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-naija-green hover:text-naija-green"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <NavLink to="/login" className={linkClass} onClick={close}>Login</NavLink>
      <Link
        to="/signup"
        onClick={close}
        className="rounded-full bg-naija-green px-5 py-2 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-naija-delta"
      >
        Sign Up
      </Link>
    </>
  )

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-naija-emerald/20 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-5">
        <Link to="/" onClick={close} className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-naija-green">
            <Plane className="h-5 w-5 text-white" />
          </span>
          <span className="text-base font-bold leading-tight text-gray-900 sm:text-lg">
            Nigeria Aviation Innovation Hub
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links}
          <span className="mx-2 h-6 w-px bg-gray-200" />
          {account}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="rounded-lg p-2 text-gray-700 lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-gray-100 bg-white px-5 py-4 lg:hidden">
          {links}
          <span className="my-2 h-px w-full bg-gray-100" />
          {account}
        </div>
      )}
    </nav>
  )
}

export default Navbar
