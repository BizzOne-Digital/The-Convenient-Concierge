// Source-controlled business content. Verified against https://www.theconvenientconcierge.ca/
// Not editable from the admin portal by design.

export const business = {
  name: 'The Convenient Concierge',
  tagline: 'Deliveries, Moving, Tasks & Errands',
  promise: 'Life gets busy. Let us handle the details.',
  phone: '647-457-5252',
  email: 'info@theconvenientconcierge.ca',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.theconvenientconcierge.ca',
  // Profile URLs taken from the client's existing website header/footer.
  social: [
    { label: 'Facebook', href: 'https://www.facebook.com/The-Convenient-Concierge-105434161244397/' },
    { label: 'Instagram', href: 'https://www.instagram.com/theconvenientconcierge/' },
  ],
  movingChecklistUrl: '/documents/tcc-moving-checklist.pdf',
} as const

export const serviceAreas = [
  'Downtown Toronto',
  'Liberty Village',
  'Parkdale',
  'Roncesvalles',
  'The Junction Triangle',
  'High Park',
  'Bloor West Village',
  'The Kingsway',
  'Etobicoke',
  'Humber Bay Shores',
  'Mississauga',
] as const

/** One consistent summary of the service area (client-confirmed 2026-11-13: all of Mississauga plus the surrounding GTA). */
export const areaSummary = 'Toronto, Etobicoke, Mississauga and the surrounding GTA'

export const serviceTypes = ['moving', 'delivery', 'tasks'] as const
export type ServiceType = (typeof serviceTypes)[number]

export type Service = {
  type: ServiceType
  slug: string
  name: string
  shortName: string
  icon: 'moving' | 'delivery' | 'tasks'
  summary: string
  /** Hero paragraph on the service page, when it differs from the shared summary. */
  heroLead?: string
  intro: string
  items: string[]
  /** Short labels for the services overview, when an item is too long to scan. */
  highlights?: string[]
  benefits?: string[]
  notice?: string
  cta: string
  cardCta: string
  images: { src: string; alt: string }[]
  seo: { title: string; description: string }
  /** H2 above the service list on the service page. */
  listHeading: string
  /** Contextual link to a related service page. */
  related: { slug: string; label: string }
}

export const services: Service[] = [
  {
    type: 'moving',
    slug: 'moving',
    name: 'Moving',
    shortName: 'Moving',
    icon: 'moving',
    summary:
      'Toronto moving services for homes, condos, apartments and offices. From small and single-item moves to full relocations, we load, unload, wrap and protect your furniture, and take care of assembly and disassembly.',
    intro:
      "Whether you're moving a house, condo, apartment or office, we handle the heavy lifting. As condo movers and small movers in Toronto and Etobicoke, we wrap and protect your furniture, take it apart and put it back together, and move appliances and heavy items. Need movers without a truck? Our movers-only service covers loading and unloading. We also handle storage moves, furniture staging for real-estate brokerages and junk removal.",
    items: [
      'Residential, condo and apartment moves',
      'Small moves and single-item moves',
      'Movers-only services, including loading and unloading',
      'Furniture wrapping and protection',
      'Furniture assembly and disassembly',
      'Storage moves and furniture staging',
      'Office moves and heavy-item moving',
      'Furniture and appliance moves',
      'Junk removal',
    ],
    notice: 'Furniture assembly and disassembly are included in our moving services.',
    cta: 'Request a Moving Quote',
    cardCta: 'Explore Moving',
    images: [
      { src: '/images/services/moving-team.jpg', alt: 'Two movers carefully carrying a wrapped armchair through a bright home' },
      { src: '/images/services/moving-boxes.jpg', alt: 'Packed moving boxes, a rolled rug and a floor lamp ready in an empty room' },
    ],
    seo: {
      title: 'Toronto Moving Services: Condo, Small & Office Movers',
      description:
        'Condo, apartment, small and office moves in Toronto, Etobicoke, Mississauga and the GTA. Movers-only loading, furniture assembly, staging and storage moves.',
    },
    listHeading: 'Our Toronto moving services',
    related: { slug: 'pick-up-delivery', label: 'Moving just one item? See furniture pickup and delivery' },
  },
  {
    type: 'delivery',
    slug: 'pick-up-delivery',
    name: 'Pick-up & Delivery',
    shortName: 'Delivery',
    icon: 'delivery',
    summary:
      "Furniture pickup and delivery across Toronto and the GTA. We collect Facebook Marketplace finds, IKEA and retail purchases, appliances and large, bulky items you can't easily move yourself, and handle corporate and event deliveries.",
    intro:
      "Bought something that won't fit in your car? The Convenient Concierge picks up furniture, appliances and other large or bulky items from Facebook Marketplace sellers, IKEA, big-box and curbside retail stores, and delivers them to your home or office across Toronto and the GTA. It's the simple way to get Facebook Marketplace delivery in Toronto without borrowing a truck.",
    items: [
      'Furniture pickup and delivery',
      'Facebook Marketplace purchases',
      'IKEA and retail store pickups',
      'Appliance pickup and delivery',
      'Corporate deliveries',
      'Event deliveries',
      'Large and bulky-item transportation',
      'Private deliveries',
      'Out-of-town deliveries',
      'Construction materials',
      'Garden centre pickups',
      'Donations pick-up and drop-off',
      'Penguin pick-ups',
      'Propane tanks',
    ],
    cta: 'Submit a Pickup / Delivery Request',
    cardCta: 'Explore Delivery',
    images: [
      { src: '/images/services/delivery-handoff.jpg', alt: 'A parcel being handed over at a front door' },
      { src: '/images/services/delivery-parcel.jpg', alt: 'A courier holding a sealed cardboard parcel' },
    ],
    seo: {
      title: 'Furniture Pickup & Delivery in Toronto',
      description:
        'Furniture pickup and delivery in Toronto, plus Facebook Marketplace delivery, IKEA and retail pickups, appliances, bulky items, and corporate and event deliveries.',
    },
    listHeading: 'Furniture pickup and delivery services',
    related: { slug: 'moving', label: 'Moving a whole home or condo? See our Toronto moving services' },
  },
  {
    type: 'tasks',
    slug: 'tasks-errands',
    name: 'Tasks & Errands',
    shortName: 'Tasks & Errands',
    icon: 'tasks',
    summary:
      'From shopping and grocery runs to gift purchases and everyday errands, we take care of the tasks that fill up your day.',
    // Client-supplied wording: keep verbatim.
    heroLead:
      'Life gets busy, and sometimes there simply aren’t enough hours in the day. The Convenient Concierge provides reliable, personalized tasks and errands services throughout Toronto and the GTA. Whether you need shopping completed, items picked up, help around your home, or assistance with a special request, we’re here to make your day easier.',
    intro:
      'Searching for errand services Toronto residents can rely on? As a personal concierge Toronto households and businesses can call on, we handle grocery pickup and delivery, personal shopping, gift and card purchases, store pickups and donation drop-offs, including for out-of-town clients who need something taken care of locally.',
    items: [
      'Grocery shopping and personal shopping',
      'Gift and card purchases',
      'Errand running and store pickups',
      'Donation drop-offs',
      'Assistance for out-of-town clients',
      'Personalized errands for residential and corporate customers',
      'Shop & Ship',
    ],
    benefits: ['Convenience', 'Reliability', 'Personalized Service', 'Local Expertise'],
    cta: 'Tell Us What You Need',
    cardCta: 'Explore Tasks & Errands',
    images: [
      { src: '/images/services/errands-shopping.jpg', alt: 'A hand holding colourful shopping bags in a bright shopping arcade' },
      { src: '/images/services/errands-groceries.jpg', alt: 'A grocery cart moving down a well-stocked supermarket aisle' },
      { src: '/images/services/errands-gifts.jpg', alt: 'A stack of wrapped gifts tied with ribbon' },
    ],
    seo: {
      title: 'Tasks & Errands Services in Toronto',
      description:
        'Personal concierge services in Toronto: grocery pickup and delivery, personal shopping, gift and card purchases, store pickups and donation drop-offs.',
    },
    listHeading: 'Tasks and errands we handle in Toronto',
    related: { slug: 'pick-up-delivery', label: 'Need a large purchase collected? See Facebook Marketplace delivery' },
  },
]

export const getService = (slug: string) => services.find((s) => s.slug === slug)
export const serviceByType = (type: string) => services.find((s) => s.type === type)

export const organisations = [
  'Recipe Unlimited Corporation',
  'George Brown College',
  'The Bentway',
  'M&M Food Market',
  'Lerners LLP',
  'Code 8 Part 2 Productions Inc',
  'Ontario Science Centre',
  'Restaurant Associates Canada',
  'Kabin 247',
  'Gilmore Property Group',
  'The Christine Cowern Real Estate Team',
  'The World Winery Inc',
  'Glucksteinhome Inc',
  'Kate Duncan Design Inc',
  'Baxter Media',
  'Compass Group-Canada',
  'Robb & Company',
  'Mimi Pineau Design',
  'Kirki Press LTD',
  'Spoke Alliance Inc',
  'Sutton Group Quantum Realty Inc',
  'XO Bisous',
  'Achev',
  'Coolican & Company',
  'DJK Construction Management',
  'Maxi Mind Learning',
  'Nijma M Fine Jewelry Inc',
] as const

export const about = {
  intro:
    'We are your customer service specialists when it comes to delivery, tasks & errands, moving and completing errands you need done around your home or office.',
  story: [
    'Here at The Convenient Concierge we understand how busy life gets at home and work. We also understand, now more than ever, the importance of knowing and trusting the people around you.',
    "For this reason our professional, customer service-based concierges build strong relationships with our clients to ensure you know what you're getting each and every time. This allows us to better understand your specific needs and fulfill them to your exact expectations.",
    'We shop, move, or pick up & pay for, and deliver anything you need, and we get those items to you when you need them.',
  ],
  promise:
    'The Convenient Concierge promises to exceed your expectations at every turn, completing tasks promptly, saving you money and, ultimately, saving you the most valuable commodity of all: time.',
  anywhere:
    'We will go anywhere to get you the items you need for work or home. We will do anything you require. Just contact us and we will get it done.',
  clients: 'We serve both corporate and residential clients.',
}

export const trustPoints = [
  { icon: 'building', title: 'Residential & Corporate', text: 'Homes, condos, offices and events' },
  { icon: 'heart', title: 'Personalized Attention', text: 'Built around your exact needs' },
  { icon: 'clock', title: 'Convenience & Reliability', text: 'Handled promptly, every time' },
  { icon: 'pin', title: 'Toronto & Nearby', text: 'Toronto, Etobicoke, Mississauga & the GTA' },
] as const

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About Us' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/blog', label: 'Blogs' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
] as const

// Verified FAQ content. Seeded into MongoDB by `npm run seed`; also used as the fallback when the database is unreachable.
export const defaultFaqs = [
  {
    question: 'What services does The Convenient Concierge provide?',
    answer:
      'We offer three types of service: Moving, Pick-up & Delivery, and Tasks & Errands. That covers everything from home, condo and office moves to marketplace pickups, corporate deliveries, grocery runs, gift purchases and everyday errands.',
  },
  {
    question: 'Do you serve both residential and corporate customers?',
    answer:
      'Yes. We work with residential clients and with businesses, including corporate, private and event deliveries and office furniture moves.',
  },
  {
    question: 'Which areas do you service?',
    answer: `We service ${serviceAreas.slice(0, -1).join(', ')} and ${serviceAreas.at(-1)}, plus the surrounding GTA. Out-of-town deliveries are also available. Get in touch with the details and we will let you know.`,
  },
  {
    question: 'Do you provide moving assistance for smaller moves?',
    answer:
      'Yes. Alongside home, condo, apartment and office moves we handle small moves, single-item moves, heavy items, furniture and appliances, and movers-only services for loading and unloading.',
  },
  {
    question: 'Can you collect marketplace purchases?',
    answer:
      'Yes. We pick up purchases from Facebook Marketplace, IKEA, big-box stores, curbside retail and more, and deliver them to you.',
  },
  {
    question: 'Can you assist with grocery shopping and errands?',
    answer:
      'Absolutely. We handle groceries, shopping at any store, gift and card purchases, shop & ship and other everyday errands, including for clients who are out of town.',
  },
  {
    question: 'Do you offer furniture assembly or disassembly?',
    answer:
      'Yes. Furniture assembly and disassembly are part of our moving services. Let us know which items need it when you request your quote.',
  },
  {
    question: 'How do I request a delivery or moving quote?',
    answer:
      'Use our booking request form and choose Moving, Pick-up & Delivery, or Tasks & Errands. For moves, please download, fill in and attach our moving checklist. You can also call 647-457-5252 or email info@theconvenientconcierge.ca.',
  },
  {
    question: 'Do you publish fixed service prices?',
    answer:
      'No. Every request is different, so we do not publish fixed prices. Send us the details of what you need and we will contact you with a quote.',
  },
]
