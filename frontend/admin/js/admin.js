// admin.js - Script para el panel administrativo de Residencias Lux

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos los componentes cuando el DOM esté listo
    initCharts();
    initEventListeners();
    updateDateTime();
    
    // Actualizar la hora cada minuto
    setInterval(updateDateTime, 60000);
});

// Función para inicializar los gráficos
function initCharts() {
    // Gráfico de Ingresos Mensuales
    const incomeCtx = document.getElementById('incomeChart').getContext('2d');
    const incomeChart = new Chart(incomeCtx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [{
                label: 'Ingresos ($)',
                data: [38000, 42000, 39800, 45000, 43200, 45680, 47000, 46500, 48000, 47500, 49000, 50500],
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Gráfico de Distribución de Propiedades
    const propertyCtx = document.getElementById('propertyChart').getContext('2d');
    const propertyChart = new Chart(propertyCtx, {
        type: 'doughnut',
        data: {
            labels: ['Ocupadas', 'Disponibles', 'En Mantenimiento'],
            datasets: [{
                data: [24, 8, 4],
                backgroundColor: [
                    '#198754',
                    '#0d6efd',
                    '#ffc107'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '65%'
        }
    });

    // Gráfico de Estado de Mantenimiento
    const maintenanceCtx = document.getElementById('maintenanceChart').getContext('2d');
    const maintenanceChart = new Chart(maintenanceCtx, {
        type: 'bar',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Solicitudes de Mantenimiento',
                data: [12, 8, 15, 10, 7, 9],
                backgroundColor: '#fd7e14',
                borderColor: '#fd7e14',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Función para inicializar event listeners
function initEventListeners() {
    // Botón de actualizar
    const refreshBtn = document.querySelector('.btn-outline-primary');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            refreshDashboard();
        });
    }

    // Botones de acción rápida
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const actionText = this.querySelector('span').textContent;
            handleQuickAction(actionText);
        });
    });

    // Botones de alertas
    const alertBtns = document.querySelectorAll('.alert-item .btn');
    alertBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const alertItem = this.closest('.alert-item');
            const alertTitle = alertItem.querySelector('h6').textContent;
            handleAlertClick(alertTitle);
        });
    });

    // Botones de la tabla de residentes
    const editBtns = document.querySelectorAll('.btn-outline-primary:not(.header-actions .btn)');
    editBtns.forEach(btn => {
        if (btn.textContent.trim() === 'Editar') {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const residentName = row.querySelector('strong').textContent;
                editResident(residentName);
            });
        }
    });

    const contactBtns = document.querySelectorAll('.btn-outline-info');
    contactBtns.forEach(btn => {
        if (btn.textContent.trim() === 'Contactar') {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const residentName = row.querySelector('strong').textContent;
                const residentEmail = row.querySelector('.text-muted').textContent;
                contactResident(residentName, residentEmail);
            });
        }
    });

    // Navegación del sidebar
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remover clase active de todos los items
            navLinks.forEach(nav => nav.parentElement.classList.remove('active'));
            // Agregar clase active al item actual
            this.parentElement.classList.add('active');
        });
    });
}

// Función para actualizar fecha y hora
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const dateTimeString = now.toLocaleDateString('es-ES', options);
    
    // Buscar o crear elemento para mostrar la fecha/hora
    let dateTimeElement = document.querySelector('.date-time');
    if (!dateTimeElement) {
        const header = document.querySelector('.content-header div:first-child');
        dateTimeElement = document.createElement('p');
        dateTimeElement.className = 'date-time text-muted small';
        header.appendChild(dateTimeElement);
    }
    
    dateTimeElement.textContent = dateTimeString;
}

// Función para refrescar el dashboard
function refreshDashboard() {
    const refreshBtn = document.querySelector('.btn-outline-primary i');
    
    // Agregar animación de giro
    refreshBtn.classList.add('fa-spin');
    
    // Simular actualización de datos
    setTimeout(() => {
        refreshBtn.classList.remove('fa-spin');
        
        // Mostrar notificación de éxito
        showNotification('Dashboard actualizado correctamente', 'success');
        
        // Aquí podrías agregar lógica para actualizar datos reales
        updateStats();
        
    }, 1500);
}

// Función para manejar acciones rápidas
function handleQuickAction(action) {
    const actions = {
        'Nuevo Residente': () => window.location.href = 'residentes.html?action=new',
        'Generar Recibos': () => generateReceipts(),
        'Reporte Diario': () => generateDailyReport(),
        'Enviar Aviso': () => sendNotice(),
        'Programar Mantenimiento': () => scheduleMaintenance(),
        'Configuración': () => window.location.href = 'configuracion.html'
    };
    
    if (actions[action]) {
        actions[action]();
    } else {
        showNotification(`Acción "${action}" no implementada`, 'warning');
    }
}

// Función para manejar clicks en alertas
function handleAlertClick(alertTitle) {
    const alertRoutes = {
        'Pago Vencido': 'finanzas.html?filter=overdue',
        'Mantenimiento Urgente': 'reportes.html?filter=maintenance',
        'Reporte Mensual': 'reportes.html'
    };
    
    if (alertRoutes[alertTitle]) {
        window.location.href = alertRoutes[alertTitle];
    } else {
        showNotification(`Navegando a: ${alertTitle}`, 'info');
    }
}

// Funciones específicas de acciones
function editResident(residentName) {
    showNotification(`Editando residente: ${residentName}`, 'info');
    // Aquí iría la lógica para editar el residente
}

function contactResident(residentName, email) {
    showNotification(`Contactando a: ${residentName} (${email})`, 'info');
    // Aquí iría la lógica para contactar al residente
}

function generateReceipts() {
    showNotification('Generando recibos para todos los residentes...', 'info');
    // Simular proceso
    setTimeout(() => {
        showNotification('Recibos generados exitosamente', 'success');
    }, 2000);
}

function generateDailyReport() {
    showNotification('Generando reporte diario...', 'info');
    // Simular proceso
    setTimeout(() => {
        showNotification('Reporte diario generado', 'success');
    }, 1500);
}

function sendNotice() {
    const notice = prompt('Ingrese el mensaje del aviso:');
    if (notice) {
        showNotification('Aviso enviado a todos los residentes', 'success');
    }
}

function scheduleMaintenance() {
    showNotification('Redirigiendo a programación de mantenimiento...', 'info');
    setTimeout(() => {
        window.location.href = 'reportes.html?section=maintenance';
    }, 1000);
}

// Función para actualizar estadísticas (simulada)
function updateStats() {
    // En una implementación real, aquí harías una petición al servidor
    console.log('Actualizando estadísticas...');
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show notification-toast`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Manejar el estado de carga
function showLoading() {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-overlay';
    loadingEl.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
    `;
    loadingEl.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    document.body.appendChild(loadingEl);
}

function hideLoading() {
    const loadingEl = document.querySelector('.loading-overlay');
    if (loadingEl) {
        loadingEl.remove();
    }
}

// Ejemplo de inicialización de tooltips de Bootstrap
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Manejar errores globales
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
    showNotification('Ha ocurrido un error inesperado', 'danger');
});

// Exportar funciones para uso global (si es necesario)
window.AdminDashboard = {
    refreshDashboard,
    showNotification,
    showLoading,
    hideLoading
};