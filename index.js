document.addEventListener('DOMContentLoaded', function() {
    // ========== Глобальные настройки ==========
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const html = document.documentElement;
    
    // Улучшенные фиксы для мобильных устройств
    if (isTouchDevice) {
        html.style.touchAction = 'manipulation';
        html.style.webkitTextSizeAdjust = '100%';
        html.style.webkitTapHighlightColor = 'transparent';
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
    const houseDetailButtons = document.querySelectorAll('.house-details');
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
        // Простая обработка кликов
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    // Обработчики для карточек домиков — показываем модалку 3 с динамическими данными
    houseDetailButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const title = btn.getAttribute('data-title') || 'Домик';
            const desc = btn.getAttribute('data-desc') || '';
            const images = (btn.getAttribute('data-images') || '').split(',').filter(Boolean);

            const modal = document.getElementById('modal3');
            if (!modal) return;

            // Заголовок и описание
            const body = modal.querySelector('.modal-body');
            if (body) body.textContent = desc;

            // Картинки
            const track = modal.querySelector('.slider-track');
            if (track && images.length) {
                track.innerHTML = images.map(src => `<img src="${src}" class="slide" alt="${title}">`).join('');
            }

            openModal('modal3');
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
        let dragDelta = 0;
        
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
        
        // Touch-события для мобильных
        if (isTouchDevice) {
            slider.addEventListener('touchstart', touchStart, { passive: false });
            slider.addEventListener('touchmove', touchMove, { passive: false });
            slider.addEventListener('touchend', touchEnd, { passive: false });
        }
        
        function touchStart(e) {
            e.preventDefault();
            startPosX = e.touches[0].clientX;
            dragDelta = 0;
            isDragging = true;
            track.style.transition = 'none';
        }
        
        function touchMove(e) {
            if (!isDragging) return;
            e.preventDefault();
            const currentX = e.touches[0].clientX;
            dragDelta = startPosX - currentX; // свайп влево => положительное значение
            const translate = currentIndex * slideWidth + dragDelta;
            // ограничиваем перемещение внутри трека
            const maxTranslate = (slides.length - 1) * slideWidth;
            const clamped = Math.max(0, Math.min(translate, maxTranslate));
            track.style.transform = `translateX(-${clamped}px)`;
        }
        
        function touchEnd(e) {
            if (!isDragging) return;
            e.preventDefault();
            isDragging = false;
            track.style.transition = 'transform 0.3s ease-out';
            const threshold = slideWidth * 0.15; // 15% от ширины слайда
            if (Math.abs(dragDelta) > threshold) {
                if (dragDelta > 0 && currentIndex < slides.length - 1) {
                    currentIndex++;
                } else if (dragDelta < 0 && currentIndex > 0) {
                    currentIndex--;
                }
            }
            dragDelta = 0;
            updateSliderPosition();
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
        
        // Упрощенные настройки
        const options = {
            ...baseOptions,
            disableMobile: false,
            static: true
        };
        
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
        
        // Обработка для мобильных устройств
        if (isTouchDevice) {
            [checkinInput, checkoutInput].forEach(input => {
                input.addEventListener('focus', function() {
                    // Плавный скролл к полю
                    setTimeout(() => {
                        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
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
                        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
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
            
            // Проверка дат
            if (formData.checkin && formData.checkout) {
                const checkinDate = new Date(formData.checkin);
                const checkoutDate = new Date(formData.checkout);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (checkinDate < today) {
                    errors.push('Дата заезда не может быть в прошлом');
                }
                if (checkoutDate <= checkinDate) {
                    errors.push('Дата выезда должна быть позже даты заезда');
                }
            }
            
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
                        await window.GoogleSheetsAPI.saveBookingToGoogleSheets(formData);
                    } catch (sheetsError) {
                        console.warn('Ошибка сохранения в Google Sheets:', sheetsError);
                        // Не показываем ошибку пользователю, так как основная отправка в Telegram прошла успешно
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
        if (!houseSelect) return;
        
        // Fallback - статичные опции по умолчанию
        const fallbackOptions = `
            <option value="">Выберите вариант</option>
            <option value="1">Домик 1 (Стандарт, до 2 чел)</option>
            <option value="2">Домик 2 (Стандарт, до 2 чел)</option>
            <option value="3">Домик 3 (Стандарт, до 2 чел)</option>
            <option value="4">Домик 4 (Комфорт, до 4 чел)</option>
            <option value="5">Домик 5 (Комфорт, до 4 чел)</option>
            <option value="6">VIP Домик (VIP, до 6 чел)</option>
        `;
        
        if (!window.GoogleSheetsAPI) {
            houseSelect.innerHTML = fallbackOptions;
            return;
        }
        
        try {
            const houses = await window.GoogleSheetsAPI.getHouses();
            
            // Очищаем существующие опции (кроме первой)
            houseSelect.innerHTML = '<option value="">Выберите вариант</option>';
            
            let added = 0;
            // Добавляем домики из Google Sheets
            houses.forEach(house => {
                if (house.status === 'Активен') {
                    const option = document.createElement('option');
                    option.value = house.id;
                    option.textContent = `${house.name} (${house.type}, до ${house.maxGuests} чел)`;
                    houseSelect.appendChild(option);
                    added++;
                }
            });
            
            // Если из таблицы ничего не пришло — показываем запасной список
            if (!added) {
                houseSelect.innerHTML = fallbackOptions;
            }
            
            console.log('Домики загружены из Google Sheets:', houses);
        } catch (error) {
            console.error('Ошибка загрузки домиков:', error);
            houseSelect.innerHTML = fallbackOptions;
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