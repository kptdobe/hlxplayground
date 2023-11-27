// carousel.js
export function decorate(block) {
  const slides = block.querySelectorAll('.carousel > div');
  const bulletsContainer = document.createElement('div');
  bulletsContainer.className = 'carousel-bullets';

  slides.forEach((slide, index) => {
    const bullet = document.createElement('span');
    bullet.className = 'carousel-bullet';
    bullet.addEventListener('click', () => showSlide(index));
    bulletsContainer.appendChild(bullet);
  });

  block.appendChild(bulletsContainer);

  let currentIndex = 0;

  function showSlide(index) {
    slides[currentIndex].classList.remove('active');
    bulletsContainer.children[currentIndex].classList.remove('active');
    
    currentIndex = index >= slides.length ? 0 : index < 0 ? slides.length - 1 : index;

    slides[currentIndex].classList.add('active');
    bulletsContainer.children[currentIndex].classList.add('active');
  }

  showSlide(currentIndex);
}
