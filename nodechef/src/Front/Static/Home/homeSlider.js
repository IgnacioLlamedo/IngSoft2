let slides = document.querySelectorAll(".slide");
let current = 0;

function showSlide(index) {
slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
});
}

function nextSlide() {
current = (current + 1) % slides.length; // avanza en orden
showSlide(current);
}

// Cambia cada 5 segundos
setInterval(nextSlide, 5000);