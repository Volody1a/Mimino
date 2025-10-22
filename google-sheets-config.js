// Конфигурация Google Sheets API
const GOOGLE_SHEETS_CONFIG = {
    // Замените на ID вашей Google Таблицы
    SPREADSHEET_ID: '1C16hHNfZFzG1-CBOutJleOLW2h7mqrE-nVXNTgO7FHE',
    
    // Названия листов в таблице
    SHEETS: {
        HOUSES: 'Домики',
        BOOKINGS: 'Бронирования'
    },
    
    // API ключ (получите в Google Cloud Console)
    API_KEY: 'AIzaSyDDYyFQo15zvyQLORvtPUNN39uwwp4iOaU',
    
    // Базовый URL для API
    BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets'
};

// Функция для получения данных из Google Sheets
async function fetchFromGoogleSheets(range) {
    const url = `${GOOGLE_SHEETS_CONFIG.BASE_URL}/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${range}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error('Ошибка при загрузке данных из Google Sheets:', error);
        return [];
    }
}

// Функция для получения списка домиков
async function getHouses() {
    const range = `${GOOGLE_SHEETS_CONFIG.SHEETS.HOUSES}!A2:E`; // Пропускаем заголовок
    const data = await fetchFromGoogleSheets(range);
    
    return data.map(row => ({
        id: row[0],
        name: row[1],
        type: row[2],
        maxGuests: parseInt(row[3]),
        status: row[4]
    }));
}

// Функция для получения бронирований
async function getBookings() {
    const range = `${GOOGLE_SHEETS_CONFIG.SHEETS.BOOKINGS}!A2:G`; // Пропускаем заголовок
    const data = await fetchFromGoogleSheets(range);
    
    return data.map(row => ({
        id: row[0],
        houseId: row[1],
        checkin: row[2],
        checkout: row[3],
        guestName: row[4],
        guestPhone: row[5],
        status: row[6]
    }));
}

// Функция для проверки доступности дат
async function checkAvailability(houseId, checkin, checkout) {
    const bookings = await getBookings();
    const houseBookings = bookings.filter(booking => 
        booking.houseId === houseId && 
        booking.status === 'Подтверждено'
    );
    
    const requestedStart = new Date(checkin);
    const requestedEnd = new Date(checkout);
    
    // Проверяем пересечения дат
    for (let booking of houseBookings) {
        const bookingStart = new Date(booking.checkin);
        const bookingEnd = new Date(booking.checkout);
        
        // Если есть пересечение дат
        if ((requestedStart < bookingEnd && requestedEnd > bookingStart)) {
            return false; // Домик занят
        }
    }
    
    return true; // Домик свободен
}

// Функция для получения занятых дат для календаря
async function getBookedDates(houseId) {
    const bookings = await getBookings();
    const houseBookings = bookings.filter(booking => 
        booking.houseId === houseId && 
        booking.status === 'Подтверждено'
    );
    
    const bookedDates = [];
    
    houseBookings.forEach(booking => {
        const start = new Date(booking.checkin);
        const end = new Date(booking.checkout);
        
        // Добавляем все даты в диапазоне
        for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
            bookedDates.push(date.toISOString().split('T')[0]);
        }
    });
    
    return bookedDates;
}

// Функция для сохранения нового бронирования
async function saveBookingToGoogleSheets(bookingData) {
    // Получаем следующий ID для бронирования
    const bookings = await getBookings();
    const nextId = bookings.length > 0 ? Math.max(...bookings.map(b => parseInt(b.id))) + 1 : 1;
    
    // Формируем данные для записи
    const rowData = [
        nextId.toString(),
        bookingData.house,
        bookingData.checkin,
        bookingData.checkout,
        bookingData.name,
        bookingData.phone,
        bookingData.status || 'Ожидает'
    ];
    
    // URL для записи в Google Sheets
    const url = `${GOOGLE_SHEETS_CONFIG.BASE_URL}/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.BOOKINGS}!A:G:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: [rowData]
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Бронирование сохранено в Google Sheets:', rowData);
        return true;
    } catch (error) {
        console.error('Ошибка сохранения бронирования:', error);
        throw error;
    }
}

// Функция для обновления статуса бронирования
async function updateBookingStatus(bookingId, newStatus) {
    // Находим строку с нужным ID
    const bookings = await getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
        throw new Error('Бронирование не найдено');
    }
    
    // Обновляем статус в Google Sheets
    const range = `${GOOGLE_SHEETS_CONFIG.SHEETS.BOOKINGS}!G${parseInt(bookingId) + 1}`; // +1 потому что первая строка - заголовок
    const url = `${GOOGLE_SHEETS_CONFIG.BASE_URL}/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${range}?valueInputOption=RAW&key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;
    
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: [[newStatus]]
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log(`Статус бронирования ${bookingId} обновлен на "${newStatus}"`);
        return true;
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        throw error;
    }
}

// Экспорт функций
window.GoogleSheetsAPI = {
    getHouses,
    getBookings,
    checkAvailability,
    getBookedDates,
    saveBookingToGoogleSheets,
    updateBookingStatus,
    config: GOOGLE_SHEETS_CONFIG
};
