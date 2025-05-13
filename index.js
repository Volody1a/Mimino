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

// Инициализация календаря
// Инициализация календаря
document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация (замените на свои данные)
    const config = {
        BOT_TOKEN: '7583652121:AAHPKhDWuHq9NNcqN5FFO4zvnzo8AYFAFPk',
        CHAT_ID: '752504401',
        get API_URL() { return `https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`;}
    };

    // Инициализация календаря
    initDatePickers();

    // Обработка формы
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = getFormData();
            
            if (!validateForm(formData)) return;
            
            setLoadingState(true);
            
            try {
                await sendFormData(formData);
                showAlert('success', '✅ Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
                bookingForm.reset();
            } catch (error) {
                console.error('Ошибка отправки:', error);
                handleSendError(error);
            } finally {
                setLoadingState(false);
            }
        });
    }

    // Функции
    function initDatePickers() {
        flatpickr("#checkin", {
            locale: "ru",
            minDate: "today",
            dateFormat: "d.m.Y",
            onChange: function(selectedDates) {
                const minCheckout = new Date(selectedDates[0].getTime() + 86400000);
                flatpickr("#checkout").set("minDate", minCheckout);
            }
        });

        flatpickr("#checkout", {
            locale: "ru",
            minDate: new Date().fp_incr(1),
            dateFormat: "d.m.Y"
        });
    }

    function getFormData() {
        return {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            checkin: document.getElementById('checkin').value,
            checkout: document.getElementById('checkout').value,
            house: document.getElementById('house').value,
            date: new Date().toLocaleString('ru-RU')
        };
    }

    function validateForm(data) {
        const errors = [];
        
        if (!data.name || data.name.length < 2) {
            errors.push('Укажите корректное имя');
        }
        
        if (!data.phone || !/^[\d\+\(\)\s-]{7,}$/.test(data.phone)) {
            errors.push('Укажите корректный телефон');
        }
        
        if (!data.checkin || !data.checkout) {
            errors.push('Выберите даты заезда и выезда');
        }
        
        if (!data.house) {
            errors.push('Выберите тип домика');
        }
        
        if (errors.length > 0) {
            showAlert('error', errors.join('<br>'));
            return false;
        }
        
        return true;
    }

    async function sendFormData(data) {
        const text = formatMessage(data);
        const response = await fetch(config.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: config.CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.description || 'Ошибка сервера');
        }
    }

    function formatMessage(data) {
        return `📌 <b>Новая заявка!</b>\n\n` +
               `🏠 <b>Домик:</b> ${getHouseName(data.house)}\n` +
               `👤 <b>Имя:</b> ${data.name}\n` +
               `📱 <b>Телефон:</b> <code>${data.phone}</code>\n` +
               `📅 <b>Даты:</b> ${data.checkin} → ${data.checkout}\n\n` +
               `⏰ ${data.date}`;
    }

    function getHouseName(value) {
        const houses = {
            'house1': '🏡 Стандарт (2 чел)',
            'house2': '🏠 Комфорт (4 чел)',
            'house3': '🌟 VIP домик'
        };
        return houses[value] || value;
    }

    function setLoadingState(isLoading) {
        const btn = document.querySelector('#bookingForm button[type="submit"]');
        if (isLoading) {
            btn.disabled = true;
            btn.querySelector('.btn-text').style.display = 'none';
            btn.querySelector('.btn-spinner').style.display = 'inline-block';
        } else {
            btn.disabled = false;
            btn.querySelector('.btn-text').style.display = 'inline-block';
            btn.querySelector('.btn-spinner').style.display = 'none';
        }
    }

    function showAlert(type, message) {
        const alertsContainer = document.getElementById('formAlerts');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = message;
        alertsContainer.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    function handleSendError(error) {
        let errorMessage = '❌ Ошибка при отправке. Пожалуйста, позвоните нам.';
        
        if (error.message.includes('chat not found')) {
            errorMessage = 'Ошибка конфигурации бота';
        } else if (error.message.includes('bot was blocked')) {
            errorMessage = 'Бот недоступен';
        }
        
        showAlert('error', errorMessage);
    }
});

// Плавный скролл к якорям с дополнительным отступом
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Закрываем меню, если оно открыто (для мобильной версии)
        const menu = document.querySelector('.menu');
        if (menu && menu.classList.contains('active')) {
            menu.classList.remove('active');
            document.querySelector('.hamburger').classList.remove('active');
        }
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Высота хедера + дополнительный отступ (в пикселях)
            const headerHeight = document.querySelector('.header') ? 
                               document.querySelector('.header').offsetHeight : 0;
            const extraOffset = -100; // Дополнительный отступ (можно регулировать)
            const totalOffset = headerHeight + extraOffset;
            
            const targetPosition = targetElement.getBoundingClientRect().top + 
                                 window.pageYOffset - 
                                 totalOffset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Обновляем URL без перезагрузки страницы
            history.pushState(null, null, targetId);
        }
    });
});