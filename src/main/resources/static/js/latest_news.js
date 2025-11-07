document.addEventListener("DOMContentLoaded", () => {
  const newsList = document.querySelector('.news-list');
  const items = document.querySelectorAll('.news-item');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  let currentIndex = 0;
  const totalItems = items.length;

  nextBtn.addEventListener('click', () => {
    if (currentIndex < totalItems - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    updateSlide();
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = totalItems - 1;
    }
    updateSlide();
  });

  function updateSlide() {
    const offset = -currentIndex * 100;
    newsList.style.transform = `translateX(${offset}%)`;
  }
});