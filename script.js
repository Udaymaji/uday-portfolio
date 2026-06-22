const body = document.body;
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const progress = document.querySelector("[data-scroll-progress]");
const tickerTrack = document.querySelector(".ticker-track");

if (tickerTrack) {
  tickerTrack.innerHTML += tickerTrack.innerHTML;
}

navToggle.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const profileFrame = document.querySelector(".profile-frame");
const topCard = document.querySelector(".top-card");
const bottomCard = document.querySelector(".bottom-card");
const blob1 = document.querySelector(".mesh-blob-1");
const blob2 = document.querySelector(".mesh-blob-2");

const updateScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${amount}%`;
  header.classList.toggle("scrolled", window.scrollY > 20);

  // Smooth Scroll Parallax
  const s = window.scrollY;
  if (window.matchMedia("(hover: hover)").matches) {
    if (profileFrame) {
      const isMobile = window.matchMedia("(max-width: 1100px)").matches;
      profileFrame.style.transform = isMobile
        ? `translateX(-50%) translateY(${s * 0.05}px)`
        : `translateY(${s * 0.06}px)`;
    }
    if (topCard) topCard.style.transform = `translateY(${s * -0.06}px)`;
    if (bottomCard) bottomCard.style.transform = `translateY(${s * 0.03}px)`;
    if (blob1) blob1.style.transform = `translateY(${s * 0.08}px)`;
    if (blob2) blob2.style.transform = `translateY(${s * -0.05}px)`;
  }
};

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((element) => revealObserver.observe(element));

// --- Premium Lightbox Modal ---
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.querySelector("[data-lightbox-close]");

if (lightbox && lightboxImg && lightboxCaption) {
  const openLightbox = (src, alt, caption) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightboxCaption.textContent = caption || "";
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    body.style.overflow = "hidden"; // Prevent scrolling behind modal
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    body.style.overflow = ""; // Restore scrolling
  };

  document.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const img = trigger.querySelector("img");
      const figcaption = trigger.querySelector("figcaption");
      if (img) {
        openLightbox(img.src, img.alt, figcaption ? figcaption.textContent : img.alt);
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      closeLightbox();
    }
  });
}

// --- Premium 3D Tilt Effect ---
if (window.matchMedia("(hover: hover)").matches) {
  const tiltElements = document.querySelectorAll(".coming-soon-card, .skill-widget-card, .certificate-card, .event-card");

  tiltElements.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate inside element
      const y = e.clientY - rect.top;  // y coordinate inside element

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max rotation in degrees
      const maxRotate = 8;

      const rotateX = ((centerY - y) / centerY) * maxRotate;
      const rotateY = ((x - centerX) / centerX) * maxRotate;

      // Apply subtle 3D transformation
      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      el.style.transition = "transform 100ms ease";
    });

    el.addEventListener("mouseleave", () => {
      // Restore default transform state
      el.style.transform = "";
      el.style.transition = "transform 400ms ease";
    });
  });
}

// --- Premium Interactive Cursor Glow Spotlight ---
const cursorGlow = document.getElementById("cursor-glow");
if (cursorGlow && window.matchMedia("(hover: hover)").matches) {
  window.addEventListener("mousemove", (e) => {
    // Show glow on first move
    if (cursorGlow.style.opacity === "") {
      cursorGlow.style.opacity = "1";
    }
    // Positioning using translate3d for hardware acceleration
    cursorGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
  });

  document.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    cursorGlow.style.opacity = "1";
  });
}
