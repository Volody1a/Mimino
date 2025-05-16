document.addEventListener('DOMContentLoaded', function() {
    // ==================== Глобальные настройки ====================
    const isTouchDevice = 'ontouchstart' in window;
    const html = document.documentElement;
    
    // Фикс для viewport на iOS
    if (isTouchDevice) {
        html.style.touchAction = 'manipulation';
        html.style.webkitTextSizeAdjust = '100%';
    }

    // ==================== Бургер-меню ====================
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');

    if (hamburger && menu) {
        // Клик по бургеру
        const toggleMenu = function(e) {
            if (e) e.preventDefault();
            hamburger.classList.toggle('active');
            menu.classList.toggle('active');
            document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
        };

        // Обработчики событий
        hamburger.addEventListener('click', toggleMenu);
        
        // Для touch-устройств
        if (isTouchDevice) {
            hamburger.addEventListener('touchend', function(e) {
                e.preventDefault();
                toggleMenu();
            });
        }

        // Закрытие при клике на ссылку
        document.querySelectorAll('.menu a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Закрытие при клике вне меню
        document.addEventListener('click', function(e) {
            if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
            }
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
            document.body.style.overflow = 'hidden';
            
            // Анимация
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.add('active');
            
            // Инициализация слайдера
            const slider = modal.querySelector('.slider');
            if (slider) initSlider(slider);
        }
    }

    // Функция закрытия
    function closeModal(modal) {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.classList.remove('active');
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    // Обработчики для карточек услуг
    serviceItems.forEach(item => {
        const handleOpenModal = function() {
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        };

        // Для всех устройств
        item.addEventListener('click', handleOpenModal);
        
        // Для touch-устройств
        if (isTouchDevice) {
            item.style.cursor = 'pointer';
            item.addEventListener('touchend', function(e) {
                e.preventDefault();
                handleOpenModal.call(this);
            });
        }
    });

    // Закрытие модальных окон
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
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
        let isDragging = false;
        let startPosX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        
        // Установка ширины слайдов
        slides.forEach((slide, index) => {
            slide.style.width = `${slideWidth}px`;
            
            // Touch события
            slide.addEventListener('touchstart', touchStart(index));
            slide.addEventListener('touchend', touchEnd);
            slide.addEventListener('touchmove', touchMove);
        });
        
        // Ресайз
        window.addEventListener('resize', () => {
            slideWidth = slider.offsetWidth;
            slides.forEach(slide => {
                slide.style.width = `${slideWidth}px`;
            });
            updateSliderPosition();
        });
        
        // Навигация
        nextBtn.addEventListener('click', goNext);
        prevBtn.addEventListener('click', goPrev);
        
        function updateSliderPosition() {
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        }
        
        function goNext() {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateSliderPosition();
        }
        
        function goPrev() {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = slides.length - 1;
            }
            updateSliderPosition();
        }
        
        // Touch функции
        function touchStart(index) {
            return function(e) {
                currentIndex = index;
                startPosX = e.touches[0].clientX;
                isDragging = true;
                track.style.transition = 'none';
            };
        }
        
        function touchEnd() {
            isDragging = false;
            track.style.transition = 'transform 0.3s ease';
            
            const movedBy = currentTranslate - prevTranslate;
            if (movedBy < -50 && currentIndex < slides.length - 1) {
                goNext();
            } else if (movedBy > 50 && currentIndex > 0) {
                goPrev();
            } else {
                updateSliderPosition();
            }
        }
        
        function touchMove(e) {
            if (isDragging) {
                const currentPosition = e.touches[0].clientX;
                currentTranslate = prevTranslate + currentPosition - startPosX;
                track.style.transform = `translateX(${currentTranslate}px)`;
            }
        }
        
        updateSliderPosition();
    }

    // ==================== Календарь и форма ====================
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        // Инициализация календаря
        flatpickr("#checkin", {
            locale: "ru",
            minDate: "today",
            dateFormat: "d.m.Y",
            disableMobile: false,
            clickOpens: true,
            onOpen: function() {
                document.body.style.overflow = 'hidden';
            },
            onClose: function() {
                document.body.style.overflow = '';
            },
            onChange: function(selectedDates) {
                const minCheckout = new Date(selectedDates[0].getTime() + 86400000);
                flatpickr("#checkout").set("minDate", minCheckout);
            }
        });

        flatpickr("#checkout", {
            locale: "ru",
            minDate: new Date().fp_incr(1),
            dateFormat: "d.m.Y",
            disableMobile: false,
            clickOpens: true,
            onOpen: function() {
                document.body.style.overflow = 'hidden';
            },
            onClose: function() {
                document.body.style.overflow = '';
            }
        });

        // Обработка touch для инпутов
        const inputs = bookingForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (isTouchDevice) {
                input.addEventListener('touchend', function(e) {
                    this.focus();
                    e.preventDefault();
                });
            }
        });

        // Отправка формы
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

    // ==================== Вспомогательные функции ====================
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
        const config = {
            BOT_TOKEN: '7583652121:AAHPKhDWuHq9NNcqN5FFO4zvnzo8AYFAFPk',
            CHAT_ID: '752504401',
            get API_URL() { return `https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`;}
        };

        const text = `📌 <b>Новая заявка!</b>\n\n` +
                   `🏠 <b>Домик:</b> ${getHouseName(data.house)}\n` +
                   `👤 <b>Имя:</b> ${data.name}\n` +
                   `📱 <b>Телефон:</b> <code>${data.phone}</code>\n` +
                   `📅 <b>Даты:</b> ${data.checkin} → ${data.checkout}\n\n` +
                   `⏰ ${data.date}`;

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
            throw new Error('Ошибка сервера');
        }
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
        
        if (isLoading) {
            btn.disabled = true;
            const btnText = btn.querySelector('.btn-text');
            const btnSpinner = btn.querySelector('.btn-spinner');
            if (btnText) btnText.style.display = 'none';
            if (btnSpinner) btnSpinner.style.display = 'inline-block';
        } else {
            btn.disabled = false;
            const btnText = btn.querySelector('.btn-text');
            const btnSpinner = btn.querySelector('.btn-spinner');
            if (btnText) btnText.style.display = 'inline-block';
            if (btnSpinner) btnSpinner.style.display = 'none';
        }
    }

    function showAlert(type, message) {
        const alertsContainer = document.getElementById('formAlerts');
        if (!alertsContainer) return;
        
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

    // ==================== Плавный скролл ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Закрываем меню
            if (menu && menu.classList.contains('active')) {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + 
                                     window.pageYOffset - 
                                     (headerHeight + 20);
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                history.pushState(null, null, targetId);
            }
        });
    });
});