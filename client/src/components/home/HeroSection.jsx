import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Plane, Leaf, Zap } from 'lucide-react'

const MotionLink = motion(Link)

function HeroSection({ sandboxTo }) {
  const reduceMotion = useReducedMotion()

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        drift: Math.random() * 100 - 50,
        duration: 6 + Math.random() * 4,
        delay: Math.random() * 5,
      })),
    []
  )

  const buttonClass =
    'eagle-glow flex w-full items-center justify-center gap-3 rounded-full px-8 py-4 text-lg font-semibold text-white md:w-auto'

  return (
    <section className="relative flex min-h-[calc(100vh-70px)] items-center justify-center overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-br from-naija-harmattan/20 via-naija-green/15 to-naija-emerald/30">
        <div className="adire-pattern absolute inset-0 opacity-10" />
      </div>

      {!reduceMotion &&
        particles.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute h-2 w-2 rounded-full bg-naija-emerald opacity-60"
            animate={{ y: [0, -100, 0], x: [0, particle.drift, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay }}
            style={{ left: particle.left, top: particle.top }}
          />
        ))}

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="mb-6 text-5xl font-bold sm:text-6xl md:text-8xl">
            <span className="harmattan-text">Ignite Naija&apos;s Wings</span>
          </h1>
          <p className="mb-4 text-2xl font-medium text-naija-green md:text-3xl">
            Sustainable Ideas Take Flight Safely
          </p>
          <p className="mx-auto max-w-3xl text-lg text-gray-700 md:text-xl">
            Where harmattan winds whisper secrets of flight, and Lagos markets fuel dreams
            that soar above the clouds. Join Nigeria&apos;s aviation renaissance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6"
        >
          <MotionLink
            to={sandboxTo}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${buttonClass} contrail-effect bg-naija-green`}
          >
            <Plane className="h-6 w-6" />
            Join the Sandbox
          </MotionLink>

          <motion.a
            href="#navigator"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${buttonClass} bg-naija-emerald`}
          >
            <Leaf className="h-6 w-6" />
            Regulatory Roadmap
          </motion.a>

          <MotionLink
            to="/guidelines"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${buttonClass} bg-naija-harmattan`}
          >
            <Zap className="h-6 w-6" />
            Explore the Guidelines
          </MotionLink>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 grid grid-cols-1 gap-4 text-center md:grid-cols-3 md:gap-8"
        >
          <div className="rounded-lg bg-white/40 p-6 backdrop-blur-sm">
            <div className="text-3xl font-bold text-naija-green">2050</div>
            <div className="text-sm text-gray-600">Net-Zero Target</div>
          </div>
          <div className="rounded-lg bg-white/40 p-6 backdrop-blur-sm">
            <div className="text-3xl font-bold text-naija-emerald">Up to 80%</div>
            <div className="text-sm text-gray-600">SAF CO₂ Reduction</div>
          </div>
          <div className="rounded-lg bg-white/40 p-6 backdrop-blur-sm">
            <div className="text-3xl font-bold text-naija-harmattan">∞</div>
            <div className="text-sm text-gray-600">Innovation Horizons</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
