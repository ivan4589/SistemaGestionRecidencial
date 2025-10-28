class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.initEventListeners();
        this.loadDashboardData();
    }

    checkAuthentication() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
            window.location.href = '../login.html';
            return;
        }

        this.displayUserInfo(JSON.parse(user));
    }

    displayUserInfo(user) {
        const userInfoElements = document.querySelectorAll('.user-name, .user-role');
        userInfoElements.forEach(element => {
            if (element.classList.contains('user-name')) {
                element.textContent = `${user.nombre} ${user.apellidos}`;
            } else if (element.classList.contains('user-role')) {
                element.textContent = user.departamento || 'Apartamento 302';
            }
        });
    }

    initEventListeners() {
        // Logout
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Mobile menu
        this.initMobileMenu();

        // Notifications
        this.initNotifications();

        // Navigation active state
        this.initNavigation();
    }

    initMobileMenu() {
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn d-lg-none';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        
        mobileMenuBtn.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('mobile-open');
        });

        document.body.appendChild(mobileMenuBtn);
    }

    initNotifications() {
        const notificationBtn = document.querySelector('.header-actions .btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }
    }

    initNavigation() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    async loadDashboardData() {
        try {
            this.showLoading();
            const dashboardData = await this.fetchDashboardData();
            this.updateDashboardUI(dashboardData);
        } catch (error) {
            this.showError('Error al cargar los datos del dashboard');
        } finally {
            this.hideLoading();
        }
    }

    async fetchDashboardData() {
        // Simular API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    reservations: [
                        { 
                            id: 1, 
                            area: 'Piscina', 
                            date: 'Hoy', 
                            time: '16:00 - 18:00',
                            icon: 'fas fa-swimming-pool'
                        },
                        { 
                            id: 2, 
                            area: 'Gimnasio', 
                            date: 'Mañana', 
                            time: '7:00 - 8:00',
                            icon: 'fas fa-dumbbell'
                        }
                    ],
                    pendingMaintenance: true,
                    unreadMessages: 3,
                    buildingFeatures: [
                        {
                            name: 'Piscina Climatizada',
                            status: 'available',
                            schedule: '6:00 AM - 10:00 PM',
                            icon: 'fas fa-swimming-pool'
                        },
                        {
                            name: 'Gimnasio 24/7',
                            status: 'available',
                            schedule: '24 Horas',
                            icon: 'fas fa-dumbbell'
                        },
                        {
                            name: 'Salón de Eventos',
                            status: 'reserved',
                            schedule: 'Hoy 15:00',
                            icon: 'fas fa-concierge-bell'
                        },
                        {
                            name: 'Área BBQ',
                            status: 'available',
                            schedule: '8:00 AM - 10:00 PM',
                            icon: 'fas fa-tree'
                        }
                    ]
                });
            }, 1500);
        });
    }

    updateDashboardUI(data) {
        this.updateReservations(data.reservations);
        this.updateStats(data);
        this.updateBuildingFeatures(data.buildingFeatures);
    }

    updateReservations(reservations) {
        const container = document.querySelector('.card-body .reservation-item');
        if (!container) return;

        const parent = container.parentElement;
        parent.innerHTML = '';

        reservations.forEach(reservation => {
            const reservationElement = this.createReservationElement(reservation);
            parent.appendChild(reservationElement);
        });
    }

    createReservationElement(reservation) {
        const div = document.createElement('div');
        div.className = 'reservation-item';
        
        div.innerHTML = `
            <div class="reservation-icon">
                <i class="${reservation.icon}"></i>
            </div>
            <div class="reservation-details">
                <h6>${reservation.area}</h6>
                <p>${reservation.date} - ${reservation.time}</p>
            </div>
        `;
        
        return div;
    }

    updateStats(data) {
        const maintenanceElement = document.querySelector('.stat-card .bg-warning + .stat-info h3');
        const messagesElement = document.querySelector('.stat-card .bg-info + .stat-info h3');
        
        if (maintenanceElement) {
            maintenanceElement.textContent = data.pendingMaintenance ? 'Pendiente' : 'Al día';
        }
        
        if (messagesElement) {
            messagesElement.textContent = `${data.unreadMessages} Mensajes`;
        }
    }

    updateBuildingFeatures(features) {
        const container = document.querySelector('.feature-item-detail');
        if (!container) return;

        const parent = container.parentElement;
        parent.innerHTML = '';

        features.forEach(feature => {
            const featureElement = this.createFeatureElement(feature);
            parent.appendChild(featureElement);
        });
    }

    createFeatureElement(feature) {
        const div = document.createElement('div');
        div.className = 'col-md-6';
        
        const statusClass = feature.status === 'available' ? 'status-available' : 'status-reserved';
        
        div.innerHTML = `
            <div class="feature-item-detail">
                <i class="${feature.icon}"></i>
                <div>
                    <h5>${feature.name}</h5>
                    <p>${feature.schedule}</p>
                    <span class="${statusClass}">${feature.status === 'available' ? 'Disponible' : 'Reservado'}</span>
                </div>
            </div>
        `;
        
        return div;
    }

    showNotifications() {
        // Implementar modal de notificaciones
        const notificationHTML = `
            <div class="notification-modal">
                <div class="notification-content">
                    <h4>Notificaciones</h4>
                    <ul>
                        <li>Nuevo mensaje del administrador</li>
                        <li>Recordatorio: Reserva de piscina hoy</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Implementación simple por ahora
        alert('Tienes 2 notificaciones:\n- Nuevo mensaje del administrador\n- Recordatorio: Reserva de piscina hoy');
    }

    showLoading() {
        // Podrías implementar un spinner aquí
        console.log('Cargando datos...');
    }

    hideLoading() {
        console.log('Datos cargados');
    }

    showError(message) {
        alert(`Error: ${message}`);
    }

    logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        }
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});