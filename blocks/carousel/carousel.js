export default function decorate(block) {
  const slides = block.querySelectorAll(':scope > div');
  const carouselInner = document.createElement('div');
  carouselInner.className = 'carouselInner';

  slides.forEach((slide, index) => {
    const slideItem = document.createElement('div');
    slideItem.className = `carouselItem ${index === 0 ? 'active' : ''}`;

    const heading = slide.querySelector('div:first-child');
    const headingH2 = document.createElement('h2');
    headingH2.className = 'carouselHeading';
    headingH2.textContent = heading.textContent;
    slideItem.appendChild(headingH2);

    const imageContainer = slide.querySelector('div:last-child');
    imageContainer.classList.add('carouselImageContainer');
    slideItem.appendChild(imageContainer);

    carouselInner.appendChild(slideItem);
  });

  const indicators = document.createElement('div');
  indicators.className = 'carouselIndicators';
  slides.forEach((_, index) => {
    const indicator = document.createElement('button');
    indicator.className = `carouselIndicator ${index === 0 ? 'active' : ''}`;
    indicator.setAttribute('data-slide-to', index);
    indicators.appendChild(indicator);
  });

  block.innerHTML = '';
  block.appendChild(carouselInner);
  block.appendChild(indicators);

  // Carousel functionality
  let activeIndex = 0;
  const changeSlide = (index) => {
    const items = block.querySelectorAll('.carouselItem');
    const indicators = block.querySelectorAll('.carouselIndicator');

    items[activeIndex].classList.remove('active');
    indicators[activeIndex].classList.remove('active');

    items[index].classList.add('active');
    indicators[index].classList.add('active');
    activeIndex = index;
  };

  indicators.querySelectorAll('.carouselIndicator').forEach(indicator => {
    indicator.addEventListener('click', () => {
      const index = parseInt(indicator.getAttribute('data-slide-to'));
      changeSlide(index);
    });
  });

  setInterval(() => {
    const nextIndex = (activeIndex + 1) % slides.length;
    changeSlide(nextIndex);
  }, 5000);
}
