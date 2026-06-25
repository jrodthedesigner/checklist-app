const Checklist = require('./models/Checklist');

/**
 * Default demo content. The public demo re-seeds to this so that visitor edits
 * — including anything inappropriate — never persist for long. Used on startup
 * and on a timer (see server.js), gated by the DEMO_RESET env var.
 */
const defaultChecklists = [
  {
    title: 'Weekend trip packing',
    color: '#f59e0b', // amber
    items: [
      { text: 'Passport & ID', priority: 'high', completed: true, order: 0 },
      { text: 'Charger & cables', priority: 'medium', completed: false, order: 1 },
      { text: 'Toiletries bag', priority: 'low', completed: true, order: 2 },
      { text: 'Refill prescriptions', priority: 'high', completed: false, order: 3 },
    ],
  },
  {
    title: 'Q3 product roadmap',
    color: '#3b82f6', // blue
    items: [
      { text: 'Finalize Q3 OKRs', priority: 'high', completed: true, order: 0 },
      { text: 'Ship onboarding redesign', priority: 'medium', completed: false, order: 1 },
      { text: 'Draft pricing experiment', priority: 'low', completed: false, order: 2 },
    ],
  },
  {
    title: 'Launch portfolio site',
    color: '#22c55e', // green
    items: [
      { text: 'Connect domain & SSL', priority: 'medium', completed: true, order: 0 },
      { text: 'Deploy across Atlas, Render & Netlify', priority: 'high', completed: true, order: 1 },
      { text: 'Final QA + Lighthouse pass', priority: 'medium', completed: false, order: 2 },
    ],
  },
];

/** Wipe the checklists collection and re-insert the default demo data. */
async function seedDatabase() {
  await Checklist.deleteMany({});
  await Checklist.insertMany(defaultChecklists);
  console.log(`Demo reset: seeded ${defaultChecklists.length} default checklists`);
}

module.exports = { seedDatabase, defaultChecklists };
