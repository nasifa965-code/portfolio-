# Personal Portfolio — Vanilla HTML/CSS/JS

A single-page, self-contained portfolio site: animated purple background,
cursor-reactive 3D tilt cards, glassmorphism panels, and an in-browser
"Edit Mode" for swapping images and adding/removing projects (persisted to
`localStorage`, since GitHub Pages has no backend).

No build step, no framework, no paid dependencies — just open `index.html`
or deploy the folder as-is.

## File structure

```
portfolio-vanilla/
├── index.html            All markup / page structure
├── css/
│   └── styles.css        All styling, animations, responsive rules
├── js/
│   ├── data.js            <-- YOUR CONTENT LIVES HERE
│   └── script.js          Rendering logic, tilt effect, edit mode
├── assets/
│   ├── images/            Placeholder profile + project images (SVG)
│   └── resume/             Put your resume.pdf here
└── README.md
```

## 1. Customize your content

Everything you'll want to change lives in **`js/data.js`**:

- `personal` — name, role, tagline, bio, email, photo path, resume path
- `social` — GitHub / LinkedIn / email / Twitter links (leave a value blank to hide it)
- `nav` — the nav bar / footer links
- `skills` — skill name + proficiency (0–100) for the animated bars
- `tools` — freeform tag list (tech stack, tools)
- `projects` — array of project cards (title, description, image, tech, links)
- `timeline` — experience/education entries, newest first

You should not need to edit `index.html`, `styles.css`, or `script.js` just
to update your info.

## 2. Add your real images and resume

- Replace `assets/images/profile-placeholder.svg` with your photo, and
  update `personal.photo` in `data.js` to point to it (or just upload it
  live via **Edit Mode**, see below).
- Replace the placeholder project images the same way.
- Add your resume as `assets/resume/resume.pdf` (the download button in
  the Resume section already points at this path).

## 3. Edit Mode — edit everything in the browser, then export

Click the **Edit Mode** toggle in the top-right corner. While it's on,
almost everything on the page becomes directly editable:

- **Name, role, tagline, and bio** — click into the text and type; changes
  save automatically when you click away.
- **Social links** — an editable URL field appears under each link
  (GitHub, LinkedIn, email, Twitter). Leave one blank to hide that link.
- **Skills** — the skill name is editable text, and a slider lets you
  adjust the proficiency percentage live.
- **Timeline entries** — period, title, organization, and description are
  all editable in place.
- **Profile photo** — hover it to reveal an **Upload photo** button.
- **Projects** — each card gets a small **✎** (edit) button to change its
  title/description/tech/links/image, and a **×** button to remove it. A
  **+ Add Project** button above the grid adds a new card.

**Important — this is a static site with no backend:** every edit above is
saved to the browser's `localStorage`, so it:

- ✅ persists across refreshes, on the same browser/device
- ❌ is **not** visible to other visitors on its own — localStorage is
  per-browser, it doesn't publish anything

### Making your edits live: the Export button

Once things look right, click **Export Changes** (next to the Edit Mode
toggle). This downloads:

1. An updated **`data.js`** containing everything you edited — text,
   links, skills, timeline, and the final project list.
2. Any images you uploaded, as separate files (e.g. `profile-photo.png`,
   `project-local-….png`).

To publish: move the downloaded image file(s) into `assets/images/`,
replace your old `js/data.js` with the downloaded one, then commit and
push. That's the whole "edit whenever you want, ship when you're ready"
workflow for a backend-free site.

If you'd rather have edits go live for every visitor immediately (not just
after an export + push), that requires real server-side storage — e.g.
upload images to Cloudinary/Supabase Storage/S3 and store the resulting
URLs, or point `script.js` at a headless CMS (Sanity, Contentful) or a
small API instead of `data.js`. The export step above is a deliberate
middle ground: no hosting costs, no backend to maintain, but still a real
editing workflow instead of hand-editing JSON.

## 4. Contact form

The contact form has no backend by default — submitting it just logs to
the console and shows a demo message. To make it actually send email,
open `js/script.js`, find `initContactForm()` / `handleSubmit()`, and
point it at a form service such as:

- [Formspree](https://formspree.io) (free tier, no backend needed)
- [EmailJS](https://www.emailjs.com)
- Your own serverless function / API endpoint

## 5. Run it locally

No build tools needed. Either:

- Open `index.html` directly in a browser, or
- Serve it locally (recommended, avoids some browser file:// restrictions):

```bash
# Python 3
python -m http.server 8000
# then visit http://localhost:8000
```

## 6. Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Initial portfolio commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Then on GitHub:

1. Go to your repo → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to `Deploy from a branch`
3. Set **Branch** to `main` and folder to `/ (root)`, then **Save**
4. Wait a minute, then visit `https://<your-username>.github.io/<your-repo>/`

### Alternative: Vercel or Netlify

Both platforms auto-detect a static site with no build command needed.

- **Vercel**: `vercel` CLI or import the repo at vercel.com → Framework
  Preset: "Other" → deploy.
- **Netlify**: drag-and-drop the folder at app.netlify.com/drop, or connect
  the repo with build command left blank and publish directory `/`.

## 7. Performance notes

- All images use `loading="lazy"`.
- Background blobs and tilt effect animate only `transform`/`opacity`
  (GPU-accelerated), never layout-triggering properties.
- The tilt effect is skipped entirely on touch devices
  (`matchMedia("(hover: hover) and (pointer: fine)")`) and respects
  `prefers-reduced-motion`.

## What you need to customize (quick checklist)

- [ ] `js/data.js` → name, role, tagline, bio, email, social links
- [ ] `assets/images/profile-placeholder.svg` → your real profile photo
- [ ] `js/data.js` → `projects` array → your real projects, images, links
- [ ] `assets/resume/resume.pdf` → your real resume
- [ ] `js/data.js` → `timeline` → your real experience/education
- [ ] `js/script.js` → `handleSubmit()` → connect a real form backend
      (optional, form works as a demo without this)
