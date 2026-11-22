import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wheat, Leaf, Brain, Plane, Target } from 'lucide-react'

const pillars = [
  {
    id: 'sky-farmers',
    title: 'Sky Farmers',
    subtitle: 'BVLOS Drones for Agrotech',
    icon: Wheat,
    color: 'bg-naija-green',
    description: 'Revolutionizing Nigerian agriculture with beyond visual line of sight drones for crop monitoring, precision farming, and yield optimization.',
    features: ['Cocoa farm mapping', 'Precision spraying', 'Yield prediction', 'Operational efficiency metrics'],
  },
  {
    id: 'green-horizons',
    title: 'Green Horizons',
    subtitle: 'Sustainable Aviation Fuel Core',
    icon: Leaf,
    color: 'bg-naija-emerald',
    description: 'Developing SAF from Nigerian feedstocks like jatropha and waste oils, achieving up to 80% CO₂ reduction vs fossil fuels.',
    features: ['Jatropha cultivation', 'Waste oil processing', 'Lifecycle analysis', 'ICAO pathway compliance'],
  },
  {
    id: 'smart-skies',
    title: 'Smart Skies',
    subtitle: 'AI Traffic Orchestration',
    icon: Brain,
    color: 'bg-naija-lagos',
    description: 'AI-powered air traffic management for Nigerian airspace, optimizing routes and reducing emissions through smart coordination.',
    features: ['ATM modernization', 'Route optimization', 'Emission reduction', 'Real-time coordination'],
  },
  {
    id: 'urban-eagles',
    title: 'Urban Eagles',
    subtitle: 'eVTOL Networks',
    icon: Plane,
    color: 'bg-adire-indigo',
    description: 'Electric vertical takeoff aircraft connecting Nigerian cities. Lagos to Abuja in 30 minutes with zero emissions.',
    features: ['Urban mobility', 'Zero emissions', 'Rapid transit', 'City connectivity'],
  },
  {
    id: 'net-zero-basket',
    title: 'Net-Zero Basket',
    subtitle: 'ICAO Measures Integration',
    icon: Target,
    color: 'bg-naija-harmattan',
    description: 'Complete ICAO basket implementation: aircraft technology, operational improvements, SAF, and market-based measures.',
    features: ['Technology advances', 'Operational efficiency', 'Market measures', 'Carbon trading'],
  },
]

function InnovationPillars() {
  const [selectedPillar, setSelectedPillar] = useState(null)

  return (
    <section className="bg-gradient-to-b from-naija-ivory to-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            <span className="harmattan-text">Innovation Pillars</span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Five pillars supporting Nigeria&apos;s sustainable aviation future,
            aligned with ICAO&apos;s global CO₂ reduction framework
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            const isSelected = selectedPillar === pillar.id

            return (
              <motion.button
                type="button"
                key={pillar.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedPillar(isSelected ? null : pillar.id)}
                aria-expanded={isSelected}
                className={`relative rounded-2xl p-6 text-white transition-shadow duration-300 ${pillar.color} ${
                  isSelected ? 'col-span-full shadow-2xl ring-4 ring-white lg:col-span-2' : 'hover:shadow-xl'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <Icon className="mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-xl font-bold">{pillar.title}</h3>
                  <p className="text-sm opacity-90">{pillar.subtitle}</p>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 text-left"
                    >
                      <p className="mb-4 text-sm opacity-90">{pillar.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {pillar.features.map((feature) => (
                          <div key={feature} className="rounded-lg bg-white/20 p-2 text-xs">
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Link
                        to="/projects"
                        onClick={(event) => event.stopPropagation()}
                        className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-800"
                      >
                        Explore Sandbox
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-lg">
            <Target className="h-5 w-5 shrink-0 text-naija-green" />
            <span className="text-sm font-semibold text-gray-700">
              Aligned with ICAO&apos;s Basket of Measures for CO₂ Reduction
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InnovationPillars
