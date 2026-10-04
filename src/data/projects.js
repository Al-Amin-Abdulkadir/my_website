// NOTE: the site no longer reads this file — content comes from the CMS (/admin).
// It's kept as the source for cms-api/scripts/export_site_content.mjs (the one-time
// import into the database) and for the resizeCloudinaryImage helper.
const CDN = 'https://res.cloudinary.com/dkwmofqa1/image/upload/f_auto,q_auto'
const TQ = `${CDN}/assets/projects/tactiq-ui-cards`

export const designProjects = [
  // ── From the new design (covers cropped from Personal Website Redesign/UI:UX/work.png) ──
  {
    id: 'nomad',
    title: 'Nomad',
    category: 'Branding',
    description: 'Nomad is a fictional footwear brand built around movement, individuality, and life between destinations. The project explores visual identity, brand strategy, campaign direction, etc. “One Path. Everywhere”',
    tags: ['Footwear', 'Fashion', 'Branding', 'Fictional'],
    cover: '/images/projects/nomad.jpg',
    images: [],
    // The detail page, top to bottom (see ProjectDetail.jsx).
    // Text blocks go in once Alamin hands over the real copy, e.g.
    //   { type: 'text', align: 'left', body: '…' }
    blocks: [
      { type: 'image', src: '/images/projects/nomad.jpg', alt: 'Nomad shoebox packaging' },
      { type: 'image', src: '/images/projects/nomad-logo.jpg', alt: 'Nomad wordmark' },
    ],
    year: '2025',
  },
  {
    id: 'steward',
    title: 'Steward',
    category: 'UI/UX Design',
    description: 'Steward is a hotel operating system that combines operations, organizational knowledge, relationships, and controlled AI reasoning to help hotels understand their business and make better decisions.',
    cover: '/images/projects/steward.jpg',
    images: [],
    year: '2025',
  },
  {
    id: 'pulse',
    title: 'Pulse',
    category: 'UI/UX Design',
    description: 'Pulse is an AI-powered smart home platform designed to help homeowners to manage and automate their living environment.',
    cover: '/images/projects/pulse.jpg',
    images: [],
    year: '2025',
  },
  {
    id: 'kinetic',
    title: 'Kinetic',
    category: 'Branding',
    description: 'Kinetic is a fitness and movement platform designed to turn training data into actionable insights. The project explores a unified experience for tracking workouts and understanding performance.',
    cover: '/images/projects/kinetic.jpg',
    images: [],
    year: '2025',
  },
  // description: null → the design only had placeholder copy; Alamin will hand over the real text
  {
    id: 'mediconnect',
    title: 'MediConnect',
    category: 'UI/UX Design',
    description: null,
    cover: '/images/projects/mediconnect.jpg',
    images: [],
    year: '2025',
  },
  {
    id: 'house-7',
    title: 'House 7',
    category: 'UI/UX Design',
    description: null,
    cover: '/images/projects/house-7.jpg',
    images: [],
    year: '2025',
  },
  {
    id: 'jummai',
    title: 'Jummai',
    category: 'Branding',
    description: null,
    cover: '/images/projects/jummai.jpg',
    images: [],
    year: '2025',
  },
  // ── Existing projects ──
  {
    id: 'tactiq',
    title: 'Tactiq',
    category: 'UI/UX Design',
    tags: ['UI/UX', 'Sports Tech', 'App Design', 'Football'],
    description: 'Tactiq is an AI-powered football intelligence platform built to help coaches simulate tactics, analyze opponents, and turn match data into actionable insights.',
    cover: '/images/projects/tactiq.jpg',
    images: [
      `${TQ}/UI%20Card%2013.jpg`,
      `${TQ}/Tactical%20Dashboard%20page.jpg`,
      `${TQ}/Set%20piece%20simulator%20page.jpg`,
      `${TQ}/Mobile%20Tactical%20dashboardBoard.png`,
      `${TQ}/Iconic.jpg`,
      `${TQ}/UI%20Card%207.jpg`,
      `${TQ}/UI%20Card%208.jpg`,
      `${TQ}/UI%20Card%209%20II.jpg`,
      `${TQ}/UI%20Card%2010.jpg`,
      `${TQ}/UI%20Card%2011.jpg`,
      `${TQ}/UI%20Card%2012.jpg`,
      `${TQ}/UI%20Card%2014.jpg`,
      `${TQ}/UI%20Card%2015.jpg`,
      `${TQ}/UI%20Card%2016.jpg`,
      `${TQ}/UI%20Card%2017.jpg`,
      `${TQ}/UI%20Card%2018.jpg`,
    ],
    year: '2025',
  },
  {
    id: 'nebula-os',
    title: 'Nebula OS',
    category: 'UI/UX Design',
    tags: ['UI/UX', 'Web Design', 'Concept'],
    description: 'Nebula OS is a conceptual operating system for civilian space travel, designed to simplify the complexity of navigating and living in space.',
    cover: '/images/projects/nebula-os.jpg',
    images: [
      `${CDN}/assets/projects/nebula-os/Nebula%20OS%20Project/Nebula%20OS%20Dashboard%20Mockup.png`,
      `${CDN}/assets/projects/nebula-os/Nebula%20OS%20Project/IMAC%20gravity%20page%20Mockup.png`,
      `${CDN}/assets/projects/nebula-os/Nebula%20OS%20Project/Final%20Nebula%20post%20folder/Dashboard.png`,
      `${CDN}/assets/projects/nebula-os/Nebula%20OS%20Project/Final%20Nebula%20post%20folder/Gravity%20Page.png`,
      `${CDN}/assets/projects/nebula-os/Nebula%20OS%20Project/Final%20Nebula%20post%20folder/Comms%20Page.png`,
      `${CDN}/assets/projects/nebula-os/Nebula%20OS%20Project/Final%20Nebula%20post%20folder/Orbiital%20page.png`,
      `${CDN}/assets/projects/nebula-os/Nebula%20OS%20Project/Final%20Nebula%20post%20folder/Star%20Page.png`,
      `${CDN}/assets/projects/nebula-os/Nebula%20OS%20Project/Nebula%20OS%20Mobile%20Design/Mobile%20Dashboard.png`,
      `${CDN}/assets/projects/nebula-os/Nebula%20OS%20Project/Nebula%20OS%20Mobile%20Design/Mobile%20Gravity.png`,
      `${CDN}/assets/projects/nebula-os/Nebula%20OS%20Project/Nebula%20OS%20Mobile%20Design/Mobile%20Comms.png`,
      `${CDN}/assets/projects/nebula-os/Nebula%20OS%20Project/Nebula%20OS%20Mobile%20Design/Mobile%20Orbital.png`,
      `${CDN}/assets/projects/nebula-os/Nebula%20OS%20Project/Nebula%20OS%20Mobile%20Design/Mobile%20Star.png`,
    ],
    year: '2025',
  },
  {
    id: 'swellpine',
    title: 'Swellpine',
    category: 'UI/UX Design',
    tags: ['UI/UX', 'Mobile Design', 'AI', 'Concept'],
    description: 'An AI-powered botanical ecosystem app. Take a photo of any plant. Swellpine identifies it, tracks its vitals, and delivers personalised care rituals.',
    cover: `${CDN}/assets/projects/swellpine/Swellpine%20Design/Swellpine%20Mockup%201.png`,
    images: [
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/Swellpine%20Mockup%201.png`,
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/Swellpine%20Mockup%202.png`,
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/swellpine%20mockup%204.png`,
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/Swellpine%20Mockup%205.png`,
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/Swellpine%20home%20mockup.png`,
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/Iphone%2017%20Dashboard.png`,
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/Mobile%20Home%2017.png`,
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/swellpine%20mobile%20catalog%20mockup.png`,
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/swellpine%20mobile%20login%20mockup.png`,
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/swellpine%20mobile%20price%20card%20mockup.png`,
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/swellpine%20signup%20mockup.png`,
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/swellpine%20mobile%20active%20cart%20mockup.png`,
      `${CDN}/assets/projects/swellpine/Swellpine%20Design/Swellpine%20Mobile%20Mockup.png`,
    ],
    year: '2025',
  },
  {
    id: 'noir-brutalism',
    title: 'Noir Brutalism',
    category: 'Editorial Design',
    tags: ['Magazine', 'Editorial', 'Print Design'],
    description: 'A magazine concept rooted in brutalist architecture. Heavy structures, strong geometry, and the tension between human scale and monumental form.',
    cover: `${CDN}/assets/projects/noir-brutalism/Noir%20Brutalism/Cover%20page.png`,
    coverPosition: 'top',   // tall magazine cover — keep the masthead in view
    images: [
      `${CDN}/assets/projects/noir-brutalism/Noir%20Brutalism/Cover%20page.png`,
      `${CDN}/assets/projects/noir-brutalism/Noir%20Brutalism/page%202.png`,
      `${CDN}/assets/projects/noir-brutalism/Noir%20Brutalism/Page%201.png`,
      `${CDN}/assets/projects/noir-brutalism/Noir%20Brutalism/Page%203.png`,
      `${CDN}/assets/projects/noir-brutalism/Noir%20Brutalism/Page%204.png`,
      `${CDN}/assets/projects/noir-brutalism/Noir%20Brutalism/Page%205.png`,
      `${CDN}/assets/projects/noir-brutalism/Noir%20Brutalism/Page%206.png`,
      `${CDN}/assets/projects/noir-brutalism/Noir%20Brutalism/Page%207.png`,
      `${CDN}/assets/projects/noir-brutalism/Noir%20Brutalism/Page%208.png`,
      `${CDN}/assets/projects/noir-brutalism/Noir%20Brutalism/Back%20page.png`,
    ],
    year: '2025',
  },
]

export const techProjects = [
  {
    id: 'websocket-chat',
    title: 'WebSocket Chat',
    category: 'Full-Stack Web App',
    tags: ['Python', 'FastAPI', 'WebSocket', 'HTML/CSS', 'JavaScript'],
    description: 'A real-time chat application built on a persistent two-way connection. Built to understand how WebSocket architecture works at the protocol level.',
    cover: `${CDN}/assets/projects/other/Web-Socket-Chat-API/main%20app.png`,
    images: [
      `${CDN}/assets/projects/other/Web-Socket-Chat-API/main%20app.png`,
      `${CDN}/assets/projects/other/Web-Socket-Chat-API/Screenshot%202026-05-12%20at%201.51.12%20PM.png`,
      `${CDN}/assets/projects/other/Web-Socket-Chat-API/Screenshot%202026-05-12%20at%201.51.15%20PM.png`,
      `${CDN}/assets/projects/other/Web-Socket-Chat-API/Websocket%20code.png`,
    ],
    year: '2025',
    status: 'Completed',
  },
  {
    id: 'salary-prediction',
    title: 'Salary Prediction ML',
    category: 'Machine Learning',
    tags: ['Python', 'Scikit-learn', 'Pandas', 'Matplotlib', 'Linear Regression'],
    description: 'A model comparison experiment. Trained Linear Regression, Decision Tree, and Random Forest on salary data. Linear Regression won with an MAE of 2500 and r2 of 0.99.',
    cover: `${CDN}/assets/projects/other/salary_prediction/IMG_3981.jpg`,
    images: [
      `${CDN}/assets/projects/other/salary_prediction/IMG_3981.jpg`,
      `${CDN}/assets/projects/other/salary_prediction/IMG_3982.jpg`,
    ],
    year: '2025',
    status: 'Completed',
  },
  {
    id: 'mylife-app',
    title: 'MyLife App',
    category: 'Full-Stack Web App',
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'HTML/CSS', 'JWT'],
    description: 'A full-stack productivity platform. Tasks, finances, fitness, and calendar, all in one clean interface. Built backend-first from scratch.',
    cover: `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3962%202.jpg`,
    images: [
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3962%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3963%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3964%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3965%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3966%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3967%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3968%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3969%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3970%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3971%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3972%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3973%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3974%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3975%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3976%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3977%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3978%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3979%202.jpg`,
      `${CDN}/assets/projects/mylife-app/MyLife_App/IMG_3980%202.jpg`,
    ],
    github: 'https://github.com/Al-Amin-Abdulkadir/MyLife-App.git',
    year: '2025',
    status: 'Completed',
  },
]

// A project's detail page is a list of blocks: { type: 'image', src } or
// { type: 'text', align: 'left' | 'right', body }. Projects without hand-made
// blocks get one image block per photo they have (or just their cover).
export function getProjectBlocks(project) {
  if (project.blocks) return project.blocks

  const photos = project.images.length > 0 ? project.images : [project.cover]
  return photos.map((src, index) => ({
    type: 'image',
    src,
    alt: `${project.title} — image ${index + 1}`,
  }))
}

// Old projects' images live on Cloudinary at full size. Asking Cloudinary for a
// width avoids downloading 5000px images for a 1400px slot. Local images pass through.
export function resizeCloudinaryImage(url, width) {
  if (!url.includes('res.cloudinary.com')) return url
  return url.replace('/upload/f_auto,q_auto', `/upload/f_auto,q_auto,w_${width}`)
}

// Every project in one list, for looking a project up by its id
export const allProjects = [...designProjects, ...techProjects]

export function findProject(id) {
  return allProjects.find((project) => project.id === id)
}

// The Projects page, top to bottom. Two row types from the design:
//   feature → one full-width image, title left, description right
//   pair    → one large + one small image side by side; `largeSide` alternates
// Reordering the page = reordering this list.
export const projectsPageRows = [
  { type: 'feature', project: 'nomad' },
  { type: 'pair', large: 'steward', small: 'pulse', largeSide: 'left' },
  { type: 'feature', project: 'kinetic' },
  { type: 'pair', large: 'nebula-os', small: 'tactiq', largeSide: 'right' },
  { type: 'feature', project: 'mediconnect' },
  { type: 'pair', large: 'house-7', small: 'jummai', largeSide: 'left' },
  // Older projects, continuing the same rhythm
  { type: 'feature', project: 'swellpine' },
  { type: 'pair', large: 'noir-brutalism', small: 'websocket-chat', largeSide: 'right' },
  { type: 'pair', large: 'mylife-app', small: 'salary-prediction', largeSide: 'left' },
]

export const firstStepMedia = {
  editorial: [
    `${CDN}/assets/firststepmedia/editorial/ELVNT.png`,
    `${CDN}/assets/firststepmedia/editorial/ELVNT%20II.png`,
    `${CDN}/assets/firststepmedia/editorial/Aurelith.png`,
    `${CDN}/assets/firststepmedia/editorial/Suits.png`,
    `${CDN}/assets/firststepmedia/editorial/Gaze.png`,
    `${CDN}/assets/firststepmedia/editorial/Gaze-1.png`,
    `${CDN}/assets/firststepmedia/editorial/Warren%20Buffet.png`,
    `${CDN}/assets/firststepmedia/editorial/Tiffany.png`,
    `${CDN}/assets/firststepmedia/editorial/Carry.png`,
    `${CDN}/assets/firststepmedia/editorial/Magazine.png`,
    `${CDN}/assets/firststepmedia/editorial/Emarald.png`,
    `${CDN}/assets/firststepmedia/editorial/Studio%20Design%20Special%20I.png`,
    `${CDN}/assets/firststepmedia/editorial/Studio%20Design%20Special%20II.png`,
    `${CDN}/assets/firststepmedia/editorial/Studio%20Design%20Special%20III.png`,
    `${CDN}/assets/firststepmedia/editorial/Studio%20Design%20Special%20IV.png`,
    `${CDN}/assets/firststepmedia/editorial/Studio%20Design%20Special%20V.png`,
    `${CDN}/assets/firststepmedia/editorial/Studio%20Design%20Special%20VI.png`,
    `${CDN}/assets/firststepmedia/editorial/Studio%20Design%20Special%20VII.png`,
    `${CDN}/assets/firststepmedia/editorial/1.png`,
    `${CDN}/assets/firststepmedia/editorial/2.png`,
    `${CDN}/assets/firststepmedia/editorial/3.png`,
    `${CDN}/assets/firststepmedia/editorial/4.png`,
    `${CDN}/assets/firststepmedia/editorial/5.png`,
    `${CDN}/assets/firststepmedia/editorial/6.png`,
    `${CDN}/assets/firststepmedia/editorial/7.png`,
    `${CDN}/assets/firststepmedia/editorial/8.png`,
    `${CDN}/assets/firststepmedia/editorial/9.png`,
  ],
  posters: [
    `${CDN}/assets/firststepmedia/posters/Ancient.png`,
    `${CDN}/assets/firststepmedia/posters/Eiffel%20Tower.png`,
    `${CDN}/assets/firststepmedia/posters/Emarald.png`,
    `${CDN}/assets/firststepmedia/posters/Blank.png`,
    `${CDN}/assets/firststepmedia/posters/Carry.png`,
  ],
  heroPages: [
    `${CDN}/assets/firststepmedia/hero%20pages/CoreAI.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Aerune.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Tokyo.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Ronin.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Vertiq%20AI.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Altiora.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Atherix.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Duneway.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Earth.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/G.A.I.A.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Gargantua.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Kinto%20Hero%20page.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Paris.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Sahara%20Trave.png`,
    `${CDN}/assets/firststepmedia/hero%20pages/Swellpine.png`,
  ],
  branding: [
    `${CDN}/assets/firststepmedia/branding/53.png`,
    `${CDN}/assets/firststepmedia/branding/54.png`,
    `${CDN}/assets/firststepmedia/branding/56.png`,
  ],
}
