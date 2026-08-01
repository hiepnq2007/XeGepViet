const header = document.querySelector("[data-header]");
const slides = Array.from(document.querySelectorAll(".hero-slide"));
const form = document.querySelector(".lead-form");
const formNote = document.querySelector("[data-form-note]");
const roleSelect = form?.querySelector("[data-role-select]");
const driverFields = Array.from(form?.querySelectorAll("[data-driver-field]") || []);
const newsList = document.querySelector("[data-news-list]");
const newsFilter = document.querySelector("[data-news-filter]");
let selectedNewsTypeID = "";
let currentSlide = 0;

const LOCAL_FORUM_API = "http://127.0.0.1:3020/api/forum";
const PUBLIC_FORUM_API = "https://api.xeghepviet.com/community/forum/api/forum";

function resolveForumApiBase() {
  if (window.location.protocol === "file:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return LOCAL_FORUM_API;
  }

  return PUBLIC_FORUM_API;
}

function setFormNote(message, tone = "neutral") {
  if (!formNote) return;
  formNote.textContent = message;
  formNote.dataset.tone = tone;
}

function getPageLanguage() {
  return document.documentElement.lang?.toLowerCase().startsWith("en") ? "en" : "vi";
}

function formatNewsDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(getPageLanguage() === "en" ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderNewsItems(news) {
  if (!newsList) return;
  const lang = getPageLanguage();
  const emptyMessage = newsList.dataset.emptyMessage || (lang === "en" ? "No news is available yet." : "Chưa có tin tức.");

  if (!Array.isArray(news) || news.length === 0) {
    newsList.innerHTML = `<p class="news-empty">${escapeHtml(emptyMessage)}</p>`;
    return;
  }

  newsList.innerHTML = news.map((item) => {
    const title = escapeHtml(item.title);
    const summary = escapeHtml(item.shortParagraph || item.fullParagraph || "");
    const typeName = escapeHtml(item.typeName || "Xe Ghép Việt");
    const dateLabel = escapeHtml(formatNewsDate(item.dateTime));
    const image = item.imageLink ? escapeHtml(item.imageLink) : "";
    const fallbackNote = item.isFallbackTranslation && lang === "en"
      ? '<span class="news-language-note">Original language</span>'
      : "";

    return `
      <article class="news-card" itemscope itemtype="https://schema.org/NewsArticle">
        ${image
          ? `<img class="news-image" src="${image}" alt="${title}" loading="lazy" itemprop="image" />`
          : '<div class="news-image-placeholder" aria-hidden="true"></div>'}
        <div class="news-card-body">
          <div class="news-meta">
            <span class="news-tag" style="--tag-color: ${escapeHtml(item.typeColor || "#0f7c55")}">${typeName}</span>
            ${dateLabel ? `<time datetime="${escapeHtml(item.dateTime)}" itemprop="datePublished">${dateLabel}</time>` : ""}
          </div>
          <h3 itemprop="headline">${title}</h3>
          <p itemprop="description">${summary}</p>
          ${fallbackNote}
        </div>
      </article>
    `;
  }).join("");

  // This JSON-LD mirrors the rendered cards so crawlers can understand the news list.
  const existingJsonLd = document.querySelector("[data-news-jsonld]");
  existingJsonLd?.remove();
  const jsonLd = document.createElement("script");
  jsonLd.type = "application/ld+json";
  jsonLd.dataset.newsJsonld = "true";
  jsonLd.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: news.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "NewsArticle",
        headline: item.title,
        description: item.shortParagraph || item.fullParagraph || "",
        image: item.imageLink || undefined,
        datePublished: item.dateTime || undefined,
        publisher: {
          "@type": "Organization",
          name: lang === "en" ? "Xe Ghep Viet" : "Xe Ghép Việt",
        },
      },
    })),
  });
  document.head.appendChild(jsonLd);
}

async function loadCommunityNews() {
  if (!newsList) return;
  const lang = getPageLanguage();
  const params = new URLSearchParams({ limit: "3", lang });
  if (selectedNewsTypeID) params.set("typeID", selectedNewsTypeID);

  try {
    const response = await fetch(`${resolveForumApiBase()}/news?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.message || "Unable to load news");
    }
    renderNewsItems(payload?.data?.news || []);
  } catch (error) {
    console.error("[CommunityNews] load.error", error);
    renderNewsItems([]);
  }
}

function renderNewsFilter(types) {
  if (!newsFilter) return;
  const allLabel = newsFilter.dataset.allLabel || (getPageLanguage() === "en" ? "All categories" : "Tất cả loại tin");
  const items = [{ typeID: "", name: allLabel, color: "#0f7c55" }, ...(Array.isArray(types) ? types : [])];

  newsFilter.innerHTML = items.map((type) => {
    const typeID = escapeHtml(type.typeID || "");
    const active = (type.typeID || "") === selectedNewsTypeID;
    return `
      <button
        class="news-filter-button${active ? " active" : ""}"
        type="button"
        data-news-type="${typeID}"
        style="--tag-color: ${escapeHtml(type.color || "#0f7c55")}"
        aria-pressed="${active ? "true" : "false"}"
      >
        ${escapeHtml(type.name)}
      </button>
    `;
  }).join("");
}

async function loadCommunityNewsTypes() {
  if (!newsFilter) return;
  const lang = getPageLanguage();
  try {
    const response = await fetch(`${resolveForumApiBase()}/news/types?lang=${lang}`, {
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.message || "Unable to load news categories");
    }
    renderNewsFilter(payload?.data?.types || []);
  } catch (error) {
    console.error("[CommunityNews] types.load.error", error);
    renderNewsFilter([]);
  }
}

function updateDriverFields() {
  const isDriver = roleSelect?.value === "driver";
  driverFields.forEach((field) => {
    field.hidden = !isDriver;
    const control = field.querySelector("input, select");
    if (control) {
      control.disabled = !isDriver;
      control.required = isDriver;
    }
  });
}

function updateHeader() {
  header?.classList.toggle("scrolled", window.scrollY > 24);
}

function showSlide(index) {
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === index);
  });
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
roleSelect?.addEventListener("change", updateDriverFields);
updateDriverFields();

if (slides.length > 1) {
  window.setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 5200);
}

loadCommunityNews();
loadCommunityNewsTypes();

newsFilter?.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest("[data-news-type]");
  if (!button) return;
  selectedNewsTypeID = button.dataset.newsType || "";
  Array.from(newsFilter.querySelectorAll("[data-news-type]")).forEach((item) => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", active ? "true" : "false");
  });
  loadCommunityNews();
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const fullName = String(formData.get("name") || "").trim();
  const phoneNumber = String(formData.get("phone") || "").trim();
  const hometown = String(formData.get("hometown") || "").trim();
  const role = String(formData.get("role") || "customer").trim() || "customer";
  const cooperative = String(formData.get("cooperative") || "").trim();
  const licensePlateColor = String(formData.get("licensePlateColor") || "").trim();

  if (!fullName || !phoneNumber || !hometown) {
    setFormNote("Vui lòng nhập họ tên, số điện thoại và quê quán.", "error");
    return;
  }

  if (role === "driver" && (!cooperative || !licensePlateColor)) {
    setFormNote("Vui lòng nhập hợp tác xã và chọn màu biển số xe.", "error");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const previousButtonText = submitButton?.textContent || "";

  try {
    setFormNote("Đang gửi thông tin...", "info");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Đang gửi...";
    }

    const response = await fetch(`${resolveForumApiBase()}/landing-leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        fullName,
        phoneNumber,
        hometown,
        role,
        cooperative: role === "driver" ? cooperative : undefined,
        licensePlateColor: role === "driver" ? licensePlateColor : undefined,
        source: "landing-page",
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.message || "Không thể gửi thông tin lúc này.");
    }

    form.reset();
    updateDriverFields();
    setFormNote("Đã ghi nhận thông tin. Chúng tôi sẽ liên hệ sớm.", "success");
  } catch (error) {
    console.error("[LandingLead] submit.error", error);
    setFormNote(
      error instanceof Error ? error.message : "Không thể gửi thông tin lúc này.",
      "error",
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = previousButtonText;
    }
  }
});
