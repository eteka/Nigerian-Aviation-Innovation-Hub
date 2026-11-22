import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, ArrowRight } from 'lucide-react'
import { projectAPI } from '../../utils/api'

function SandboxShowcase({ sandboxTo }) {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    let active = true
    projectAPI
      .getAll()
      .then((response) => {
        if (active && Array.isArray(response.data)) {
          setProjects(response.data.slice(0, 3))
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="bg-gradient-to-b from-naija-emerald/10 to-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            <span className="harmattan-text">Innovation Sandbox</span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Put your sustainable aviation idea in front of a reviewer and see what
            other innovators across Nigeria are working on.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-naija-emerald/50 bg-white p-10 text-center shadow-xl">
            <Upload className="mb-4 h-12 w-12 text-naija-green" />
            <h3 className="mb-2 text-2xl font-bold">Submit Your Innovation</h3>
            <p className="mb-6 max-w-sm text-gray-600">
              A title, a description and a category are all you need to start.
            </p>
            <Link
              to={sandboxTo}
              className="eagle-glow rounded-full bg-naija-green px-8 py-3 font-semibold text-white"
            >
              Start a submission
            </Link>
          </div>

          <div>
            <h3 className="mb-6 text-2xl font-bold text-naija-green">In the Sandbox Now</h3>
            {projects.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <p className="text-gray-600">
                  No projects have been submitted yet. Yours could be the first.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block rounded-2xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-naija-emerald/20 px-3 py-1 text-xs font-semibold text-naija-green">
                        {project.category}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {project.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold">{project.title}</h4>
                  </Link>
                ))}
              </div>
            )}
            <Link
              to="/projects"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-naija-green hover:underline"
            >
              See all projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SandboxShowcase
