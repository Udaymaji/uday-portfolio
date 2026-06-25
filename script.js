// --- Theme System ---
const themeSwitch = document.getElementById("theme-switch");
const themeBtns = document.querySelectorAll(".theme-btn");

function initTheme() {
  const currentSetting = localStorage.getItem("theme") || "dark";
  applyTheme(currentSetting);

  themeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetTheme = btn.getAttribute("data-theme-value");
      localStorage.setItem("theme", targetTheme);
      applyTheme(targetTheme);
    });
  });

  // Listen for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (localStorage.getItem("theme") === "system" || !localStorage.getItem("theme")) {
      applyTheme("system");
    }
  });
}

function applyTheme(setting) {
  document.documentElement.setAttribute("data-setting", setting);
  
  if (setting === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    document.documentElement.setAttribute("data-theme", setting);
  }
}

initTheme();

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

// Toggle focus and community cards on profile pic tap
const profilePicFrame = document.getElementById("profile-pic-frame");
const heroStageContainer = document.getElementById("hero-stage-container");
if (profilePicFrame && heroStageContainer) {
  profilePicFrame.addEventListener("click", (e) => {
    e.stopPropagation();
    heroStageContainer.classList.toggle("cards-hidden");
  });
}

// --- High-Performance Scroll Caching & Initialization ---
let cachedViewportHeight = window.innerHeight;
let scrollableHeight = document.documentElement.scrollHeight - cachedViewportHeight;
let isHoverDevice = window.matchMedia("(hover: hover)").matches;
let isMobileLayout = window.matchMedia("(max-width: 1100px)").matches;

const scroll3DElements = document.querySelectorAll(
  ".reveal-3d-flip-x, .reveal-3d-flip-y, .reveal-3d-scale, .reveal-3d-slide-up, .reveal-3d-slide-left, .reveal-3d-slide-right"
);

const cachedElements = [];

const cacheLayoutValues = () => {
  cachedViewportHeight = window.innerHeight;
  scrollableHeight = document.documentElement.scrollHeight - cachedViewportHeight;
  isHoverDevice = window.matchMedia("(hover: hover)").matches;
  isMobileLayout = window.matchMedia("(max-width: 1100px)").matches;
  
  // Cache coordinates to completely eliminate getBoundingClientRect layout thrashing on scroll
  cachedElements.length = 0;
  scroll3DElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    // We add the current scrollY to get the absolute top offset in the document
    cachedElements.push({
      element: el,
      top: window.scrollY + rect.top,
      height: rect.height,
    });
  });
};

// Run cache setup once on script load, then refresh when load completes or resize fires
cacheLayoutValues();
window.addEventListener("load", cacheLayoutValues);
window.addEventListener("resize", cacheLayoutValues);


// --- Buttery-Smooth Interpolated Scroll Loop (Parallax + 3D Animations) ---
let targetScrollY = window.scrollY;
let currentScrollY = window.scrollY;
const easeFactor = 0.085; // Lower values = smoother/fluid lag. Higher = faster response.
let isRAFActive = false;

const applyParallaxTransforms = (s) => {
  if (isHoverDevice) {
    if (profileFrame) {
      profileFrame.style.transform = isMobileLayout
        ? `translateX(-50%) translateY(${s * 0.05}px)`
        : `translateY(${s * 0.06}px)`;
    }
    if (topCard) topCard.style.transform = `translateY(${s * -0.06}px)`;
    if (bottomCard) bottomCard.style.transform = `translateY(${s * 0.03}px)`;
    if (blob1) blob1.style.transform = `translateY(${s * 0.08}px)`;
    if (blob2) blob2.style.transform = `translateY(${s * -0.05}px)`;
  }
};

const apply3DScrollTransforms = (s) => {
  cachedElements.forEach((item) => {
    const el = item.element;
    if (!el.classList.contains("visible")) return;

    const rectTop = item.top - s;
    const rectBottom = rectTop + item.height;

    // Check if element is inside the viewport
    if (rectTop < cachedViewportHeight && rectBottom > 0) {
      const elementCenter = rectTop + item.height / 2;
      const viewportCenter = cachedViewportHeight / 2;
      const offsetFromCenter = (elementCenter - viewportCenter) / viewportCenter; // Range: -1 to 1
      const maxRot = 12; // Degrees of rotation
      const rotVal = offsetFromCenter * maxRot;

      if (el.classList.contains("reveal-3d-flip-x")) {
        el.style.transform = `perspective(1000px) rotateX(${rotVal.toFixed(2)}deg)`;
      } else if (el.classList.contains("reveal-3d-flip-y")) {
        el.style.transform = `perspective(1000px) rotateY(${(rotVal * -1).toFixed(2)}deg)`;
      } else if (el.classList.contains("reveal-3d-scale")) {
        const scaleVal = 1 - Math.abs(offsetFromCenter) * 0.06;
        el.style.transform = `perspective(1000px) translateZ(${(-Math.abs(offsetFromCenter) * 100).toFixed(2)}px) scale(${scaleVal.toFixed(3)})`;
      } else if (el.classList.contains("reveal-3d-slide-up")) {
        el.style.transform = `perspective(1000px) translateY(${(offsetFromCenter * 30).toFixed(2)}px) rotateX(${rotVal.toFixed(2)}deg)`;
      } else if (el.classList.contains("reveal-3d-slide-left")) {
        el.style.transform = `perspective(1000px) translateX(${(offsetFromCenter * -30).toFixed(2)}px) rotateY(${(rotVal * -1).toFixed(2)}deg)`;
      } else if (el.classList.contains("reveal-3d-slide-right")) {
        el.style.transform = `perspective(1000px) translateX(${(offsetFromCenter * 30).toFixed(2)}px) rotateY(${rotVal.toFixed(2)}deg)`;
      }
    }
  });
};

const updateScrollProgress = (s) => {
  if (progress) {
    const amount = scrollableHeight > 0 ? (s / scrollableHeight) * 100 : 0;
    progress.style.width = `${amount}%`;
  }
};

const smoothScrollLoop = () => {
  const diff = targetScrollY - currentScrollY;

  if (Math.abs(diff) > 0.05) {
    currentScrollY += diff * easeFactor;
    applyParallaxTransforms(currentScrollY);
    apply3DScrollTransforms(currentScrollY);
    updateScrollProgress(currentScrollY);
    
    requestAnimationFrame(smoothScrollLoop);
  } else {
    currentScrollY = targetScrollY;
    applyParallaxTransforms(currentScrollY);
    apply3DScrollTransforms(currentScrollY);
    updateScrollProgress(currentScrollY);
    isRAFActive = false;
  }
};

window.addEventListener("scroll", () => {
  targetScrollY = window.scrollY;
  // Instantly toggle header background class on raw scroll tick for responsiveness
  if (header) {
    header.classList.toggle("scrolled", targetScrollY > 20);
  }
  
  if (!isRAFActive) {
    isRAFActive = true;
    requestAnimationFrame(smoothScrollLoop);
  }
}, { passive: true });

// --- 3D Brand Logo Coin Flip Toggler ---
const logoFlipCard = document.getElementById("logo-flip-card");
if (logoFlipCard) {
  logoFlipCard.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    logoFlipCard.classList.toggle("flipped");
  });
}

// --- 3D Scroll Reveal Observer ---
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(
  ".reveal, .reveal-left, .reveal-right, .reveal-3d-flip-x, .reveal-3d-flip-y, .reveal-3d-scale, .reveal-3d-slide-up, .reveal-3d-slide-left, .reveal-3d-slide-right"
).forEach((element) => revealObserver.observe(element));


// --- Comprehensive Certificates Database (14 items) ---
const certificateDetails = {
  "cert-google-ambassador": {
    title: "Google Student Ambassador Program",
    issuer: "Google Student Ambassador / Ping Network",
    date: "December 31, 2025",
    id: "N/A",
    desc: "Successfully completed the Google Student Ambassador Program. Recognized for consistency, leadership, and a strong commitment to learning and growth. Fostered campus tech awareness, hosted developer study jams, led community growth, and organized collaborative events.",
    skills: ["Leadership", "Community Advocacy", "Public Speaking", "Developer Relations"]
  },
  "cert-alcheringa": {
    title: "Certificate of Excellence - Student Ambassador",
    issuer: "Alcheringa IIT Guwahati (in collaboration with 1stop)",
    date: "February 19, 2025",
    id: "N/A",
    desc: "Awarded in recognition of excellent initiatives and outstanding contributions made during the Student Ambassador Program conducted in February 2025 during Alcheringa, IIT Guwahati's annual festival.",
    skills: ["Event Organization", "Outreach", "Leadership", "Teamwork"]
  },
  "cert-nptel-cloud": {
    title: "Cloud Computing (Elite Certification)",
    issuer: "NPTEL (Funded by MoE, Govt. of India / IIT Kharagpur)",
    date: "January - April 2026 (12 Week Course)",
    id: "Roll No: NPTEL26CS55S958701287",
    desc: "Successfully completed the 12-week course on Cloud Computing with a consolidated score of 60% (Online Assignments: 25/25, Proctored Exam: 34.64/75). Explored virtualization models, distributed scheduling, cloud architectures (SaaS/PaaS/IaaS), and virtualization hypervisors.",
    skills: ["Cloud Computing", "Virtualization", "Distributed Systems", "Swayam Infrastructure"]
  },
  "cert-ardent-mern": {
    title: "Full Stack Development Using MERN",
    issuer: "Ardent Computech Pvt. Ltd. (in collaboration with CodingAvengers)",
    date: "February 23 - March 11, 2026",
    id: "Certificate ID: ARDENT/193011",
    desc: "Completed 30 hours of intensive training on MERN Stack (MongoDB, Express, React, Node.js). Handled database queries, created responsive layouts, and built server API endpoints.",
    skills: ["React.js", "Node.js", "Express.js", "MongoDB", "REST APIs"]
  },
  "cert-ardent-java": {
    title: "Full Stack Development Using Java",
    issuer: "Ardent Computech Pvt. Ltd.",
    date: "July 15 - July 28, 2025",
    id: "Certification ID: ARDENT/176001",
    desc: "Completed a comprehensive 36 hours training course on Java-based Full Stack development, including JSP, Servlets, JDBC, database integrations, and responsive frontends.",
    skills: ["Java EE", "JDBC", "Servlets & JSP", "Database Integrations"]
  },
  "cert-euphoria-python": {
    title: "Python Programming Training Program",
    issuer: "Euphoria GenX (ISO 9001:2015)",
    date: "March 24, 2025",
    id: "SL NO: EG - 25 - 4354",
    desc: "Awarded for successful completion of a 30-hour Training Programme on Python Programming, covering core software building, structured programming, and backend logic.",
    skills: ["Python Programming", "Structured Algorithms", "File Handling", "OOP Logic"]
  },
  "cert-python-bootcamp": {
    title: "Python Bootcamp",
    issuer: "LetsUpgrade (in collaboration with NSDC, ITM, GDG MAD)",
    date: "March 11, 2025",
    id: "LUEPYTNOV1243007",
    desc: "Successfully completed the 3-day Python Bootcamp from November 14 to November 16, 2024. Explored foundational syntax, control logic, arrays, and standard libraries.",
    skills: ["Python Syntax", "Control Flow", "Array Manipulation", "Logic Foundations"]
  },
  "cert-cyber-security": {
    title: "Cyber Security and Ethical Hacking Bootcamp",
    issuer: "LetsUpgrade (in collaboration with NSDC, ITM, GDG MAD)",
    date: "November 29, 2024",
    id: "LUECESHOCT124981",
    desc: "Successfully completed the 3-day Bootcamp from October 24 to October 26, 2024. Covered essential concepts of cybersecurity, networking, ethical hacking tools, and safety protocols.",
    skills: ["Cyber Security", "Ethical Hacking", "Network Security", "Threat Intelligence"]
  },
  "cert-genai-prompting": {
    title: "Introduction to GenAI & Prompting",
    issuer: "LetsUpgrade (in collaboration with NSDC, ITM, GDG MAD)",
    date: "July 14, 2025",
    id: "LUEPMTJUL125473",
    desc: "Successfully completed the 2-day Bootcamp from July 10 to July 11, 2025. Focused on generative AI foundations, large language models, and practical prompt engineering techniques.",
    skills: ["Generative AI", "Prompt Engineering", "Large Language Models", "AI Applications"]
  },
  "cert-java-bootcamp": {
    title: "Java Bootcamp",
    issuer: "LetsUpgrade (in collaboration with NSDC, ITM, GDG MAD)",
    date: "March 11, 2025",
    id: "LUEJAVANOV1241298",
    desc: "Successfully completed the 3-day Java Bootcamp from November 25 to November 27, 2024. Covered Java programming language, OOP concepts, syntax, and coding practices.",
    skills: ["Java Programming", "OOP Concepts", "Data Structures", "Problem Solving"]
  },
  "cert-codesprint": {
    title: "Codesprint 2.0 Hackathon Participation",
    issuer: "JIS University",
    date: "December 2024",
    id: "N/A",
    desc: "Participated in the Codesprint 2.0 hackathon, engaging in rapid software prototyping and algorithmic problem solving under strict timelines.",
    skills: ["Competitive Programming", "Teamwork", "Rapid Prototyping"]
  },
  "cert-hp-life": {
    title: "Starting a Small Business",
    issuer: "HP LIFE",
    date: "November 2024",
    id: "N/A",
    desc: "Completed the HP LIFE training course on business management, target market profiling, business value propositions, and entrepreneurial strategy.",
    skills: ["Business Strategy", "Entrepreneurship", "Financial Modeling", "Market Analysis"]
  },
  "cert-accenture-forage": {
    title: "Accenture Data Analytics Virtual Experience",
    issuer: "Accenture (via Forage)",
    date: "October 2024",
    id: "N/A",
    desc: "Completed simulated data analyst tasks including cleaning datasets, building modeling charts, preparing client visual dashboards, and presenting insights.",
    skills: ["Data Cleaning", "Data Visualization", "Data Modeling", "Business Intelligence"]
  },
  "cert-tata-forage": {
    title: "Tata GenAI & Data Visualization Experience",
    issuer: "Tata Group (via Forage)",
    date: "September 2024",
    id: "N/A",
    desc: "Successfully navigated tasks involving generative AI applications and senior leadership presentation prep, resolving business analytics use cases.",
    skills: ["Generative AI", "Business Analytics", "Executive Presentation", "Data Preparation"]
  }
};

// Brand Colors for Active Carousel Backdrop Glows
const brandGlows = {
  "Google": "rgba(0, 242, 254, 0.25)",
  "IIT Guwahati": "rgba(255, 117, 95, 0.22)",
  "NPTEL": "rgba(127, 0, 255, 0.24)",
  "Ardent": "rgba(79, 172, 254, 0.24)",
  "Euphoria GenX": "rgba(197, 244, 108, 0.24)",
  "LetsUpgrade": "rgba(255, 165, 0, 0.22)",
  "JIS University": "rgba(0, 242, 254, 0.22)",
  "HP LIFE": "rgba(79, 172, 254, 0.2)",
  "Accenture": "rgba(169, 139, 255, 0.22)",
  "Tata Group": "rgba(0, 120, 254, 0.24)"
};


// --- Certificate Carousel Slider (3D Coverflow) ---
const showAchievementsBtn = document.getElementById("show-achievements-btn");
const certCarouselContainer = document.getElementById("certificates-carousel-container");
const carouselTrack = document.getElementById("carousel-track");
const prevBtn = document.getElementById("carousel-prev-btn");
const nextBtn = document.getElementById("carousel-next-btn");
const dotsContainer = document.getElementById("carousel-dots");
const cards = Array.from(document.querySelectorAll(".carousel-card"));

let currentIndex = 0;

function setupCarousel() {
  if (!certCarouselContainer || cards.length === 0) return;
  
  // Create indicators
  dotsContainer.innerHTML = "";
  cards.forEach((_, idx) => {
    const dot = document.createElement("div");
    dot.classList.add("carousel-dot");
    if (idx === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      currentIndex = idx;
      updateCarousel();
    });
    dotsContainer.appendChild(dot);
  });
  
  updateCarousel();
}

function updateCarousel() {
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const spread = isMobile ? 120 : 190;
  
  cards.forEach((card, idx) => {
    const offset = idx - currentIndex;
    const absOffset = Math.abs(offset);
    
    if (absOffset <= 2) {
      card.style.opacity = idx === currentIndex ? "1" : "0.55";
      card.style.pointerEvents = "auto";
      card.style.zIndex = 100 - absOffset;
      
      const translateX = offset * spread;
      const rotateY = offset * -32;
      const translateZ = -absOffset * 100;
      const scale = 1 - absOffset * 0.12;
      
      card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
    } else {
      card.style.opacity = "0";
      card.style.pointerEvents = "none";
      card.style.transform = `translateX(${offset > 0 ? 550 : -550}px) translateZ(-450px) rotateY(${offset > 0 ? -90 : 90}deg) scale(0.4)`;
      card.style.zIndex = 0;
    }
  });
  
  // Dynamic Backdrop Glow depending on Active Certificate Brand
  const activeCard = cards[currentIndex];
  if (activeCard && carouselTrack) {
    const key = activeCard.getAttribute("data-cert-key");
    const data = certificateDetails[key];
    if (data) {
      let glowColor = "rgba(0, 242, 254, 0.18)"; // Fallback
      for (const pattern in brandGlows) {
        if (data.issuer.includes(pattern)) {
          glowColor = brandGlows[pattern];
          break;
        }
      }
      carouselTrack.style.setProperty('--active-glow', glowColor);
    }
  }
  
  // Update indicators
  const dots = Array.from(dotsContainer.querySelectorAll(".carousel-dot"));
  dots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === currentIndex);
  });
}

// Click Trigger for Raining Certificates Drop
if (showAchievementsBtn && certCarouselContainer) {
  showAchievementsBtn.addEventListener("click", () => {
    const triggerContainer = showAchievementsBtn.parentElement;
    triggerContainer.style.opacity = "0";
    triggerContainer.style.transform = "translateY(20px) scale(0.95)";
    triggerContainer.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
    
    setTimeout(() => {
      triggerContainer.style.display = "none";
      certCarouselContainer.classList.remove("hidden");
      
      // Calculate viewport variables for randomized rain drop physics coordinates
      const vWidth = window.innerWidth;
      const vHeight = window.innerHeight;
      
      cards.forEach((card, index) => {
        // Random horizontal entry coordinates
        const randomX = Math.floor(Math.random() * (vWidth * 0.7)) - (vWidth * 0.35);
        // Random falling heights
        const randomY = -(Math.floor(Math.random() * 300) + vHeight);
        // Random rotating offsets
        const randomR = Math.floor(Math.random() * 70) - 35;
        
        card.style.setProperty('--rain-x', `${randomX}px`);
        card.style.setProperty('--rain-y', `${randomY}px`);
        card.style.setProperty('--rain-r', `${randomR}deg`);
        // Rain drop staggered delays
        card.style.animationDelay = `${index * 0.11}s`;
        
        card.classList.add("dropping");
      });
      
      setupCarousel();
    }, 400);
  });
}

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
  });
}

// Swipe / Drag controls
let startX = 0;
let isDragging = false;

if (carouselTrack) {
  carouselTrack.addEventListener("mousedown", (e) => {
    startX = e.clientX;
    isDragging = true;
  });
  
  carouselTrack.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const diffX = e.clientX - startX;
    if (Math.abs(diffX) > 60) {
      if (diffX > 0) {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      } else {
        currentIndex = (currentIndex + 1) % cards.length;
      }
      updateCarousel();
      isDragging = false;
    }
  });
  
  window.addEventListener("mouseup", () => {
    isDragging = false;
  });
  
  carouselTrack.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });
  
  carouselTrack.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const diffX = e.touches[0].clientX - startX;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      } else {
        currentIndex = (currentIndex + 1) % cards.length;
      }
      updateCarousel();
      isDragging = false;
    }
  }, { passive: true });
  
  carouselTrack.addEventListener("touchend", () => {
    isDragging = false;
  });
}


// --- Certificate Detailed Modal ---
const certModal = document.getElementById("cert-modal");
const certModalImg = document.getElementById("cert-modal-img");
const certModalIssuer = document.getElementById("cert-modal-issuer");
const certModalTitle = document.getElementById("cert-modal-title");
const certModalDate = document.getElementById("cert-modal-date");
const certModalId = document.getElementById("cert-modal-id");
const certModalDesc = document.getElementById("cert-modal-desc");
const certModalSkills = document.getElementById("cert-modal-skills");
const certModalIdContainer = document.getElementById("cert-modal-id-container");
const certModalClose = document.getElementById("cert-modal-close");

function openCertModal(key) {
  const data = certificateDetails[key];
  if (!data) return;
  
  const ext = (key.startsWith('cert-google') || key.startsWith('cert-alcheringa') || key.includes('cyber') || key.includes('genai') || key.includes('bootcamp') || key.includes('python') || key.includes('cloud') || key.includes('mern') || key.includes('java')) ? 'jpg' : 'jpeg';
  
  certModalImg.src = `assets/${key}.${ext}`;
  certModalImg.alt = data.title;
  certModalIssuer.textContent = data.issuer;
  certModalTitle.textContent = data.title;
  certModalDate.textContent = data.date;
  
  if (data.id === "N/A") {
    certModalIdContainer.style.display = "none";
  } else {
    certModalIdContainer.style.display = "block";
    certModalId.textContent = data.id;
  }
  
  certModalDesc.textContent = data.desc;
  
  // Render Skills
  certModalSkills.innerHTML = "";
  data.skills.forEach(skill => {
    const chip = document.createElement("span");
    chip.textContent = skill;
    certModalSkills.appendChild(chip);
  });
  
  certModal.classList.add("active");
  certModal.setAttribute("aria-hidden", "false");
  body.style.overflow = "hidden";
}

function closeCertModal() {
  if (certModal) {
    certModal.classList.remove("active");
    certModal.setAttribute("aria-hidden", "true");
    body.style.overflow = "";
  }
}

cards.forEach(card => {
  card.addEventListener("click", () => {
    const idx = cards.indexOf(card);
    if (idx !== currentIndex) {
      currentIndex = idx;
      updateCarousel();
      return;
    }
    
    const key = card.getAttribute("data-cert-key");
    openCertModal(key);
  });
});

if (certModalClose) {
  certModalClose.addEventListener("click", closeCertModal);
}

if (certModal) {
  certModal.addEventListener("click", (e) => {
    if (e.target === certModal) {
      closeCertModal();
    }
  });
}


// --- Simple Lightbox Modal for Events ---
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxCloseBtn = document.getElementById("lightbox-close-btn");

if (lightbox && lightboxImg && lightboxCaption) {
  const openLightbox = (src, alt, caption) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightboxCaption.textContent = caption || "";
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    body.style.overflow = "";
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

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener("click", closeLightbox);
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

// Global Escape listener
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCertModal();
  }
});


// --- Premium Interactive Cursor Glow Spotlight ---
const cursorGlow = document.getElementById("cursor-glow");
if (cursorGlow && window.matchMedia("(hover: hover)").matches) {
  window.addEventListener("mousemove", (e) => {
    if (cursorGlow.style.opacity === "") {
      cursorGlow.style.opacity = "1";
    }
    cursorGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
  });

  document.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    cursorGlow.style.opacity = "1";
  });
}

// --- Premium 3D Tilt Effect ---
if (window.matchMedia("(hover: hover)").matches) {
  const tiltElements = document.querySelectorAll(
    ".coming-soon-card, .skill-widget-card, .event-card, .timeline-card"
  );

  tiltElements.forEach((el) => {
    let rect = null;

    el.addEventListener("mouseenter", () => {
      rect = el.getBoundingClientRect();
    });

    el.addEventListener("mousemove", (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxRotate = 6;

      const rotateX = ((centerY - y) / centerY) * maxRotate;
      const rotateY = ((x - centerX) / centerX) * maxRotate;

      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px) scale(1.01)`;
      el.style.transition = "transform 100ms ease";
    });

    el.addEventListener("mouseleave", () => {
      rect = null;
      el.style.transform = "";
      el.style.transition = "transform 400ms ease";
    });
  });
}

// --- Cinematic Synth Engine (Web Audio API) ---
class CinematicSynth {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.padGain = null;
    this.osc1 = null;
    this.osc2 = null;
    this.filter = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.isInitialized = false;
    this.isMuted = true;
  }

  init() {
    if (this.isInitialized) return;
    
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.masterGain.connect(this.audioCtx.destination);
    
    this.filter = this.audioCtx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.setValueAtTime(180, this.audioCtx.currentTime);
    
    this.padGain = this.audioCtx.createGain();
    this.padGain.gain.setValueAtTime(0.45, this.audioCtx.currentTime);
    
    this.osc1 = this.audioCtx.createOscillator();
    this.osc1.type = "triangle";
    this.osc1.frequency.setValueAtTime(65.41, this.audioCtx.currentTime); // C2 note
    
    this.osc2 = this.audioCtx.createOscillator();
    this.osc2.type = "triangle";
    this.osc2.frequency.setValueAtTime(65.75, this.audioCtx.currentTime); // detuned low pad
    
    this.delayNode = this.audioCtx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.35, this.audioCtx.currentTime);
    
    this.delayFeedback = this.audioCtx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.38, this.audioCtx.currentTime);
    
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    
    this.osc1.connect(this.filter);
    this.osc2.connect(this.filter);
    this.filter.connect(this.padGain);
    this.padGain.connect(this.masterGain);
    this.delayNode.connect(this.masterGain);
    
    this.osc1.start(0);
    this.osc2.start(0);
    
    this.isInitialized = true;
  }

  unmute() {
    this.init();
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    this.isMuted = false;
    
    const now = this.audioCtx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.7, now + 1.5);
  }

  mute() {
    if (!this.isInitialized) return;
    this.isMuted = true;
    
    const now = this.audioCtx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + 0.3);
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmute();
      return false;
    } else {
      this.mute();
      return true;
    }
  }

  playPluck(frequency) {
    if (!this.isInitialized || this.isMuted) return;
    
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    
    const pluckGain = this.audioCtx.createGain();
    pluckGain.gain.setValueAtTime(0.38, now);
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    
    osc.connect(pluckGain);
    pluckGain.connect(this.masterGain);
    pluckGain.connect(this.delayNode);
    
    osc.start(now);
    osc.stop(now + 1.7);
  }

  stopAll() {
    if (!this.isInitialized) return;
    this.mute();
    setTimeout(() => {
      try {
        if (this.osc1) this.osc1.stop();
        if (this.osc2) this.osc2.stop();
        if (this.audioCtx) this.audioCtx.close();
      } catch(e) {}
    }, 800);
  }
}

// --- Cinematic Intro Screen & Audio ---
const introScreen = document.getElementById("intro-screen");
const introSkipBtn = document.getElementById("intro-skip-btn");
const introSoundToggle = document.getElementById("intro-sound-toggle");
const introNameContainer = document.getElementById("intro-name-container");

const taglines = [];
for (let i = 1; i <= 12; i++) {
  taglines.push(document.getElementById(`intro-tagline-${i}`));
}

const synth = new CinematicSynth();
let introTimeouts = [];

function clearIntroTimeouts() {
  introTimeouts.forEach(t => clearTimeout(t));
  introTimeouts = [];
}

function skipIntro() {
  clearIntroTimeouts();
  synth.stopAll();
  if (introScreen) {
    introScreen.classList.add("hide");
    document.body.classList.remove("intro-active");
    sessionStorage.setItem("visited", "true");
    
    // Refresh Scroll 3D observer layout cache
    setTimeout(() => {
      if (typeof cacheLayoutValues === "function") cacheLayoutValues();
    }, 1200);
  }
}

function startIntroSequence() {
  const hasVisited = sessionStorage.getItem("visited");
  
  if (hasVisited && introScreen) {
    introScreen.style.display = "none";
    return;
  }
  
  if (!introScreen) return;
  
  document.body.classList.add("intro-active");
  
  const stepTime = 950; // timing pace
  const notes = [
    523.25, // Tag 1: C5
    587.33, // Tag 2: D5
    659.25, // Tag 3: E5
    783.99, // Tag 4: G5
    880.00, // Tag 5: A5
    1046.50,// Tag 6: C6
    1174.66,// Tag 7: D6
    1318.51,// Tag 8: E6
    1567.98,// Tag 9: G6
    1760.00,// Tag 10: A6
    2093.00,// Tag 11: C7
    2637.02 // Tag 12: E7
  ];

  // Animate Taglines
  taglines.forEach((tag, idx) => {
    const startTime = 300 + idx * stepTime;
    
    introTimeouts.push(setTimeout(() => {
      if (tag) {
        tag.classList.add("active");
        synth.playPluck(notes[idx]);
      }
    }, startTime));
    
    introTimeouts.push(setTimeout(() => {
      if (tag) {
        tag.classList.remove("active");
        tag.classList.add("exit");
      }
    }, startTime + stepTime - 50));
  });

  // Name Reveal
  const nameStartTime = 300 + 12 * stepTime;
  introTimeouts.push(setTimeout(() => {
    if (introNameContainer) {
      introNameContainer.classList.add("visible");
      // Play C Major Chord
      synth.playPluck(392.00); // G4
      synth.playPluck(523.25); // C5
      synth.playPluck(659.25); // E5
      synth.playPluck(783.99); // G5
    }
  }, nameStartTime));

  // Exit Intro
  introTimeouts.push(setTimeout(() => {
    skipIntro();
  }, nameStartTime + 2000));

  // Audio Interactions
  if (introSoundToggle) {
    introSoundToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isMuted = synth.toggleMute();
      introSoundToggle.classList.toggle("muted", isMuted);
      introSoundToggle.setAttribute(
        "aria-label",
        isMuted ? "Unmute Cinematic Soundscape" : "Mute Cinematic Soundscape"
      );
    });
  }

  // Allow clicking screen to play sound
  introScreen.addEventListener("click", (e) => {
    if (e.target.closest("#intro-skip-btn") || e.target.closest("#intro-sound-toggle")) return;
    if (synth.isMuted) {
      synth.unmute();
      if (introSoundToggle) {
        introSoundToggle.classList.remove("muted");
        introSoundToggle.setAttribute("aria-label", "Mute Cinematic Soundscape");
      }
    }
  });

  if (introSkipBtn) {
    introSkipBtn.addEventListener("click", skipIntro);
  }
}

startIntroSequence();

// --- Education Section Accordion ---
const accordionCards = document.querySelectorAll("[data-education-accordion]");
accordionCards.forEach((card) => {
  const headerBtn = card.querySelector(".timeline-card-header");
  if (headerBtn) {
    headerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isCollapsed = card.classList.toggle("collapsed");
      headerBtn.setAttribute("aria-expanded", String(!isCollapsed));
      
      // Re-calculate the 3D scroll offsets as heights changed
      setTimeout(() => {
        if (typeof cacheLayoutValues === "function") cacheLayoutValues();
      }, 350);
    });
  }
});
