// Cinematic reveal effects, falling rose petals and mobile navigation.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll(".reveal").forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index % 5, 4) * 100}ms`;
  revealObserver.observe(el);
});

const petalLayer = document.getElementById("petals");
const petalCount = window.matchMedia("(max-width: 700px)").matches ? 15 : 28;
for (let i = 0; i < petalCount; i++) {
  const petal = document.createElement("span");
  petal.className = "petal";
  petal.style.left = `${Math.random() * 100}%`;
  petal.style.animationDuration = `${9 + Math.random() * 15}s`;
  petal.style.animationDelay = `${-Math.random() * 22}s`;
  petal.style.setProperty("--drift", `${-100 + Math.random() * 200}px`);
  petal.style.opacity = `${0.25 + Math.random() * 0.55}`;
  petal.style.transform = `scale(${0.55 + Math.random() * 0.9})`;
  petalLayer.appendChild(petal);
}

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

// Gentle pointer parallax on desktop hero frame.
const frame = document.querySelector(".hero-frame");
if (window.matchMedia("(pointer:fine)").matches) {
  document.querySelector(".hero").addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 5;
    const y = (event.clientY / window.innerHeight - 0.5) * 5;
    frame.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
  });
  document.querySelector(".hero").addEventListener("pointerleave", () => {
    frame.style.transform = "perspective(1000px) rotateY(0) rotateX(0)";
  });
}
