/* =====================================================================
   SITE SETTINGS — Marc, this is the only file you need to edit for
   links, the contact form, testimonials and "currently learning".
   Save the file and refresh the page to see changes.
   ===================================================================== */
window.SITE_CONFIG = {

  /* ---------- Draft switch ----------
     true  → anything still containing "[TODO" shows on the page in a dashed style,
             so you can see what is missing (use this while editing).
     false → anything still containing "[TODO" is HIDDEN (use this when the site is live).
             If no hands-on jobs are left, the whole "Hands-on" section and its menu link hide. */
  SHOW_DRAFT_JOBS: false,

  /* ---------- Availability box (hero) ----------
     icon: 'search' | 'briefcase' | 'pin' | 'calendar' | 'clock' | 'chat'
     Replace each [TODO: …] with the real answer.                         */
  AVAILABILITY: [
    { icon: 'search',    label: 'Looking for', value: 'OJT · Internship · Junior IT role' },
    { icon: 'briefcase', label: 'Roles',       value: 'IT Support · Junior Web Developer' },
    { icon: 'pin',       label: 'Location',    value: 'South Caloocan City, Metro Manila — onsite' },
    { icon: 'calendar',  label: 'Can start',   value: 'December 2026 or January 2027' },
    { icon: 'clock',     label: 'OJT hours',   value: '600 hours required' },
    { icon: 'chat',      label: 'Languages',   value: 'English, Filipino' }
  ],

  /* ---------- Hands-on IT work (repair-ticket cards) ----------
     category: 'build' | 'repair' | 'network'
     photos:   [] = icon instead of a photo
               ['assets/jobs/001.jpg'] = one photo
               ['assets/jobs/001-before.jpg', 'assets/jobs/001-after.jpg'] = before/after slider
     Only add REAL jobs you did yourself. Copy a { … } block to add more.

     Example format only (NOT real, do not copy the words):
       problem: 'Laptop won't boot'
       action:  'Reset BIOS, reinstalled Windows 11, swapped HDD for SSD'
       result:  'Boots in about 15 seconds'                                    */
  IT_JOBS: [
    {
      id: '001',
      category: 'repair',
      title: '[TODO: e.g. Slow laptop upgrade]',
      date: '[TODO: Mon YYYY]',
      problem: '[TODO: what was wrong]',
      action: '[TODO: what Marc did]',
      result: '[TODO: the result, with a number if possible]',
      tools: ['[TODO: tools / parts used]'],
      photos: []
    },
    {
      id: '002',
      category: 'build',
      title: '[TODO: e.g. Custom gaming PC build]',
      date: '[TODO: Mon YYYY]',
      problem: '[TODO: what the client needed]',
      action: '[TODO: parts chosen and how Marc built it]',
      result: '[TODO: the result, with a number if possible]',
      tools: ['[TODO: tools / parts used]'],
      photos: []
    },
    {
      id: '003',
      category: 'network',
      title: '[TODO: e.g. Small office LAN setup]',
      date: '[TODO: Mon YYYY]',
      problem: '[TODO: what was wrong or needed]',
      action: '[TODO: what Marc set up (router, cabling, …)]',
      result: '[TODO: the result, with a number if possible]',
      tools: ['[TODO: tools / parts used]'],
      photos: []
    }
  ],

  /* ---------- Contact form ----------
     'formsubmit' → (DEFAULT, easiest) sends straight to CONTACT_EMAIL with FormSubmit.co.
                    No account needed. The FIRST message sends an "Activate form" email
                    to CONTACT_EMAIL — open it and click Activate once. After that, every
                    message goes straight to the Gmail inbox.
                    Works only when the site is opened from a web address
                    (Live Server, Netlify, GitHub Pages), not by double-clicking index.html.
     'formspree'  → needs a free Formspree account; put the form ID in FORMSPREE_ID.
     'php'        → uses contact.php (only on hosting that runs PHP).            */
  CONTACT_MODE: 'formsubmit',
  CONTACT_EMAIL: 'marcaustriapelayo@gmail.com',
  FORMSPREE_ID: '', // only for 'formspree' mode, e.g. 'xyzabcde' from https://formspree.io/f/xyzabcde

  /* "Email me" buttons: on computers, open Gmail in the browser (true),
     because many PCs have no mail app set up. Phones always use the mail app. */
  EMAIL_OPEN_GMAIL_ON_DESKTOP: true,

  /* ---------- Project buttons ----------
     demo   → video file path. The "Watch demo" button only shows if the file exists.
     live   → full URL of the live site. Empty '' = button hidden.
     github → full URL of the GitHub repo. Empty '' = button hidden.          */
  PROJECT_LINKS: {
    techworld: {
      demo:   'assets/techworld-demo.mp4',
      live:   '', // TODO (Marc): e.g. 'https://techworld.example.com'
      github: ''  // TODO (Marc): e.g. 'https://github.com/your-name/techworld'
    },
    scms: {
      demo:   'assets/scms-demo.mp4',
      live:   '', // TODO (Marc)
      github: ''  // TODO (Marc)
    }
  },

  /* ---------- Profile links (contact section + footer icons) ----------
     Empty '' = that contact row shows as plain text and its footer icon is hidden. */
  SOCIAL_LINKS: {
    github:   'https://github.com/Marcaustriapelayo',
    facebook: 'https://www.facebook.com/marc.pelayo.75',
    linkedin: 'https://www.linkedin.com/in/pelayo-marc-73b771451'
  },

  /* ---------- Testimonials ----------
     Only add REAL quotes from real people, with their permission.
     Empty list [] = the whole Testimonials section is hidden.
     Format (copy this, remove the // and fill it in):

     { quote: 'What they said about you…',
       name:  'Full Name',
       role:  'Job title, Company' },
  */
  TESTIMONIALS: [
  ],

  /* ---------- "Currently learning" strip (under the stats) ----------
     Empty list [] = strip hidden.                                          */
  LEARNING: [
    // e.g. 'Laravel', 'CCNA'
  ]
};
