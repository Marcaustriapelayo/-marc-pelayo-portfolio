# Marc Adrian Pelayo — Portfolio

**Live site:** <https://marc-pelayo-portfolio.vercel.app>

A plain HTML, CSS and JavaScript website. No installs, no build step: open `index.html` in a browser and it works.

## What's in the folder

| File / folder | What it is |
|---|---|
| `index.html` | The home page |
| `techworld.html`, `scms.html` | The two case-study pages |
| `404.html` | The "Component not found" page shown for broken links |
| `css/style.css` | All the styles (colors and animation speeds are at the top) |
| `js/config.js` | **Your settings: links, contact form, testimonials, "currently learning"** |
| `js/main.js` | All the interactive features (you normally don't need to touch this) |
| `js/theme-init.js` | Picks light/dark mode and decides whether the boot intro plays |
| `contact.php` | Contact form sender (only for hosting that runs PHP) |
| `assets/` | Images, icons, QR code, share image |
| `Marc-Adrian-Pelayo-CV.pdf` | Your CV (used by every "Download CV" button) |
| `robots.txt`, `sitemap.xml` | Help Google find the site |
| `tools/` | Small scripts that make the share image, icons and QR code |

---

## 1. Edit your links, testimonials and learning items

Open **`js/config.js`** in VS Code. Everything you need is there, with notes. Save, then refresh the browser.

### Draft mode (`SHOW_DRAFT_JOBS`)
Anything still marked `[TODO …]` shows on the page in a dashed blue box while `SHOW_DRAFT_JOBS: true`, so you can see what's missing.
**Before the site goes live, set it to `false`**: every unfinished `[TODO]` (jobs, availability rows, "My part" lines, the rider-job number) is then hidden automatically.

### Availability box (`AVAILABILITY`)
The rows in the box under the hero buttons. Replace each `[TODO: …]` with the real answer.

### Hands-on IT work (`IT_JOBS`)
Each `{ … }` block is one "repair ticket" card: `id`, `category` (`'build'`, `'repair'` or `'network'`), `title`, `date`, `problem`, `action`, `result`, `tools`, `photos`.
Photos go in `assets/jobs/` (see `assets/jobs/README.txt`). Two photos = a before/after slider; no photo = an icon.
Only add jobs you really did.

### Project buttons (Live demo, GitHub)
```js
PROJECT_LINKS: {
  techworld: { demo: 'assets/techworld-demo.mp4', live: 'https://…', github: 'https://github.com/…' },
  scms:      { demo: 'assets/scms-demo.mp4',      live: '',          github: '' }
}
```
- Put the full address (starting with `https://`) between the quotes.
- Leave it as `''` (empty) and the button stays hidden.

### GitHub, Facebook, LinkedIn
```js
SOCIAL_LINKS: {
  github:   'https://github.com/Marcaustriapelayo',
  facebook: 'https://www.facebook.com/marc.pelayo.75',
  linkedin: 'https://www.linkedin.com/in/pelayo-marc-73b771451'
}
```
These drive the icon rows in the Contact section and the round icons in the footer.
Empty `''` = that contact row shows as plain text and its footer icon is hidden. Add the URL and both become links.

### Testimonials
Only add **real** quotes from real people who agreed to be quoted.
```js
TESTIMONIALS: [
  { quote: 'What they said…', name: 'Full Name', role: 'Job title, Company' },
  { quote: '…', name: '…', role: '…' }
]
```
- Empty list `[]` = the Testimonials section **and** its menu link are hidden.
- When you add quotes, the section appears and the menu numbers update by themselves (Contact becomes 06).
- The round avatar shows the person's initials automatically.

### "Currently learning" strip
```js
LEARNING: ['Laravel', 'CCNA']
```
These two are **placeholders**: change them to what you are really learning. Empty list `[]` hides the strip.

---

## 2. Add the demo videos

1. Record a short screen video of each system (1–2 minutes is enough). Export as **MP4** (H.264).
2. Keep each file small, ideally under 20–30 MB. You can shrink it with HandBrake (free; use the "Fast 1080p30" preset).
3. Name them exactly:
   - `assets/techworld-demo.mp4`
   - `assets/scms-demo.mp4`
4. Put them in the `assets` folder. That's it. The **"Watch demo"** button appears by itself when the file exists, and the video opens in the full-screen viewer.

> Netlify drag-and-drop and GitHub have file size limits (GitHub: 100 MB per file). If your video is bigger, upload it to YouTube instead and put that link in `live`.

---

## 3. Set up the contact form

Pick **one** option in `js/config.js`:

### Contact form (EmailJS) — the default
EmailJS sends each message using **your own email designs**. The templates are in `tools/email-templates/`:
- `notification.html`: the email **you** receive.
- `auto-reply.html`: the "thank you" email the visitor receives (optional).

`tools/` is kept off GitHub, so the templates only live on your computer. You paste them into EmailJS once.

1. Sign up free at <https://www.emailjs.com>.
2. **Email Services → Add New Service → Gmail.** Connect marcaustriapelayo@gmail.com. Copy the **Service ID**.
3. **Email Templates → Create New Template** (do this twice):
   - **Notification:** set "To Email" to your Gmail, set "Reply To" to `{{email}}`, and paste `notification.html` into the HTML/code editor. Copy its **Template ID**.
   - **Auto-reply:** set "To Email" to `{{email}}` and paste `auto-reply.html`. Copy its **Template ID**.
4. **Account → General:** copy the **Public Key**.
5. Paste the 4 values into `EMAILJS` in `js/config.js`, keep `CONTACT_MODE: 'emailjs'`, then commit and push.

The templates can use these values: `{{name}}`, `{{email}}`, `{{subject}}`, `{{message}}`, `{{time}}` (Philippine Time), `{{page}}`, `{{device}}` (e.g. "iPhone · Safari") and `{{site}}`.

- **Not set up yet?** While any of the first three values still says `PASTE_…` (or EmailJS can't load), the form automatically uses FormSubmit (below), so it keeps working.
- **No auto-reply?** Set `autoReplyTemplateId: ''`. If only the auto-reply fails, the visitor still sees "sent", because the message did reach you.

### Option 0: FormSubmit (automatic fallback, no account needed)
```js
CONTACT_MODE: 'formsubmit',   // or leave 'emailjs': FormSubmit is used until EmailJS is set up
CONTACT_EMAIL: 'marcaustriapelayo@gmail.com',
```
1. Open the site from a **web address** (Live Server in VS Code, or the live site). It does not work when you double-click `index.html` (`file://`).
2. Send one test message. FormSubmit emails an **"Activate Form"** message to `CONTACT_EMAIL` (check Spam too). Click **Activate** once.
3. From then on, every message lands in that Gmail inbox. Press Reply in Gmail to answer the sender directly.

**"Email me" buttons:** with `EMAIL_OPEN_GMAIL_ON_DESKTOP: true`, a normal click on a computer opens Gmail's "new message" page in a new tab, with the address and subject filled in (many PCs have no mail app). Phones keep the normal mail-app link. Ctrl/Shift-click still opens the plain `mailto:` link.

### Option A: Formspree (needs a free account)
1. Go to <https://formspree.io>, make a free account, and create a new form.
2. Formspree shows a URL like `https://formspree.io/f/xyzabcde`. Copy the last part (`xyzabcde`).
3. In `js/config.js`:
   ```js
   CONTACT_MODE: 'formspree',
   FORMSPREE_ID: 'xyzabcde',
   ```
4. Send yourself a test message from the live site. The first time, Formspree asks you to confirm your email.

Until you add the ID, the form shows a friendly message asking people to email you directly. It never pretends a message was sent.

### Option B: PHP (only on hosting with PHP, e.g. Hostinger or cPanel)
1. In `js/config.js` set `CONTACT_MODE: 'php'`.
2. Upload the whole folder, including `contact.php`.
3. If emails don't arrive, open `contact.php` and set `FROM_EMAIL` to an address on your own domain (for example `no-reply@marcpelayo.dev`). Many hosts require this.

PHP does **not** run on GitHub Pages, Netlify or Vercel. Use Formspree there.

Both options include spam protection (a hidden "honeypot" field that only bots fill in).

---

## 4. Put the site online for free

**Before uploading**, you can leave out these files (they are only for editing): `CLAUDE_CODE_PROMPT*.md`, the `Design System` folder and the `tools` folder.

### Netlify (easiest — drag and drop)
1. Go to <https://app.netlify.com/drop> and sign up (free).
2. Drag the whole `PELAYO_PORTFOLIO` folder onto the page.
3. Wait a few seconds. Netlify gives you an address like `https://something-123.netlify.app`.
4. To change that name: **Site configuration → Change site name** (e.g. `marcpelayo.netlify.app`).
5. To update later: open your site in Netlify → **Deploys** → drag the folder again.

### GitHub Pages
1. Make a free account at <https://github.com>.
2. Click **New repository**. Name it `marcpelayo` (or name it `YOUR-USERNAME.github.io` to get the shortest address). Set it to **Public** → **Create repository**.
3. Click **uploading an existing file**, drag in all the files and folders, then click **Commit changes**.
4. Go to **Settings → Pages**. Under "Branch" choose `main` and `/ (root)` → **Save**.
5. After 1–2 minutes your site is live at `https://YOUR-USERNAME.github.io/marcpelayo/` (or `https://YOUR-USERNAME.github.io/`).

All links in the site are relative, so it works on Netlify, Vercel and GitHub Pages without changes. The 404 page works on both Netlify and GitHub Pages automatically.

---

## 5. Connect your own domain (e.g. `marcpelayo.dev`)

1. Buy the domain (Namecheap, Porkbun, Cloudflare and similar; usually ₱600–1,000 a year).
2. Connect it:
   - **Netlify:** Domain management → **Add a domain** → follow the steps (Netlify tells you which DNS records to add at your domain seller).
   - **GitHub Pages:** Settings → Pages → **Custom domain** → type `marcpelayo.dev` → Save. At your domain seller, add the DNS records GitHub shows you. Then tick **Enforce HTTPS**.
3. **Then update these placeholders** (search for `YOUR-DOMAIN` in VS Code with Ctrl+Shift+F and replace them all):
   - `index.html`, `techworld.html`, `scms.html`: the `og:url`, `og:image`, `twitter:image` and `canonical` lines in the `<head>`
   - `sitemap.xml`
   - `robots.txt`
4. **Make a new QR code** that points to the real address:
   ```
   pip install "qrcode[pil]"
   python tools/make_qr.py https://marcpelayo.dev/
   ```
   This replaces `assets/portfolio-qr.png` and `assets/portfolio-qr.svg`. Scan it with your phone to check.
5. Test the link preview: paste your URL into <https://www.opengraph.xyz> (or a Messenger chat).

---

## 6. Analytics (optional, free, no cookie banner needed)

In the `<head>` of `index.html` there is a commented-out analytics block. Pick one:
- **GoatCounter** (<https://www.goatcounter.com>): sign up, choose a code (e.g. `marcpelayo`), replace `YOUR-CODE`, and remove the `<!--` `-->` marks around that one line.
- **Cloudflare Web Analytics**: add your site in Cloudflare, copy the token, replace `YOUR-TOKEN`, and uncomment that line.

Do the same in `techworld.html` and `scms.html` if you want those pages counted.

---

## 7. Other things you can change

- **Phone number** (0926 939 1284): it's in the Contact list and the footer icons of all three pages. Search for `639269391284` to change it (keep the `tel:+63…` format for the link).
- **"What does your team need?" section:** the five branches (skills, proof, next-step button and email subject) are in the `NEEDS` list in `js/main.js`. Each branch has its own shareable link: `#need-it`, `#need-web`, `#need-analyst`, `#need-network`, `#need-ojt` (e.g. `https://YOUR-DOMAIN/#need-web`).

- **Case-study text:** search for `TODO (Marc)` in `techworld.html` and `scms.html`. Each one has a "Coming soon" line next to it. Replace both with your own words.
- **The boot intro** plays only the first time someone visits. To see it again, click **↻ Reboot** in the footer. To change its text, edit the lines inside `<div class="boot-lines">` in `index.html`.
- **Animation speeds and colors:** the top of `css/style.css` (`--blob-speed`, `--type-speed`, …).
- **Share image** (`assets/og-image.png`) and **app icon:** edit `tools/og-image.html` or `tools/icon.html`, then run `node tools/render.js` (needs Chrome or Edge installed).
- **New screenshots:** keep them around 1400–1600 px wide and save as JPG (quality ~80) so the site stays fast.

## Accessibility & motion

- Everything works with the keyboard (Tab, Enter, Space, Esc).
- If a visitor's device is set to "reduce motion", the boot intro is skipped and every animation shows a calm, still version.
