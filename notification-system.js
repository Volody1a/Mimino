// Система уведомлений клиентов
class NotificationSystem {
    constructor() {
        this.smsApiKey = null; // Настройте SMS API
        this.emailApiKey = null; // Настройте Email API
    }
    
    // Отправка SMS уведомления
    async sendSMS(phone, message) {
        // Здесь должна быть интеграция с SMS API (например, SMS.ru, Twilio)
        console.log(`SMS для ${phone}: ${message}`);
        
        // Пример для SMS.ru (замените на ваш API)
        if (this.smsApiKey) {
            try {
                const response = await fetch('https://sms.ru/sms/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        api_id: this.smsApiKey,
                        to: phone,
                        msg: message
                    })
                });
                
                const result = await response.json();
                return result.status === 'OK';
            } catch (error) {
                console.error('Ошибка отправки SMS:', error);
                return false;
            }
        }
        
        return false;
    }
    
    // Отправка Email уведомления
    async sendEmail(email, subject, message) {
        // Здесь должна быть интеграция с Email API (например, SendGrid, Mailgun)
        console.log(`Email для ${email}: ${subject} - ${message}`);
        
        // Пример для SendGrid (замените на ваш API)
        if (this.emailApiKey) {
            try {
                const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.emailApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        personalizations: [{
                            to: [{ email: email }]
                        }],
                        from: { email: 'noreply@mimino-arkhyz.ru' },
                        subject: subject,
                        content: [{
                            type: 'text/plain',
                            value: message
                        }]
                    })
                });
                
                return response.ok;
            } catch (error) {
                console.error('Ошибка отправки Email:', error);
                return false;
            }
        }
        
        return false;
    }
    
    // Уведомление о подтверждении бронирования
    async notifyBookingConfirmed(booking) {
        const message = `🏠 Ваше бронирование в базе отдыха "Мимино" подтверждено!\n\n📅 Даты: ${this.formatDate(booking.checkin)} - ${this.formatDate(booking.checkout)}\n🏡 Домик: ${booking.houseName}\n\n📞 Контакты: +7 (928) 123-45-67\n\nЖдем вас в Архызе! 🌄`;
        
        // Отправляем SMS
        await this.sendSMS(booking.guestPhone, message);
        
        // Отправляем Email (если есть email)
        if (booking.guestEmail) {
            await this.sendEmail(
                booking.guestEmail,
                'Бронирование подтверждено - База отдыха Мимино',
                message
            );
        }
    }
    
    // Уведомление об отмене бронирования
    async notifyBookingCancelled(booking) {
        const message = `❌ Ваше бронирование в базе отдыха "Мимино" отменено.\n\n📅 Даты: ${this.formatDate(booking.checkin)} - ${this.formatDate(booking.checkout)}\n🏡 Домик: ${booking.houseName}\n\n📞 По вопросам обращайтесь: +7 (928) 123-45-67`;
        
        // Отправляем SMS
        await this.sendSMS(booking.guestPhone, message);
        
        // Отправляем Email (если есть email)
        if (booking.guestEmail) {
            await this.sendEmail(
                booking.guestEmail,
                'Бронирование отменено - База отдыха Мимино',
                message
            );
        }
    }
    
    // Уведомление о новом бронировании (для администратора)
    async notifyAdminNewBooking(booking) {
        const message = `📋 Новое бронирование!\n\n👤 Гость: ${booking.guestName}\n📱 Телефон: ${booking.guestPhone}\n🏡 Домик: ${booking.houseName}\n📅 Даты: ${this.formatDate(booking.checkin)} - ${this.formatDate(booking.checkout)}\n\nСтатус: ${booking.status}`;
        
        // Отправляем в Telegram (уже настроено)
        console.log('Уведомление администратору:', message);
    }
    
    // Форматирование даты
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }
}

// Создаем экземпляр системы уведомлений
window.NotificationSystem = new NotificationSystem();

// Функция для отправки уведомления при изменении статуса
async function sendBookingNotification(booking, newStatus) {
    try {
        if (newStatus === 'Подтверждено') {
            await window.NotificationSystem.notifyBookingConfirmed(booking);
        } else if (newStatus === 'Отменено') {
            await window.NotificationSystem.notifyBookingCancelled(booking);
        }
    } catch (error) {
        console.error('Ошибка отправки уведомления:', error);
    }
}

// Экспорт функций
window.sendBookingNotification = sendBookingNotification;
