import "./style.css";
import { categories } from "./menu.js";

/* ==========================================================
   Drishya Restaurant
   The page markup lives in index.html. This file only adds
   behaviour: header + mobile nav, menu tabs, photo viewer.
   ========================================================== */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const escapeHTML = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );

/* ----------------------------------------------------------
   Header: turns solid after scrolling, and owns the mobile menu
   ---------------------------------------------------------- */
function initNav() {
  const header = $("#site-header");
  const toggle = $("#nav-toggle");
  const nav = $("#site-nav");
  const sentinel = $("#top-sentinel");
  if (!header || !toggle || !nav) return;

  let scrolled = false;
  let open = false;

  const render = () => {
    header.classList.toggle("is-solid", scrolled || open);
    header.classList.toggle("menu-open", open);
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  const setOpen = (value) => {
    open = value;
    render();
  };

  // An observer avoids running code on every scroll event
  if (sentinel) {
    new IntersectionObserver(([entry]) => {
      scrolled = !entry.isIntersecting;
      render();
    }).observe(sentinel);
  }

  toggle.addEventListener("click", () => setOpen(!open));

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Close the mobile panel if the window grows to desktop width
  matchMedia("(max-width: 52em)").addEventListener("change", (event) => {
    if (!event.matches) setOpen(false);
  });
}

/* ----------------------------------------------------------
   Highlight the nav link for the section being read
   ---------------------------------------------------------- */
function initScrollSpy() {
  const links = $$('#site-nav a[href^="#"]');
  const linkById = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const sections = ["home", ...linkById.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute("aria-current"));
        linkById.get(entry.target.id)?.setAttribute("aria-current", "true");
      }
    },
    // Only the band across the middle of the screen counts
    { rootMargin: "-45% 0px -50% 0px" },
  );

  sections.forEach((section) => observer.observe(section));
}

/* ----------------------------------------------------------
   Menu: accessible tabs (arrow keys work) built from menu.js
   ---------------------------------------------------------- */
function initMenu() {
  const tabList = $("#menu-tabs");
  const panel = $("#menu-panel");
  if (!tabList || !panel || categories.length === 0) return;

  tabList.innerHTML = categories
    .map(
      ({ id, label }) => `
        <button class="menu-tab" type="button" role="tab" id="tab-${escapeHTML(id)}"
                aria-controls="menu-panel">${escapeHTML(label)}</button>`,
    )
    .join("");

  const tabs = $$(".menu-tab", tabList);

  const renderItem = ({ name, description, price }) => `
    <li class="menu-item">
      <div class="menu-item-row">
        <h3>${escapeHTML(name)}</h3>
        ${
          price
            ? `<span class="menu-leader" aria-hidden="true"></span>
               <span class="menu-price">${escapeHTML(price)}</span>`
            : ""
        }
      </div>
      ${description ? `<p>${escapeHTML(description)}</p>` : ""}
    </li>`;

  const renderEmpty = (label) => `
    <div class="menu-empty">
      <p>Our ${escapeHTML(label.toLowerCase())} menu is being updated.
         Please call us to ask what’s available today.</p>
      <a class="text-link" href="#contact">See contact details</a>
    </div>`;

  let active = 0;

  const show = (index, { focus = false } = {}) => {
    active = index;
    const { id, label, items } = categories[index];

    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });

    panel.setAttribute("aria-labelledby", `tab-${id}`);
    panel.innerHTML = items.length
      ? `<ul class="menu-list">${items.map(renderItem).join("")}</ul>`
      : renderEmpty(label);

    if (focus) tabs[index].focus();
  };

  tabList.addEventListener("click", (event) => {
    const index = tabs.indexOf(event.target.closest(".menu-tab"));
    if (index !== -1) show(index);
  });

  tabList.addEventListener("keydown", (event) => {
    const last = tabs.length - 1;
    const target = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowDown: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      ArrowUp: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    }[event.key];

    if (target === undefined) return;
    event.preventDefault();
    show(target, { focus: true });
  });

  // Start on the first category that has something in it
  show(Math.max(categories.findIndex((c) => c.items.length > 0), 0));
}

/* ----------------------------------------------------------
   Gallery: open photos large in a native <dialog>.
   Without JS the tiles are plain links to the full photo.
   ---------------------------------------------------------- */
function initLightbox() {
  const dialog = $("#lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const image = $("#lightbox-img");
  const caption = $("#lightbox-caption");

  $$(".tile").forEach((tile) => {
    tile.addEventListener("click", (event) => {
      event.preventDefault();
      image.src = tile.href;
      image.alt = $("img", tile).alt;
      caption.textContent = $(".tile-caption", tile).textContent;
      dialog.showModal();
    });
  });

  // Clicking the dark backdrop closes it (Esc and the button already do)
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => image.removeAttribute("src"));
}

/* ----------------------------------------------------------
   Start
   ---------------------------------------------------------- */
const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

initNav();
initScrollSpy();
initMenu();
initLightbox();
