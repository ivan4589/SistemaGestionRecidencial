class MiDepartamentoManager {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.initEventListeners();
        this.loadDepartmentData();
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
            }
        });
    }

    initEventListeners() {
        // Modal de mantenimiento
        const solicitarBtn = document.getElementById('solicitarMantenimientoBtn');
        const nuevaSolicitudBtn = document.getElementById('nuevaSolicitudBtn');
        const submitMaintenanceBtn = document.getElementById('submitMaintenanceBtn');
        
        if (solicitarBtn) {
            solicitarBtn.addEventListener('click', () => this.openMaintenanceModal());
        }
        
        if (nuevaSolicitudBtn) {
            nuevaSolicitudBtn.addEventListener('click', () => this.openMaintenanceModal());
        }
        
        if (submitMaintenanceBtn) {
            submitMaintenanceBtn.addEventListener('click', () => this.submitMaintenanceRequest());
        }

        // Botones de detalles de mantenimiento
        document.querySelectorAll('.maintenance-item .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMaintenanceDetails(e.target.closest('.maintenance-item'));
            });
        });
    }

    openMaintenanceModal() {
        const modal = new bootstrap.Modal(document.getElementById('maintenanceModal'));
        modal.show();
    }

    async submitMaintenanceRequest() {
        const form = document.getElementById('maintenanceForm');
        const submitBtn = document.getElementById('submitMaintenanceBtn');
        
        if (!this.validateMaintenanceForm()) {
            return;
        }

        const formData = {
            problemType: document.getElementById('problemType').value,
            priority: document.getElementById('priority').value,
            description: document.getElementById('problemDescription').value,
            location: document.getElementById('location').value,
            access: document.querySelector('input[name="access"]:checked').value,
            date: new Date().toISOString()
        };

        this.setLoading(submitBtn, true);

        try {
            // Simular envío a la API
            await this.sendMaintenanceRequest(formData);
            
            this.showNotification('Solicitud de mantenimiento enviada correctamente', 'success');
            this.closeMaintenanceModal();
            this.loadDepartmentData(); // Recargar datos
        } catch (error) {
            this.showNotification('Error al enviar la solicitud', 'error');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    validateMaintenanceForm() {
        const problemType = document.getElementById('problemType').value;
        const description = document.getElementById('problemDescription').value;
        const location = document.getElementById('location').value;

        if (!problemType) {
            this.showNotification('Por favor selecciona el tipo de problema', 'error');
            return false;
        }

        if (!description.trim()) {
            this.showNotification('Por favor describe el problema', 'error');
            return false;
        }

        if (!location.trim()) {
            this.showNotification('Por favor indica la ubicación del problema', 'error');
            return false;
        }

        return true;
    }

    async sendMaintenanceRequest(formData) {
        // Simular llamada a la API
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Solicitud enviada:', formData);
                resolve({ success: true, id: Date.now() });
            }, 1500);
        });
    }

    closeMaintenanceModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('maintenanceModal'));
        modal.hide();
        document.getElementById('maintenanceForm').reset();
    }

    showMaintenanceDetails(maintenanceItem) {
        const title = maintenanceItem.querySelector('h6').textContent;
        const date = maintenanceItem.querySelector('p').textContent.replace('Solicitado: ', '');
        const priority = maintenanceItem.querySelector('.priority').textContent;
        const status = maintenanceItem.querySelector('.status').textContent;
        
        const detailsHTML = `
            <div class="maintenance-details-modal">
                <h4>${title}</h4>
                <div class="detail-item">
                    <strong>Fecha de solicitud:</strong> ${date}
                </div>
                <div class="detail-item">
                    <strong>Prioridad:</strong> ${priority}
                </div>
                <div class="detail-item">
                    <strong>Estado:</strong> ${status}
                </div>
                <div class="detail-item">
                    <strong>Última actualización:</strong> Hoy a las 14:30
                </div>
                <div class="detail-item">
                    <strong>Técnico asignado:</strong> Carlos Mendoza
                </div>
                <div class="detail-item">
                    <strong>Comentarios:</strong> El técnico visitará el departamento mañana entre 9:00 y 12:00.
                </div>
            </div>
        `;

        // Mostrar en un modal o alerta
        this.showCustomModal('Detalles de Solicitud', detailsHTML);
    }

    showCustomModal(title, content) {
        // Crear modal dinámico
        const modalId = 'customDetailsModal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            modal.querySelector('.modal-title').textContent = title;
            modal.querySelector('.modal-body').innerHTML = content;
        }

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    async loadDepartmentData() {
        try {
            const data = await this.fetchDepartmentData();
            this.updateDepartmentUI(data);
        } catch (error) {
            console.error('Error loading department data:', error);
        }
    }

    async fetchDepartmentData() {
        // Simular datos de la API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    financialStatus: {
                        currentDebt: 0,
                        nextPayment: 1200,
                        nextDueDate: '2024-12-05'
                    },
                    maintenanceRequests: [
                        {
                            id: 1,
                            title: 'Fuga en grifo de cocina',
                            date: '15/11/2024',
                            priority: 'medium',
                            status: 'in-progress',
                            type: 'plomeria'
                        },
                        {
                            id: 2,
                            title: 'Luz del pasillo no funciona',
                            date: '10/11/2024',
                            priority: 'low',
                            status: 'completed',
                            type: 'electricidad'
                        },
                        {
                            id: 3,
                            title: 'Aire acondicionado no enfría',
                            date: '08/11/2024',
                            priority: 'high',
                            status: 'pending',
                            type: 'aire_acondicionado'
                        }
                    ],
                    services: {
                        water: 'active',
                        electricity: 'active',
                        internet: 'active',
                        gas: 'warning'
                    }
                });
            }, 1000);
        });
    }

    updateDepartmentUI(data) {
        this.updateFinancialStatus(data.financialStatus);
        this.updateMaintenanceList(data.maintenanceRequests);
        this.updateServicesStatus(data.services);
    }

    updateFinancialStatus(financial) {
        const debtElement = document.querySelector('.financial-amount .amount');
        if (debtElement && financial.currentDebt === 0) {
            debtElement.textContent = '$0.00';
            debtElement.style.color = 'var(--success-color)';
        }
    }

    updateMaintenanceList(requests) {
        // En una implementación real, actualizarías la lista dinámicamente
        console.log('Maintenance requests:', requests);
    }

    updateServicesStatus(services) {
        // Actualizar estado de servicios si es necesario
        console.log('Services status:', services);
    }

    setLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        } else {
            button.disabled = false;
            button.innerHTML = 'Enviar Solicitud';
        }
    }

    showNotification(message, type = 'success') {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show`;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
        `;
        
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${icon} me-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new MiDepartamentoManager();
});