const nav = document.querySelector("[data-nav]");
const hero = document.querySelector(".hero");
const progress = document.querySelector(".progress");
const toggle = document.querySelector(".nav-toggle");
const panel = document.querySelector(".nav-panel");

const setSolid = () => {
  if (!nav || !hero) return;
  nav.classList.toggle("is-solid", window.scrollY > hero.offsetHeight - 70);
};

const setProgress = () => {
  if (!progress) return;
  const scrolled = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = height > 0 ? `${(scrolled / height) * 100}%` : "0";
};

if (nav && hero) {
  setSolid();
  window.addEventListener("scroll", setSolid, { passive: true });
}

if (progress) {
  setProgress();
  window.addEventListener("scroll", setProgress, { passive: true });
}

const setMenu = (open) => {
  if (!panel || !toggle) return;
  panel.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "Закрыть" : "Меню";
  document.body.classList.toggle("menu-open", open);
};

if (toggle && panel) {
  toggle.addEventListener("click", () => setMenu(panel.hidden));
  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
}

const links = [...document.querySelectorAll(".nav-links a, .nav-panel a, .work-rail a")];

const sectionForLink = (link) => {
  const href = link.getAttribute("href");
  if (!href?.startsWith("#") || href === "#") return null;
  return document.querySelector(href);
};

const sections = [...new Set(links.map(sectionForLink))].filter(Boolean);

const mark = (id) => {
  links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`));
};

const updateActive = () => {
  const line = window.scrollY + 120;
  let current = "";
  sections.forEach((section) => {
    if (section.offsetTop <= line) current = section.id;
  });
  mark(current);
};

updateActive();
window.addEventListener("scroll", updateActive, { passive: true });

const dialog = document.querySelector(".viewer");
const viewImg = dialog?.querySelector("img");
const counter = dialog?.querySelector(".viewer-count");
const caption = dialog?.querySelector(".viewer-caption");
let items = [];
let index = 0;
let opener = null;
let suppressBackdropClose = false;

const show = () => {
  const item = items[index];
  viewImg.src = item.src;
  viewImg.alt = item.alt;
  counter.textContent = `${index + 1} / ${items.length}`;
  caption.textContent = item.alt;
};

const step = (dir) => {
  index = (index + dir + items.length) % items.length;
  show();
};

const pageLayers = [
  hero,
  document.querySelector(".intro"),
  document.querySelector(".ticker"),
  document.querySelector(".work-rail"),
  document.querySelector("main"),
  document.querySelector(".price"),
  document.querySelector(".book"),
  document.querySelector(".footer"),
].filter(Boolean);

const setPageInert = (on) => {
  pageLayers.forEach((node) => {
    if (on) node.setAttribute("inert", "");
    else node.removeAttribute("inert");
  });
};

const clearViewerState = () => {
  document.body.classList.remove("is-viewing");
  setPageInert(false);
};

clearViewerState();
if (dialog?.open) dialog.close();

const openViewer = (gallery, shot, event) => {
  if (!dialog || !viewImg || !counter || !caption) return;

  const shots = [...gallery.querySelectorAll(".shot")];
  const shotIndex = shots.indexOf(shot);
  if (shotIndex < 0) return;

  items = shots.map((node) => {
    const image = node.querySelector("img");
    return { src: image.currentSrc || image.src, alt: image.alt };
  });
  index = shotIndex;
  opener = shot;
  show();

  event?.stopPropagation();
  suppressBackdropClose = true;
  try {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("is-viewing");
    setPageInert(true);
  } catch {
    clearViewerState();
    return;
  }
  requestAnimationFrame(() => {
    suppressBackdropClose = false;
  });
};

document.addEventListener("click", (event) => {
  const gallery = event.target.closest("[data-gallery]");
  if (!gallery) return;
  const shot = event.target.closest(".shot");
  if (!shot || !gallery.contains(shot)) return;
  event.preventDefault();
  openViewer(gallery, shot, event);
});

if (dialog && viewImg && counter && caption) {
  dialog.querySelector("[data-close]")?.addEventListener("click", () => dialog.close());
  dialog.querySelectorAll("[data-dir]").forEach((button) => {
    button.addEventListener("click", () => step(Number(button.dataset.dir)));
  });

  dialog.addEventListener("click", (event) => {
    if (suppressBackdropClose) return;
    if (event.target === dialog || event.target.classList.contains("viewer-stage")) dialog.close();
  });

  dialog.addEventListener("close", () => {
    clearViewerState();
    opener?.focus();
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    dialog.close();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  });

  let touchX = 0;
  dialog.addEventListener("touchstart", (event) => {
    touchX = event.changedTouches[0].clientX;
  }, { passive: true });
  dialog.addEventListener("touchend", (event) => {
    const delta = event.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 48) step(delta < 0 ? 1 : -1);
  }, { passive: true });
}

const clipPlayer = document.querySelector("[data-clip-player]");
const clipPlay = clipPlayer?.querySelector("[data-clip-play]");
if (clipPlayer && clipPlay) {
  clipPlay.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/hGMMX5LqpV0?rel=0&autoplay=1";
    iframe.title = "ADEL’ — ВЫШЕ";
    iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.allowFullscreen = true;
    clipPlayer.replaceChildren(iframe);
  });
}

