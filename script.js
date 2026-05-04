const header = document.querySelector("[data-header]");
const slides = Array.from(document.querySelectorAll(".hero-slide"));
const form = document.querySelector(".lead-form");
let currentSlide = 0;

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

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  form.reset();
  window.alert("Cảm ơn bạn. Chúng tôi đã ghi nhận thông tin.");
});
