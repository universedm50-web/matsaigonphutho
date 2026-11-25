// ==========================================================================
// BỆNH VIỆN MẮT ÁNH SÁNG - APPLICATION CONTROLLER
// ==========================================================================

const DATA = window.HOSPITAL_DATA;

let state = {
  lang: "vi",
  currentView: "home",
  aboutTab: "timeline",
  techIndex: 0,
  quizStep: 0,
  quizAnswers: {},
  booking: {
    step: 1,
    serviceId: "smile-pro",
    doctorId: "",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "08:30 – 09:30",
    name: "",
    phone: "",
    symptoms: ""
  },
  cart: [],
  pathologyFilter: "all",
  faqFilter: "all"
};

// -------------------- INITIALIZATION --------------------
document.addEventListener("DOMContentLoaded", () => {
  const aboutPage = document.body?.dataset?.aboutPage;
  const servicePage = document.body?.dataset?.servicePage;
  const supportPage = document.body?.dataset?.supportPage;
  const knowledgePage = document.body?.dataset?.knowledgePage;
  const mainPage = document.body?.dataset?.page;
  if (aboutPage) {
    state.currentView = "about";
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.classList.toggle("nav-link-active", el.getAttribute("data-nav") === "about");
    });
    switchAboutTab(aboutPage, true);
    initScrollHeaderAndReveal();
  } else if (servicePage) {
    state.currentView = "service-detail";
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.classList.toggle("nav-link-active", el.getAttribute("data-nav") === "services");
    });
    openServiceDetail(servicePage);
    initScrollHeaderAndReveal();
  } else if (supportPage) {
    state.currentView = "support";
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.classList.toggle("nav-link-active", el.getAttribute("data-nav") === "support");
    });
    switchSupportTab(supportPage);
    initScrollHeaderAndReveal();
  } else if (knowledgePage) {
    state.currentView = "knowledge";
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.classList.toggle("nav-link-active", el.getAttribute("data-nav") === "knowledge");
    });
    switchKnowledgeTab(knowledgePage);
    initScrollHeaderAndReveal();
  } else if (mainPage) {
    state.currentView = mainPage;
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.classList.toggle("nav-link-active", el.getAttribute("data-nav") === mainPage);
    });
    if (mainPage === "about") switchAboutTab("timeline", true);
    if (mainPage === "doctors") renderDoctorsPage();
    if (mainPage === "services") renderServicesCatalog();
    if (mainPage === "support") renderSupportTab("pricing");
    if (mainPage === "knowledge") renderKnowledgeTab("pathology");
    if (mainPage === "myopia") renderMyopiaControlPage();
    initScrollHeaderAndReveal();
  } else {
    initHeroDate();
    renderHomeServices();
    renderTechSlider();
    renderHomeDoctors();
    renderVisionQuiz();
    renderHomeTestimonials();
    initCounters();
    initBASlider();
    renderAboutTab("timeline");
    renderDoctorsPage();
    renderServicesCatalog();
    renderSupportTab("pricing");
    renderKnowledgeTab("pathology");
    initScrollHeaderAndReveal();
    initDynamicEngines();
    handleHashRoute();
    window.addEventListener("hashchange", handleHashRoute);
  }

  document.addEventListener("click", (e) => {
    const searchBox = document.getElementById("live-search-input");
    const resBox = document.getElementById("live-search-results");
    if (searchBox && resBox && !searchBox.contains(e.target) && !resBox.contains(e.target)) {
      resBox.classList.add("hidden");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeBookingModal();
      closeGenericModal();
      document.getElementById("zalo-widget")?.classList.add("hidden");
    }
  });
});

function toggleZaloWidget() {
  document.getElementById("zalo-widget")?.classList.toggle("hidden");
}

function initScrollHeaderAndReveal() {
  const header = document.getElementById("main-header");
  window.addEventListener("scroll", () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 30);
    const prog = document.getElementById("article-reading-progress");
    if (prog && state.currentView === "article-detail") {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? Math.min(100, Math.max(0, (window.scrollY / docH) * 100)) : 0;
      prog.style.width = pct.toFixed(1) + "%";
    }
  }, { passive: true });

  const reveals = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("visible");
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.08 });
  reveals.forEach((el) => obs.observe(el));
}

function openTVCModal() {
  document.getElementById("generic-modal-body").innerHTML = `
    <span class="eyebrow">Phim giới thiệu thương hiệu</span>
    <h3 class="font-display text-3xl font-semibold text-navy-900 mt-1 mb-4">Mắt Sài Gòn Phú Thọ (Hệ thống liên kết) – Chuẩn Mực 5 Sao</h3>
    <div class="rounded-2xl overflow-hidden bg-navy-950 shadow-2xl aspect-video">
      <iframe
        class="w-full h-full border-0"
        src="https://www.youtube.com/embed/8JshyLIcKWo?autoplay=1&rel=0"
        title="TỔNG HỢP VIDEO BỆNH VIỆN MẮT SGPT"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </div>
  `;
  document.getElementById("generic-modal").classList.remove("hidden");
}

function openSpotlightSearch() {
  document.getElementById("generic-modal-body").innerHTML = `
    <span class="eyebrow">Tìm kiếm thông minh</span>
    <h3 class="font-display text-2xl font-semibold text-navy-900 mt-1 mb-4">Tra Cứu Bệnh Lý, Dịch Vụ &amp; Bác Sĩ</h3>
    <input type="text" autofocus oninput="handleLiveSearch(this.value, 'spotlight-search-results')" placeholder="Nhập tên bệnh, phương pháp mổ hoặc tên bác sĩ..." class="w-full px-4 py-3 rounded-xl bg-ivory-50 border border-gold-500/40 text-sm focus:outline-none mb-3" />
    <div id="spotlight-search-results" class="max-h-72 overflow-y-auto space-y-1"></div>
  `;
  document.getElementById("generic-modal").classList.remove("hidden");
}

function initHeroDate() {
  const el = document.getElementById("hero-quick-date");
  if (el) el.value = state.booking.date;
}

// -------------------- NAVIGATION --------------------
function updateUrlHash(hash) {
  if (!hash) return;
  const normalized = hash.startsWith("#") ? hash : `#${hash}`;
  if (window.location.hash !== normalized) {
    window.location.hash = normalized;
  }
}

function handleHashRoute() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return;

  const aboutMatch = raw.match(/^about-(timeline|facilities|tech|legal)$/);
  if (aboutMatch) {
    const subTab = aboutMatch[1];
    if (state.currentView !== "about" || state.aboutTab !== subTab) {
      navigateTo("about", subTab, true);
    }
    return;
  }

  const serviceMatch = raw.match(/^service-(.+)$/);
  if (serviceMatch && typeof openServiceDetail === "function") {
    openServiceDetail(serviceMatch[1]);
    return;
  }

  const doctorMatch = raw.match(/^doctor-(.+)$/);
  if (doctorMatch && typeof openDoctorDetail === "function") {
    openDoctorDetail(doctorMatch[1]);
    return;
  }

  const articleMatch = raw.match(/^article-(articles|news)-(.+)$/);
  if (articleMatch && typeof openArticleDetail === "function") {
    openArticleDetail(articleMatch[2], articleMatch[1]);
    return;
  }

  const validViews = ["home", "about", "doctors", "services", "support", "knowledge", "contact"];
  if (validViews.includes(raw) && state.currentView !== raw) {
    navigateTo(raw, undefined, true);
  }
}

function navigateTo(view, subTab, skipHashUpdate = false) {
  const target = document.getElementById(`view-${view}`);
  if (!target) {
    if ((view === "about" || view === "support" || view === "knowledge") && subTab) {
      window.location.href = `${view}-${subTab}.html`;
    } else if (view === "home") {
      window.location.href = "index.html";
    } else {
      window.location.href = `${view}.html`;
    }
    return;
  }
  document.querySelectorAll(".page-view").forEach((v) => v.classList.remove("active"));
  target.classList.add("active");
  state.currentView = view;

  // Highlight active nav link
  const navGroup = view === "doctor-detail" ? "doctors" : view === "service-detail" ? "services" : view === "article-detail" ? "knowledge" : view;
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.classList.toggle("nav-link-active", el.getAttribute("data-nav") === navGroup);
  });
  const prog = document.getElementById("article-reading-progress");
  if (prog && view !== "article-detail") prog.style.width = "0%";

  if (view === "about" && subTab) switchAboutTab(subTab, true);
  if (view === "support" && subTab) switchSupportTab(subTab);
  if (view === "knowledge" && subTab) switchKnowledgeTab(subTab);
  if (view === "home") setTimeout(syncBAWidth, 50);

  if (!skipHashUpdate) {
    const nextHash = view === "about" && subTab ? `#about-${subTab}` : `#${view}`;
    updateUrlHash(nextHash);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleMobileMenu() {
  document.getElementById("mobile-menu").classList.toggle("hidden");
}

// -------------------- ACCESSIBILITY & LANGUAGE --------------------
function setFontScale(scale) {
  const html = document.documentElement;
  html.classList.remove("font-scale-lg", "font-scale-xl");
  if (scale === "lg") html.classList.add("font-scale-lg");
  if (scale === "xl") html.classList.add("font-scale-xl");
  showToast(
    scale === "xl" ? "Đã bật cỡ chữ Lớn (Hỗ trợ thị lực)" :
    scale === "lg" ? "Đã bật cỡ chữ Trung bình" : "Đã đặt lại cỡ chữ Tiêu chuẩn"
  );
}

function syncLangIfEn(el) {
  if (state.lang === "en" && typeof window.applyFullLanguageDOM === "function") {
    window._langTranslating = true;
    try { window.applyFullLanguageDOM("en", el || document.body); } finally { window._langTranslating = false; }
  }
}

(function setupAutoEnglishObserver() {
  document.addEventListener("DOMContentLoaded", () => {
    const obs = new MutationObserver((mutations) => {
      if (state.lang !== "en" || window._langTranslating) return;
      window._langTranslating = true;
      try {
        mutations.forEach((m) => {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === 1) window.applyFullLanguageDOM("en", n);
          });
        });
      } finally {
        window._langTranslating = false;
      }
    });
    ["app-main", "booking-modal", "generic-modal"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el, { childList: true, subtree: true });
    });
  });
})();

function setLanguage(lang) {
  state.lang = lang;
  document.documentElement.lang = lang;
  const dict = DATA.i18n[lang];
  if (dict) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (dict[key]) el.innerHTML = dict[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key]) el.placeholder = dict[key];
    });
  }

  if (typeof window.applyFullLanguageDOM === "function") {
    window.applyFullLanguageDOM(lang, document.body);
  }

  document.getElementById("lang-vi").className = lang === "vi"
    ? "px-2.5 py-1 rounded-full bg-navy-900 text-white font-semibold text-[11px] transition"
    : "px-2.5 py-1 rounded-full text-slate-600 hover:text-navy-900 font-semibold text-[11px] transition";
  document.getElementById("lang-en").className = lang === "en"
    ? "px-2.5 py-1 rounded-full bg-navy-900 text-white font-semibold text-[11px] transition"
    : "px-2.5 py-1 rounded-full text-slate-600 hover:text-navy-900 font-semibold text-[11px] transition";

  showToast(lang === "en" ? "Switched interface language to English" : "Đã chuyển ngôn ngữ sang Tiếng Việt");
}

// -------------------- LIVE SEARCH --------------------
function handleLiveSearch(query, targetId = "live-search-results") {
  const box = document.getElementById(targetId);
  if (!box) return;
  const q = query.trim().toLowerCase();
  if (!q) {
    box.classList.add("hidden");
    return;
  }

  const docMatches = DATA.doctors.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q));
  const srvMatches = DATA.services.filter(s => s.name.toLowerCase().includes(q) || s.target.toLowerCase().includes(q));
  const artMatches = DATA.articles.filter(a => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));

  let html = "";
  if (docMatches.length) {
    html += `<div class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-600">Bác sĩ</div>`;
    docMatches.slice(0, 3).forEach(d => {
      html += `<button onclick="openDoctorDetail('${d.id}'); document.getElementById('${targetId}').classList.add('hidden')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-ivory-100 flex items-center gap-2.5 text-xs">
        <img src="${d.image}" class="w-8 h-8 rounded-full object-cover bg-navy-900" />
        <div><div class="font-semibold text-navy-900">${d.name}</div><div class="text-slate-500">${d.specialty}</div></div>
      </button>`;
    });
  }
  if (srvMatches.length) {
    html += `<div class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-600 mt-1">Dịch vụ</div>`;
    srvMatches.slice(0, 3).forEach(s => {
      html += `<button onclick="openServiceDetail('${s.id}'); document.getElementById('${targetId}').classList.add('hidden')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-ivory-100 text-xs">
        <div class="font-semibold text-navy-900">${s.name}</div>
        <div class="text-slate-500 truncate">${s.priceRange}</div>
      </button>`;
    });
  }
  if (artMatches.length) {
    html += `<div class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-600 mt-1">Bệnh lý &amp; Kiến thức</div>`;
    artMatches.slice(0, 3).forEach(a => {
      html += `<button onclick="openArticleDetail('${a.id}'); closeGenericModal(); document.getElementById('${targetId}').classList.add('hidden')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-ivory-100 text-xs">
        <div class="font-semibold text-navy-900">${a.title}</div>
        <div class="text-slate-500">${a.category}</div>
      </button>`;
    });
  }

  if (!html) {
    html = `<div class="p-4 text-center text-xs text-slate-500">Không tìm thấy kết quả phù hợp cho "${query}"</div>`;
  }
  box.innerHTML = html;
  box.classList.remove("hidden");
}

// -------------------- COUNTERS --------------------
function initCounters() {
  const els = document.querySelectorAll(".counter");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const dec = parseInt(el.dataset.decimal || "0", 10);
      let curr = 0;
      const step = target / 45;
      const timer = setInterval(() => {
        curr += step;
        if (curr >= target) {
          el.textContent = dec > 0 ? target.toFixed(dec) : Math.round(target).toLocaleString("vi-VN");
          clearInterval(timer);
        } else {
          el.textContent = dec > 0 ? curr.toFixed(dec) : Math.round(curr).toLocaleString("vi-VN");
        }
      }, 25);
      obs.unobserve(el);
    });
  }, { threshold: 0.3 });
  els.forEach((el) => obs.observe(el));
}

// -------------------- HOME: SERVICES --------------------
let _homeSrvFilter = "all";

function filterHomeServices(id) {
  _homeSrvFilter = id;
  document.querySelectorAll(".hsrv-pill").forEach(btn => {
    const active = btn.dataset.hsrv === id;
    btn.className = active
      ? "hsrv-pill px-4 py-2 rounded-full text-xs font-semibold bg-navy-900 text-white shadow transition"
      : "hsrv-pill px-4 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-gold-500 transition";
  });
  renderHomeServices();
}

function renderHomeServices() {
  const icons = [
    `<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`,
    `<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    `<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`,
    `<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    `<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`
  ];

  const grid = document.getElementById("home-services-grid");
  if (!grid) return;
  const list = DATA.services.filter(s =>
    _homeSrvFilter === "all" ||
    s.id === _homeSrvFilter ||
    (_homeSrvFilter === "day-mat" && s.id === "kham-tong-quat")
  );
  grid.innerHTML = list.map((s, idx) => {
    const origIdx = DATA.services.findIndex(x => x.id === s.id);
    if (idx === 0 && list.length > 2) {
      return `
        <div class="luxury-card doctor-card-fx card-gold-accent animate-cascade overflow-hidden lg:col-span-2 grid grid-cols-1 md:grid-cols-12 bg-gradient-to-br from-white via-white to-gold-200/20 border-gold-500/30 group" style="animation-delay: ${idx * 70}ms">
          <div class="md:col-span-5 doctor-portrait-wrap relative min-h-[240px] md:min-h-full bg-navy-950">
            <img src="${s.image}" alt="${s.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            <div class="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent"></div>
            <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold-500 text-white text-[11px] font-bold shadow-lg">${s.badge}</span>
            <div class="absolute bottom-4 left-4 flex items-center gap-2.5 text-white">
              <div class="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-gold-400/40 text-gold-400 flex items-center justify-center">${icons[origIdx % icons.length]}</div>
              <span class="font-display text-3xl font-bold text-gold-400/80">0${origIdx + 1}</span>
            </div>
          </div>
          <div class="md:col-span-7 p-7 flex flex-col justify-between">
            <div>
              <h3 class="font-display text-3xl font-semibold text-navy-900 group-hover:text-gold-600 transition mb-2">${s.name}</h3>
              <p class="text-sm text-slate-600 leading-relaxed mb-4">${s.overview}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-3 py-1 rounded-full bg-navy-900/5 text-navy-900 text-xs font-semibold">⚡ ${s.duration}</span>
                <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">✓ ${s.recovery}</span>
              </div>
            </div>
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <span class="text-xs font-bold text-navy-900">${s.priceRange}</span>
              <div class="flex gap-2">
                <button onclick="openBookingModal('${s.id}')" class="btn-gold px-4 py-2 rounded-full text-xs">Đặt lịch</button>
                <button onclick="openServiceDetail('${s.id}')" class="px-4 py-2 rounded-full border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white text-xs font-semibold transition">Chi tiết &rarr;</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    return `
      <div class="luxury-card doctor-card-fx card-gold-accent animate-cascade overflow-hidden flex flex-col justify-between group" style="animation-delay: ${idx * 70}ms">
        <div>
          <div class="doctor-portrait-wrap h-48 relative bg-navy-950">
            <img src="${s.image}" alt="${s.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            <div class="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent"></div>
            <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-navy-950/75 backdrop-blur-md border border-gold-400/40 text-gold-400 text-[10px] font-bold">${s.badge}</span>
            <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
              <div class="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-gold-400/40 text-gold-400 flex items-center justify-center">${icons[origIdx % icons.length]}</div>
              <span class="font-display text-3xl font-bold text-white/40">0${origIdx + 1}</span>
            </div>
          </div>
          <div class="p-6 pb-2">
            <h3 class="font-display text-2xl font-semibold text-navy-900 group-hover:text-gold-600 transition mb-2">${s.name}</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">${s.target}</p>
            <div class="service-specs-reveal">
              <div class="flex flex-wrap gap-1.5 text-[11px]">
                <span class="px-2.5 py-1 rounded-full bg-ivory-100 text-navy-900 font-semibold">⏱ ${s.duration}</span>
                <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">✨ ${s.recovery}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-navy-900">${s.priceRange}</span>
          <div class="flex items-center gap-2">
            <button onclick="openBookingModal('${s.id}')" class="btn-gold px-3 py-1.5 rounded-full text-[11px]">Đặt lịch</button>
            <button onclick="openServiceDetail('${s.id}')" class="text-xs font-semibold text-gold-600 hover:text-navy-900 transition">Chi tiết &rarr;</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// -------------------- HOME: TECHNOLOGY SLIDER --------------------
function renderTechSlider() {
  const t = DATA.technologies[state.techIndex];
  const imgEl = document.getElementById("tech-image");
  if (!imgEl) return;
  imgEl.style.opacity = "0";
  setTimeout(() => {
    imgEl.src = t.image;
    imgEl.style.opacity = "1";
  }, 150);
  document.getElementById("tech-origin-badge").textContent = t.origin;
  document.getElementById("tech-name").textContent = t.name;
  document.getElementById("tech-tagline").textContent = t.tagline;
  document.getElementById("tech-highlights").innerHTML = t.highlights.map(h => `
    <li class="flex items-start gap-2.5">
      <span class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
      <span>${h}</span>
    </li>
  `).join("");
  document.getElementById("tech-metrics").innerHTML = `
    <div class="text-center"><div class="text-xs text-slate-500">Tốc độ</div><div class="font-bold text-navy-900">${t.metrics.speed}</div></div>
    <div class="text-center border-x border-gold-500/20"><div class="text-xs text-slate-500">Độ xâm lấn</div><div class="font-bold text-navy-900">${t.metrics.incision}</div></div>
    <div class="text-center"><div class="text-xs text-slate-500">Độ chính xác</div><div class="font-bold text-gold-600">${t.metrics.accuracy}</div></div>
  `;
  document.getElementById("tech-dots").innerHTML = DATA.technologies.map((_, i) => `
    <button onclick="state.techIndex=${i}; renderTechSlider()" class="h-2 rounded-full transition-all ${i === state.techIndex ? 'w-8 bg-gold-500' : 'w-2 bg-white/30'}"></button>
  `).join("");

  const strip = document.getElementById("tech-selector-strip");
  if (strip) {
    strip.innerHTML = DATA.technologies.map((item, i) => `
      <button onclick="selectTechManual(${i})" class="relative overflow-hidden p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${i === state.techIndex ? 'bg-navy-900 text-white border-gold-500 shadow-lg' : 'bg-white border-slate-200 hover:border-gold-400 text-navy-900'}">
        <img src="${item.image}" class="w-11 h-11 object-contain rounded-xl ${i === state.techIndex ? 'bg-white/10' : 'bg-ivory-100'} p-1 shrink-0" />
        <div class="min-w-0">
          <div class="text-[10px] uppercase tracking-wider ${i === state.techIndex ? 'text-gold-400' : 'text-gold-600'} font-bold truncate">${item.origin}</div>
          <div class="text-xs font-semibold truncate">${item.name}</div>
        </div>
        ${i === state.techIndex ? '<div class="tech-progress-fill absolute bottom-0 left-0 h-0.5 bg-gold-400"></div>' : ''}
      </button>
    `).join("");
  }
  syncLangIfEn(document.getElementById("tech-showcase-box"));
  syncLangIfEn(strip);
}
function selectTechManual(i) { state.techIndex = i; renderTechSlider(); resetTechAutoTimer(); }
function nextTech() { state.techIndex = (state.techIndex + 1) % DATA.technologies.length; renderTechSlider(); resetTechAutoTimer(); }
function prevTech() { state.techIndex = (state.techIndex - 1 + DATA.technologies.length) % DATA.technologies.length; renderTechSlider(); resetTechAutoTimer(); }

function openTechPrincipleModal() {
  const t = DATA.technologies[state.techIndex];
  document.getElementById("generic-modal-body").innerHTML = `
    <span class="px-3 py-1 rounded-full bg-gold-200/50 text-gold-600 text-xs font-bold">${t.origin}</span>
    <h3 class="font-display text-3xl font-semibold text-navy-900 mt-2 mb-2">Nguyên Lý Hoạt Động: ${t.name}</h3>
    <p class="text-sm text-slate-600 mb-6">${t.tagline}</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
      <div class="doctor-pedestal rounded-2xl p-6 flex items-center justify-center"><img src="${t.image}" class="max-h-56 object-contain" /></div>
      <div class="space-y-3 text-sm text-slate-700">
        ${t.highlights.map((h, i) => `<div class="p-3 rounded-xl bg-ivory-50 border border-slate-200"><strong class="text-gold-600">Bước 0${i + 1}:</strong> ${h}</div>`).join("")}
      </div>
    </div>
    <div class="flex justify-end gap-3">
      <button onclick="closeGenericModal(); openBookingModal('smile-pro')" class="btn-gold px-6 py-2.5 rounded-full text-sm">Đặt lịch khám &amp; trải nghiệm</button>
    </div>
  `;
  document.getElementById("generic-modal").classList.remove("hidden");
}

function scrollDoctorsSlider(dir) {
  const slider = document.getElementById("home-doctors-slider");
  if (slider) slider.scrollBy({ left: dir * 340, behavior: "smooth" });
}

let _homeDocFilter = "all";
let _homeDocSpotlight = 0;

function filterHomeDoctors(spec) {
  _homeDocFilter = spec;
  _homeDocSpotlight = 0;
  document.querySelectorAll(".hdoc-pill").forEach(btn => {
    const active = btn.dataset.hdoc === spec;
    btn.className = active
      ? "hdoc-pill px-4 py-1.5 rounded-full text-xs font-semibold bg-gold-500 text-white shadow transition"
      : "hdoc-pill px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200 hover:bg-white/20 transition";
  });
  renderHomeDoctors();
}

function focusHomeDoctor(idx) {
  _homeDocSpotlight = idx;
  const slider = document.getElementById("home-doctors-slider");
  const cards = slider?.querySelectorAll(".home-doc-card") || [];
  cards.forEach((c, i) => c.classList.toggle("home-doc-spotlight", i === idx));
  if (cards[idx] && slider) {
    slider.scrollTo({ left: Math.max(0, cards[idx].offsetLeft - 16), behavior: "smooth" });
  }
  document.querySelectorAll("#home-doctors-dots button").forEach((d, i) => {
    d.className = `h-2 rounded-full transition-all ${i === idx ? 'w-8 bg-gold-400' : 'w-2 bg-white/25 hover:bg-white/50'}`;
  });
}

// -------------------- HOME: DOCTORS SLIDER (CONTINUOUS MARQUEE) --------------------
function renderHomeDoctors() {
  const slider = document.getElementById("home-doctors-slider");
  if (!slider) return;
  const list = DATA.doctors.filter(d => _homeDocFilter === "all" || d.specialty === _homeDocFilter);
  const base = list.length <= 2 ? [...list, ...list] : list;
  const loopList = [...base, ...base];

  slider.innerHTML = `<div class="doctors-marquee-track">` + loopList.map((d) => `
    <div class="home-doc-card doctor-card-fx card-gold-accent group shrink-0 w-64 sm:w-80 bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl">
      <div>
        <div class="doctor-portrait-wrap h-60 sm:h-72 relative">
          <img src="${d.image}" alt="${d.name}" class="w-full h-full object-cover object-top group-hover:scale-105 transition duration-700" />
          <div class="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent"></div>
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-navy-950/75 backdrop-blur-md border border-gold-400/40 text-[10px] font-bold text-gold-400">${d.specialty}</span>
          <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gold-500 text-white text-[10px] font-bold shadow">${d.experience} năm KN</span>
        </div>
        <div class="px-6 pt-5 pb-2">
          <span class="inline-block px-2.5 py-0.5 rounded-full bg-gold-500/15 border border-gold-400/30 text-[10px] font-bold uppercase tracking-wider text-gold-400">${d.title}</span>
          <h3 class="font-display text-2xl font-semibold text-white mt-2">${d.name}</h3>
          <p class="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">${d.role}</p>
          <div class="doctor-schedule-reveal">
            <div class="p-2.5 rounded-xl bg-white/10 border border-gold-400/30 text-[11px] text-slate-200">
              <strong class="text-gold-400 block mb-0.5">Lịch khám tuần này:</strong>
              ${d.schedule.map(s => `<span class="inline-block mr-2">• ${s.day} (${s.time})</span>`).join("")}
            </div>
          </div>
        </div>
      </div>
      <div class="px-6 pb-6 pt-3">
        <div class="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/10">
          <button onclick="openDoctorDetail('${d.id}')" class="px-3 py-2 rounded-full border border-white/25 text-xs font-semibold hover:bg-white/10 transition">Xem hồ sơ</button>
          <button onclick="openBookingModal('', '${d.id}')" class="btn-gold px-3 py-2 rounded-full text-xs">Đặt lịch</button>
        </div>
      </div>
    </div>
  `).join("") + `</div>`;
  syncLangIfEn(slider);
}

// -------------------- HOME: 60s VISION QUIZ --------------------
const QUIZ_QUESTIONS = [
  { key: "diopter", q: "1. Độ cận hiện tại của bạn khoảng bao nhiêu?", opts: ["Dưới 3.0 Diop", "Từ 3.0 – 7.0 Diop", "Trên 7.0 Diop / Giác mạc mỏng", "Chưa rõ / Chỉ bị lóa mắt"] },
  { key: "age", q: "2. Độ tuổi hiện tại của bạn?", opts: ["Dưới 18 tuổi", "Từ 18 – 35 tuổi", "Từ 36 – 45 tuổi", "Trên 45 tuổi"] },
  { key: "dry", q: "3. Bạn có thường xuyên bị khô mắt khi dùng máy tính?", opts: ["Không bị", "Thỉnh thoảng", "Thường xuyên khô rát"] },
  { key: "job", q: "4. Đặc thù công việc / sở thích của bạn?", opts: ["Văn phòng / Thiết bị số", "Hàng không / Thể thao vận động mạnh", "Học sinh / Sinh viên"] }
];

function renderVisionQuiz() {
  const box = document.getElementById("vision-quiz-box");
  if (!box) return;

  if (state.quizStep < QUIZ_QUESTIONS.length) {
    const item = QUIZ_QUESTIONS[state.quizStep];
    box.innerHTML = `
      <div class="flex items-center justify-between text-xs text-slate-500 mb-4">
        <div class="flex items-center gap-2">
          ${state.quizStep > 0 ? `<button onclick="state.quizStep--; renderVisionQuiz()" class="text-gold-600 font-semibold hover:underline">&larr; Quay lại</button>` : ''}
          <span>Câu hỏi ${state.quizStep + 1} / ${QUIZ_QUESTIONS.length}</span>
        </div>
        <div class="w-32 h-1.5 bg-ivory-100 rounded-full overflow-hidden">
          <div class="h-full bg-gold-500 transition-all" style="width:${((state.quizStep + 1) / QUIZ_QUESTIONS.length) * 100}%"></div>
        </div>
      </div>
      <h4 class="font-display text-2xl font-semibold text-navy-900 mb-5">${item.q}</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${item.opts.map((opt, idx) => `
          <button onclick="answerQuizIdx(${idx})" class="text-left p-4 rounded-xl border ${state.quizAnswers[item.key] === opt ? 'border-gold-500 bg-gold-200/25' : 'border-slate-200'} hover:border-gold-500 hover:bg-gold-200/20 text-sm font-medium text-navy-900 transition">
            ${opt}
          </button>
        `).join("")}
      </div>
    `;
  } else {
    let rec = { name: "SMILE Pro (VisuMax 800)", id: "smile-pro", reason: "Độ tuổi và nhu cầu vận động của bạn rất lý tưởng cho phẫu thuật không tạo vạt 10 giây, hạn chế khô mắt tới 80%." };
    if (state.quizAnswers.age === "Dưới 18 tuổi") {
      rec = { name: "Kính áp tròng ban đêm Ortho-K", id: "ortho-k", reason: "Dưới 18 tuổi độ cận chưa ổn định. Ortho-K giúp nhìn rõ 10/10 ban ngày và kìm hãm tăng độ tới 80%." };
    } else if (state.quizAnswers.diopter && state.quizAnswers.diopter.includes("Trên 7.0")) {
      rec = { name: "Phakic ICL Cao Cấp", id: "smile-pro", reason: "Với độ cận cao hoặc giác mạc mỏng, thấu kính nội nhãn Phakic ICL bảo toàn 100% giác mạc và cho thị lực HD sắc nét." };
    } else if (state.quizAnswers.age === "Trên 45 tuổi") {
      rec = { name: "Tầm soát Đục thủy tinh thể & Phaco", id: "phaco", reason: "Ở độ tuổi trên 45, bác sĩ khuyên khám tầm soát lão thị và thủy tinh thể để có giải pháp tối ưu nhất." };
    }

    box.innerHTML = `
      <div class="text-center sm:text-left space-y-4">
        <span class="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">✓ Kết quả phân tích 60 giây</span>
        <h4 class="font-display text-2xl sm:text-3xl font-semibold text-navy-900">Gợi ý tối ưu: <span class="text-gold-600">${rec.name}</span></h4>
        <p class="text-sm text-slate-600">${rec.reason}</p>
        <div class="vip-voucher rounded-2xl p-4 text-white flex items-center justify-between gap-3">
          <div>
            <div class="text-[10px] uppercase tracking-widest text-gold-400 font-bold">Mã ưu đãi khám chuyên sâu</div>
            <div class="font-display text-xl font-bold tracking-wider">VIP-SMILE2026</div>
          </div>
          <span class="px-3 py-1 rounded-full bg-gold-500 text-white text-xs font-bold shrink-0">Miễn phí 1.200.000đ</span>
        </div>
        <div class="flex flex-wrap gap-3 pt-1">
          <button onclick="openBookingModal('${rec.id}', '', 'Áp dụng mã VIP-SMILE2026 từ Trắc nghiệm 60s')" class="btn-gold px-6 py-3 rounded-full text-sm">Đặt lịch &amp; Áp dụng mã</button>
          <button onclick="state.quizStep=0; state.quizAnswers={}; renderVisionQuiz()" class="px-5 py-3 rounded-full border border-slate-200 text-sm font-medium hover:bg-ivory-50">Làm lại</button>
        </div>
      </div>
    `;
  }
}

function answerQuizIdx(idx) {
  const item = QUIZ_QUESTIONS[state.quizStep];
  if (item && item.opts[idx]) {
    state.quizAnswers[item.key] = item.opts[idx];
    state.quizStep++;
    renderVisionQuiz();
  }
}

// -------------------- HOME: TESTIMONIALS & BEFORE/AFTER --------------------
function renderHomeTestimonials() {
  const grid = document.getElementById("home-testimonials-grid");
  if (!grid) return;
  grid.innerHTML = DATA.testimonials.map(t => `
    <div class="group luxury-card card-gold-accent overflow-hidden flex flex-col justify-between">
      <div>
        <div class="h-52 overflow-hidden relative">
          <img src="${t.image}" alt="${t.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent"></div>
          <span class="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-navy-900/90 border border-gold-400/30 text-gold-400 text-[11px] font-semibold">${t.method}</span>
          <span class="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-semibold">✓ Đã điều trị</span>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gold-500 text-xs">★★★★★</span>
            <span class="font-display text-3xl leading-none text-gold-400/60">”</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-600 italic leading-relaxed">“${t.quote}”</p>
        </div>
      </div>
      <div class="px-5 pb-5 pt-3 border-t border-slate-100">
        <div class="font-semibold text-sm text-navy-900">${t.name}</div>
        <div class="text-[11px] text-slate-500">${t.role}</div>
      </div>
    </div>
  `).join("");
  syncLangIfEn(grid);
}

function syncBAWidth() {
  const container = document.getElementById("ba-slider");
  const beforeImg = document.getElementById("ba-before-img");
  if (container && beforeImg && container.offsetWidth > 0) {
    beforeImg.style.width = container.offsetWidth + "px";
  }
}

function initBASlider() {
  const container = document.getElementById("ba-slider");
  const layer = document.getElementById("ba-before-layer");
  const handle = document.getElementById("ba-handle");
  if (!container || !layer || !handle) return;

  syncBAWidth();
  window.addEventListener("resize", syncBAWidth);

  let dragging = false;
  let manualPauseUntil = 0;

  const move = (clientX) => {
    const rect = container.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(5, Math.min(95, pct));
    layer.style.width = pct + "%";
    handle.style.left = pct + "%";
  };

  container.addEventListener("mousedown", (e) => { dragging = true; manualPauseUntil = Date.now() + 6000; move(e.clientX); });
  window.addEventListener("mouseup", () => { if (dragging) { dragging = false; manualPauseUntil = Date.now() + 6000; } });
  window.addEventListener("mousemove", (e) => { if (dragging) move(e.clientX); });
  container.addEventListener("touchmove", (e) => { manualPauseUntil = Date.now() + 6000; move(e.touches[0].clientX); }, { passive: true });

  // Automatic smooth sweep demo when user is not dragging
  let phase = 0;
  setInterval(() => {
    if (dragging || Date.now() < manualPauseUntil || state.currentView !== "home") return;
    phase += 0.04;
    const pct = 50 + Math.sin(phase) * 24;
    layer.style.width = pct.toFixed(2) + "%";
    handle.style.left = pct.toFixed(2) + "%";
  }, 40);
}

// -------------------- DYNAMIC KINETIC ENGINES --------------------
let _techTimer = null;
let _techHovered = false;

function resetTechAutoTimer() {
  clearInterval(_techTimer);
  _techTimer = setInterval(() => {
    if (_techHovered || state.currentView !== "home") return;
    state.techIndex = (state.techIndex + 1) % DATA.technologies.length;
    renderTechSlider();
  }, 4500);
}

function initDynamicEngines() {
  // 1. Live Activity Ticker
  const tickers = [
    "Đang mở đặt lịch VIP trực tuyến hôm nay",
    "Vừa có 1 lịch hẹn SMILE Pro từ Cầu Giấy • 2 phút trước",
    "GS.TS.TTND Tôn Thị Kim Thanh đang có lịch khám sáng T2/T4/T6",
    "Ưu đãi mùa mổ cận 2026: Tài trợ tới 35% chi phí SMILE Pro"
  ];
  let tIdx = 0;
  setInterval(() => {
    const el = document.getElementById("live-activity-ticker");
    if (!el) return;
    tIdx = (tIdx + 1) % tickers.length;
    el.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span><span class="animate-fade-slide">${tickers[tIdx]}</span>`;
  }, 4000);

  // 2. Dynamic Hero Prestige Card Cycling
  const heroSlides = [
    {
      img: "assets/images/facility/surgical-suite.jpg",
      badge: "Phòng mổ Vô khuẩn JCI",
      role: "Giám đốc Chuyên môn • 40 năm KN",
      docName: "GS.TS.TTND Tôn Thị Kim Thanh",
      docId: "ton-thi-kim-thanh",
      m1: ["10s", "SMILE Pro"], m2: ["24h", "Phục hồi"], m3: ["99.8%", "Hài lòng"]
    },
    {
      img: "assets/images/facility/hospital-interior.jpg",
      badge: "Không gian 5 Sao Quốc tế",
      role: "Giám đốc Bệnh viện • 32 năm KN",
      docName: "TS.BS Vũ Thị Thanh",
      docId: "vu-thi-thanh",
      m1: ["25.000+", "Ca Phaco"], m2: ["2.2mm", "Vết mổ siêu nhỏ"], m3: ["Trong ngày", "Xuất viện"]
    },
    {
      img: "assets/images/facility/consultation.webp",
      badge: "Trung tâm Khúc xạ VISUMAX 800",
      role: "Trưởng khoa Khúc xạ • 35 năm KN",
      docName: "BSCKII Bùi Tiến Hùng",
      docId: "bui-tien-hung",
      m1: ["30.000+", "Ca xóa cận"], m2: ["80%", "Giảm khô mắt"], m3: ["0%", "Trả góp"]
    }
  ];
  let hIdx = 0;
  const renderHeroSlide = () => {
    const box = document.getElementById("hero-prestige-card");
    if (!box) return;
    const s = heroSlides[hIdx];
    box.innerHTML = `
      <div class="relative rounded-2xl overflow-hidden h-52 animate-fade-slide">
        <img src="${s.img}" alt="${s.badge}" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent"></div>
        <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-navy-950/80 border border-gold-400/40 text-gold-400 text-[10px] font-bold uppercase tracking-wider">${s.badge}</span>
        <div class="absolute top-3 right-3 flex gap-1">
          ${heroSlides.map((_, i) => `<span class="h-1.5 rounded-full transition-all ${i === hIdx ? 'w-5 bg-gold-400' : 'w-1.5 bg-white/40'}"></span>`).join("")}
        </div>
        <div class="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <div class="text-[11px] text-gold-400 font-semibold">${s.role}</div>
            <div class="font-display text-xl font-semibold">${s.docName}</div>
          </div>
          <button onclick="openDoctorDetail('${s.docId}')" class="px-3 py-1.5 rounded-full bg-white/15 hover:bg-gold-500 text-[11px] font-semibold transition shrink-0">Hồ sơ &rarr;</button>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center animate-fade-slide">
        <div class="p-3 rounded-xl bg-white/5 border border-white/10"><div class="font-display text-2xl font-bold text-gold-400">${s.m1[0]}</div><div class="text-[10px] text-slate-300 uppercase tracking-wider">${s.m1[1]}</div></div>
        <div class="p-3 rounded-xl bg-white/5 border border-white/10"><div class="font-display text-2xl font-bold text-gold-400">${s.m2[0]}</div><div class="text-[10px] text-slate-300 uppercase tracking-wider">${s.m2[1]}</div></div>
        <div class="p-3 rounded-xl bg-white/5 border border-white/10"><div class="font-display text-2xl font-bold text-emerald-400">${s.m3[0]}</div><div class="text-[10px] text-slate-300 uppercase tracking-wider">${s.m3[1]}</div></div>
      </div>
    `;
  };
  renderHeroSlide();
  let heroPaused = false;
  const heroBox = document.getElementById("hero-prestige-card");
  heroBox?.addEventListener("mouseenter", () => heroPaused = true);
  heroBox?.addEventListener("mouseleave", () => heroPaused = false);
  setInterval(() => {
    if (heroPaused || state.currentView !== "home") return;
    hIdx = (hIdx + 1) % heroSlides.length;
    renderHeroSlide();
  }, 4500);

  // 3. Technology Auto-Play (pauses on hover)
  const techBox = document.getElementById("tech-showcase-box");
  const techStrip = document.getElementById("tech-selector-strip");
  [techBox, techStrip].forEach(el => {
    el?.addEventListener("mouseenter", () => _techHovered = true);
    el?.addEventListener("mouseleave", () => _techHovered = false);
  });
  resetTechAutoTimer();

  // 4. Doctors Continuous Marquee runs via CSS (.doctors-marquee-track) and pauses smoothly on hover

  // 5. Dynamic Spotlight Cycling for Pillars, Services & Testimonials
  const cycleHighlight = (selector, intervalMs) => {
    let idx = 0;
    let paused = false;
    const attachHover = () => {
      document.querySelectorAll(selector).forEach(el => {
        el.addEventListener("mouseenter", () => paused = true);
        el.addEventListener("mouseleave", () => paused = false);
      });
    };
    attachHover();
    setInterval(() => {
      if (paused || state.currentView !== "home") return;
      const cards = document.querySelectorAll(selector);
      if (!cards.length) return;
      cards.forEach((c, i) => c.classList.toggle("dynamic-card-active", i === idx));
      idx = (idx + 1) % cards.length;
    }, intervalMs);
  };
  cycleHighlight("#stats-cards-grid .stat-card", 2400);
  cycleHighlight("#pillars-grid .pillar-card", 2600);
  cycleHighlight("#home-services-grid .luxury-card", 3200);
  cycleHighlight("#facility-gallery-grid .facility-card", 2800);
  cycleHighlight("#home-testimonials-grid .luxury-card", 3000);
}

// -------------------- VIEW: ABOUT & LEGAL --------------------
function switchAboutTab(tab, skipHashUpdate = false) {
  state.aboutTab = tab;
  document.querySelectorAll(".about-tab").forEach(btn => {
    btn.className = btn.dataset.tab === tab
      ? "about-tab px-4 py-2 rounded-full text-xs font-semibold bg-gold-500 text-white"
      : "about-tab px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-slate-200 hover:bg-white/20";
  });
  renderAboutTab(tab);
  if (!skipHashUpdate && state.currentView === "about") {
    updateUrlHash(`#about-${tab}`);
  }
}

let _timelineTimer = null;
function startAboutTimelineSpotlight() {
  clearInterval(_timelineTimer);
  let idx = 0;
  let paused = false;
  const list = document.getElementById("about-timeline-list");
  list?.addEventListener("mouseenter", () => paused = true);
  list?.addEventListener("mouseleave", () => paused = false);
  _timelineTimer = setInterval(() => {
    if (paused || state.currentView !== "about") return;
    const cards = document.querySelectorAll("#about-timeline-list .timeline-card");
    if (!cards.length) return;
    cards.forEach((c, i) => c.classList.toggle("dynamic-card-active", i === idx));
    idx = (idx + 1) % cards.length;
  }, 2400);
}

function renderAboutTab(tab) {
  const box = document.getElementById("about-content");
  if (!box) return;
  if (tab === "timeline") {
    box.innerHTML = `
      <div class="space-y-16">
        <!-- Lời giới thiệu & Thông điệp Giám đốc chuyên môn -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center animate-cascade">
          <div class="lg:col-span-6 relative group">
            <div class="doctor-portrait-wrap rounded-3xl overflow-hidden shadow-2xl">
              <img src="assets/images/facility/hospital-interior.jpg" class="w-full h-96 object-cover group-hover:scale-105 transition duration-700" />
            </div>
            <div class="animate-float-slow absolute -bottom-5 right-6 bg-navy-900 text-white px-6 py-4 rounded-2xl shadow-xl border border-gold-500/40">
              <div class="font-display text-3xl font-bold text-gold-400">25+ Năm</div>
              <div class="text-xs text-slate-300">Phụng sự thị lực cộng đồng</div>
            </div>
          </div>
          <div class="lg:col-span-6 space-y-5">
            <span class="eyebrow">Hành trình 25+ năm kiến tạo</span>
            <h2 class="font-display text-3xl sm:text-4xl font-semibold text-navy-900">Tiên Phong Nhãn Khoa Chuẩn Quốc Tế Tại Việt Nam</h2>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
              Được sáng lập và dẫn dắt bởi đội ngũ Giáo sư, Thầy thuốc Nhân dân từng giữ trọng trách tại Bệnh viện Mắt Trung Ương và Bệnh viện Mắt Hà Nội, <strong>Mắt Sài Gòn Phú Thọ (Hệ thống liên kết)</strong> kiên định theo đuổi triết lý: kết hợp bàn tay vàng của chuyên gia đầu ngành cùng siêu công nghệ nhãn khoa tối tân nhất thế giới.
            </p>
            <blockquote class="luxury-card p-5 rounded-2xl bg-ivory-100 border-l-4 border-l-gold-500 text-sm italic text-navy-900">
              “Mỗi đôi mắt là một kiệt tác vô giá. Nhiệm vụ của chúng tôi không chỉ là phục hồi thị lực 10/10, mà là bảo vệ sự an toàn tuyệt đối và nâng niu từng khoảnh khắc nhìn thấy ánh sáng của người bệnh.”
              <footer class="not-italic font-bold text-xs text-gold-600 mt-2">— GS.TS.TTND Tôn Thị Kim Thanh • Giám đốc Chuyên môn</footer>
            </blockquote>
          </div>
        </div>

        <!-- Tầm nhìn - Sứ mệnh - Giá trị -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="luxury-card doctor-card-fx doctor-portrait-wrap card-gold-accent animate-cascade p-7 border-t-4 border-t-gold-500" style="animation-delay: 80ms">
            <span class="text-xs font-bold uppercase tracking-widest text-gold-600">Tầm nhìn 2030</span>
            <h3 class="font-display text-2xl font-semibold text-navy-900 mt-2 mb-3">Hệ Thống Nhãn Khoa 5 Sao Hàng Đầu Đông Nam Á</h3>
            <p class="text-sm text-slate-600 leading-relaxed">Trở thành trung tâm nhãn khoa chuyên sâu đạt chuẩn kiểm định JCI Quốc tế, là điểm đến tin cậy cho bệnh nhân trong nước và kiều bào.</p>
          </div>
          <div class="luxury-card doctor-card-fx doctor-portrait-wrap card-gold-accent animate-cascade p-7 border-t-4 border-t-navy-900" style="animation-delay: 160ms">
            <span class="text-xs font-bold uppercase tracking-widest text-navy-900">Sứ mệnh</span>
            <h3 class="font-display text-2xl font-semibold text-navy-900 mt-2 mb-3">Khai Mở Tầm Nhìn – Kiến Tạo Tương Lai</h3>
            <p class="text-sm text-slate-600 leading-relaxed">Phổ cập công nghệ điều trị nhãn khoa không đau, ít xâm lấn với chi phí minh bạch và dịch vụ chăm sóc tận tâm như người thân.</p>
          </div>
          <div class="luxury-card doctor-card-fx doctor-portrait-wrap card-gold-accent animate-cascade p-7 border-t-4 border-t-emerald-600" style="animation-delay: 240ms">
            <span class="text-xs font-bold uppercase tracking-widest text-emerald-700">Triết lý Y đức</span>
            <h3 class="font-display text-2xl font-semibold text-navy-900 mt-2 mb-3">Tâm Đức • Tinh Hoa • Minh Bạch</h3>
            <p class="text-sm text-slate-600 leading-relaxed">Chỉ định điều trị trung thực theo đúng tình trạng bệnh lý, tuyệt đối không lạm dụng kỹ thuật, đồng hành trọn đời cùng thị lực bệnh nhân.</p>
          </div>
        </div>

        <!-- Dòng thời gian chi tiết 7 cột mốc có trục nối phát sáng & spotlight động -->
        <div>
          <div class="text-center max-w-2xl mx-auto mb-10">
            <span class="eyebrow">Cột mốc vàng son</span>
            <h3 class="font-display text-3xl sm:text-4xl font-semibold text-navy-900 mt-2">Lịch Sử Hình Thành &amp; Phát Triển</h3>
          </div>
          <div class="relative pl-6 sm:pl-10 space-y-5" id="about-timeline-list">
            <div class="absolute left-2 sm:left-4 top-3 bottom-3 w-0.5 bg-gradient-to-b from-gold-500 via-navy-900/30 to-gold-500"></div>
            ${[
              { y: "2001", t: "Đặt nền móng Trung tâm Nhãn khoa Chuyên sâu", d: "Khởi đầu với phòng khám chuyên khoa mắt quy tụ các giảng viên và bác sĩ đầu ngành từ Đại học Y Hà Nội & BV Mắt Trung Ương." },
              { y: "2008", t: "Mở rộng quy mô & Chuẩn hóa Phẫu thuật Phaco", d: "Đưa vào vận hành hệ thống phẫu thuật đục thủy tinh thể Phaco nhũ tương hóa đầu tiên, giúp hàng nghìn người cao tuổi tìm lại ánh sáng." },
              { y: "2012", t: "Chính thức thành lập Mắt Sài Gòn Phú Thọ (Hệ thống liên kết)", d: "Khánh thành tòa nhà bệnh viện chuyên khoa tại Đ. Nguyễn Tất Thành, P. Vân Phú, TP. Việt Trì, Tỉnh Phú Thọ với đầy đủ các khoa Khúc xạ, Đáy mắt, Nhãn nhi." },
              { y: "2017", t: "Thành lập Trung tâm Kiểm soát Cận thị Học đường", d: "Tiên phong ứng dụng kính áp tròng ban đêm Ortho-K cá nhân hóa theo bản đồ giác mạc 3D cho trẻ em và thanh thiếu niên." },
              { y: "2020", t: "Cột mốc 50.000+ ca Phẫu thuật Khúc xạ An toàn", d: "Chuyển giao đồng bộ công nghệ Femtosecond Laser & ReLEx SMILE từ Carl Zeiss (Đức), đạt tỷ lệ hài lòng lâm sàng trên 99.5%." },
              { y: "2024", t: "Đưa vào hoạt động Khoa Dịch kính – Võng mạc 27G", d: "Trang bị hệ thống chụp cắt lớp OCT-A không xâm lấn và máy vi phẫu Alcon Constellation điều trị bệnh lý võng mạc đái tháo đường." },
              { y: "2026", t: "Hợp tác Chiến lược NSQ Capital & Siêu máy VisuMax 800", d: "Hoàn tất nâng cấp toàn diện hệ thống bệnh viện chuẩn 5 sao Quốc tế, đưa vào vận hành siêu cỗ máy SMILE Pro 10 giây thế hệ mới nhất." }
            ].map((m, i) => `
              <div class="timeline-card relative luxury-card doctor-card-fx card-gold-accent animate-cascade p-6 flex flex-col md:flex-row md:items-center gap-5" style="animation-delay: ${i * 90}ms">
                <span class="absolute -left-[22px] sm:-left-[30px] top-8 w-3.5 h-3.5 rounded-full bg-gold-500 ring-4 ring-ivory-50 shadow"></span>
                <div class="font-display text-4xl font-bold text-gold-600 w-28 shrink-0">${m.y}</div>
                <div>
                  <h4 class="font-display text-2xl font-semibold text-navy-900">${m.t}</h4>
                  <p class="text-sm text-slate-600 mt-1 leading-relaxed">${m.d}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Đối tác & Chứng nhận Marquee -->
        <div class="bg-navy-900 text-white rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl overflow-hidden">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span class="text-xs font-bold uppercase tracking-widest text-gold-400">Hợp tác quốc tế</span>
              <h3 class="font-display text-3xl font-semibold mt-1">Đối Tác Chiến Lược Của Các Tập Đoàn Nhãn Khoa Hàng Đầu</h3>
            </div>
            <button onclick="navigateTo('doctors')" class="btn-gold px-7 py-3.5 rounded-full text-sm shrink-0">Gặp gỡ Đội ngũ Bác sĩ &rarr;</button>
          </div>
          <div class="marquee-wrap overflow-hidden border-t border-white/10 pt-5">
            <div class="marquee-track gap-8 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              <span>Carl Zeiss Meditec (Đức)</span><span class="text-white/30">•</span>
              <span>Alcon (Hoa Kỳ)</span><span class="text-white/30">•</span>
              <span>Ziemer (Thụy Sĩ)</span><span class="text-white/30">•</span>
              <span>Staar Surgical (Thụy Sĩ)</span><span class="text-white/30">•</span>
              <span>EssilorLuxottica (Pháp)</span><span class="text-white/30">•</span>
              <span>Carl Zeiss Meditec (Đức)</span><span class="text-white/30">•</span>
              <span>Alcon (Hoa Kỳ)</span><span class="text-white/30">•</span>
              <span>Ziemer (Thụy Sĩ)</span><span class="text-white/30">•</span>
              <span>Staar Surgical (Thụy Sĩ)</span><span class="text-white/30">•</span>
              <span>EssilorLuxottica (Pháp)</span><span class="text-white/30">•</span>
            </div>
          </div>
        </div>
      </div>
    `;
    startAboutTimelineSpotlight();
  } else if (tab === "facilities") {
    box.innerHTML = `
      <div class="space-y-16">
        <!-- Tiêu chuẩn phòng mổ vô khuẩn -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div class="lg:col-span-6">
            <img src="assets/images/facility/surgical-suite.jpg" class="rounded-3xl shadow-2xl w-full h-96 object-cover" />
          </div>
          <div class="lg:col-span-6 space-y-5">
            <span class="eyebrow">Kiểm soát nhiễm khuẩn 4 tầng</span>
            <h2 class="font-display text-3xl sm:text-4xl font-semibold text-navy-900">Phòng Mổ Áp Lực Dương Vô Khuẩn Tuyệt Đối</h2>
            <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
              Trong phẫu thuật nhãn khoa vi phẫu, độ sạch của không khí quyết định trực tiếp đến tốc độ lành thương và phòng ngừa biến chứng. Hệ thống phòng mổ tại Mắt Sài Gòn Phú Thọ (Hệ thống liên kết) được thiết kế khép kín một chiều theo chuẩn JCI Quốc tế.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div class="p-4 rounded-2xl bg-ivory-100 border border-gold-500/20"><strong class="text-navy-900 block mb-1">1. Lọc khí HEPA H14</strong>Loại bỏ 99.995% bụi siêu mịn và vi khuẩn trong không khí.</div>
              <div class="p-4 rounded-2xl bg-ivory-100 border border-gold-500/20"><strong class="text-navy-900 block mb-1">2. Áp lực dương liên tục</strong>Ngăn chặn hoàn toàn luồng khí bên ngoài tràn vào khu phẫu thuật.</div>
              <div class="p-4 rounded-2xl bg-ivory-100 border border-gold-500/20"><strong class="text-navy-900 block mb-1">3. Vật tư dùng 1 lần</strong>100% dao mổ, kim tiêm, găng tay và bộ kít phẫu thuật chỉ dùng cho 1 bệnh nhân.</div>
              <div class="p-4 rounded-2xl bg-ivory-100 border border-gold-500/20"><strong class="text-navy-900 block mb-1">4. Tiệt khuẩn Autoclave</strong>Dụng cụ vi phẫu được hấp tiệt trùng chuẩn Châu Âu kèm test kiểm định sinh học.</div>
            </div>
          </div>
        </div>

        <!-- 6 Phân khu chức năng -->
        <div>
          <h3 class="font-display text-3xl font-semibold text-navy-900 mb-6">6 Phân Khu Chức Năng Tiêu Chuẩn 5 Sao</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="luxury-card overflow-hidden"><img src="assets/images/facility/hospital-interior.jpg" class="h-56 w-full object-cover" /><div class="p-6"><span class="text-[11px] font-bold text-gold-600 uppercase">Tầng 1 • Đón tiếp</span><h4 class="font-display text-2xl font-semibold mt-1">Sảnh Chờ Lounge 5 Sao</h4><p class="text-xs text-slate-600 mt-2">Không gian yên tĩnh, ánh sáng dịu nhẹ bảo vệ mắt, phục vụ trà thảo mộc và check-in QR không chờ đợi.</p></div></div>
            <div class="luxury-card overflow-hidden"><img src="assets/images/facility/consultation.webp" class="h-56 w-full object-cover" /><div class="p-6"><span class="text-[11px] font-bold text-gold-600 uppercase">Tầng 2 • Chẩn đoán</span><h4 class="font-display text-2xl font-semibold mt-1">Trung Tâm Khám 12 Bước</h4><p class="text-xs text-slate-600 mt-2">Tích hợp phòng đo khúc xạ tối ưu, chụp bản đồ giác mạc Pentacam và soi đáy mắt OCT-A.</p></div></div>
            <div class="luxury-card overflow-hidden"><img src="assets/images/facility/surgical-suite.jpg" class="h-56 w-full object-cover" /><div class="p-6"><span class="text-[11px] font-bold text-gold-600 uppercase">Tầng 3 • Vi phẫu</span><h4 class="font-display text-2xl font-semibold mt-1">Cụm Phòng Mổ Vô Khuẩn</h4><p class="text-xs text-slate-600 mt-2">Tách biệt phòng mổ Khúc xạ Laser (SMILE Pro) và phòng mổ Phaco / Dịch kính Võng mạc.</p></div></div>
            <div class="luxury-card overflow-hidden"><img src="assets/images/facility/about-left.webp" class="h-56 w-full object-cover" /><div class="p-6"><span class="text-[11px] font-bold text-gold-600 uppercase">Tầng 4 • Hậu phẫu</span><h4 class="font-display text-2xl font-semibold mt-1">Phòng Nghỉ Dưỡng VIP</h4><p class="text-xs text-slate-600 mt-2">Giường nghỉ cao cấp riêng tư, điều dưỡng theo dõi chỉ số sinh tồn và hướng dẫn nhỏ thuốc sau mổ.</p></div></div>
            <div class="luxury-card overflow-hidden"><img src="assets/images/facility/about-right.webp" class="h-56 w-full object-cover" /><div class="p-6"><span class="text-[11px] font-bold text-gold-600 uppercase">Tầng 1 • Nhãn nhi</span><h4 class="font-display text-2xl font-semibold mt-1">Đơn Vị Ortho-K &amp; Nhãn Nhi</h4><p class="text-xs text-slate-600 mt-2">Khu vực thân thiện cho trẻ nhỏ, trang bị thiết bị tập nhược thị và phòng thử kính Ortho-K riêng.</p></div></div>
            <div class="luxury-card overflow-hidden"><img src="assets/images/facility/hero-banner.webp" class="h-56 w-full object-cover" /><div class="p-6"><span class="text-[11px] font-bold text-gold-600 uppercase">Tầng 1 • Kính mắt</span><h4 class="font-display text-2xl font-semibold mt-1">Trung Tâm Kính Mắt Y Khoa</h4><p class="text-xs text-slate-600 mt-2">Cung cấp gọng Titanium, tròng kiểm soát cận thị Zeiss/Essilor cắt lắp chuẩn đơn bác sĩ.</p></div></div>
          </div>
        </div>

        <!-- Tiện ích dành riêng cho bệnh nhân -->
        <div class="luxury-card p-8 bg-ivory-100 border-gold-500/20">
          <h3 class="font-display text-2xl font-semibold text-navy-900 mb-4">Đặc Quyền Tiện Ích Dành Cho Bệnh Nhân &amp; Người Nhà</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium text-navy-900">
            <div class="p-4 rounded-xl bg-white">✓ Phòng chờ điều hòa lọc khí</div>
            <div class="p-4 rounded-xl bg-white">✓ Trà, bánh nhẹ miễn phí</div>
            <div class="p-4 rounded-xl bg-white">✓ Kính bảo vệ mắt sau mổ</div>
            <div class="p-4 rounded-xl bg-white">✓ Hỗ trợ đặt xe sau phẫu thuật</div>
          </div>
        </div>
      </div>
    `;
  } else if (tab === "tech") {
    box.innerHTML = `
      <div class="space-y-16">
        <div>
          <span class="eyebrow">100% Nhập khẩu chính hãng</span>
          <h2 class="font-display text-3xl sm:text-4xl font-semibold text-navy-900 mt-2 mb-3">Hệ Sinh Thái Siêu Máy Phẫu Thuật Nhãn Khoa</h2>
          <p class="text-slate-600 text-sm sm:text-base max-w-3xl mb-8">Mắt Sài Gòn Phú Thọ (Hệ thống liên kết) đầu tư đồng bộ những thế hệ máy phẫu thuật và chẩn đoán hình ảnh tiên tiến nhất từ Đức, Thụy Sĩ và Hoa Kỳ, được bảo trì định kỳ bởi kỹ sư hãng.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            ${DATA.technologies.map(t => `
              <div class="luxury-card overflow-hidden flex flex-col justify-between">
                <div class="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center">
                  <div class="tech-pedestal w-44 h-44 rounded-2xl p-4 flex items-center justify-center shrink-0">
                    <img src="${t.image}" class="max-h-36 object-contain relative z-10" />
                  </div>
                  <div class="space-y-2">
                    <span class="text-[11px] font-bold text-gold-600 uppercase">${t.origin}</span>
                    <h4 class="font-display text-2xl font-semibold text-navy-900">${t.name}</h4>
                    <p class="text-xs text-slate-600">${t.tagline}</p>
                    <ul class="space-y-1 text-xs text-slate-700 pt-2">
                      ${t.highlights.map(h => `<li>• ${h}</li>`).join("")}
                    </ul>
                  </div>
                </div>
                <div class="px-6 py-4 bg-ivory-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div class="flex gap-4 font-semibold text-navy-900">
                    <span>Tốc độ: <strong class="text-gold-600">${t.metrics.speed}</strong></span>
                    <span>Độ chính xác: <strong class="text-emerald-700">${t.metrics.accuracy}</strong></span>
                  </div>
                  <button onclick="openBookingModal('smile-pro')" class="font-bold text-gold-600 hover:text-navy-900">Đặt lịch khám &rarr;</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Hệ thống chẩn đoán tiền phẫu -->
        <div>
          <h3 class="font-display text-3xl font-semibold text-navy-900 mb-6">Hệ Thống Máy Chẩn Đoán Hình Ảnh Tiền Phẫu Chuẩn 12 Bước</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="luxury-card p-6">
              <span class="text-xs font-bold text-gold-600 uppercase">Oculus • Đức</span>
              <h4 class="font-display text-2xl font-semibold text-navy-900 mt-1 mb-2">Pentacam AXL Wave</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Quét bản đồ giác mạc 3D mặt trước & mặt sau trong 2 giây, phát hiện sớm nguy cơ giác mạc chóp tiềm ẩn trước khi chỉ định mổ cận.</p>
            </div>
            <div class="luxury-card p-6">
              <span class="text-xs font-bold text-gold-600 uppercase">Carl Zeiss • Đức</span>
              <h4 class="font-display text-2xl font-semibold text-navy-900 mt-1 mb-2">IOLMaster 700</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Đo sinh trắc học nhãn cầu bằng công nghệ Swept-Source OCT, tính toán công suất thủy tinh thể nhân tạo chính xác tuyệt đối cho ca mổ Phaco.</p>
            </div>
            <div class="luxury-card p-6">
              <span class="text-xs font-bold text-gold-600 uppercase">Carl Zeiss • Đức</span>
              <h4 class="font-display text-2xl font-semibold text-navy-900 mt-1 mb-2">Cirrus HD-OCT 6000</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Chụp cắt lớp võng mạc & mạch máu đáy mắt OCT-A tốc độ 100.000 lát cắt/giây, không cần tiêm thuốc cản quang.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    box.innerHTML = `
      <div class="space-y-14">
        <!-- Hồ sơ pháp lý Bộ Y Tế -->
        <div>
          <span class="eyebrow">Minh bạch pháp lý</span>
          <h2 class="font-display text-3xl sm:text-4xl font-semibold text-navy-900 mt-2 mb-6">Công Bố Thông Tin Y Tế Theo Quy Định Bộ Y Tế</h2>
          <div class="luxury-card p-6 sm:p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="p-4 rounded-xl bg-ivory-50 border border-slate-200"><strong>Tên cơ sở khám chữa bệnh:</strong> Mắt Sài Gòn Phú Thọ (Hệ thống liên kết)</div>
              <div class="p-4 rounded-xl bg-ivory-50 border border-slate-200"><strong>Giấy phép hoạt động KCB:</strong> Số 289/BYT-GPHĐ do Bộ Y Tế cấp</div>
              <div class="p-4 rounded-xl bg-ivory-50 border border-slate-200"><strong>Người chịu trách nhiệm chuyên môn:</strong> GS.TS.TTND Tôn Thị Kim Thanh</div>
              <div class="p-4 rounded-xl bg-ivory-50 border border-slate-200"><strong>Địa chỉ hoạt động:</strong> Đ. Nguyễn Tất Thành, P. Vân Phú, TP. Việt Trì, Tỉnh Phú Thọ</div>
              <div class="p-4 rounded-xl bg-ivory-50 border border-slate-200"><strong>Danh mục kỹ thuật phê duyệt:</strong> 148 kỹ thuật chuyên khoa Mắt (SMILE Pro, ICL, Phaco, Dịch kính võng mạc...)</div>
              <div class="p-4 rounded-xl bg-ivory-50 border border-slate-200"><strong>Kiểm soát nhiễm khuẩn &amp; An toàn:</strong> Đạt chuẩn an toàn phẫu thuật Bộ Y Tế &amp; WHO 2026</div>
            </div>
          </div>
        </div>

        <!-- Danh mục kỹ thuật trọng điểm -->
        <div>
          <h3 class="font-display text-3xl font-semibold text-navy-900 mb-6">Danh Mục Kỹ Thuật Chuyên Khoa Được Phê Duyệt</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div class="luxury-card p-6 space-y-2">
              <h4 class="font-bold text-navy-900 text-base border-b border-slate-100 pb-2">1. Phẫu thuật Tật Khúc Xạ &amp; Giác Mạc</h4>
              <ul class="space-y-1.5 text-slate-600 list-disc pl-5">
                <li>Phẫu thuật rút lõi nhu mô giác mạc qua đường rạch nhỏ (SMILE Pro / ReLEx SMILE)</li>
                <li>Phẫu thuật Femtosecond Lasik &amp; Laser bề mặt không chạm SmartSurfACE</li>
                <li>Phẫu thuật đặt thấu kính nội nhãn Phakic ICL / IPCL điều trị cận loạn nặng</li>
                <li>Kỹ thuật Cross-linking (CXL) điều trị giãn phình giác mạc</li>
              </ul>
            </div>
            <div class="luxury-card p-6 space-y-2">
              <h4 class="font-bold text-navy-900 text-base border-b border-slate-100 pb-2">2. Phẫu thuật Thủy Tinh Thể &amp; Đáy Mắt</h4>
              <ul class="space-y-1.5 text-slate-600 list-disc pl-5">
                <li>Phẫu thuật Phaco tán nhuyễn thủy tinh thể đặt IOL đơn tiêu, đa tiêu, Toric loạn thị</li>
                <li>Phẫu thuật cắt dịch kính 25G/27G điều trị bong võng mạc, màng trước võng mạc</li>
                <li>Tiêm nội nhãn Anti-VEGF điều trị thoái hóa hoàng điểm &amp; phù hoàng điểm đái tháo đường</li>
                <li>Điều trị Glaucoma bằng Laser vi xung và phẫu thuật cắt bè củng giác mạc</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Chứng chỉ hành nghề Bác sĩ -->
        <div>
          <h3 class="font-display text-3xl font-semibold text-navy-900 mb-6">Thông Tin Chứng Chỉ Hành Nghề Đội Ngũ Chuyên Gia</h3>
          <div class="luxury-card overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-navy-900 text-white">
                <tr><th class="p-4">Họ và Tên Bác Sĩ</th><th class="p-4">Chức danh</th><th class="p-4">Phạm vi hoạt động chuyên môn</th><th class="p-4">Trạng thái</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${DATA.doctors.map(d => `
                  <tr>
                    <td class="p-4 font-semibold text-navy-900">${d.name}</td>
                    <td class="p-4 text-slate-600">${d.title}</td>
                    <td class="p-4 text-slate-600">Khám bệnh, chữa bệnh chuyên khoa Mắt (${d.specialty})</td>
                    <td class="p-4"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">✓ Đã xác thực BYT</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
}

// -------------------- VIEW: DOCTORS & DOCTOR DETAIL --------------------
function setDocSpecialty(spec) {
  const sel = document.getElementById("filter-doc-specialty");
  if (sel) sel.value = spec;
  document.querySelectorAll(".doc-spec-pill").forEach(btn => {
    const active = btn.dataset.spec === spec;
    btn.className = active
      ? "doc-spec-pill px-4 py-2 rounded-full text-xs font-semibold bg-gold-500 text-white shadow-lg transition"
      : "doc-spec-pill px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-slate-200 hover:bg-white/20 transition";
  });
  renderDoctorsPage();
}

function renderDoctorsPage() {
  const spec = document.getElementById("filter-doc-specialty")?.value || "all";
  const title = document.getElementById("filter-doc-title")?.value || "all";
  const query = (document.getElementById("filter-doc-search")?.value || "").trim().toLowerCase();
  const grid = document.getElementById("doctors-grid");
  if (!grid) return;

  const list = DATA.doctors.filter(d =>
    (spec === "all" || d.specialty === spec) &&
    (title === "all" || d.title === title) &&
    (!query || d.name.toLowerCase().includes(query) || d.role.toLowerCase().includes(query) || d.specialty.toLowerCase().includes(query))
  );
  grid.innerHTML = list.map((d, idx) => `
    <div class="luxury-card doctor-card-fx card-gold-accent overflow-hidden flex flex-col justify-between animate-cascade group" style="animation-delay: ${idx * 70}ms">
      <div>
        <div class="doctor-portrait-wrap h-80 relative bg-navy-950">
          <img src="${d.image}" alt="${d.name}" class="w-full h-full object-cover object-top group-hover:scale-105 transition duration-700" />
          <div class="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent"></div>
          <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-navy-950/75 backdrop-blur-md border border-gold-400/40 text-gold-400 text-[10px] font-bold uppercase tracking-wider">${d.specialty}</span>
          <span class="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-gold-500 text-white text-[10px] font-bold shadow">${d.experience} năm KN</span>
          <div class="absolute bottom-3 left-5 right-5 text-white">
            <div class="text-[11px] font-semibold text-gold-400 uppercase tracking-wider">${d.title}</div>
            <h3 class="font-display text-2xl font-semibold leading-tight mt-0.5">${d.name}</h3>
          </div>
        </div>
        <div class="px-6 pt-5 pb-2">
          <p class="text-xs text-slate-600 leading-relaxed">${d.role}</p>
          <div class="doctor-schedule-reveal">
            <div class="p-3 rounded-xl bg-ivory-100 border border-gold-500/20 text-[11px] text-navy-900">
              <strong class="text-gold-600 block mb-1">Lịch khám tuần này:</strong>
              ${d.schedule.map(s => `<span class="inline-block mr-2">• ${s.day} (${s.time})</span>`).join("")}
            </div>
          </div>
        </div>
      </div>
      <div class="px-6 pb-6 pt-3 flex gap-2.5">
        <button onclick="openDoctorDetail('${d.id}')" class="flex-1 py-2.5 rounded-full border border-navy-900 text-navy-900 text-xs font-semibold hover:bg-navy-900 hover:text-white transition">Xem hồ sơ</button>
        <button onclick="openBookingModal('', '${d.id}')" class="flex-1 btn-gold py-2.5 rounded-full text-xs">Đặt lịch khám</button>
      </div>
    </div>
  `).join("") || `<p class="col-span-3 text-center text-slate-500 py-10">Không tìm thấy bác sĩ phù hợp bộ lọc.</p>`;
}

function openDoctorDetail(id) {
  const box = document.getElementById("doctor-detail-content");
  if (!box) {
    window.location.href = `index.html#doctor-${id}`;
    return;
  }
  const d = DATA.doctors.find(x => x.id === id);
  if (!d) return;
  box.innerHTML = `
    <button onclick="navigateTo('doctors')" class="text-sm font-semibold text-gold-600 mb-6 inline-flex items-center gap-1">&larr; Quay lại Đội ngũ Bác sĩ</button>
    <div class="luxury-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl">
      <div class="lg:col-span-4 relative bg-navy-950 min-h-[420px]">
        <img src="${d.image}" alt="${d.name}" class="w-full h-full object-cover object-top" />
        <div class="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent"></div>
        <div class="absolute bottom-5 left-6 right-6 text-white">
          <span class="px-3 py-1 rounded-full bg-gold-500 text-white text-[11px] font-bold">${d.experience} năm kinh nghiệm</span>
        </div>
      </div>
      <div class="lg:col-span-8 p-8 sm:p-10 space-y-6">
        <div>
          <span class="px-3 py-1 rounded-full bg-gold-200/50 text-gold-600 text-xs font-bold">${d.specialty} • ${d.title}</span>
          <h1 class="font-display text-4xl font-semibold text-navy-900 mt-3">${d.name}</h1>
          <p class="text-gold-600 font-medium mt-1">${d.role}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div class="p-5 rounded-2xl bg-ivory-50 border border-slate-100">
            <h4 class="font-bold text-navy-900 mb-2">Quá trình đào tạo</h4>
            <ul class="space-y-1.5 text-slate-600 list-disc pl-4">${d.education.map(e => `<li>${e}</li>`).join("")}</ul>
          </div>
          <div class="p-5 rounded-2xl bg-ivory-50 border border-slate-100">
            <h4 class="font-bold text-navy-900 mb-2">Kinh nghiệm công tác</h4>
            <ul class="space-y-1.5 text-slate-600 list-disc pl-4">${d.career.map(c => `<li>${c}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="p-4 rounded-2xl bg-ivory-100 border border-gold-500/25 text-sm text-slate-700">
          <strong>Thành tựu nghiên cứu:</strong> ${d.research}
        </div>
        <div>
          <h4 class="font-bold text-navy-900 mb-3 text-sm">Lịch khám trong tuần (Bấm vào khung giờ để đặt hẹn ngay)</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            ${d.schedule.map(s => `
              <button onclick="openBookingModal('', '${d.id}', 'Đặt lịch khám ${s.day} (${s.time}) - ${s.room}')" class="text-left p-3.5 rounded-xl bg-ivory-50 hover:bg-navy-900 hover:text-white border border-gold-500/25 text-xs transition group">
                <div class="font-bold">${s.day}</div>
                <div class="text-gold-600 group-hover:text-gold-400 font-semibold">${s.time}</div>
                <div class="opacity-75">${s.room}</div>
              </button>
            `).join("")}
          </div>
        </div>
        <button onclick="openBookingModal('', '${d.id}')" class="btn-gold px-8 py-3.5 rounded-full text-sm">
          Đặt lịch khám với ${d.name}
        </button>
      </div>
    </div>
  `;
  navigateTo("doctor-detail");
}

// -------------------- VIEW: SERVICES & SERVICE DETAIL --------------------
function renderServicesCatalog() {
  const grid = document.getElementById("services-catalog-grid");
  if (!grid) return;
  grid.innerHTML = DATA.services.map((s, idx) => {
    if (idx === 0) {
      return `
        <div class="luxury-card doctor-card-fx card-gold-accent animate-cascade md:col-span-2 overflow-hidden grid grid-cols-1 lg:grid-cols-12 group">
          <div class="lg:col-span-5 doctor-portrait-wrap relative min-h-[280px] bg-navy-950">
            <img src="${s.image}" alt="${s.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            <div class="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent"></div>
            <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold-500 text-white text-xs font-bold shadow">${s.badge}</span>
            <span class="absolute bottom-4 left-5 font-display text-4xl font-bold text-gold-400/80">01</span>
          </div>
          <div class="lg:col-span-7 p-8 flex flex-col justify-between">
            <div>
              <h3 class="font-display text-3xl font-semibold text-navy-900 group-hover:text-gold-600 transition mb-2">${s.name}</h3>
              <p class="text-sm text-slate-600 leading-relaxed mb-4">${s.overview}</p>
              <div class="flex flex-wrap gap-3 text-xs text-navy-900 font-semibold mb-5">
                <span class="px-3 py-1.5 rounded-full bg-ivory-100">⏱ ${s.duration}</span>
                <span class="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">✨ ${s.recovery}</span>
                <span class="px-3 py-1.5 rounded-full bg-gold-200/40 text-gold-600">💳 ${s.priceRange}</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
              <button onclick="openServiceDetail('${s.id}')" class="btn-navy px-6 py-2.5 rounded-full text-xs">Xem chi tiết &amp; Bảng giá &rarr;</button>
              <button onclick="openBookingModal('${s.id}')" class="btn-gold px-6 py-2.5 rounded-full text-xs">Đặt lịch ngay</button>
            </div>
          </div>
        </div>
      `;
    }
    return `
      <div class="luxury-card doctor-card-fx card-gold-accent animate-cascade overflow-hidden flex flex-col justify-between group" style="animation-delay: ${idx * 80}ms">
        <div>
          <div class="doctor-portrait-wrap h-60 relative bg-navy-950">
            <img src="${s.image}" alt="${s.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            <div class="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent"></div>
            <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-navy-950/75 backdrop-blur-md border border-gold-400/40 text-gold-400 text-[11px] font-bold">${s.badge}</span>
            <span class="absolute bottom-3 right-5 font-display text-4xl font-bold text-white/40">0${idx + 1}</span>
          </div>
          <div class="p-7 pb-3">
            <h3 class="font-display text-2xl sm:text-3xl font-semibold text-navy-900 group-hover:text-gold-600 transition mb-2">${s.name}</h3>
            <p class="text-sm text-slate-600 mb-4">${s.overview}</p>
            <div class="flex flex-wrap gap-2 text-xs text-navy-900 font-semibold mb-3">
              <span class="px-2.5 py-1 rounded-full bg-ivory-100">⏱ ${s.duration}</span>
              <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">✨ ${s.recovery}</span>
            </div>
            <div class="service-specs-reveal">
              <div class="text-xs font-semibold text-gold-600">💳 ${s.priceRange} • ${s.installment}</div>
            </div>
          </div>
        </div>
        <div class="px-7 pb-7 pt-3 border-t border-slate-100 flex gap-3">
          <button onclick="openServiceDetail('${s.id}')" class="btn-navy flex-1 py-2.5 rounded-full text-xs">Xem chi tiết &amp; Bảng giá</button>
          <button onclick="openBookingModal('${s.id}')" class="btn-gold flex-1 py-2.5 rounded-full text-xs">Đặt lịch ngay</button>
        </div>
      </div>
    `;
  }).join("");
}

function openServiceDetail(id) {
  const servicePage = document.body?.dataset?.servicePage;
  if (servicePage && servicePage !== id) {
    window.location.href = `service-${id}.html`;
    return;
  }
  const box = document.getElementById("service-detail-content");
  if (!box) {
    window.location.href = `service-${id}.html`;
    return;
  }
  const s = DATA.services.find(x => x.id === id);
  if (!s) return;
  const docs = DATA.doctors.filter(d => s.doctorIds.includes(d.id));

  box.innerHTML = `
    <div class="relative bg-navy-950 text-white py-16 overflow-hidden">
      <img src="${s.image}" alt="${s.name}" class="absolute inset-0 w-full h-full object-cover opacity-25" />
      <div class="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/85 to-navy-950/60"></div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onclick="navigateTo('services')" class="text-xs font-semibold text-gold-400 mb-6 inline-flex items-center gap-1 hover:underline">&larr; Tất cả dịch vụ</button>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-7">
            <span class="px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-400 text-xs font-bold">${s.badge}</span>
            <h1 class="font-display text-4xl sm:text-5xl font-semibold mt-3">${s.name}</h1>
            <p class="text-slate-300 mt-3 leading-relaxed">${s.overview}</p>
            <div class="mt-6 inline-block bg-white/10 backdrop-blur-md border border-gold-400/30 rounded-2xl p-4">
              <div class="text-xs text-slate-300">Chi phí tham khảo</div>
              <div class="font-display text-2xl font-bold text-gold-400 mt-0.5">${s.priceRange}</div>
              <div class="text-xs text-emerald-300 mt-0.5">${s.installment}</div>
            </div>
          </div>
          <div class="lg:col-span-5">
            <div class="doctor-portrait-wrap rounded-3xl overflow-hidden shadow-2xl border border-gold-400/30 animate-float-slow">
              <img src="${s.image}" alt="${s.name}" class="w-full h-72 object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
      <!-- 2. Bảng so sánh -->
      <div class="animate-cascade">
        <h2 class="font-display text-3xl font-semibold text-navy-900 mb-6">Ưu Điểm Vượt Trội So Với Phương Pháp Cũ</h2>
        <div class="luxury-card overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-navy-900 text-white">
              <tr><th class="p-4">Tiêu chí</th><th class="p-4">Phương pháp truyền thống</th><th class="p-4 text-gold-400">${s.shortName} tại Mắt Sài Gòn Phú Thọ</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${s.comparison.map(c => `
                <tr><td class="p-4 font-semibold text-navy-900">${c.criteria}</td><td class="p-4 text-slate-500">${c.oldTech}</td><td class="p-4 font-semibold text-emerald-700 bg-emerald-50/40">✓ ${c.newTech}</td></tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. Quy trình 5 bước -->
      <div>
        <h2 class="font-display text-3xl font-semibold text-navy-900 mb-6">Quy Trình Phẫu Thuật / Điều Trị 5 Bước Chuẩn Quốc Tế</h2>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          ${s.steps.map((st, idx) => `
            <div class="luxury-card doctor-card-fx card-gold-accent animate-cascade p-5" style="animation-delay: ${idx * 80}ms">
              <div class="font-display text-3xl font-bold text-gold-600 mb-2">${st.step}</div>
              <h4 class="font-semibold text-navy-900 text-sm mb-1">${st.title}</h4>
              <p class="text-xs text-slate-600">${st.desc}</p>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- 4. Bác sĩ phụ trách -->
      <div>
        <h2 class="font-display text-3xl font-semibold text-navy-900 mb-6">Bác Sĩ Chuyên Khoa Phụ Trách</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${docs.map(d => `
            <div class="luxury-card doctor-card-fx card-gold-accent p-5 flex items-center gap-4">
              <img src="${d.image}" class="w-16 h-16 rounded-full object-cover object-top bg-navy-900 shrink-0 border border-gold-400/40" />
              <div>
                <div class="font-semibold text-navy-900 text-sm">${d.name}</div>
                <div class="text-xs text-slate-500 mb-2">${d.title}</div>
                <button onclick="openBookingModal('${s.id}', '${d.id}')" class="text-xs font-bold text-gold-600 hover:underline">Đặt lịch với bác sĩ &rarr;</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- 5. FAQ & Form đặt lịch cuối trang -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div class="space-y-3">
          <h3 class="font-display text-2xl font-semibold text-navy-900 mb-4">Câu Hỏi Thường Gặp</h3>
          ${s.faqs.map(f => `
            <div class="luxury-card p-5">
              <div class="font-semibold text-navy-900 text-sm mb-1">${f.q}</div>
              <p class="text-xs text-slate-600">${f.a}</p>
            </div>
          `).join("")}
        </div>
        <div class="luxury-card p-7 bg-navy-900 text-white">
          <h3 class="font-display text-2xl font-semibold mb-2">Đăng Ký Tư Vấn ${s.shortName}</h3>
          <p class="text-xs text-slate-300 mb-5">Nhận bảng giá ưu đãi chi tiết và đặt lịch khám trực tiếp với chuyên gia.</p>
          <form onsubmit="event.preventDefault(); openBookingModal('${s.id}');" class="space-y-3">
            <input type="text" required placeholder="Họ và tên của bạn" class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder-slate-400" />
            <input type="tel" required placeholder="Số điện thoại" class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder-slate-400" />
            <button type="submit" class="btn-gold w-full py-3 rounded-full text-sm">Đặt lịch khám ngay</button>
          </form>
        </div>
      </div>
    </div>
  `;
  navigateTo("service-detail");
}

// -------------------- VIEW: SUPPORT (PRICING, INSTALLMENT, INSURANCE, STORIES) --------------------
let _processTimer = null;
function startProcessSpotlight() {
  clearInterval(_processTimer);
  let idx = 0;
  let paused = false;
  const grid = document.getElementById("process-steps-grid");
  grid?.addEventListener("mouseenter", () => paused = true);
  grid?.addEventListener("mouseleave", () => paused = false);
  _processTimer = setInterval(() => {
    if (paused || state.currentView !== "support") return;
    const cards = document.querySelectorAll("#process-steps-grid .process-step-card");
    if (!cards.length) return;
    cards.forEach((c, i) => c.classList.toggle("dynamic-card-active", i === idx));
    idx = (idx + 1) % cards.length;
  }, 2200);
}

function switchSupportTab(tab) {
  document.querySelectorAll(".support-tab").forEach(btn => {
    btn.className = btn.dataset.tab === tab
      ? "support-tab px-4 py-2 rounded-full text-xs font-semibold bg-gold-500 text-white"
      : "support-tab px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-slate-200 hover:bg-white/20";
  });
  renderSupportTab(tab);
}

function renderSupportTab(tab) {
  const box = document.getElementById("support-content");
  if (!box) return;
  if (tab === "pricing") {
    box.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-7 luxury-card overflow-hidden">
          <div class="p-6 bg-navy-900 text-white"><h3 class="font-display text-2xl font-semibold">Bảng Giá Niêm Yết Minh Bạch 2026</h3></div>
          <div class="divide-y divide-slate-100 text-sm">
            ${DATA.services.map(s => `
              <div class="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div><div class="font-semibold text-navy-900">${s.name}</div><div class="text-xs text-slate-500">${s.installment}</div></div>
                <div class="font-bold text-gold-600 shrink-0">${s.priceRange}</div>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="lg:col-span-5 luxury-card p-6 sm:p-8 bg-gradient-to-br from-white to-gold-200/20">
          <span class="eyebrow">Công cụ tính tài chính</span>
          <h3 class="font-display text-2xl font-semibold text-navy-900 mt-1 mb-4">Tính Trả Góp 0% Lãi Suất</h3>
          <div class="space-y-4 text-sm">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Số tiền gói phẫu thuật (VNĐ)</label>
              <input type="range" id="calc-amount" min="15000000" max="85000000" step="1000000" value="42000000" oninput="updateInstallmentCalc()" class="w-full accent-gold-500" />
              <div class="text-right font-bold text-navy-900" id="calc-amount-label">42.000.000đ</div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Kỳ hạn trả góp 0%</label>
              <select id="calc-months" onchange="updateInstallmentCalc()" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white">
                <option value="3">3 tháng (0% lãi suất)</option>
                <option value="6">6 tháng (0% lãi suất)</option>
                <option value="9">9 tháng (0% lãi suất)</option>
                <option value="12" selected>12 tháng (0% lãi suất)</option>
              </select>
            </div>
            <div class="p-4 rounded-2xl bg-navy-900 text-white text-center">
              <div class="text-xs text-slate-300">Số tiền thanh toán mỗi tháng</div>
              <div class="font-display text-3xl font-bold text-gold-400 mt-1" id="calc-monthly">3.500.000đ / tháng</div>
            </div>
            <button onclick="openBookingModal('smile-pro', '', 'Tư vấn gói trả góp 0%')" class="btn-gold w-full py-3 rounded-full text-sm">Tư vấn gói trả góp 0%</button>
          </div>
        </div>
      </div>
    `;
  } else if (tab === "insurance") {
    const processSteps = [
      { num: "01", title: "1. Check-in QR VIP", desc: "Quét mã QR lịch hẹn tại sảnh Lounge, không cần chờ đợi.", img: "assets/images/facility/hospital-interior.jpg", tag: "Dưới 2 phút" },
      { num: "02", title: "2. Đo khúc xạ & Nhãn áp", desc: "Đo thị lực, bản đồ giác mạc và nhãn áp trên máy điện tử.", img: "assets/images/services/srv-retina.jpg", tag: "Chuẩn 12 bước" },
      { num: "03", title: "3. Khám Bác sĩ Chuyên khoa", desc: "Soi sinh hiển vi và đánh giá toàn diện cùng Giáo sư/Bác sĩ.", img: "assets/images/services/srv-vip-exam.jpg", tag: "1-1 Chuyên sâu" },
      { num: "04", title: "4. Tư vấn Phác đồ", desc: "Giải thích kết quả chi tiết, chọn phương pháp & bảng giá tối ưu.", img: "assets/images/facility/consultation.webp", tag: "Minh bạch 100%" },
      { num: "05", title: "5. Nhận thuốc / Đặt lịch mổ", desc: "Nhận đơn thuốc điện tử hoặc xếp lịch phòng mổ vô khuẩn.", img: "assets/images/services/srv-smile.jpg", tag: "Hỗ trợ trọn đời" }
    ];
    box.innerHTML = `
      <div class="space-y-14">
        <div>
          <span class="eyebrow">Trải nghiệm không chờ đợi</span>
          <h3 class="font-display text-3xl sm:text-4xl font-semibold text-navy-900 mt-1 mb-6">Quy Trình Khám Bệnh Chuẩn 5 Sao</h3>
          <div id="process-steps-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            ${processSteps.map((st, idx) => `
              <div class="process-step-card luxury-card doctor-card-fx card-gold-accent animate-cascade overflow-hidden flex flex-col justify-between group" style="animation-delay: ${idx * 80}ms">
                <div>
                  <div class="doctor-portrait-wrap h-40 relative bg-navy-950">
                    <img src="${st.img}" alt="${st.title}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    <div class="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent"></div>
                    <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-gold-500 text-white text-[10px] font-bold">${st.tag}</span>
                    <span class="absolute bottom-2 right-3 font-display text-3xl font-bold text-white/60">${st.num}</span>
                  </div>
                  <div class="p-4">
                    <h4 class="font-display text-lg font-semibold text-navy-900 group-hover:text-gold-600 transition">${st.title}</h4>
                    <p class="text-xs text-slate-600 mt-1 leading-relaxed">${st.desc}</p>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div>
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span class="eyebrow">Liên kết 13+ hãng bảo hiểm</span>
              <h3 class="font-display text-3xl sm:text-4xl font-semibold text-navy-900 mt-1">Đối Tác Bảo Lãnh Viện Phí &amp; BHYT</h3>
            </div>
            <button onclick="openBookingModal('kham-tong-quat', '', 'Kiểm tra quyền lợi bảo lãnh viện phí')" class="btn-outline-gold px-5 py-2.5 rounded-full text-xs shrink-0">Kiểm tra quyền lợi bảo hiểm &rarr;</button>
          </div>
          <div class="marquee-wrap overflow-hidden py-3">
            <div class="marquee-track gap-4">
              ${[...DATA.insurancePartners, ...DATA.insurancePartners].map(p => `
                <div class="luxury-card doctor-card-fx px-6 py-4 flex items-center gap-3.5 shrink-0 border border-gold-500/25">
                  <div class="w-10 h-10 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <div>
                    <div class="font-semibold text-sm text-navy-900 whitespace-nowrap">${p}</div>
                    <div class="text-[10px] font-bold text-emerald-700">✓ ${p.includes('BHYT') ? 'Áp dụng đúng tuyến & trái tuyến' : 'Bảo lãnh trực tiếp'}</div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
    startProcessSpotlight();
  } else {
    box.innerHTML = `
      <div class="space-y-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${DATA.testimonials.map(t => `
            <div class="luxury-card p-5"><img src="${t.image}" class="h-44 w-full object-cover rounded-xl mb-3" /><div class="font-semibold text-navy-900">${t.name}</div><p class="text-xs text-slate-600 mt-1">“${t.quote}”</p></div>
          `).join("")}
        </div>
        <div>
          <h3 class="font-display text-3xl font-semibold text-navy-900 mb-4">Câu Hỏi Thường Gặp (FAQ)</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${DATA.faqs.map(f => `
              <div class="luxury-card p-5">
                <span class="text-[11px] font-bold text-gold-600 uppercase">${f.group}</span>
                <h4 class="font-semibold text-navy-900 mt-1 mb-2">${f.q}</h4>
                <p class="text-xs text-slate-600">${f.a}</p>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }
}

function updateInstallmentCalc() {
  const amt = +document.getElementById("calc-amount").value;
  const m = +document.getElementById("calc-months").value;
  document.getElementById("calc-amount-label").textContent = amt.toLocaleString("vi-VN") + "đ";
  document.getElementById("calc-monthly").textContent = Math.round(amt / m).toLocaleString("vi-VN") + "đ / tháng";
}

// -------------------- VIEW: KNOWLEDGE, NEWS, CAREERS --------------------
function switchKnowledgeTab(tab) {
  document.querySelectorAll(".knowledge-tab").forEach(btn => {
    btn.className = btn.dataset.tab === tab
      ? "knowledge-tab px-4 py-2 rounded-full text-xs font-semibold bg-gold-500 text-white"
      : "knowledge-tab px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-slate-200 hover:bg-white/20";
  });
  renderKnowledgeTab(tab);
}

function renderKnowledgeTab(tab) {
  const box = document.getElementById("knowledge-content");
  if (!box) return;
  if (tab === "pathology") {
    const cats = ["all", "Giác mạc", "Thủy tinh thể", "Võng mạc", "Khúc xạ"];
    const filtered = DATA.articles.filter(a => state.pathologyFilter === "all" || a.category === state.pathologyFilter);
    box.innerHTML = `
      <div class="flex flex-wrap gap-2 mb-8">
        ${cats.map(c => `
          <button onclick="state.pathologyFilter='${c}'; renderKnowledgeTab('pathology')" class="px-4 py-2 rounded-full text-xs font-semibold ${state.pathologyFilter === c ? 'bg-navy-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}">
            ${c === 'all' ? 'Tất cả bệnh lý' : c}
          </button>
        `).join("")}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${filtered.map(a => `
          <div onclick="openArticleDetail('${a.id}', 'articles')" class="luxury-card card-gold-accent overflow-hidden flex flex-col justify-between cursor-pointer group">
            <div>
              <div class="h-48 overflow-hidden relative">
                <img src="${a.image || 'assets/images/facility/consultation.webp'}" alt="${a.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div class="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent"></div>
                <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-navy-900/85 border border-gold-400/40 text-gold-400 text-[11px] font-bold">${a.category}</span>
                <span class="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-white/90 text-navy-900 text-[11px] font-semibold">${a.readTime}</span>
              </div>
              <div class="p-6 pb-3">
                <h3 class="font-display text-2xl font-semibold text-navy-900 group-hover:text-gold-600 transition mb-2">${a.title}</h3>
                <p class="text-xs text-slate-600 mb-3">${a.excerpt}</p>
              </div>
            </div>
            <div class="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-emerald-700 font-semibold">✓ Kiểm duyệt: ${a.reviewer}</span>
              <span class="font-bold text-navy-900 group-hover:text-gold-600">Đọc chi tiết &rarr;</span>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  } else if (tab === "news") {
    box.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${DATA.news.map(n => `
          <div onclick="openArticleDetail('${n.id}', 'news')" class="luxury-card card-gold-accent overflow-hidden flex flex-col justify-between cursor-pointer group">
            <div>
              <div class="h-48 overflow-hidden relative">
                <img src="${n.image}" alt="${n.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-navy-900/85 text-gold-400 text-[11px] font-bold uppercase">${n.tag}</span>
              </div>
              <div class="p-6 pb-3">
                <span class="text-[11px] font-semibold text-slate-400">${n.date} • ${n.readTime || '4 phút đọc'}</span>
                <h4 class="font-display text-xl font-semibold text-navy-900 group-hover:text-gold-600 transition mt-1 mb-2">${n.title}</h4>
                <p class="text-xs text-slate-600">${n.summary}</p>
              </div>
            </div>
            <div class="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500">${n.reviewer || 'Mắt Sài Gòn Phú Thọ'}</span>
              <span class="font-bold text-gold-600">Xem chi tiết &rarr;</span>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  } else {
    box.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-7 space-y-4">
          <h3 class="font-display text-3xl font-semibold text-navy-900 mb-4">Vị Trí Đang Tuyển Dụng</h3>
          ${DATA.careers.map(c => `
            <div class="luxury-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div><h4 class="font-semibold text-navy-900">${c.title}</h4><div class="text-xs text-slate-500">${c.dept} • ${c.type}</div></div>
              <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0">${c.salary}</span>
            </div>
          `).join("")}
        </div>
        <div class="lg:col-span-5 luxury-card p-6 sm:p-8">
          <h3 class="font-display text-2xl font-semibold text-navy-900 mb-4">Nộp Hồ Sơ Ứng Tuyển Trực Tuyến</h3>
          <form onsubmit="event.preventDefault(); showToast('Đã tiếp nhận CV của bạn! Bộ phận Nhân sự sẽ liên hệ sớm.'); this.reset();" class="space-y-3 text-sm">
            <input type="text" required placeholder="Họ và tên ứng viên *" class="w-full px-4 py-2.5 rounded-xl bg-ivory-50 border border-slate-200" />
            <input type="tel" required placeholder="Số điện thoại *" class="w-full px-4 py-2.5 rounded-xl bg-ivory-50 border border-slate-200" />
            <select class="w-full px-4 py-2.5 rounded-xl bg-ivory-50 border border-slate-200">
              ${DATA.careers.map(c => `<option>${c.title}</option>`).join("")}
            </select>
            <input type="file" accept=".pdf,.doc,.docx" class="w-full text-xs text-slate-500" />
            <button type="submit" class="btn-gold w-full py-3 rounded-full text-sm">Gửi CV ngay</button>
          </form>
        </div>
      </div>
    `;
  }
}

function openArticleDetail(id, source = "articles") {
  const box = document.getElementById("article-detail-content");
  if (!box) {
    window.location.href = `index.html#article-${source}-${id}`;
    return;
  }
  const list = source === "news" ? DATA.news : DATA.articles;
  const item = list.find(x => x.id === id) || DATA.articles.find(x => x.id === id) || DATA.news.find(x => x.id === id);
  if (!item) return;

  const badge = item.category || item.tag || "Kiến thức y khoa";
  const lead = item.excerpt || item.summary || "";
  const heroImg = item.image || "assets/images/facility/consultation.webp";
  const reviewer = item.reviewer || "Hội đồng Chuyên môn Mắt Sài Gòn Phú Thọ";
  const readTime = item.readTime || "5 phút đọc";
  const relatedServiceId = item.relatedService || "kham-tong-quat";
  const relatedSrv = DATA.services.find(s => s.id === relatedServiceId);
  const others = [...DATA.articles, ...DATA.news].filter(x => x.id !== item.id).slice(0, 3);

  box.innerHTML = `
    <!-- Full-Bleed Editorial Hero -->
    <div class="relative bg-navy-950 text-white py-16 sm:py-24 overflow-hidden">
      <img src="${heroImg}" alt="${item.title}" class="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div class="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/80 to-navy-950/60"></div>
      <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onclick="navigateTo('knowledge', '${source === 'news' ? 'news' : 'pathology'}')" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-gold-500 text-xs font-semibold text-white transition mb-8">
          &larr; Quay lại trang Kiến thức
        </button>
        <div class="flex flex-wrap items-center gap-3 text-xs mb-4">
          <span class="px-3.5 py-1 rounded-full bg-gold-500 text-white font-bold uppercase tracking-wider">${badge}</span>
          <span class="text-slate-300">📅 ${item.date}</span>
          <span class="text-slate-300">⏱ ${readTime}</span>
        </div>
        <h1 class="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold leading-[1.12] max-w-4xl mb-6">${item.title}</h1>
        <div class="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 border border-gold-400/30 text-xs">
          <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">✓</span>
          <span>Cố vấn chuyên môn kiểm duyệt (E-E-A-T): <strong class="text-gold-400">${reviewer}</strong></span>
        </div>
      </div>
    </div>

    <!-- Full-Page 12-Column Editorial Layout -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <!-- Sticky Left TOC & Reading Controls -->
        <aside class="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
          <div class="luxury-card p-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-navy-900">Mục lục bài viết</span>
              <div class="flex items-center gap-1 bg-ivory-100 px-2 py-0.5 rounded-full text-xs">
                <button onclick="setFontScale('normal')" class="px-1.5 hover:text-gold-600 font-semibold">A-</button>
                <button onclick="setFontScale('lg')" class="px-1.5 hover:text-gold-600 font-semibold">A</button>
                <button onclick="setFontScale('xl')" class="px-1.5 hover:text-gold-600 font-bold text-gold-600">A+</button>
              </div>
            </div>
            <ul class="space-y-2.5 text-sm">
              ${(item.sections || []).map((s, idx) => `
                <li>
                  <button onclick="scrollToArticleSection('art-sec-${idx}')" class="text-left text-slate-600 hover:text-gold-600 font-medium transition flex items-start gap-2">
                    <span class="text-gold-500 font-bold">•</span>
                    <span>${s.heading}</span>
                  </button>
                </li>
              `).join("")}
            </ul>
          </div>

          ${relatedSrv ? `
            <div class="bg-navy-900 text-white rounded-3xl p-6 shadow-xl border border-gold-500/25 space-y-3">
              <span class="text-[10px] uppercase tracking-widest text-gold-400 font-bold">Dịch vụ điều trị liên quan</span>
              <h4 class="font-display text-2xl font-semibold">${relatedSrv.name}</h4>
              <p class="text-xs text-slate-300">${relatedSrv.target}</p>
              <div class="text-sm font-bold text-gold-400">${relatedSrv.priceRange}</div>
              <div class="pt-2 flex flex-col gap-2">
                <button onclick="openBookingModal('${relatedSrv.id}')" class="btn-gold w-full py-2.5 rounded-full text-xs">Đặt lịch tư vấn chuyên khoa</button>
                <button onclick="openServiceDetail('${relatedSrv.id}')" class="w-full py-2.5 rounded-full border border-white/25 text-xs font-semibold hover:bg-white/10 transition">Xem chi tiết dịch vụ &rarr;</button>
              </div>
            </div>
          ` : ""}
        </aside>

        <!-- Main Editorial Body -->
        <article class="lg:col-span-8 space-y-8">
          <div class="luxury-card p-8 sm:p-12 space-y-8">
            <p class="font-display text-xl sm:text-2xl italic text-navy-900 leading-relaxed border-l-4 border-gold-500 pl-5">
              ${lead}
            </p>
            <div class="rounded-2xl overflow-hidden shadow-md">
              <img src="${heroImg}" alt="${item.title}" class="w-full max-h-96 object-cover" />
            </div>
            <div class="space-y-8 text-base sm:text-lg text-slate-700 leading-loose">
              ${(item.sections || []).map((s, idx) => `
                <section id="art-sec-${idx}" class="scroll-mt-28">
                  <h2 class="font-display text-2xl sm:text-3xl font-semibold text-navy-900 mb-3">${s.heading}</h2>
                  <p>${s.body}</p>
                </section>
              `).join("")}
            </div>

            <!-- E-E-A-T Medical Disclaimer & CTA -->
            <div class="p-6 rounded-2xl bg-ivory-50 border border-gold-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div class="text-xs font-bold text-emerald-700 uppercase">Thông tin đã được kiểm duyệt y khoa</div>
                <div class="text-sm text-navy-900 font-semibold mt-1">Bạn có triệu chứng tương tự? Đặt lịch thăm khám 1-1 cùng ${reviewer}.</div>
              </div>
              <button onclick="openBookingModal('${relatedServiceId}')" class="btn-gold px-6 py-3 rounded-full text-xs shrink-0">Đặt lịch khám ngay</button>
            </div>
          </div>

          <!-- Bài viết liên quan -->
          <div>
            <h3 class="font-display text-3xl font-semibold text-navy-900 mb-6">Bài Viết &amp; Tin Tức Liên Quan</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
              ${others.map(o => `
                <div onclick="openArticleDetail('${o.id}', '${o.tag ? 'news' : 'articles'}')" class="luxury-card card-gold-accent overflow-hidden cursor-pointer group flex flex-col justify-between">
                  <div>
                    <img src="${o.image || 'assets/images/facility/consultation.webp'}" class="h-36 w-full object-cover group-hover:scale-105 transition duration-500" />
                    <div class="p-4">
                      <span class="text-[10px] font-bold text-gold-600 uppercase">${o.category || o.tag}</span>
                      <h4 class="font-display text-lg font-semibold text-navy-900 group-hover:text-gold-600 mt-1 line-clamp-2">${o.title}</h4>
                    </div>
                  </div>
                  <div class="px-4 pb-4 text-xs font-semibold text-navy-900">Đọc bài viết &rarr;</div>
                </div>
              `).join("")}
            </div>
          </div>
        </article>
      </div>
    </div>
  `;
  navigateTo("article-detail");
}

function scrollToArticleSection(secId) {
  document.getElementById(secId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// -------------------- VIEW: MYOPIA CONTROL (KIỂM SOÁT CẬN THỊ) --------------------
function renderMyopiaControlPage(filterTag = "all") {
  state.myopiaFilter = filterTag;
  const grid = document.getElementById("myopia-grid");
  const filterWrap = document.getElementById("myopia-filters");
  const list = DATA.myopiaArticles || [];
  if (!grid) return;

  const tags = ["all", ...new Set(list.map(x => x.tag))];
  if (filterWrap) {
    filterWrap.innerHTML = tags.map(t => `
      <button onclick="renderMyopiaControlPage('${t}')" class="px-4 py-2 rounded-full text-xs font-semibold transition ${filterTag === t ? 'bg-gold-500 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:border-gold-400'}">
        ${t === 'all' ? 'Tất cả bài viết' : t}
      </button>
    `).join("");
  }

  const filtered = filterTag === "all" ? list : list.filter(x => x.tag === filterTag);
  grid.innerHTML = filtered.map(n => `
    <div onclick="openMyopiaArticleDetail('${n.id}')" class="luxury-card card-gold-accent overflow-hidden flex flex-col justify-between cursor-pointer group">
      <div>
        <div class="h-52 overflow-hidden relative">
          <img src="${n.image}" alt="${n.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-navy-900/85 text-gold-400 text-[11px] font-bold uppercase">${n.tag}</span>
        </div>
        <div class="p-6 pb-3">
          <span class="text-[11px] font-semibold text-slate-400">${n.date} • ${n.readTime || '4 phút đọc'}</span>
          <h3 class="font-display text-xl font-semibold text-navy-900 group-hover:text-gold-600 transition mt-1 mb-2">${n.title}</h3>
          <p class="text-xs text-slate-600 leading-relaxed">${n.summary}</p>
        </div>
      </div>
      <div class="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span class="text-slate-500">${n.reviewer || 'Mắt Sài Gòn Phú Thọ'}</span>
        <span class="font-bold text-gold-600">Đọc chi tiết &rarr;</span>
      </div>
    </div>
  `).join("");
}

function openMyopiaArticleDetail(id) {
  const list = DATA.myopiaArticles || [];
  const item = list.find(x => x.id === id);
  const listView = document.getElementById("myopia-list-view");
  const detailView = document.getElementById("myopia-detail-view");
  const box = document.getElementById("myopia-detail-content");
  if (!item || !listView || !detailView || !box) return;

  const reviewer = item.reviewer || "Hội đồng Chuyên môn Mắt Sài Gòn Phú Thọ";
  const readTime = item.readTime || "5 phút đọc";
  const relatedServiceId = item.relatedService || "ortho-k";
  const relatedSrv = DATA.services.find(s => s.id === relatedServiceId);
  const others = list.filter(x => x.id !== item.id).slice(0, 3);

  box.innerHTML = `
    <div class="relative bg-navy-950 text-white py-16 sm:py-24 overflow-hidden">
      <img src="${item.image}" alt="${item.title}" class="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div class="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/80 to-navy-950/60"></div>
      <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onclick="backToMyopiaList()" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-gold-500 text-xs font-semibold text-white transition mb-8">
          &larr; Quay lại Trung Tâm Kiểm Soát Cận Thị
        </button>
        <div class="flex flex-wrap items-center gap-3 text-xs mb-4">
          <span class="px-3.5 py-1 rounded-full bg-gold-500 text-white font-bold uppercase tracking-wider">${item.tag}</span>
          <span class="text-slate-300">📅 ${item.date}</span>
          <span class="text-slate-300">⏱ ${readTime}</span>
          <span class="text-emerald-400 font-semibold">✓ Kiểm duyệt bởi ${reviewer}</span>
        </div>
        <h1 class="font-display text-3xl sm:text-5xl font-semibold leading-tight max-w-4xl mb-4">${item.title}</h1>
        <p class="text-base sm:text-lg text-slate-200 max-w-3xl leading-relaxed">${item.summary}</p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <aside class="lg:col-span-4 lg:sticky lg:top-24 space-y-6 order-2 lg:order-1">
        <div class="luxury-card p-6 border-gold-500/20">
          <div class="text-xs font-bold uppercase tracking-wider text-gold-600 mb-3">Mục lục bài viết</div>
          <div class="space-y-2 text-sm">
            ${item.sections.map((s, i) => `
              <button onclick="scrollToArticleSection('myopia-sec-${i}')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-ivory-100 text-navy-900 font-medium transition flex items-start gap-2">
                <span class="text-gold-600 font-bold">0${i + 1}.</span>
                <span>${s.heading.replace(/^\d+\.\s*/, '')}</span>
              </button>
            `).join("")}
          </div>
        </div>

        <div class="bg-navy-900 text-white rounded-3xl p-6 space-y-4 shadow-xl border border-gold-500/30">
          <div class="text-[11px] font-bold uppercase tracking-wider text-gold-400">Tư vấn Kiểm soát Cận thị 1-1</div>
          <h4 class="font-display text-2xl font-semibold">${relatedSrv ? relatedSrv.shortName : 'Đo trục nhãn cầu & Ortho-K'}</h4>
          <p class="text-xs text-slate-300 leading-relaxed">${relatedSrv ? relatedSrv.tagline : 'Thăm khám trực tiếp cùng đội ngũ Chuyên gia Khúc xạ tại Mắt Sài Gòn Phú Thọ (Hệ thống liên kết).'}</p>
          <button onclick="openBookingModal('${relatedServiceId}')" class="btn-gold w-full py-3 rounded-full text-xs">Đặt lịch khám chuyên sâu &rarr;</button>
        </div>
      </aside>

      <article class="lg:col-span-8 space-y-8 order-1 lg:order-2">
        <div class="p-6 rounded-3xl bg-gold-200/35 border border-gold-500/30">
          <div class="text-xs font-bold uppercase tracking-wider text-gold-600 mb-2">📌 Tóm tắt chuyên môn</div>
          <p class="text-sm text-navy-900 leading-relaxed font-medium">${item.summary}</p>
        </div>

        <div class="space-y-8">
          ${item.sections.map((s, i) => `
            <section id="myopia-sec-${i}" class="scroll-mt-24 luxury-card p-6 sm:p-8 border border-slate-100">
              <div class="flex items-center gap-3 mb-3">
                <span class="w-8 h-8 rounded-full bg-navy-900 text-gold-400 text-xs font-bold flex items-center justify-center shrink-0">0${i + 1}</span>
                <h2 class="font-display text-2xl sm:text-3xl font-semibold text-navy-900">${s.heading.replace(/^\d+\.\s*/, '')}</h2>
              </div>
              <p class="text-base text-slate-700 leading-relaxed">${s.body}</p>
            </section>
          `).join("")}
        </div>

        <div class="p-6 rounded-3xl bg-white border border-emerald-500/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="text-xs font-bold text-emerald-700 uppercase">Thông tin đã được kiểm duyệt y khoa</div>
            <div class="text-sm text-navy-900 font-semibold mt-1">Đặt lịch đo trục nhãn cầu &amp; tư vấn kiểm soát cận thị cùng ${reviewer}.</div>
          </div>
          <button onclick="openBookingModal('${relatedServiceId}')" class="btn-gold px-6 py-3 rounded-full text-xs shrink-0">Đặt lịch khám ngay</button>
        </div>

        <div>
          <h3 class="font-display text-3xl font-semibold text-navy-900 mb-6">Bài Viết Kiểm Soát Cận Thị Liên Quan</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            ${others.map(o => `
              <div onclick="openMyopiaArticleDetail('${o.id}')" class="luxury-card card-gold-accent overflow-hidden cursor-pointer group flex flex-col justify-between">
                <div>
                  <img src="${o.image}" alt="${o.title}" class="h-36 w-full object-cover group-hover:scale-105 transition duration-500" />
                  <div class="p-4">
                    <span class="text-[10px] font-bold text-gold-600 uppercase">${o.tag}</span>
                    <h4 class="font-display text-lg font-semibold text-navy-900 group-hover:text-gold-600 mt-1 line-clamp-2">${o.title}</h4>
                  </div>
                </div>
                <div class="px-4 pb-4 text-xs font-semibold text-navy-900">Đọc bài viết &rarr;</div>
              </div>
            `).join("")}
          </div>
        </div>
      </article>
    </div>
  `;

  listView.classList.add("hidden");
  detailView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  syncLangIfEn(box);
}

function backToMyopiaList() {
  const listView = document.getElementById("myopia-list-view");
  const detailView = document.getElementById("myopia-detail-view");
  if (detailView) detailView.classList.add("hidden");
  if (listView) listView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// -------------------- VIEW: OPTICAL SHOP & CART --------------------
function renderShopPage() {
  const cat = document.getElementById("filter-shop-cat")?.value || "all";
  const brand = document.getElementById("filter-shop-brand")?.value || "all";
  const grid = document.getElementById("shop-grid");
  if (!grid) return;

  const list = DATA.products.filter(p => (cat === "all" || p.category === cat) && (brand === "all" || p.brand === brand));
  grid.innerHTML = list.map((p, idx) => `
    <div class="luxury-card doctor-card-fx card-gold-accent animate-cascade overflow-hidden flex flex-col justify-between group" style="animation-delay: ${idx * 60}ms">
      <div>
        <div class="doctor-portrait-wrap h-60 relative bg-ivory-100">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
          <div class="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent"></div>
          <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-navy-950/75 backdrop-blur-md border border-gold-400/40 text-gold-400 text-[10px] font-bold uppercase">${p.brand}</span>
          <span class="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 text-navy-900 text-[10px] font-semibold">${p.material}</span>
        </div>
        <div class="p-6">
          <span class="text-[11px] font-bold text-gold-600 uppercase">${p.category}</span>
          <h3 class="font-display text-2xl font-semibold text-navy-900 group-hover:text-gold-600 transition mt-1">${p.name}</h3>
          <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">${p.specs}</p>
        </div>
      </div>
      <div class="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span class="font-bold text-navy-900">${p.price.toLocaleString("vi-VN")}đ</span>
        <div class="flex gap-2">
          <button onclick="openProductModal('${p.id}')" class="px-3.5 py-2 rounded-full border border-navy-900 text-xs font-semibold hover:bg-navy-900 hover:text-white transition">Chi tiết</button>
          <button onclick="addToCart('${p.id}')" class="btn-gold px-4 py-2 rounded-full text-xs">Mua</button>
        </div>
      </div>
    </div>
  `).join("") || `<p class="col-span-3 text-center text-slate-500 py-10">Không tìm thấy sản phẩm phù hợp bộ lọc.</p>`;
}

function openProductModal(id) {
  const p = DATA.products.find(x => x.id === id);
  if (!p) return;
  document.getElementById("generic-modal-body").innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div class="bg-ivory-100 rounded-2xl p-6 flex items-center justify-center overflow-hidden group">
        <img src="${p.image}" class="max-h-64 object-contain group-hover:scale-125 transition duration-500 cursor-zoom-in" />
      </div>
      <div class="space-y-4">
        <span class="text-xs font-bold text-gold-600 uppercase">${p.brand} • ${p.material}</span>
        <h3 class="font-display text-3xl font-semibold text-navy-900">${p.name}</h3>
        <div class="text-2xl font-bold text-navy-900">${p.price.toLocaleString("vi-VN")}đ</div>
        <p class="text-xs text-slate-600">${p.desc}</p>
        <div class="p-3 rounded-xl bg-ivory-50 border border-slate-200 space-y-2 text-xs">
          <div class="font-bold text-navy-900">Nhập thông số đơn kính (nếu có):</div>
          <div class="grid grid-cols-3 gap-2">
            <input type="text" id="rx-mp" placeholder="MP (VD: -2.5)" class="px-2 py-1.5 rounded border border-slate-200" />
            <input type="text" id="rx-mt" placeholder="MT (VD: -2.0)" class="px-2 py-1.5 rounded border border-slate-200" />
            <input type="text" id="rx-pd" placeholder="PD (mm)" class="px-2 py-1.5 rounded border border-slate-200" />
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <button onclick="addToCartWithRx('${p.id}'); closeGenericModal(); toggleCartDrawer()" class="btn-gold flex-1 py-3 rounded-full text-xs">Thêm vào giỏ &amp; Thanh toán</button>
          <button onclick="closeGenericModal(); openBookingModal('kham-tong-quat', '', 'Đặt lịch đo mắt & thử kính ${p.name}')" class="btn-navy flex-1 py-3 rounded-full text-xs">Đặt lịch đo mắt tại viện</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("generic-modal").classList.remove("hidden");
}

function addToCartWithRx(id) {
  const mp = document.getElementById("rx-mp")?.value.trim() || "";
  const mt = document.getElementById("rx-mt")?.value.trim() || "";
  const pd = document.getElementById("rx-pd")?.value.trim() || "";
  const rxNote = (mp || mt || pd) ? `Đơn kính: MP ${mp || '-'} | MT ${mt || '-'} | PD ${pd || '-'}` : "";
  addToCart(id, rxNote);
}

function addToCart(id, rxNote = "") {
  const p = DATA.products.find(x => x.id === id);
  if (!p) return;
  const ex = state.cart.find(c => c.id === id && (c.rxNote || "") === rxNote);
  if (ex) ex.qty++;
  else state.cart.push({ ...p, qty: 1, rxNote });
  updateCartBadge();
  renderCartDrawer();
  showToast(`Đã thêm "${p.name}" vào giỏ hàng`);
}

function updateCartQty(idx, delta) {
  if (!state.cart[idx]) return;
  state.cart[idx].qty += delta;
  if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  badge.textContent = count;
  badge.classList.toggle("hidden", count === 0);
}

function toggleCartDrawer() {
  renderCartDrawer();
  document.getElementById("cart-drawer").classList.toggle("hidden");
}

function renderCartDrawer() {
  const list = document.getElementById("cart-items-list");
  const totalEl = document.getElementById("cart-total");
  if (!list) return;
  if (!state.cart.length) {
    list.innerHTML = `<p class="text-sm text-slate-500 text-center py-10">Giỏ hàng kính mắt đang trống.</p>`;
    totalEl.textContent = "0đ";
    return;
  }
  let sum = 0;
  list.innerHTML = state.cart.map((item, idx) => {
    sum += item.price * item.qty;
    return `
      <div class="p-3.5 rounded-2xl bg-ivory-50 border border-slate-200 space-y-2">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-semibold text-xs text-navy-900">${item.name}</div>
            ${item.rxNote ? `<div class="text-[11px] text-emerald-700 font-medium mt-0.5">${item.rxNote}</div>` : ''}
            <div class="text-xs text-gold-600 font-bold mt-1">${item.price.toLocaleString("vi-VN")}đ</div>
          </div>
          <button onclick="state.cart.splice(${idx},1); updateCartBadge(); renderCartDrawer()" class="text-xs text-red-500 hover:underline font-semibold shrink-0">Xóa</button>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="updateCartQty(${idx}, -1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 text-xs font-bold flex items-center justify-center">-</button>
          <span class="text-xs font-semibold w-5 text-center">${item.qty}</span>
          <button onclick="updateCartQty(${idx}, 1)" class="w-6 h-6 rounded-full bg-white border border-slate-200 text-xs font-bold flex items-center justify-center">+</button>
        </div>
      </div>
    `;
  }).join("");
  totalEl.textContent = sum.toLocaleString("vi-VN") + "đ";
}

function checkoutCart() {
  if (!state.cart.length) return showToast("Giỏ hàng đang trống!");
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  toggleCartDrawer();
  document.getElementById("generic-modal-body").innerHTML = `
    <div class="text-center space-y-4">
      <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">Thanh toán QR / VNPay Tự Động</span>
      <h3 class="font-display text-3xl font-semibold text-navy-900">Quét Mã Thanh Toán Đơn Hàng</h3>
      <div class="text-2xl font-bold text-gold-600">${total.toLocaleString("vi-VN")}đ</div>
      <div class="w-44 h-44 mx-auto bg-navy-900 rounded-2xl p-4 flex items-center justify-center text-white text-xs border-4 border-gold-500">
        [MÃ QR VNPAY / VIETQR]<br/>MẮT SÀI GÒN PHÚ THỌ
      </div>
      <p class="text-xs text-slate-500">Sau khi chuyển khoản, đơn hàng sẽ được xác nhận tức thì qua Zalo OA.</p>
      <button onclick="state.cart=[]; updateCartBadge(); closeGenericModal(); showToast('Thanh toán thành công! Mã đơn kính đã gửi về Zalo của bạn.')" class="btn-gold px-8 py-3 rounded-full text-sm">Xác nhận đã thanh toán</button>
    </div>
  `;
  document.getElementById("generic-modal").classList.remove("hidden");
}

// -------------------- 3-STEP SMART BOOKING MODAL --------------------
function openBookingModal(serviceId = "", doctorId = "", note = "") {
  if (serviceId) state.booking.serviceId = serviceId;
  state.booking.doctorId = doctorId;
  if (note) state.booking.symptoms = note;
  state.booking.step = 1;
  renderBookingModal();
  document.getElementById("booking-modal").classList.remove("hidden");
}

function closeBookingModal() {
  document.getElementById("booking-modal").classList.add("hidden");
}

function submitHeroQuickBook() {
  const srv = document.getElementById("hero-quick-service").value;
  const date = document.getElementById("hero-quick-date").value;
  const phone = document.getElementById("hero-quick-phone").value;
  state.booking.serviceId = srv;
  if (date) state.booking.date = date;
  if (phone) state.booking.phone = phone;
  openBookingModal(srv);
  if (phone) { state.booking.step = 3; renderBookingModal(); }
}

function renderBookingModal() {
  [1, 2, 3].forEach(n => {
    const el = document.getElementById(`bk-ind-${n}`);
    if (el) el.className = n <= state.booking.step
      ? "py-2 px-3 rounded-xl bg-navy-900 text-white text-center"
      : "py-2 px-3 rounded-xl bg-ivory-100 text-slate-500 text-center";
  });

  const box = document.getElementById("booking-steps-container");
  if (state.booking.step === 1) {
    box.innerHTML = `
      <div class="space-y-4 text-sm">
        <div>
          <label class="block text-xs font-bold text-navy-900 mb-1.5">Chọn dịch vụ / chuyên khoa</label>
          <select id="bk-service" onchange="state.booking.serviceId=this.value" class="w-full px-4 py-3 rounded-xl bg-ivory-50 border border-slate-200">
            ${DATA.services.map(s => `<option value="${s.id}" ${state.booking.serviceId === s.id ? "selected" : ""}>${s.name}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-navy-900 mb-1.5">Chọn Bác sĩ (tùy chọn)</label>
          <select id="bk-doctor" onchange="state.booking.doctorId=this.value" class="w-full px-4 py-3 rounded-xl bg-ivory-50 border border-slate-200">
            <option value="">Bệnh viện sắp xếp Chuyên gia phù hợp nhất</option>
            ${DATA.doctors.map(d => `<option value="${d.id}" ${state.booking.doctorId === d.id ? "selected" : ""}>${d.name} (${d.specialty})</option>`).join("")}
          </select>
        </div>
        <button onclick="state.booking.step=2; renderBookingModal()" class="btn-gold w-full py-3.5 rounded-full text-sm">Tiếp tục: Chọn ngày &amp; giờ &rarr;</button>
      </div>
    `;
  } else if (state.booking.step === 2) {
    const slots = ["08:00 – 09:00", "09:30 – 10:30", "10:30 – 11:30", "13:30 – 14:30", "15:00 – 16:00", "16:00 – 17:00"];
    box.innerHTML = `
      <div class="space-y-4 text-sm">
        <div>
          <label class="block text-xs font-bold text-navy-900 mb-1.5">Chọn ngày khám</label>
          <input type="date" value="${state.booking.date}" onchange="state.booking.date=this.value" class="w-full px-4 py-3 rounded-xl bg-ivory-50 border border-slate-200" />
        </div>
        <div>
          <label class="block text-xs font-bold text-navy-900 mb-1.5">Chọn khung giờ ưu tiên</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${slots.map(sl => `
              <button onclick="state.booking.time='${sl}'; renderBookingModal()" class="py-2.5 px-3 rounded-xl border text-xs font-semibold ${state.booking.time === sl ? 'bg-navy-900 text-white border-navy-900' : 'bg-ivory-50 border-slate-200'}">${sl}</button>
            `).join("")}
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button onclick="state.booking.step=1; renderBookingModal()" class="px-6 py-3 rounded-full border border-slate-200 text-xs font-semibold">Quay lại</button>
          <button onclick="state.booking.step=3; renderBookingModal()" class="btn-gold flex-1 py-3 rounded-full text-sm">Tiếp tục: Nhập thông tin &rarr;</button>
        </div>
      </div>
    `;
  } else if (state.booking.step === 3) {
    box.innerHTML = `
      <form onsubmit="confirmBooking(event)" class="space-y-4 text-sm">
        <input type="text" required value="${state.booking.name}" oninput="state.booking.name=this.value" placeholder="Họ và tên bệnh nhân *" class="w-full px-4 py-3 rounded-xl bg-ivory-50 border border-slate-200" />
        <input type="tel" required value="${state.booking.phone}" oninput="state.booking.phone=this.value" placeholder="Số điện thoại (nhận mã Zalo ZNS) *" class="w-full px-4 py-3 rounded-xl bg-ivory-50 border border-slate-200" />
        <textarea rows="2" oninput="state.booking.symptoms=this.value" placeholder="Triệu chứng hoặc ghi chú thêm..." class="w-full px-4 py-3 rounded-xl bg-ivory-50 border border-slate-200">${state.booking.symptoms}</textarea>
        <div class="flex gap-3">
          <button type="button" onclick="state.booking.step=2; renderBookingModal()" class="px-6 py-3 rounded-full border border-slate-200 text-xs font-semibold">Quay lại</button>
          <button type="submit" class="btn-gold flex-1 py-3.5 rounded-full text-sm">Xác nhận Đặt Lịch Khám</button>
        </div>
      </form>
    `;
  } else {
    const code = "MAS-" + Math.floor(100000 + Math.random() * 900000);
    const srv = DATA.services.find(s => s.id === state.booking.serviceId)?.name || "Khám chuyên khoa";
    const doc = DATA.doctors.find(d => d.id === state.booking.doctorId)?.name || "Chuyên gia đầu ngành";
    box.innerHTML = `
      <div class="text-center space-y-4 py-2">
        <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto">✓</div>
        <h4 class="font-display text-3xl font-semibold text-navy-900">Đặt Lịch Thành Công!</h4>
        <div class="inline-block px-4 py-1.5 rounded-full bg-gold-200/60 text-navy-900 font-bold text-sm">Mã lịch hẹn: ${code}</div>
        <div class="p-4 rounded-2xl bg-ivory-50 border border-slate-200 text-left text-xs space-y-1.5">
          <div><strong>Khách hàng:</strong> ${state.booking.name} (${state.booking.phone})</div>
          <div><strong>Dịch vụ:</strong> ${srv}</div>
          <div><strong>Bác sĩ:</strong> ${doc}</div>
          <div><strong>Thời gian:</strong> ${state.booking.time}, ngày ${state.booking.date}</div>
          <div class="text-emerald-700 font-semibold pt-1">✓ Tin nhắn xác nhận ZNS đã được gửi tự động tới Zalo của quý khách.</div>
        </div>
        <div class="p-4 rounded-2xl bg-navy-900 text-white text-left text-xs">
          <strong>Lưu ý chuẩn bị trước khi đến viện:</strong> Ngưng đeo kính áp tròng mềm 3–7 ngày nếu khám mổ cận; mang theo kính đang đeo và CMND/CCCD/Thẻ bảo hiểm.
        </div>
        <button onclick="closeBookingModal()" class="btn-navy px-8 py-3 rounded-full text-sm">Hoàn tất</button>
      </div>
    `;
  }
}

function confirmBooking(e) {
  e.preventDefault();
  state.booking.step = 4;
  renderBookingModal();
}

function submitContactForm(e) {
  e.preventDefault();
  showToast("Đã gửi yêu cầu tư vấn! CSKH sẽ gọi lại trong 15 phút.");
  e.target.reset();
}

function closeGenericModal() {
  document.getElementById("generic-modal").classList.add("hidden");
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.add("hidden"), 3500);
}
