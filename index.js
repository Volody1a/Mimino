document.addEventListener('DOMContentLoaded', function() {
    // ========== Глобальные настройки ==========
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const html = document.documentElement;
    
    // Улучшенные фиксы для мобильных устройств
    if (isTouchDevice) {
        html.style.touchAction = 'manipulation';
        html.style.webkitTextSizeAdjust = '100%';
        html.style.webkitTapHighlightColor = 'transparent';
        
        // Предотвращение масштабирования при двойном тапе
        document.addEventListener('dblclick', function(e) {
            e.preventDefault();
        }, { passive: false });
        
        // Предотвращение контекстного меню на долгий тап
        document.addEventListener('contextmenu', function(e) {
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
        let touchMoved = false;

        // Улучшенная обработка тач-событий
        item.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchMoved = false;
        }, { passive: true });

        item.addEventListener('touchmove', (e) => {
            if (!touchMoved) {
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const deltaX = Math.abs(currentX - touchStartX);
                const deltaY = Math.abs(currentY - touchStartY);
                
                // Если движение больше 10px, считаем это свайпом
                if (deltaX > 10 || deltaY > 10) {
                    touchMoved = true;
                }
            }
        }, { passive: true });

        item.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const timeDiff = Date.now() - touchStartTime;
            
            // Проверяем, был ли это тап (а не свайп)
            const isTap = (
                !touchMoved &&
                Math.abs(touchEndX - touchStartX) < 15 && 
                Math.abs(touchEndY - touchStartY) < 15 &&
                timeDiff < 500
            );

            if (isTap) {
                e.preventDefault();
                const modalId = item.getAttribute('data-modal');
                openModal(modalId);
            }
        }, { passive: false });

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
        let animationID = null;
        
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
            if (currentIndex < slides.length - 1) currentIndex++;
            else currentIndex = 0;
            updateSliderPosition();
        };
        
        const goPrev = () => {
            if (currentIndex > 0) currentIndex--;
            else currentIndex = slides.length - 1;
            updateSliderPosition();
        };
        
        const updateSliderPosition = () => {
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        };
        
        // Инициализация
        setSlideWidth();
        window.addEventListener('resize', setSlideWidth);
        
        // Кнопки навигации
        if (nextBtn) nextBtn.addEventListener('click', goNext);
        if (prevBtn) prevBtn.addEventListener('click', goPrev);
        
        // Улучшенные Touch-события для мобильных
        if (isTouchDevice) {
            slider.addEventListener('touchstart', touchStart, { passive: false });
            slider.addEventListener('touchmove', touchMove, { passive: false });
            slider.addEventListener('touchend', touchEnd, { passive: false });
        }
        
        function touchStart(e) {
            e.preventDefault();
            startPosX = e.touches[0].clientX;
            isDragging = true;
            track.style.transition = 'none';
            
            // Отменяем анимацию
            cancelAnimationFrame(animationID);
        }
        
        function touchMove(e) {
            if (!isDragging) return;
            e.preventDefault();
            const currentX = e.touches[0].clientX;
            const deltaX = currentX - startPosX;
            
            // Плавное перемещение с ограничениями
            const maxTranslate = (slides.length - 1) * slideWidth;
            const minTranslate = 0;
            currentTranslate = Math.max(Math.min(prevTranslate + deltaX, maxTranslate), minTranslate);
            
            track.style.transform = `translateX(${-currentTranslate}px)`;
        }
        
        function touchEnd(e) {
            if (!isDragging) return;
            e.preventDefault();
            isDragging = false;
            track.style.transition = 'transform 0.3s ease-out';
            
            const deltaX = currentTranslate - prevTranslate;
            const threshold = slideWidth * 0.3; // 30% от ширины слайда
            
            // Определяем направление свайпа с улучшенной логикой
            if (deltaX < -threshold && currentIndex < slides.length - 1) {
                currentIndex++;
            } else if (deltaX > threshold && currentIndex > 0) {
                currentIndex--;
            }
            
            updateSliderPosition();
            prevTranslate = currentIndex * slideWidth;
        }
    }

    // ========== Календарь с интеграцией Google Sheets ==========
    const initDatePickers = () => {
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        const houseSelect = document.getElementById('house');
        
        if (!checkinInput || !checkoutInput || !houseSelect) return;
        
        // Улучшенные настройки для мобильных устройств
        const baseOptions = {
            locale: 'ru',
            dateFormat: 'd.m.Y',
            clickOpens: true,
            allowInput: false,
            onOpen: () => { 
                document.body.style.overflow = 'hidden';
                // Фикс для iOS Safari
                if (isTouchDevice) {
                    setTimeout(() => {
                        window.scrollTo(0, 0);
                    }, 100);
                }
            },
            onClose: () => { 
                document.body.style.overflow = '';
            }
        };
        
        // Разные настройки для мобильных и десктопов
        const mobileOptions = {
            ...baseOptions,
            disableMobile: false, // Включаем мобильную версию
            mobileNative: true,   // Используем нативный пикер
            static: true          // Статичное позиционирование
        };
        
        const desktopOptions = {
            ...baseOptions,
            disableMobile: true,
            static: false,
            position: 'auto'
        };
        
        const options = isTouchDevice ? mobileOptions : desktopOptions;
        
        // Функция для загрузки занятых дат
        const loadBookedDates = async (houseId) => {
            if (!window.GoogleSheetsAPI) {
                console.warn('Google Sheets API не загружен');
                return [];
            }
            
            try {
                const bookedDates = await window.GoogleSheetsAPI.getBookedDates(houseId);
                return bookedDates;
            } catch (error) {
                console.error('Ошибка загрузки занятых дат:', error);
                return [];
            }
        };
        
        // Функция для обновления календаря при смене домика
        const updateCalendarForHouse = async (houseId) => {
            if (!houseId) return;
            
            const bookedDates = await loadBookedDates(houseId);
            
            // Обновляем календарь заезда
            checkinPicker.set('disable', bookedDates);
            
            // Обновляем календарь выезда
            const selectedCheckin = checkinPicker.selectedDates[0];
            if (selectedCheckin) {
                const nextDay = new Date(selectedCheckin.getTime() + 86400000);
                checkoutPicker.set('minDate', nextDay);
                checkoutPicker.set('disable', bookedDates);
            }
        };
        
        const checkinPicker = flatpickr(checkinInput, {
            ...options,
            minDate: 'today',
            onChange: async function(selectedDates) {
                if (selectedDates.length > 0) {
                    const nextDay = new Date(selectedDates[0].getTime() + 86400000);
                    checkoutPicker.set('minDate', nextDay);
                    
                    // Обновляем календарь выезда с учетом занятых дат
                    const houseId = houseSelect.value;
                    if (houseId) {
                        await updateCalendarForHouse(houseId);
                    }
                }
            }
        });
        
        const checkoutPicker = flatpickr(checkoutInput, {
            ...options,
            minDate: new Date().fp_incr(1)
        });
        
        // Обработчик смены домика
        houseSelect.addEventListener('change', async function() {
            const houseId = this.value;
            if (houseId) {
                await updateCalendarForHouse(houseId);
            }
        });
        
        // Дополнительная обработка для мобильных устройств
        if (isTouchDevice) {
            [checkinInput, checkoutInput].forEach(input => {
                input.addEventListener('focus', function() {
                    // Предотвращаем скролл страницы при фокусе
                    setTimeout(() => {
                        this.blur();
                        this.click();
                    }, 50);
                });
            });
        }
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
                date: new Date().toLocaleString('ru-RU'),
                status: 'Ожидает' // Новое бронирование всегда в статусе "Ожидает"
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
            
            // Проверка доступности дат через Google Sheets
            if (window.GoogleSheetsAPI) {
                try {
                    const isAvailable = await window.GoogleSheetsAPI.checkAvailability(
                        formData.house, 
                        formData.checkin, 
                        formData.checkout
                    );
                    
                    if (!isAvailable) {
                        showAlert('error', '❌ Выбранные даты уже заняты. Пожалуйста, выберите другие даты.');
                        return;
                    }
                } catch (error) {
                    console.error('Ошибка проверки доступности:', error);
                    showAlert('error', '❌ Ошибка проверки доступности. Попробуйте позже.');
                    return;
                }
            }
            
            // Отправка формы
            setLoadingState(true);
            
            try {
                // Отправляем в Telegram
                await sendFormData(formData);
                
                // Сохраняем в Google Sheets (если API доступен)
                if (window.GoogleSheetsAPI) {
                    try {
                        await saveBookingToGoogleSheets(formData);
                    } catch (sheetsError) {
                        console.warn('Ошибка сохранения в Google Sheets:', sheetsError);
                    }
                }
                
                showAlert('success', '✅ Заявка отправлена! Мы свяжемся с вами в ближайшее время для подтверждения бронирования.');
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

    // ========== Загрузка домиков из Google Sheets ==========
    const loadHousesFromGoogleSheets = async () => {
        const houseSelect = document.getElementById('house');
        if (!houseSelect || !window.GoogleSheetsAPI) return;
        
        try {
            const houses = await window.GoogleSheetsAPI.getHouses();
            
            // Очищаем существующие опции (кроме первой)
            houseSelect.innerHTML = '<option value="">Выберите вариант</option>';
            
            // Добавляем домики из Google Sheets
            houses.forEach(house => {
                if (house.status === 'Активен') {
                    const option = document.createElement('option');
                    option.value = house.id;
                    option.textContent = `${house.name} (${house.type}, до ${house.maxGuests} чел)`;
                    houseSelect.appendChild(option);
                }
            });
            
            console.log('Домики загружены из Google Sheets:', houses);
        } catch (error) {
            console.error('Ошибка загрузки домиков:', error);
            
            // Fallback - статичные опции если Google Sheets недоступен
            houseSelect.innerHTML = `
                <option value="">Выберите вариант</option>
                <option value="1">Домик 1 (Стандарт, до 2 чел)</option>
                <option value="2">Домик 2 (Стандарт, до 2 чел)</option>
                <option value="3">Домик 3 (Стандарт, до 2 чел)</option>
                <option value="4">Домик 4 (Комфорт, до 4 чел)</option>
                <option value="5">Домик 5 (Комфорт, до 4 чел)</option>
                <option value="6">VIP Домик (VIP, до 6 чел)</option>
            `;
        }
    };

    // ========== Инициализация ==========
    initDatePickers();
    
    // Загружаем домики из Google Sheets
    loadHousesFromGoogleSheets();
    
    // Инициализация всех слайдеров
    document.querySelectorAll('.modal .slider').forEach(slider => {
        initSlider(slider);
    });
});