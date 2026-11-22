import { useAuth } from '../context/AuthContext'
import HeroSection from '../components/home/HeroSection'
import InnovationPillars from '../components/home/InnovationPillars'
import RegulatoryNavigator from '../components/home/RegulatoryNavigator'
import SandboxShowcase from '../components/home/SandboxShowcase'
import Footer from '../components/home/Footer'

function Home() {
  const { user } = useAuth()
  const sandboxTo = user ? '/projects/new' : '/signup'

  return (
    <div>
      <HeroSection sandboxTo={sandboxTo} />
      <InnovationPillars />
      <RegulatoryNavigator sandboxTo={sandboxTo} />
      <SandboxShowcase sandboxTo={sandboxTo} />
      <Footer />
    </div>
  )
}

export default Home
