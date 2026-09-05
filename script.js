/**
 * ============================================================
 *  script.js
 *  - Renders content from data.js into the page
 *  - Handles the cursor-reactive 3D tilt effect
 *  - Handles "Edit Mode": inline text editing (name, role, tagline,
 *    bio, social links, skills, timeline), image upload, and full
 *    project add/edit/remove — everything persisted to localStorage
 *    since GitHub Pages has no backend.
 *  - Provides an "Export Changes" button that bundles all current
 *    edits + uploaded images into a ready-to-commit data.js file
 *    plus downloadable image files, so edits made in the browser
 *    can actually be pushed to the live site.
 *
 *  NOTE ON PERSISTENCE:
 *  Everything you edit here is stored in the browser's localStorage,
 *  because GitHub Pages has no backend to save to permanently or
 *  share across devices. That means:
 *    - Edits persist across refreshes on the SAME browser/device.
 *    - Edits are NOT visible to other visitors — localStorage is
 *      per-browser, it doesn't publish anything on its own.
 *  Use Edit Mode to get everything looking right, then click
 *  "Export Changes" to download an updated data.js (and any
 *  uploaded images) — move the images into assets/images/, replace
 *  your old js/data.js with the downloaded one, commit, and push.
 *  That's what actually updates the live site.
 * ============================================================
 */

const STORAGE_KEYS = {
  editMode: "portfolio.editMode",
  profilePhoto: "portfolio.profilePhoto",
  extraProjects: "portfolio.extraProjects",
  removedProjectIds: "portfolio.removedProjectIds",
  projectOverrides: "portfolio.projectOverrides", // {[id]: {title, description, tech, liveUrl, repoUrl, image}}
  textOverrides: "portfolio.textOverrides" // deep partial over personal/social/skills/timeline
};

/* ---------- small utils ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const el = (tag, props = {}, children = []) => {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("data-")) node.setAttribute(k, v);
    else node[k] = v;
  });
  children.forEach((c) => node.appendChild(c));
  return node;
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage write failed (storage may be full):", e);
  }
}

function setPath(obj, path, value) {
  const keys = path.split(".");
  let node = obj;
  keys.slice(0, -1).forEach((k) => {
    if (typeof node[k] !== "object" || node[k] === null) node[k] = {};
    node = node[k];
  });
  node[keys[keys.length - 1]] = value;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ============================================================
   EFFECTIVE DATA — SITE_DATA + your saved edits, merged
   ============================================================ */
function getTextOverrides() {
  return readJSON(STORAGE_KEYS.textOverrides, {});
}
function saveField(path, value) {
  const overrides = getTextOverrides();
  setPath(overrides, path, value);
  writeJSON(STORAGE_KEYS.textOverrides, overrides);
}

function getEffectivePersonal() {
  const o = getTextOverrides();
  return { ...SITE_DATA.personal, ...(o.personal || {}) };
}
function getEffectiveSocial() {
  const o = getTextOverrides();
  return { ...SITE_DATA.social, ...(o.social || {}) };
}
function getEffectiveSkills() {
  const o = getTextOverrides();
  const skillOverrides = o.skills || {};
  return SITE_DATA.skills.map((s, i) => ({ ...s, ...(skillOverrides[i] || {}) }));
}
function getEffectiveTimeline() {
  const o = getTextOverrides();
  const timelineOverrides = o.timeline || {};
  return SITE_DATA.timeline.map((t, i) => ({ ...t, ...(timelineOverrides[i] || {}) }));
}
function getEffectiveProjects() {
  const extra = readJSON(STORAGE_KEYS.extraProjects, []);
  const removed = new Set(readJSON(STORAGE_KEYS.removedProjectIds, []));
  const overrides = readJSON(STORAGE_KEYS.projectOverrides, {});

  return [...SITE_DATA.projects, ...extra]
    .filter((p) => !removed.has(p.id))
    .map((p) => ({ ...p, ...(overrides[p.id] || {}) }));
}

/* ============================================================
   GENERIC INLINE-EDITABLE TEXT FIELDS
   Any element with [data-edit-path] becomes contenteditable
   while Edit Mode is on, and saves to localStorage on blur.
   data-multiline="true" fields (the bio) split on blank lines
   into paragraphs/array items on save.
   ============================================================ */
function bindEditableFields() {
  $$("[data-edit-path]").forEach((node) => {
    if (node.dataset.editableBound) return;
    node.dataset.editableBound = "true";

    node.addEventListener("blur", () => {
      const path = node.dataset.editPath;
      const text = node.innerText !== undefined ? node.innerText : node.textContent;
      if (node.dataset.multiline === "true") {
        const paragraphs = text
          .split(/\n{1,}/)
          .map((p) => p.trim())
          .filter(Boolean);
        saveField(path, paragraphs);
      } else {
        saveField(path, text.trim());
      }
    });

    // Prevent Enter from inserting newlines in single-line fields
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && node.dataset.multiline !== "true") {
        e.preventDefault();
        node.blur();
      }
    });
  });
}

function applyEditModeToFields(on) {
  $$("[data-edit-path]").forEach((node) => {
    node.contentEditable = on ? "true" : "false";
    node.setAttribute("spellcheck", on ? "true" : "false");
  });
}

/* ============================================================
   RENDER: static text content
   ============================================================ */
function renderPersonalInfo() {
  const personal = getEffectivePersonal();
  const social = getEffectiveSocial();

  document.title = `${personal.name} — Portfolio`;
  $("#hero-role").textContent = personal.role;
  $("#hero-name").textContent = personal.name;
  $("#hero-tagline").textContent = personal.tagline;
  $("#nav-brand").textContent = personal.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  $("#footer-name").textContent = personal.name;
  $("#footer-year").textContent = new Date().getFullYear();

  $("#about-bio").innerHTML = personal.bio.map((p) => `<p>${p}</p>`).join("");

  const savedPhoto = readJSON(STORAGE_KEYS.profilePhoto, null);
  $("#profile-photo").src = savedPhoto || personal.photo;
  $("#profile-photo").alt = `Photo of ${personal.name}`;

  $("#resume-btn").href = personal.resumeFile;

  // Nav links (desktop + footer) — render once
  if (!$("#nav-links").dataset.rendered) {
    const navLinks = SITE_DATA.nav.map((item) => el("li", {}, [el("a", { href: item.href, textContent: item.label })]));
    $("#nav-links").append(...navLinks);
    $("#nav-links").dataset.rendered = "true";
    const footerLinks = SITE_DATA.nav.map((item) => el("a", { href: item.href, textContent: item.label }));
    $("#footer-nav").append(...footerLinks);
  }

  renderSocialLinks(social);
}

/* ============================================================
   RENDER: social links, with editable URL inputs in Edit Mode
   ============================================================ */
const SOCIAL_LABELS = { github: "GitHub", linkedin: "LinkedIn", email: "Email", twitter: "Twitter" };

function renderSocialLinks(social) {
  const list = $("#social-list");
  list.innerHTML = "";
  Object.entries(social).forEach(([key, url]) => {
    if (!url && !document.body.classList.contains("edit-mode")) return;

    const link = el("a", {
      href: url || "#",
      target: key === "email" ? "_self" : "_blank",
      rel: "noopener",
      textContent: SOCIAL_LABELS[key] || key
    });

    const urlInput = el("input", {
      type: "text",
      class: "social-url-input",
      value: url || "",
      placeholder: `${SOCIAL_LABELS[key] || key} URL (blank to hide)`
    });
    urlInput.addEventListener("blur", () => {
      const newUrl = urlInput.value.trim();
      const overrides = getTextOverrides();
      if (!overrides.social) overrides.social = {};
      overrides.social[key] = newUrl;
      writeJSON(STORAGE_KEYS.textOverrides, overrides);
      link.href = newUrl || "#";
      renderSocialLinks(getEffectiveSocial());
    });

    list.appendChild(el("li", { class: "social-item" }, [link, urlInput]));
  });
}

/* ============================================================
   RENDER: skills (editable name + level in Edit Mode)
   ============================================================ */
function renderSkills() {
  const wrap = $("#skill-bars");
  wrap.innerHTML = "";
  const skills = getEffectiveSkills();

  skills.forEach((skill, i) => {
    const nameEl = el("span", {
      class: "editable-field",
      textContent: skill.name,
      "data-edit-path": `skills.${i}.name`
    });
    const staticLevel = el("span", { class: "skill-level-static", textContent: `${skill.level}%` });
    const levelInput = el("input", {
      type: "range",
      class: "skill-level-input",
      min: "0",
      max: "100",
      value: String(skill.level)
    });

    const fill = el("div", { class: "skill-bar-fill", "data-level": skill.level });

    levelInput.addEventListener("input", () => {
      fill.style.width = `${levelInput.value}%`;
      staticLevel.textContent = `${levelInput.value}%`;
    });
    levelInput.addEventListener("change", () => {
      saveField(`skills.${i}.level`, Number(levelInput.value));
    });

    const bar = el("div", { class: "skill-bar" }, [
      el("div", { class: "skill-bar-label" }, [nameEl, staticLevel, levelInput]),
      el("div", { class: "skill-bar-track" }, [fill])
    ]);
    wrap.appendChild(bar);
  });

  const tagWrap = $("#tool-tags");
  if (!tagWrap.dataset.rendered) {
    SITE_DATA.tools.forEach((tool) => tagWrap.appendChild(el("span", { class: "tag", textContent: tool })));
    tagWrap.dataset.rendered = "true";
  }

  bindEditableFields();
  applyEditModeToFields(document.body.classList.contains("edit-mode"));

  // Animate bars in once visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          $$(".skill-bar-fill", entry.target).forEach((f) => {
            f.style.width = `${f.dataset.level}%`;
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  observer.observe(wrap);
}

/* ============================================================
   RENDER: projects (base + localStorage overrides/additions/removals)
   ============================================================ */
function projectCard(project) {
  const techTags = (project.tech || []).map((t) => el("span", { textContent: t }));
  const links = [];
  if (project.liveUrl) links.push(el("a", { href: project.liveUrl, target: "_blank", rel: "noopener", textContent: "Live Demo" }));
  if (project.repoUrl) links.push(el("a", { href: project.repoUrl, target: "_blank", rel: "noopener", textContent: "GitHub" }));

  const card = el("div", { class: "project-card tilt-el", "data-tilt-max": "6" }, [
    el("div", { class: "project-image-wrap" }, [
      el("img", { src: project.image, alt: `${project.title} preview`, loading: "lazy" }),
      el("button", {
        class: "project-edit-btn",
        type: "button",
        title: "Edit project",
        textContent: "✎",
        onclick: () => window.openProjectModal(project)
      }),
      el("button", {
        class: "project-remove-btn",
        type: "button",
        title: "Remove project",
        textContent: "×",
        onclick: () => removeProject(project.id)
      })
    ]),
    el("div", { class: "project-body" }, [
      el("h3", { textContent: project.title }),
      el("p", { textContent: project.description }),
      el("div", { class: "project-tech" }, techTags),
      el("div", { class: "project-links" }, links)
    ])
  ]);
  return card;
}

function renderProjects() {
  const grid = $("#project-grid");
  grid.innerHTML = "";
  getEffectiveProjects().forEach((p) => grid.appendChild(projectCard(p)));
  initTilt(); // re-bind tilt on newly created cards
}

function removeProject(id) {
  if (!confirm("Remove this project card? This only affects your browser (localStorage) until you export & commit.")) return;
  const isBaseProject = SITE_DATA.projects.some((p) => p.id === id);
  if (isBaseProject) {
    const removed = new Set(readJSON(STORAGE_KEYS.removedProjectIds, []));
    removed.add(id);
    writeJSON(STORAGE_KEYS.removedProjectIds, [...removed]);
  } else {
    const extra = readJSON(STORAGE_KEYS.extraProjects, []).filter((p) => p.id !== id);
    writeJSON(STORAGE_KEYS.extraProjects, extra);
  }
  const overrides = readJSON(STORAGE_KEYS.projectOverrides, {});
  delete overrides[id];
  writeJSON(STORAGE_KEYS.projectOverrides, overrides);
  renderProjects();
}

function addProject(data) {
  const extra = readJSON(STORAGE_KEYS.extraProjects, []);
  const id = `local-${Date.now()}`;
  extra.push({ ...data, id });
  writeJSON(STORAGE_KEYS.extraProjects, extra);
  renderProjects();
}

function updateProject(id, data) {
  const isBaseProject = SITE_DATA.projects.some((p) => p.id === id);
  if (isBaseProject) {
    const overrides = readJSON(STORAGE_KEYS.projectOverrides, {});
    overrides[id] = { ...(overrides[id] || {}), ...data };
    writeJSON(STORAGE_KEYS.projectOverrides, overrides);
  } else {
    const extra = readJSON(STORAGE_KEYS.extraProjects, []).map((p) => (p.id === id ? { ...p, ...data } : p));
    writeJSON(STORAGE_KEYS.extraProjects, extra);
  }
  renderProjects();
}

/* ============================================================
   RENDER: timeline (editable in Edit Mode)
   ============================================================ */
function renderTimeline() {
  const wrap = $("#timeline");
  wrap.innerHTML = "";
  getEffectiveTimeline().forEach((item, i) => {
    wrap.appendChild(
      el("div", { class: "timeline-item" }, [
        el("span", { class: "timeline-period editable-field", textContent: item.period, "data-edit-path": `timeline.${i}.period` }),
        el("h3", { class: "editable-field", textContent: item.title, "data-edit-path": `timeline.${i}.title` }),
        el("span", { class: "timeline-org editable-field", textContent: item.org, "data-edit-path": `timeline.${i}.org` }),
        el("p", { class: "editable-field", textContent: item.description, "data-edit-path": `timeline.${i}.description` })
      ])
    );
  });
  bindEditableFields();
  applyEditModeToFields(document.body.classList.contains("edit-mode"));
}

/* ============================================================
   CURSOR-REACTIVE 3D TILT
   - Desktop / mouse only (pointer: fine, hover: hover)
   - Degrades to a static state on touch devices
   ============================================================ */
const supportsTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initTilt() {
  if (!supportsTilt || prefersReducedMotion) return;

  $$(".tilt-el").forEach((node) => {
    if (node.dataset.tiltBound) return;
    node.dataset.tiltBound = "true";

    const maxTilt = parseFloat(node.dataset.tiltMax || "6");

    node.addEventListener("mousemove", (e) => {
      const rect = node.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - y) * maxTilt * 2;
      node.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    });

    node.addEventListener("mouseleave", () => {
      node.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
    });
  });
}

/* ============================================================
   EDIT MODE + IMAGE UPLOAD
   ============================================================ */
function initEditMode() {
  const toggle = $("#edit-mode-toggle");
  const isOn = readJSON(STORAGE_KEYS.editMode, false);
  setEditMode(isOn);

  toggle.addEventListener("click", () => {
    const next = !document.body.classList.contains("edit-mode");
    setEditMode(next);
    writeJSON(STORAGE_KEYS.editMode, next);
  });

  function setEditMode(on) {
    document.body.classList.toggle("edit-mode", on);
    toggle.setAttribute("aria-pressed", String(on));
    $(".edit-toggle-label", toggle).textContent = on ? "Editing" : "Edit Mode";
    applyEditModeToFields(on);
    renderSocialLinks(getEffectiveSocial()); // shows/hides blank links + URL inputs
  }

  // Profile photo upload
  const profileInput = $('.upload-input[data-role="profile"]');
  profileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readFileAsDataURL(file).then((dataUrl) => {
      writeJSON(STORAGE_KEYS.profilePhoto, dataUrl);
      $("#profile-photo").src = dataUrl;
    });
  });
}

/* ============================================================
   ADD / EDIT PROJECT MODAL (shared)
   ============================================================ */
function initProjectModal() {
  const backdrop = $("#modal-backdrop");
  const form = $("#add-project-form");
  const heading = $("#modal-heading");
  const submitBtn = $("#modal-submit");

  $("#add-project-btn").addEventListener("click", () => window.openProjectModal(null));
  $("#modal-cancel").addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  function closeModal() {
    backdrop.hidden = true;
    form.reset();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const editingId = fd.get("editingId");
    const imageFile = fd.get("image");

    const payload = {
      title: fd.get("title"),
      description: fd.get("description"),
      tech: (fd.get("tech") || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      liveUrl: fd.get("liveUrl") || "",
      repoUrl: fd.get("repoUrl") || ""
    };

    if (imageFile && imageFile.size > 0) {
      payload.image = await readFileAsDataURL(imageFile);
    }

    if (editingId) {
      updateProject(editingId, payload);
    } else {
      addProject({ ...payload, image: payload.image || "assets/images/project-placeholder-1.svg" });
    }
    closeModal();
  });

  window.openProjectModal = function openProjectModal(project) {
    form.reset();
    if (project) {
      heading.textContent = "Edit Project";
      submitBtn.textContent = "Save Changes";
      form.elements.editingId.value = project.id;
      form.elements.title.value = project.title;
      form.elements.description.value = project.description;
      form.elements.tech.value = (project.tech || []).join(", ");
      form.elements.liveUrl.value = project.liveUrl || "";
      form.elements.repoUrl.value = project.repoUrl || "";
    } else {
      heading.textContent = "Add Project";
      submitBtn.textContent = "Add Project";
      form.elements.editingId.value = "";
    }
    backdrop.hidden = false;
  };
}

/* ============================================================
   NAV: mobile menu
   ============================================================ */
function initNav() {
  const burger = $("#nav-burger");
  const links = $("#nav-links");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("#nav-links a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );
}

/* ============================================================
   CONTACT FORM
   Static site: no backend. Replace handleSubmit's body with a
   call to Formspree / EmailJS / your own API endpoint.
   ============================================================ */
function initContactForm() {
  const form = $("#contact-form");
  const status = $("#form-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit(new FormData(form));
  });

  function handleSubmit(formData) {
    console.log("Contact form submitted (no backend configured):", Object.fromEntries(formData));
    status.textContent = "Thanks! (Demo only — connect a form backend in script.js to actually send this.)";
    form.reset();
    setTimeout(() => (status.textContent = ""), 6000);
  }
}

/* ============================================================
   EXPORT — bundle current edits into a ready-to-commit data.js
   plus any uploaded images, so browser edits reach the live site.
   ============================================================ */
function triggerDownload(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function dataURLToBlob(dataUrl) {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);base64/)[1];
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
function extFromMime(mime) {
  const map = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" };
  return map[mime] || "png";
}

async function exportChanges() {
  const personal = getEffectivePersonal();
  const social = getEffectiveSocial();
  const skills = getEffectiveSkills();
  const timeline = getEffectiveTimeline();
  const projects = getEffectiveProjects();
  const imagesToDownload = [];

  // Profile photo: if it's a data URL (uploaded locally), export as a file
  let photoPath = personal.photo;
  const savedPhoto = readJSON(STORAGE_KEYS.profilePhoto, null);
  if (savedPhoto && savedPhoto.startsWith("data:")) {
    const blob = dataURLToBlob(savedPhoto);
    const filename = `profile-photo.${extFromMime(blob.type)}`;
    imagesToDownload.push({ filename, blob });
    photoPath = `assets/images/${filename}`;
  }

  // Project images: export any that are data URLs
  const exportedProjects = projects.map((p) => {
    let image = p.image;
    if (image && image.startsWith("data:")) {
      const blob = dataURLToBlob(image);
      const filename = `project-${p.id.replace(/[^a-z0-9-]/gi, "")}.${extFromMime(blob.type)}`;
      imagesToDownload.push({ filename, blob });
      image = `assets/images/${filename}`;
    }
    return { ...p, image };
  });

  // Build the new data.js file text
  const dataJs = `/**
 * ============================================================
 *  data.js — ALL your personal content lives here.
 *  Generated by "Export Changes" in Edit Mode on ${new Date().toISOString().slice(0, 10)}.
 *  Move any exported image files into assets/images/ before committing.
 * ============================================================
 */

const SITE_DATA = ${JSON.stringify(
    {
      personal: { ...personal, photo: photoPath },
      social,
      nav: SITE_DATA.nav,
      skills,
      tools: SITE_DATA.tools,
      projects: exportedProjects.map(({ id, title, description, image, tech, liveUrl, repoUrl }) => ({
        id, title, description, image, tech, liveUrl, repoUrl
      })),
      timeline
    },
    null,
    2
  )};
`;

  // Trigger downloads: data.js first, then each image
  triggerDownload("data.js", new Blob([dataJs], { type: "text/javascript" }));
  imagesToDownload.forEach(({ filename, blob }) => triggerDownload(filename, blob));

  const note = imagesToDownload.length
    ? `Downloaded data.js and ${imagesToDownload.length} image file(s). Move the image(s) into assets/images/, replace your old js/data.js with the downloaded one, then commit and push.`
    : `Downloaded data.js. Replace your old js/data.js with the downloaded one, then commit and push.`;
  alert(note);
}

function initExport() {
  $("#export-btn").addEventListener("click", exportChanges);
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  renderPersonalInfo();
  renderSkills();
  renderProjects();
  renderTimeline();
  initNav();
  initEditMode();
  initProjectModal();
  initContactForm();
  initExport();
  bindEditableFields();
  applyEditModeToFields(document.body.classList.contains("edit-mode"));
  initTilt();
});
