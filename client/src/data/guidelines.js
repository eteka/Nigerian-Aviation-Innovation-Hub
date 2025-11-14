export const guidelines = [
  {
    id: 1,
    slug: 'aircraft-technology',
    title: 'Aircraft Technology Improvements',
    icon: '✈️',
    summary: 'Innovations in aircraft design, propulsion, and materials to reduce emissions and improve efficiency.',
    content: `Aircraft technology improvements represent one of the most direct pathways to reducing aviation's environmental impact. This includes advancements in aerodynamics, lightweight composite materials, and next-generation propulsion systems. Modern aircraft designs can achieve up to 25% better fuel efficiency compared to older models through improved wing designs, reduced drag, and optimized flight systems.

Electric and hybrid-electric propulsion systems are emerging as game-changers for short to medium-haul flights. These technologies promise near-zero emissions for regional aviation while reducing noise pollution in urban areas. Hydrogen-powered aircraft are also being developed for longer ranges, offering the potential for completely carbon-neutral flight operations.

The integration of artificial intelligence and advanced sensors enables real-time optimization of flight parameters, further enhancing efficiency. From adaptive wing surfaces to intelligent engine management systems, technology is transforming how aircraft operate and perform.`,
    supportedInNigeria: [
      'Development and testing of electric vertical takeoff and landing (eVTOL) aircraft',
      'Research into hybrid-electric propulsion systems for regional flights',
      'Drone technology innovations for cargo delivery and surveillance',
      'Lightweight materials research and composite manufacturing',
      'AI-powered flight optimization systems'
    ]
  },
  {
    id: 2,
    slug: 'operational-improvements',
    title: 'Operational Improvements',
    icon: '📊',
    summary: 'Optimizing flight operations, air traffic management, and ground procedures to reduce fuel consumption.',
    content: `Operational improvements focus on making existing aviation infrastructure and procedures more efficient without requiring new aircraft technology. This includes optimizing flight routes, improving air traffic management, and streamlining ground operations. Studies show that operational improvements can reduce fuel consumption by 5-15% through better planning and execution.

Advanced air traffic management systems use real-time data and predictive analytics to reduce delays, minimize holding patterns, and enable more direct routing. Continuous descent approaches and optimized climb procedures can significantly reduce fuel burn during critical phases of flight. On the ground, efficient taxiing procedures, reduced auxiliary power unit usage, and improved turnaround times all contribute to lower emissions.

Collaborative decision-making between airlines, airports, and air traffic control enables system-wide optimization. Digital tools and data sharing platforms allow stakeholders to coordinate more effectively, reducing inefficiencies and improving overall system performance.`,
    supportedInNigeria: [
      'AI-powered air traffic flow management systems',
      'Flight planning optimization software',
      'Airport ground operations efficiency projects',
      'Collaborative decision-making platforms for aviation stakeholders',
      'Performance-based navigation (PBN) implementation studies'
    ]
  },
  {
    id: 3,
    slug: 'sustainable-aviation-fuels',
    title: 'Sustainable Aviation Fuels (SAF)',
    icon: '🌱',
    summary: 'Alternative fuels derived from sustainable sources that can reduce lifecycle carbon emissions by up to 80%.',
    content: `Sustainable Aviation Fuels (SAF) are drop-in replacement fuels that can be used in existing aircraft without modification, making them one of the most practical near-term solutions for reducing aviation emissions. SAF can be produced from various feedstocks including agricultural residues, algae, municipal waste, and captured carbon dioxide. When produced sustainably, SAF can reduce lifecycle carbon emissions by up to 80% compared to conventional jet fuel.

The production of SAF creates opportunities for local economic development and agricultural diversification. In Nigeria, abundant biomass resources and agricultural waste streams present significant potential for SAF production. Technologies such as Fischer-Tropsch synthesis, hydroprocessed esters and fatty acids (HEFA), and alcohol-to-jet processes can convert local feedstocks into high-quality aviation fuel.

Scaling SAF production requires investment in production facilities, feedstock supply chains, and quality certification processes. The Nigeria Aviation Innovation Hub supports projects that advance SAF technology, establish production capabilities, and demonstrate the viability of locally-produced sustainable fuels.`,
    supportedInNigeria: [
      'SAF production from agricultural waste and biomass',
      'Algae cultivation for biofuel production',
      'Waste-to-fuel conversion technologies',
      'SAF quality testing and certification processes',
      'Feedstock supply chain development and optimization'
    ]
  },
  {
    id: 4,
    slug: 'market-based-measures',
    title: 'Market-Based Measures (CORSIA)',
    icon: '🌍',
    summary: 'Carbon offsetting and emissions trading schemes to achieve carbon-neutral growth in international aviation.',
    content: `The Carbon Offsetting and Reduction Scheme for International Aviation (CORSIA) is a global market-based measure designed to address CO2 emissions from international flights. Implemented by ICAO, CORSIA aims to stabilize net CO2 emissions from international aviation at 2020 levels through a combination of emissions reductions and carbon offsetting. Airlines purchase carbon credits from verified environmental projects to offset their emissions growth.

CORSIA creates economic incentives for emissions reductions while supporting sustainable development projects worldwide. Eligible offset projects include renewable energy installations, reforestation initiatives, and methane capture systems. These projects must meet strict verification standards to ensure they deliver real, measurable, and additional emissions reductions.

For Nigeria, CORSIA presents opportunities to develop carbon offset projects that generate revenue while delivering environmental and social benefits. The scheme also encourages airlines to invest in more efficient operations and technologies to minimize their offsetting obligations.`,
    supportedInNigeria: [
      'Development of verified carbon offset projects (reforestation, renewable energy)',
      'CORSIA compliance monitoring and reporting systems',
      'Carbon accounting and verification services',
      'Emissions reduction project development and certification',
      'Market mechanisms for trading carbon credits'
    ]
  }
];

export const getGuidelineBySlug = (slug) => {
  return guidelines.find(g => g.slug === slug);
};
