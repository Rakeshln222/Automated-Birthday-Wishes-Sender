document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const greetingCard = document.getElementById('greeting-card');
    const recipientNameInput = document.getElementById('recipient-name');
    const recipientEmailInput = document.getElementById('recipient-email');
    const birthdayDateInput = document.getElementById('birthday-date');
    const messageInput = document.getElementById('message');
    const senderNameInput = document.getElementById('sender-name');
    const senderEmailInput = document.getElementById('sender-email');
    const sendTimeSelect = document.getElementById('send-time');
    const customTimeInput = document.getElementById('custom-time');
    const previewBtn = document.getElementById('preview-btn');
    const scheduleBtn = document.getElementById('schedule-btn');
    const wishList = document.getElementById('wish-list');
    const previewModal = document.getElementById('preview-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const confirmScheduleBtn = document.getElementById('confirm-schedule');
    const previewCard = document.getElementById('preview-card');
    const notification = document.getElementById('notification');
    const confettiContainer = document.getElementById('confetti-container');

    // Sample data for scheduled wishes (in a real app, this would come from a database)
    let scheduledWishes = JSON.parse(localStorage.getItem('scheduledWishes')) || [];

    // Initialize the app
    init();

    // Event Listeners
    greetingCard.addEventListener('click', toggleCard);
    sendTimeSelect.addEventListener('change', toggleCustomTime);
    previewBtn.addEventListener('click', showPreview);
    scheduleBtn.addEventListener('click', scheduleWish);
    closeModalBtn.addEventListener('click', closeModal);
    confirmScheduleBtn.addEventListener('click', confirmSchedule);
    window.addEventListener('click', outsideModalClick);

    // Functions
    function init() {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        birthdayDateInput.min = today;
        
        // Load scheduled wishes
        renderScheduledWishes();
        
        // Set default sender email if available
        if (localStorage.getItem('senderEmail')) {
            senderEmailInput.value = localStorage.getItem('senderEmail');
        }
        
        // Set default sender name if available
        if (localStorage.getItem('senderName')) {
            senderNameInput.value = localStorage.getItem('senderName');
        }
    }

    function toggleCard() {
        greetingCard.classList.toggle('flipped');
    }

    function toggleCustomTime() {
        if (sendTimeSelect.value === 'custom') {
            customTimeInput.style.display = 'block';
        } else {
            customTimeInput.style.display = 'none';
        }
    }

    function showPreview() {
        if (!validateForm()) return;
        
        // Create preview card
        const recipientName = recipientNameInput.value;
        const message = messageInput.value || "Wishing you a wonderful birthday filled with joy and happiness!";
        const senderName = senderNameInput.value || "A friend";
        
        previewCard.innerHTML = `
            <div class="card-front">
                <div class="card-content">
                    <h2>Happy Birthday!</h2>
                    <div class="decoration balloon1"></div>
                    <div class="decoration balloon2"></div>
                    <div class="decoration balloon3"></div>
                    <div class="cake">
                        <div class="plate"></div>
                        <div class="layer bottom"></div>
                        <div class="layer middle"></div>
                        <div class="layer top"></div>
                        <div class="icing"></div>
                        <div class="candle">
                            <div class="flame"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-inside">
                <p>Dear <span class="recipient-name">${recipientName}</span>,</p>
                <p class="message-preview">${message}</p>
                <p>Best regards,</p>
                <p class="sender-name">${senderName}</p>
            </div>
        `;
        
        // Show modal
        previewModal.style.display = 'block';
    }

    function closeModal() {
        previewModal.style.display = 'none';
    }

    function outsideModalClick(e) {
        if (e.target === previewModal) {
            closeModal();
        }
    }

    function validateForm() {
        if (!recipientNameInput.value) {
            showNotification('Please enter recipient name', 'error');
            recipientNameInput.focus();
            return false;
        }
        
        if (!recipientEmailInput.value) {
            showNotification('Please enter recipient email', 'error');
            recipientEmailInput.focus();
            return false;
        }
        
        if (!isValidEmail(recipientEmailInput.value)) {
            showNotification('Please enter a valid recipient email', 'error');
            recipientEmailInput.focus();
            return false;
        }
        
        if (!birthdayDateInput.value) {
            showNotification('Please select birthday date', 'error');
            birthdayDateInput.focus();
            return false;
        }
        
        if (!senderEmailInput.value) {
            showNotification('Please enter your email', 'error');
            senderEmailInput.focus();
            return false;
        }
        
        if (!isValidEmail(senderEmailInput.value)) {
            showNotification('Please enter a valid email for yourself', 'error');
            senderEmailInput.focus();
            return false;
        }
        
        if (sendTimeSelect.value === 'custom' && !customTimeInput.value) {
            showNotification('Please select a custom time', 'error');
            customTimeInput.focus();
            return false;
        }
        
        return true;
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function scheduleWish() {
        if (!validateForm()) return;
        showPreview();
    }

    function confirmSchedule() {
        const recipientName = recipientNameInput.value;
        const recipientEmail = recipientEmailInput.value;
        const birthdayDate = birthdayDateInput.value;
        const message = messageInput.value || "Wishing you a wonderful birthday filled with joy and happiness!";
        const senderName = senderNameInput.value || "A friend";
        const senderEmail = senderEmailInput.value;
        
        // Calculate send time
        let sendTime;
        switch(sendTimeSelect.value) {
            case 'morning':
                sendTime = '09:00';
                break;
            case 'afternoon':
                sendTime = '12:00';
                break;
            case 'evening':
                sendTime = '18:00';
                break;
            case 'custom':
                sendTime = customTimeInput.value;
                break;
        }
        
        // Create wish object
        const wish = {
            id: Date.now(),
            recipientName,
            recipientEmail,
            birthdayDate,
            message,
            senderName,
            senderEmail,
            sendTime,
            scheduledAt: new Date().toISOString(),
            status: 'scheduled'
        };
        
        // Add to scheduled wishes
        scheduledWishes.push(wish);
        localStorage.setItem('scheduledWishes', JSON.stringify(scheduledWishes));
        
        // Save sender info for convenience
        localStorage.setItem('senderEmail', senderEmail);
        if (senderNameInput.value) {
            localStorage.setItem('senderName', senderNameInput.value);
        }
        
        // Update UI
        renderScheduledWishes();
        closeModal();
        showNotification('Birthday wish scheduled successfully!');
        createConfetti();
        
        // In a real app, you would send this to your backend for actual scheduling
        console.log('Wish scheduled:', wish);
        
        // Clear form
        recipientNameInput.value = '';
        recipientEmailInput.value = '';
        messageInput.value = '';
    }

    function renderScheduledWishes() {
        if (scheduledWishes.length === 0) {
            wishList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>No scheduled wishes yet</p>
                </div>
            `;
            return;
        }
        
        wishList.innerHTML = '';
        
        scheduledWishes.forEach(wish => {
            const wishElement = document.createElement('div');
            wishElement.className = 'wish-item';
            wishElement.innerHTML = `
                <div class="wish-info">
                    <h3>${wish.recipientName}</h3>
                    <p>Birthday: ${formatDate(wish.birthdayDate)} | Email: ${wish.recipientEmail}</p>
                    <p>Scheduled for: ${wish.birthdayDate} at ${wish.sendTime}</p>
                </div>
                <div class="wish-actions">
                    <button class="edit-btn" data-id="${wish.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-id="${wish.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            wishList.appendChild(wishElement);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteWish);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editWish);
        });
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function deleteWish(e) {
        const id = parseInt(e.target.closest('button').dataset.id);
        scheduledWishes = scheduledWishes.filter(wish => wish.id !== id);
        localStorage.setItem('scheduledWishes', JSON.stringify(scheduledWishes));
        renderScheduledWishes();
        showNotification('Wish deleted successfully');
    }

    function editWish(e) {
        const id = parseInt(e.target.closest('button').dataset.id);
        const wish = scheduledWishes.find(w => w.id === id);
        
        if (wish) {
            // Fill form with wish data
            recipientNameInput.value = wish.recipientName;
            recipientEmailInput.value = wish.recipientEmail;
            birthdayDateInput.value = wish.birthdayDate;
            messageInput.value = wish.message;
            senderNameInput.value = wish.senderName;
            senderEmailInput.value = wish.senderEmail;
            
            // Set send time
            if (wish.sendTime === '09:00') {
                sendTimeSelect.value = 'morning';
            } else if (wish.sendTime === '12:00') {
                sendTimeSelect.value = 'afternoon';
            } else if (wish.sendTime === '18:00') {
                sendTimeSelect.value = 'evening';
            } else {
                sendTimeSelect.value = 'custom';
                customTimeInput.value = wish.sendTime;
                customTimeInput.style.display = 'block';
            }
            
            // Delete the old wish
            scheduledWishes = scheduledWishes.filter(w => w.id !== id);
            localStorage.setItem('scheduledWishes', JSON.stringify(scheduledWishes));
            
            showNotification('Edit your wish and click Schedule when ready');
        }
    }

    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    function createConfetti() {
        // Clear existing confetti
        confettiContainer.innerHTML = '';
        
        // Create new confetti
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confettiContainer.appendChild(confetti);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 5000);
    }

    function getRandomColor() {
        const colors = ['#ff6b6b', '#51cf66', '#fcc419', '#339af0', '#845ef7', '#ff922b'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
});