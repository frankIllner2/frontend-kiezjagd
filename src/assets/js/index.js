document.addEventListener("DOMContentLoaded", function () {
    const track = document.querySelector(".game-preview-section .slider-track");
    const cards = document.querySelectorAll(".game-preview-section .slider-track .card");
    const prevButton = document.querySelector(".game-preview-section .prev");
    const nextButton = document.querySelector(".game-preview-section .next");

    let currentIndex = 0;
    const visibleCards = 3;
    const cardWidth = 320; // Feste Breite inkl. Margin
    const totalCards = cards.length;

    console.log(totalCards );

    function updateSlider() {
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }

    nextButton.addEventListener("click", function () {
        if (currentIndex < totalCards - visibleCards) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateSlider();
    });

    prevButton.addEventListener("click", function () {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = totalCards - visibleCards;
        }
        updateSlider();
    });
});
