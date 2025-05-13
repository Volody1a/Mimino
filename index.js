document.addEventListener('DOMContentLoaded', function() {
    // ==================== Бургер-меню ====================
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');
    
    if (hamburger && menu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            menu.classList.toggle('active');
        });
    }

    // ==================== Модальные окна ====================
    const serviceItems = document.querySelectorAll('.service-item');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');

    // Функция открытия модального окна
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
            
            // Анимация появления
            const modalContent = modal.querySelector('.modal-content');
            setTimeout(() => {
                modalContent.classList.add('active');
            }, 10);
            
            // Инициализация слайдера при открытии
            const slider = modal.querySelector('.slider');
            if (slider) initSlider(slider);
        }
    }

    // Функция закрытия модального окна
    function closeModal(modal) {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.classList.remove('active');
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Восстанавливаем скролл
        }, 300);
    }

    // Обработчики для модальных окон
    serviceItems.forEach(item => {
        item.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    // ==================== Слайдер ====================
    function initSlider(slider) {
        const track = slider.querySelector('.slider-track');
        const slides = slider.querySelectorAll('.slide');
        const prevBtn = slider.querySelector('.prev');
        const nextBtn = slider.querySelector('.next');
        
        if (!track || !slides.length || !prevBtn || !nextBtn) return;
        
        let currentIndex = 0;
        let slideWidth = slider.offsetWidth;
        
        // Устанавливаем ширину слайдов
        slides.forEach(slide => {
            slide.style.width = `${slideWidth}px`;
        });
        
        // Обновляем ширину при ресайзе окна
        window.addEventListener('resize', function() {
            slideWidth = slider.offsetWidth;
            slides.forEach(slide => {
                slide.style.width = `${slideWidth}px`;
            });
            updateSliderPosition();
        });
        
        // Функция обновления позиции слайдера
        function updateSliderPosition() {
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        }
        
        // Кнопка "Вперед"
        nextBtn.addEventListener('click', function() {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
            } else {
                currentIndex = 0; // Возврат к первому слайду
            }
            updateSliderPosition();
        });
        
        // Кнопка "Назад"
        prevBtn.addEventListener('click', function() {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = slides.length - 1; // Переход к последнему слайду
            }
            updateSliderPosition();
        });
        
        // Инициализация
        updateSliderPosition();
    }
    
    // Автоматическая инициализация всех слайдеров на странице
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        initSlider(slider);
    });
});