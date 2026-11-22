import { Link } from 'react-router-dom'
import { Plane, Leaf, Heart } from 'lucide-react'
import { guidelines } from '../../data/guidelines'

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-naija-green via-naija-delta to-naija-lagos text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
                <Plane className="h-6 w-6 text-naija-green" />
              </div>
              <h2 className="text-2xl font-bold">Nigeria Aviation Innovation Hub</h2>
            </div>
            <p className="mb-6 max-w-md text-lg opacity-90">
              Empowering Nigeria&apos;s sustainable aviation future through innovation
              and collaboration. Where dreams take flight safely.
            </p>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <Leaf className="h-4 w-4" />
              <span>Committed to Net-Zero by 2050</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/projects" className="opacity-80 hover:opacity-100">Innovation Sandbox</Link></li>
              <li><a href="/#navigator" className="opacity-80 hover:opacity-100">Regulatory Navigator</a></li>
              <li><Link to="/guidelines" className="opacity-80 hover:opacity-100">Guidelines</Link></li>
              <li><Link to="/signup" className="opacity-80 hover:opacity-100">Create an account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">ICAO Basket of Measures</h3>
            <ul className="space-y-3">
              {guidelines.map((item) => (
                <li key={item.slug}>
                  <Link to={`/guidelines/${item.slug}`} className="opacity-80 hover:opacity-100">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-8 md:flex-row">
          <div className="flex items-center gap-2 text-sm opacity-80">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-300" />
            <span>for Nigeria&apos;s aviation future</span>
          </div>
          <div className="text-sm opacity-80">
            © {new Date().getFullYear()} Nigeria Aviation Innovation Hub
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
