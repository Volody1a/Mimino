document.addEventListener('DOMContentLoaded', function() {
    // ========== Глобальные настройки ==========
    const isTouchDevice = 'ontouchstart' in window;
    const html = document.documentElement;
    
    // Фиксы для мобильных устройств
    if (isTouchDevice) {
        html.style.touchAction = 'manipulation';
        html.style.webkitTextSizeAdjust = '100%';
        
        // Предотвращение масштабирования при двойном тапе
        document.addEventListener('dblclick', function(e) {
            e.preventDefault();
        }, { passive: false });
    }

    // ========== Бургер-меню ==========
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');

    if (hamburger && menu) {
        const toggleMenu = () => {
            hamburger.classList.toggle('active');
            menu.classList.toggle('active');
            document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
        };

        // Улучшенный обработчик для всех устройств
        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        // Закрытие при клике вне меню
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Закрытие при клике на ссылку
        document.querySelectorAll('.menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ========== Модальные окна ==========
    const serviceItems = document.querySelectorAll('.service-item');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');

    // Функция открытия модалки
    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Закрываем все модалки
        modals.forEach(m => m.classList.remove('active'));
        
        // Открываем нужную
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Инициализация слайдера
        const slider = modal.querySelector('.slider');
        if (slider) initSlider(slider);
    };

    // Функция закрытия модалки
    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Обработчики для карточек услуг
    serviceItems.forEach(item => {
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;

        item.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        item.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const timeDiff = Date.now() - touchStartTime;
            
            // Проверяем, был ли это тап (а не свайп)
            const isTap = (
                Math.abs(touchEndX - touchStartX) < 10 && 
                Math.abs(touchEndY - touchStartY) < 10 &&
                timeDiff < 300
            );

            if (isTap) {
                const modalId = item.getAttribute('data-modal');
                openModal(modalId);
            }
        }, { passive: true });

        // Для десктопов
        item.addEventListener('click', function(e) {
            if (e.target.closest('a') || e.target.closest('button')) return;
            if (isTouchDevice) return; // Для тач-устройств используем только touchend
            
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    // Закрытие модалок
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal(button.closest('.modal'));
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // ========== Слайдер ==========
    function initSlider(slider) {
        const track = slider.querySelector('.slider-track');
        const slides = slider.querySelectorAll('.slide');
        const prevBtn = slider.querySelector('.prev');
        const nextBtn = slider.querySelector('.next');
        
        if (!track || !slides.length) return;
        
        let currentIndex = 0;
        let slideWidth = slider.offsetWidth;
        let isDragging = false;
        let startPosX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        
        // Установка размеров слайдов
        const setSlideWidth = () => {
            slideWidth = slider.offsetWidth;
            slides.forEach(slide => {
                slide.style.width = `${slideWidth}px`;
            });
            updateSliderPosition();
        };
        
        // Навигация
        const goNext = () => {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
                updateSliderPosition();
            }
        };
        
        const goPrev = () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSliderPosition();
            }
        };
        
        const updateSliderPosition = () => {
            track.style.transition = 'transform 0.3s ease-out';
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            prevTranslate = currentIndex * slideWidth;
            currentTranslate = prevTranslate;
        };
        
        // Инициализация
        setSlideWidth();
        window.addEventListener('resize', setSlideWidth);
        
        // Кнопки навигации
        if (nextBtn) nextBtn.addEventListener('click', goNext);
        if (prevBtn) prevBtn.addEventListener('click', goPrev);
        
        // Touch-события
        if (isTouchDevice) {
            slider.addEventListener('touchstart', touchStart, { passive: false });
            slider.addEventListener('touchmove', touchMove, { passive: false });
            slider.addEventListener('touchend', touchEnd);
        }
        
        function touchStart(e) {
            e.preventDefault();
            startPosX = e.touches[0].clientX;
            isDragging = true;
            track.style.transition = 'none';
        }
        
        function touchMove(e) {
            if (!isDragging) return;
            e.preventDefault();
            const currentX = e.touches[0].clientX;
            currentTranslate = prevTranslate + currentX - startPosX;
            track.style.transform = `translateX(${currentTranslate}px)`;
        }
        
        function touchEnd() {
            if (!isDragging) return;
            isDragging = false;
            
            const movedBy = currentTranslate - prevTranslate;
            const threshold = slideWidth / 4; // 25% ширины слайда
            
            if (movedBy < -threshold && currentIndex < slides.length - 1) {
                currentIndex++;
            } else if (movedBy > threshold && currentIndex > 0) {
                currentIndex--;
            }
            
            updateSliderPosition();
        }
    }

    // ========== Календарь ==========
    const initDatePickers = () => {
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        
        if (!checkinInput || !checkoutInput) return;
        
        const options = {
            locale: 'ru',
            dateFormat: 'd.m.Y',
            disableMobile: true, // Используем нативный пикер на мобильных
            clickOpens: true,
            onOpen: () => { document.body.style.overflow = 'hidden'; },
            onClose: () => { document.body.style.overflow = ''; }
        };
        
        const checkinPicker = flatpickr(checkinInput, {
            ...options,
            minDate: 'today',
            onChange: function(selectedDates) {
                checkoutPicker.set('minDate', new Date(selectedDates[0].getTime() + 86400000));
            }
        });
        
        const checkoutPicker = flatpickr(checkoutInput, {
            ...options,
            minDate: new Date().fp_incr(1)
        });
    };

    // ========== Форма бронирования ==========
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        // Оптимизация для touch-устройств
        if (isTouchDevice) {
            bookingForm.querySelectorAll('input, select').forEach(input => {
                input.addEventListener('focus', function() {
                    setTimeout(() => {
                        window.scrollTo({
                            top: this.getBoundingClientRect().top + window.pageYOffset - 100,
                            behavior: 'smooth'
                        });
                    }, 300);
                });
            });
        }
        
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                checkin: document.getElementById('checkin').value,
                checkout: document.getElementById('checkout').value,
                house: document.getElementById('house').value,
                date: new Date().toLocaleString('ru-RU')
            };
            
            // Валидация
            const errors = [];
            if (!formData.name || formData.name.length < 2) errors.push('Укажите корректное имя');
            if (!formData.phone || !/^[\d\+\(\)\s-]{7,}$/.test(formData.phone)) errors.push('Укажите корректный телефон');
            if (!formData.checkin || !formData.checkout) errors.push('Выберите даты заезда и выезда');
            if (!formData.house) errors.push('Выберите тип домика');
            
            if (errors.length > 0) {
                showAlert('error', errors.join('<br>'));
                return;
            }
            
            // Отправка формы
            setLoadingState(true);
            
            try {
                await sendFormData(formData);
                showAlert('success', '✅ Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
                bookingForm.reset();
            } catch (error) {
                console.error('Ошибка отправки:', error);
                showAlert('error', '❌ Ошибка при отправке. Пожалуйста, позвоните нам.');
            } finally {
                setLoadingState(false);
            }
        });
    }
    
    // ========== Вспомогательные функции ==========
    function sendFormData(data) {
        const config = {
            BOT_TOKEN: '7583652121:AAHPKhDWuHq9NNcqN5FFO4zvnzo8AYFAFPk',
            CHAT_ID: '752504401',
            get API_URL() { return `https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`; }
        };
        
        const text = `📌 <b>Новая заявка!</b>\n\n🏠 <b>Домик:</b> ${getHouseName(data.house)}\n👤 <b>Имя:</b> ${data.name}\n📱 <b>Телефон:</b> <code>${data.phone}</code>\n📅 <b>Даты:</b> ${data.checkin} → ${data.checkout}\n\n⏰ ${data.date}`;
        
        return fetch(config.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: config.CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        }).then(response => {
            if (!response.ok) throw new Error('Ошибка сервера');
        });
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
        if (!btn) return;
        
        btn.disabled = isLoading;
        const btnText = btn.querySelector('.btn-text');
        const btnSpinner = btn.querySelector('.btn-spinner');
        
        if (btnText) btnText.style.display = isLoading ? 'none' : 'inline-block';
        if (btnSpinner) btnSpinner.style.display = isLoading ? 'inline-block' : 'none';
    }
    
    function showAlert(type, message) {
        const alertsContainer = document.getElementById('formAlerts');
        if (!alertsContainer) return;
        
        alertsContainer.innerHTML = ''; // Очищаем предыдущие уведомления
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = message;
        alertsContainer.appendChild(alert);
        
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }

    // ========== Инициализация ==========
    initDatePickers();
    
    // Инициализация всех слайдеров
    document.querySelectorAll('.modal .slider').forEach(slider => {
        initSlider(slider);
    });
});