// ========== МОБИЛЬНОЕ МЕНЮ С АНИМАЦИЕЙ ==========
document.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('.burger');
    const navMenu = document.querySelector('.nav ul');

    if (burger) {
        burger.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            burger.classList.toggle('active');
        });
    }

    // Закрытие меню при клике на ссылку
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show');
            if (burger) burger.classList.remove('active');
        });
    });

    // ========== ФОРМА ПРОБНОГО ЗАНЯТИЯ ==========
    const trialForm = document.getElementById('trialForm');
    if (trialForm) {
        trialForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = document.getElementById('formMessage');
            
            const nameInput = trialForm.querySelector('input[placeholder*="Имя"]');
            const phoneInput = trialForm.querySelector('input[placeholder*="Телефон"]');
            
            const data = {
                name: nameInput ? nameInput.value : '',
                phone: phoneInput ? phoneInput.value : '',
                email: '',
                message: 'Заявка на пробное занятие'
            };
            
            if (!data.name || !data.phone) {
                if (msg) {
                    msg.innerHTML = '<div class="error-message">❌ Пожалуйста, заполните все поля.</div>';
                    setTimeout(() => { msg.innerHTML = ''; }, 5000);
                }
                return;
            }
            
            try {
                const response = await fetch('send.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(data)
                });
                
                const result = await response.json();
                
                if (msg) {
                    if (result.success) {
                        msg.innerHTML = '<div class="success-message">✅ Спасибо! Мы свяжемся с вами.</div>';
                        trialForm.reset();
                    } else {
                        msg.innerHTML = '<div class="error-message">❌ Ошибка отправки. Позвоните нам.</div>';
                    }
                }
            } catch (error) {
                if (msg) {
                    msg.innerHTML = '<div class="error-message">❌ Ошибка соединения.</div>';
                }
            }
            
            setTimeout(() => { if (msg) msg.innerHTML = ''; }, 5000);
        });
    }

    // ========== ФОРМА В КОНТАКТАХ ==========
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = document.getElementById('contactFormMessage');
            
            const nameInput = contactForm.querySelector('input[placeholder*="Имя"]');
            const emailInput = contactForm.querySelector('input[type="email"]');
            const phoneInput = contactForm.querySelector('input[placeholder*="Телефон"]');
            const messageInput = contactForm.querySelector('textarea');
            
            const data = {
                name: nameInput ? nameInput.value : '',
                email: emailInput ? emailInput.value : '',
                phone: phoneInput ? phoneInput.value : '',
                message: messageInput ? messageInput.value : ''
            };
            
            if (!data.name || !data.email || !data.message) {
                if (msg) {
                    msg.innerHTML = '<div class="error-message">❌ Заполните имя, email и сообщение.</div>';
                    setTimeout(() => { msg.innerHTML = ''; }, 5000);
                }
                return;
            }
            
            try {
                const response = await fetch('send.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(data)
                });
                
                const result = await response.json();
                
                if (msg) {
                    if (result.success) {
                        msg.innerHTML = '<div class="success-message">✉️ Сообщение отправлено!</div>';
                        contactForm.reset();
                    } else {
                        msg.innerHTML = '<div class="error-message">❌ Ошибка отправки.</div>';
                    }
                }
            } catch (error) {
                if (msg) {
                    msg.innerHTML = '<div class="error-message">❌ Ошибка соединения.</div>';
                }
            }
            
            setTimeout(() => { if (msg) msg.innerHTML = ''; }, 5000);
        });
    }

    // ========== ЗАГРУЗКА РАСПИСАНИЯ ==========
    loadSchedule();
    
    // ========== ЗАГРУЗКА ГАЛЕРЕИ ==========
    loadGallery();
});

// ========== ФУНКЦИЯ ЗАГРУЗКИ РАСПИСАНИЯ ==========
// ========== ФУНКЦИЯ ЗАГРУЗКИ РАСПИСАНИЯ С ФИЛЬТРОМ ==========
let currentScheduleData = [];

async function loadSchedule() {
    const scheduleContainer = document.getElementById('scheduleTable');
    if (!scheduleContainer) return;

    try {
        const response = await fetch('data/schedule.json');
        
        if (!response.ok) {
            throw new Error('Не удалось загрузить расписание');
        }
        
        currentScheduleData = await response.json();
        
        if (!currentScheduleData || currentScheduleData.length === 0) {
            scheduleContainer.innerHTML = '<p>📅 Расписание временно отсутствует.</p>';
            return;
        }
        
        // Отображаем все занятия
        renderSchedule(currentScheduleData);
        
        // Настраиваем фильтры
        setupFilters();
        
    } catch (error) {
        console.error('Ошибка:', error);
        scheduleContainer.innerHTML = '<div class="error-message">⚠️ Не удалось загрузить расписание.</div>';
    }
}

// Функция отображения расписания
function renderSchedule(data) {
    const scheduleContainer = document.getElementById('scheduleTable');
    
    if (!data || data.length === 0) {
        scheduleContainer.innerHTML = '<p>📅 Нет занятий по выбранному фильтру.</p>';
        return;
    }
    
    let html = '<table class="schedule-table">';
    html += '<thead><tr><th>День</th><th>Время</th><th>Преподаватель</th><th>Направление</th></tr></thead><tbody>';
    
    data.forEach(item => {
        html += `<tr class="schedule-row" data-style="${escapeHtml(item.style)}">
                    <td>${escapeHtml(item.day)}</td>
                    <td>${escapeHtml(item.time)}</td>
                    <td>${escapeHtml(item.teacher)}</td>
                    <td>${escapeHtml(item.style)}</td>
                  </tr>`;
    });
    
    html += '</tbody></table>';
    scheduleContainer.innerHTML = html;
}

// Функция настройки фильтров
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем active у всех кнопок
            filterBtns.forEach(b => b.classList.remove('active'));
            // Добавляем active текущей
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            if (filterValue === 'all') {
                // Показываем все строки
                renderSchedule(currentScheduleData);
            } else {
                // Фильтруем данные
                const filteredData = currentScheduleData.filter(item => item.style === filterValue);
                renderSchedule(filteredData);
            }
        });
    });
}

// ========== ФУНКЦИЯ ЗАГРУЗКИ ГАЛЕРЕИ ==========
async function loadGallery() {
    const galleryContainer = document.getElementById('galleryGrid');
    if (!galleryContainer) return;

    try {
        const response = await fetch('data/gallery.json');
        
        if (!response.ok) {
            throw new Error('Не удалось загрузить галерею');
        }
        
        const images = await response.json();
        
        if (!images || images.length === 0) {
            galleryContainer.innerHTML = '<p>📸 Фотографии скоро появятся!</p>';
            return;
        }
        
        let html = '<div class="gallery-grid">';
        images.forEach(img => {
            const imgPath = typeof img === 'string' ? img : img.filename;
            const imgTitle = typeof img === 'string' ? 'Фото студии' : (img.title || 'Фото');
            
            html += `<div class="gallery-item">
                        <img src="uploads/${escapeHtml(imgPath)}" 
                            alt="${escapeHtml(imgTitle)}"
                            loading="lazy"
                            onclick="openImageModal('uploads/${escapeHtml(imgPath)}', '${escapeHtml(imgTitle)}')">
                    </div>`;
        });
        html += '</div>';
        galleryContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Ошибка:', error);
        galleryContainer.innerHTML = '<div class="error-message">⚠️ Не удалось загрузить галерею.</div>';
    }
}

// ========== ЗАЩИТА ОТ XSS ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
}

// ========== МОДАЛЬНОЕ ОКНО ДЛЯ ФОТО ==========
function openImageModal(imageSrc, imageTitle) {
    let modal = document.getElementById('imageModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.style.cssText = `
            display: none; position: fixed; top: 0; left: 0;
            width: 100%; height: 100%; background: rgba(0,0,0,0.9);
            z-index: 9999; justify-content: center; align-items: center;
            cursor: pointer;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `max-width: 90%; max-height: 90%; position: relative;`;
        
        const modalImg = document.createElement('img');
        modalImg.style.cssText = `max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: 8px;`;
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute; top: -40px; right: 0;
            color: white; font-size: 30px; cursor: pointer;
            font-weight: bold;
        `;
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(modalImg);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
        
        modal.imgElement = modalImg;
    }
    
    modal.imgElement.src = imageSrc;
    modal.imgElement.alt = imageTitle;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    modal.imgElement.onerror = () => {
        modal.imgElement.src = 'https://placehold.co/800x600/2a2533/ff6b6b?text=Фото+не+найдено';
    };
}

// ========== ПЛАВНАЯ ПРОКРУТКА ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ========== АНИМАЦИЯ ПРИ СКРОЛЛЕ ==========
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .teacher-card, .direction-card, .pricing-card, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

const style = document.createElement('style');
style.textContent = `
    .feature-card.visible, .teacher-card.visible, .direction-card.visible,
    .pricing-card.visible, .gallery-item.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);