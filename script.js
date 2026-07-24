const header = document.querySelector("[data-header]");
const slides = Array.from(document.querySelectorAll(".hero-slide"));
const form = document.querySelector(".lead-form");
const formNote = document.querySelector("[data-form-note]");
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

if (slides.length > 1) {
  window.setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 5200);
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const fullName = String(formData.get("name") || "").trim();
  const phoneNumber = String(formData.get("phone") || "").trim();
  const role = String(formData.get("role") || "customer").trim() || "customer";

  if (!fullName || !phoneNumber) {
    setFormNote("Vui lòng nhập họ tên và số điện thoại.", "error");
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
        role,
        source: "landing-page",
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.message || "Không thể gửi thông tin lúc này.");
    }

    form.reset();
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
