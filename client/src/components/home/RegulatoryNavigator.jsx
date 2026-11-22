import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, CheckCircle, ArrowRight, FileText, ListChecks, RotateCcw } from 'lucide-react'
import { guidelines } from '../../data/guidelines'

const ideaTypes = [
  {
    value: 'aircraft-technology',
    category: 'Aircraft Tech',
    label: 'A new aircraft, drone, engine or material',
  },
  {
    value: 'operational-improvements',
    category: 'Operations',
    label: 'A smarter way to fly, route or run operations',
  },
  {
    value: 'sustainable-aviation-fuels',
    category: 'Sustainable Fuel',
    label: 'A sustainable aviation fuel or its feedstock',
  },
  {
    value: 'market-based-measures',
    category: 'Offsets',
    label: 'Carbon offsets or emissions accounting',
  },
]

const stages = [
  {
    value: 'idea',
    label: 'Just an idea',
    prepare: [
      'One paragraph on the problem and who has it',
      'How your idea reduces emissions, in plain words',
      'What you need most: guidance, partners or a test site',
    ],
  },
  {
    value: 'prototype',
    label: 'A working prototype',
    prepare: [
      'What you have built and what it has shown so far',
      'Any test results, photos or measurements',
      'The safety questions you already know about',
    ],
  },
  {
    value: 'pilot',
    label: 'Ready for a pilot',
    prepare: [
      'Where and with whom you want to run the pilot',
      'Evidence from earlier tests',
      'The approvals you think you need and any you already hold',
    ],
  },
]

const steps = ['Your idea', 'Your stage', 'Your roadmap']

const sandboxSteps = [
  { title: 'Find your area', text: 'Answer two questions and see which ICAO area your idea falls under.' },
  { title: 'Read the guideline', text: 'Each area has a plain-language guideline on what it covers.' },
  { title: 'Submit to the sandbox', text: 'Describe your project and send it in for review.' },
  { title: 'Follow its status', text: 'Watch it move from Submitted to Under Review and beyond.' },
]

function RegulatoryNavigator({ sandboxTo }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [ideaType, setIdeaType] = useState('')
  const [stage, setStage] = useState('')

  const selectedIdea = ideaTypes.find((item) => item.value === ideaType)
  const selectedStage = stages.find((item) => item.value === stage)
  const guideline = guidelines.find((item) => item.slug === ideaType)
  const canContinue = currentStep === 0 ? Boolean(ideaType) : Boolean(stage)

  const restart = () => {
    setIdeaType('')
    setStage('')
    setCurrentStep(0)
  }

  const optionClass = (isActive) =>
    `flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left text-sm font-medium transition-colors ${
      isActive
        ? 'border-naija-green bg-naija-emerald/10 text-naija-green'
        : 'border-gray-200 text-gray-700 hover:border-naija-green'
    }`

  return (
    <section id="navigator" className="scroll-mt-[70px] bg-gradient-to-br from-white via-naija-ivory/30 to-naija-emerald/10 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            <span className="harmattan-text">Regulatory Navigator</span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Your compass through the ICAO framework. No red tape, just clear skies ahead.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Compass className="h-8 w-8 text-naija-green" />
              <h3 className="text-2xl font-bold">What&apos;s Your Idea?</h3>
            </div>

            <ol className="mb-8 flex items-center">
              {steps.map((label, index) => (
                <li key={label} className="flex flex-1 items-center last:flex-none">
                  <span
                    aria-label={label}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white transition-colors ${
                      index <= currentStep ? 'bg-naija-green' : 'bg-gray-300'
                    }`}
                  >
                    {index < currentStep ? <CheckCircle className="h-6 w-6" /> : index + 1}
                  </span>
                  {index < steps.length - 1 && (
                    <span className={`mx-2 h-1 flex-1 ${index < currentStep ? 'bg-naija-green' : 'bg-gray-300'}`} />
                  )}
                </li>
              ))}
            </ol>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {currentStep === 0 && (
                <div>
                  <h4 className="mb-4 text-xl font-bold">What is your idea about?</h4>
                  <div className="space-y-3">
                    {ideaTypes.map((item) => (
                      <button
                        type="button"
                        key={item.value}
                        aria-pressed={ideaType === item.value}
                        onClick={() => setIdeaType(item.value)}
                        className={optionClass(ideaType === item.value)}
                      >
                        {item.label}
                        {ideaType === item.value && <CheckCircle className="h-5 w-5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div>
                  <h4 className="mb-4 text-xl font-bold">How far along are you?</h4>
                  <div className="space-y-3">
                    {stages.map((item) => (
                      <button
                        type="button"
                        key={item.value}
                        aria-pressed={stage === item.value}
                        onClick={() => setStage(item.value)}
                        className={optionClass(stage === item.value)}
                      >
                        {item.label}
                        {stage === item.value && <CheckCircle className="h-5 w-5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && selectedIdea && selectedStage && guideline && (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Your idea falls under</p>
                    <h4 className="text-2xl font-bold text-naija-green">{guideline.title}</h4>
                    <p className="mt-2 text-sm text-gray-600">{guideline.summary}</p>
                  </div>

                  <div className="rounded-lg bg-naija-emerald/10 p-4">
                    <h5 className="mb-2 flex items-center gap-2 font-semibold text-naija-green">
                      <ListChecks className="h-5 w-5" />
                      Have this ready before you submit
                    </h5>
                    <ul className="space-y-2">
                      {selectedStage.prepare.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-naija-emerald" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={`/guidelines/${guideline.slug}`}
                      className="flex-1 rounded-lg border border-naija-green px-6 py-3 text-center font-semibold text-naija-green hover:bg-naija-emerald/10"
                    >
                      Read the guideline
                    </Link>
                    <Link
                      to={sandboxTo}
                      className="flex-1 rounded-lg bg-naija-green px-6 py-3 text-center font-semibold text-white hover:bg-naija-delta"
                    >
                      Submit to the sandbox
                    </Link>
                  </div>
                  <p className="text-xs text-gray-500">
                    When you submit, choose the category &ldquo;{selectedIdea.category}&rdquo;.
                    This roadmap is general guidance, not an approval.
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                {currentStep === 2 ? (
                  <button
                    type="button"
                    onClick={restart}
                    className="flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Start again
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      disabled={currentStep === 0}
                      className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!canContinue}
                      className="rounded-lg bg-naija-green px-6 py-3 font-semibold text-white hover:bg-naija-delta disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {currentStep === 1 ? 'Show my roadmap' : 'Next'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
              <h3 className="mb-6 text-2xl font-bold">How the Sandbox Works</h3>
              <ol className="space-y-5">
                {sandboxSteps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-naija-emerald/20 font-bold text-naija-green">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-naija-green/10 to-naija-emerald/10 p-6 sm:p-8">
              <h3 className="mb-4 text-xl font-bold">Quick Resources</h3>
              <div className="space-y-3">
                {guidelines.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/guidelines/${item.slug}`}
                    className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm transition-transform hover:translate-x-2"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-naija-green" />
                    <span className="text-sm font-medium">{item.title}</span>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RegulatoryNavigator
