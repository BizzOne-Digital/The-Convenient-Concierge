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
  'East Mississauga',
] as const

export const serviceTypes = ['moving', 'delivery', 'tasks'] as const
export type ServiceType = (typeof serviceTypes)[number]

export type Service = {
  type: ServiceType
  slug: string
  name: string
  shortName: string
  icon: 'moving' | 'delivery' | 'tasks'
  summary: string
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
}

export const services: Service[] = [
  {
    type: 'moving',
    slug: 'moving',
    name: 'Moving',
    shortName: 'Moving',
    icon: 'moving',
    summary:
      "We make moving easier, whether you're relocating a home, condo, apartment, or office. From furniture and appliances to smaller moves, we help take the stress out of moving day.",
    intro:
      'We can move houses, condos and apartments. We also move appliances and provide junk removal and facilitate storage for staging for real-estate brokerages.',
    items: [
      'Furniture & Appliances',
      'Office Furniture',
      'Moving Helpers',
      'Junk Removal',
      'Heavy Items',
      'Bachelor & 1 Bedroom Units',
      'Home & Office Moves',
      'Micro Moves',
      'House or Condo Items to Storage',
      'Furniture Removal for Staging',
    ],
    notice: 'Please note: we do not offer disassembly or assembly services.',
    cta: 'Request a Moving Quote',
    cardCta: 'Explore Moving',
    images: [
      { src: '/images/services/moving-team.jpg', alt: 'Two movers carefully carrying a wrapped armchair through a bright home' },
      { src: '/images/services/moving-boxes.jpg', alt: 'Packed moving boxes, a rolled rug and a floor lamp ready in an empty room' },
    ],
    seo: {
      title: 'Moving Services in Toronto & Etobicoke',
      description:
        'Home, condo, apartment and office moves, furniture and appliances, micro moves, junk removal and staging removals across Toronto, Etobicoke and East Mississauga.',
    },
  },
  {
    type: 'delivery',
    slug: 'pick-up-delivery',
    name: 'Pick-up & Delivery',
    shortName: 'Delivery',
    icon: 'delivery',
    summary:
      'From retail and marketplace purchases to corporate, private, and event deliveries, we collect and deliver the items you need.',
    intro: 'The Convenient Concierge will pick up and deliver anything you may need.',
    items: [
      'Picking up your purchases such as curbside retail, Facebook Marketplace, IKEA, big-box retail and more, and delivering them to you',
      'Corporate Deliveries',
      'Private Deliveries',
      'Event Deliveries',
      'Out-of-Town Deliveries',
      'Construction Materials',
      'Garden Centre Pickups',
      'Donations Pick-up & Drop-off',
      'Penguin Pick-Ups',
      'Propane Tanks',
    ],
    highlights: ['Retail, Marketplace & IKEA pickups', 'Corporate Deliveries', 'Private Deliveries', 'Event Deliveries', 'Out-of-Town Deliveries', 'Donations Pick-up & Drop-off'],
    cta: 'Submit a Pickup / Delivery Request',
    cardCta: 'Explore Delivery',
    images: [
      { src: '/images/services/delivery-handoff.jpg', alt: 'A parcel being handed over at a front door' },
      { src: '/images/services/delivery-parcel.jpg', alt: 'A courier holding a sealed cardboard parcel' },
    ],
    seo: {
      title: 'Pick-up & Delivery Services in Toronto',
      description:
        'Marketplace, IKEA, big-box and curbside pickups, plus corporate, private, event and out-of-town deliveries across Toronto and nearby neighbourhoods.',
    },
  },
  {
    type: 'tasks',
    slug: 'tasks-errands',
    name: 'Tasks & Errands',
    shortName: 'Tasks & Errands',
    icon: 'tasks',
    summary:
      'From shopping and grocery runs to gift purchases and everyday errands, we take care of the tasks that fill up your day.',
    intro:
      'Life in Toronto can be fast-paced and demanding. Between work, family, and personal commitments, finding time to complete tasks and errands can be a challenge. At The Convenient Concierge, we understand the value of your time and aim to make your life easier by taking care of your tasks and errands efficiently and reliably.',
    items: [
      'Out-of-town client? No problem',
      'Gift & Card Purchases',
      'Pick-up & Delivery',
      'Shopping',
      'Groceries',
      'Shopping at All Stores',
      'Shop & Ship',
    ],
    benefits: ['Convenience', 'Reliability', 'Personalized Service', 'Local Expertise'],
    cta: 'Submit a Tasks & Errands Request',
    cardCta: 'Explore Tasks & Errands',
    images: [
      { src: '/images/services/errands-shopping.jpg', alt: 'A hand holding colourful shopping bags in a bright shopping arcade' },
      { src: '/images/services/errands-groceries.jpg', alt: 'A grocery cart moving down a well-stocked supermarket aisle' },
      { src: '/images/services/errands-gifts.jpg', alt: 'A stack of wrapped gifts tied with ribbon' },
    ],
    seo: {
      title: 'Tasks & Errands Concierge in Toronto',
      description:
        'Shopping, groceries, gift and card purchases, shop & ship and everyday errands handled for busy Toronto residents and out-of-town clients.',
    },
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
  { icon: 'pin', title: 'Toronto & Nearby', text: 'Downtown to East Mississauga' },
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
    answer: `We service ${serviceAreas.slice(0, -1).join(', ')} and ${serviceAreas.at(-1)}. Out-of-town deliveries are also available. Get in touch with the details and we will let you know.`,
  },
  {
    question: 'Do you provide moving assistance for smaller moves?',
    answer:
      'Yes. Alongside home and office moves we handle micro moves, bachelor and one-bedroom units, single heavy items, furniture and appliances, and moving helpers.',
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
      'No. We do not offer disassembly or assembly services. Please have furniture disassembled and ready before your move.',
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
