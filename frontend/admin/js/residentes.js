class ResidentesManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilter = {};
        this.selectedResidents = new Set();
        
        this.initEventListeners();
        this.loadResidents();
        this.loadDepartments();
    }

    initEventListeners() {
        // Búsqueda en tiempo real
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value;
            this.currentPage = 1;
            this.loadResidents();
        });

        // Filtros
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilter.status = e.target.value;
            this.currentPage = 1;
            this.loadResidents();
        });

        document.getElementById('towerFilter').addEventListener('change', (e) => {
            this.currentFilter.tower = e.target.value;
            this.currentPage = 1;
            this.loadResidents();
        });

        document.getElementById('paymentFilter').addEventListener('change', (e) => {
            this.currentFilter.payment = e.target.value;
            this.currentPage = 1;
            this.loadResidents();
        });

        // Fecha con Flatpickr
        flatpickr('#dateFilter', {
            mode: 'range',
            locale: 'es',
            dateFormat: 'd/m/Y',
            onChange: (selectedDates) => {
                if (selectedDates.length === 2) {
                    this.currentFilter.dateRange = selectedDates;
                    this.currentPage = 1;
                    this.loadResidents();
                }
            }
        });

        // Fecha ingreso en modal
        flatpickr('#fechaIngreso', {
            locale: 'es',
            dateFormat: 'd/m/Y',
            defaultDate: new Date()
        });

        // Botones de filtros
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.currentPage = 1;
            this.loadResidents();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Selección múltiple
        document.getElementById('selectAll').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });

        // Botones de acción
        document.getElementById('nuevoResidenteBtn').addEventListener('click', () => {
            this.openResidentModal();
        });

        document.getElementById('saveResidentBtn').addEventListener('click', () => {
            this.saveResident();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportResidents();
        });

        // Mostrar inactivos
        document.getElementById('showInactive').addEventListener('change', (e) => {
            this.currentFilter.showInactive = e.target.checked;
            this.currentPage = 1;
            this.loadResidents();
        });
    }

    async loadResidents() {
        try {
            this.showLoading();
            
            // Simular llamada a API
            const residents = await this.fetchResidents();
            this.displayResidents(residents);
            this.updateStatistics(residents);
            
        } catch (error) {
            console.error('Error loading residents:', error);
            this.showError('Error al cargar los residentes');
        }
    }

    async fetchResidents() {
        // Datos de ejemplo - en producción esto vendría de una API
        return [
            {
                id: 1,
                nombre: 'María',
                apellidos: 'González',
                email: 'maria.g@email.com',
                telefono: '+34 612 345 678',
                departamento: 'Torre A - 301',
                fechaIngreso: '15/03/2023',
                estado: 'activo',
                estadoPago: 'al-dia',
                tipoContrato: 'alquiler',
                avatar: 'https://randomuser.me/api/portraits/women/32.jpg'
            },
            {
                id: 2,
                nombre: 'Carlos',
                apellidos: 'López',
                email: 'carlos.l@email.com',
                telefono: '+34 623 456 789',
                departamento: 'Torre A - 303',
                fechaIngreso: '20/04/2023',
                estado: 'activo',
                estadoPago: 'pendiente',
                tipoContrato: 'propietario',
                avatar: 'https://randomuser.me/api/portraits/men/54.jpg'
            },
            {
                id: 3,
                nombre: 'Ana',
                apellidos: 'Martínez',
                email: 'ana.m@email.com',
                telefono: '+34 634 567 890',
                departamento: 'Torre B - 401',
                fechaIngreso: '10/06/2023',
                estado: 'activo',
                estadoPago: 'al-dia',
                tipoContrato: 'alquiler',
                avatar: 'https://randomuser.me/api/portraits/women/67.jpg'
            },
            {
                id: 4,
                nombre: 'Roberto',
                apellidos: 'Díaz',
                email: 'roberto.d@email.com',
                telefono: '+34 645 678 901',
                departamento: 'Torre B - 402',
                fechaIngreso: '05/08/2023',
                estado: 'inactivo',
                estadoPago: 'atrasado',
                tipoContrato: 'alquiler',
                avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
            }
        ];
    }

    displayResidents(residents) {
        const tbody = document.getElementById('residentsTableBody');
        const filteredResidents = this.applyFilters(residents);
        const paginatedResidents = this.paginateData(filteredResidents);
        
        tbody.innerHTML = '';

        if (paginatedResidents.length === 0) {
            tbody.innerHTML = this.getEmptyState();
            return;
        }

        paginatedResidents.forEach(resident => {
            const row = this.createResidentRow(resident);
            tbody.appendChild(row);
        });

        this.updatePagination(filteredResidents.length);
        this.updateResidentCount(filteredResidents.length);
    }

    applyFilters(residents) {
        return residents.filter(resident => {
            // Filtro de búsqueda
            if (this.currentFilter.search) {
                const searchTerm = this.currentFilter.search.toLowerCase();
                const searchable = `${resident.nombre} ${resident.apellidos} ${resident.email} ${resident.departamento}`.toLowerCase();
                if (!searchable.includes(searchTerm)) return false;
            }

            // Filtro de estado
            if (this.currentFilter.status && resident.estado !== this.currentFilter.status) {
                return false;
            }

            // Filtro de torre
            if (this.currentFilter.tower && !resident.departamento.includes(this.currentFilter.tower)) {
                return false;
            }

            // Filtro de pago
            if (this.currentFilter.payment && resident.estadoPago !== this.currentFilter.payment) {
                return false;
            }

            // Filtro de fecha
            if (this.currentFilter.dateRange) {
                // Implementar lógica de filtrado por fecha si es necesario
            }

            // Mostrar inactivos
            if (!this.currentFilter.showInactive && resident.estado === 'inactivo') {
                return false;
            }

            return true;
        });
    }

    createResidentRow(resident) {
        const row = document.createElement('tr');
        row.className = 'resident-row';
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="form-check-input resident-checkbox" data-id="${resident.id}">
            </td>
            <td>
                <div class="user-cell">
                    <img src="${resident.avatar}" alt="${resident.nombre}" class="user-avatar-sm">
                    <div class="user-info">
                        <span class="user-name">${resident.nombre} ${resident.apellidos}</span>
                        <span class="user-email">${resident.email}</span>
                    </div>
                </div>
            </td>
            <td>${resident.departamento}</td>
            <td>${resident.telefono}</td>
            <td>${resident.fechaIngreso}</td>
            <td>
                <span class="status-badge status-${resident.estado}">
                    ${this.getStatusText(resident.estado)}
                </span>
            </td>
            <td>
                <span class="payment-badge payment-${resident.estadoPago}">
                    ${this.getPaymentStatusText(resident.estadoPago)}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-outline-primary btn-table view-btn" data-id="${resident.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary btn-table edit-btn" data-id="${resident.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info btn-table contact-btn" data-id="${resident.id}">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-table delete-btn" data-id="${resident.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        // Agregar event listeners a los botones
        this.attachRowEventListeners(row, resident);
        return row;
    }

    attachRowEventListeners(row, resident) {
        // Checkbox de selección
        row.querySelector('.resident-checkbox').addEventListener('change', (e) => {
            this.toggleResidentSelection(resident.id, e.target.checked);
        });

        // Botón ver
        row.querySelector('.view-btn').addEventListener('click', () => {
            this.viewResident(resident.id);
        });

        // Botón editar
        row.querySelector('.edit-btn').addEventListener('click', () => {
            this.editResident(resident.id);
        });

        // Botón contactar
        row.querySelector('.contact-btn').addEventListener('click', () => {
            this.contactResident(resident);
        });

        // Botón eliminar
        row.querySelector('.delete-btn').addEventListener('click', () => {
            this.deleteResident(resident.id);
        });
    }

    getStatusText(status) {
        const statusMap = {
            'activo': 'Activo',
            'inactivo': 'Inactivo',
            'pendiente': 'Pendiente'
        };
        return statusMap[status] || status;
    }

    getPaymentStatusText(paymentStatus) {
        const paymentMap = {
            'al-dia': 'Al Día',
            'pendiente': 'Pendiente',
            'atrasado': 'Atrasado'
        };
        return paymentMap[paymentStatus] || paymentStatus;
    }

    updateStatistics(residents) {
        const total = residents.length;
        const active = residents.filter(r => r.estado === 'activo').length;
        const pending = residents.filter(r => r.estado === 'pendiente').length;
        const overdue = residents.filter(r => r.estadoPago === 'atrasado').length;

        document.getElementById('totalResidents').textContent = total;
        document.getElementById('activeResidents').textContent = active;
        document.getElementById('pendingResidents').textContent = pending;
        document.getElementById('overdueResidents').textContent = overdue;
    }

    updateResidentCount(count) {
        document.getElementById('residentCount').textContent = count;
    }

    paginateData(data) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return data.slice(start, end);
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const pagination = document.getElementById('pagination');
        
        pagination.innerHTML = '';

        // Botón anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadResidents();
            }
        });
        pagination.appendChild(prevLi);

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage = i;
                this.loadResidents();
            });
            pagination.appendChild(li);
        }

        // Botón siguiente
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.loadResidents();
            }
        });
        pagination.appendChild(nextLi);
    }

    openResidentModal(resident = null) {
        const modal = new bootstrap.Modal(document.getElementById('residentModal'));
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('residentForm');

        if (resident) {
            title.textContent = 'Editar Residente';
            this.fillForm(resident);
        } else {
            title.textContent = 'Nuevo Residente';
            form.reset();
        }

        modal.show();
    }

    fillForm(resident) {
        document.getElementById('nombre').value = resident.nombre;
        document.getElementById('apellidos').value = resident.apellidos;
        document.getElementById('email').value = resident.email;
        document.getElementById('telefono').value = resident.telefono;
        document.getElementById('departamento').value = resident.departamento;
        document.getElementById('fechaIngreso').value = resident.fechaIngreso;
        document.getElementById('tipoContrato').value = resident.tipoContrato;
        document.getElementById('estado').value = resident.estado;
        document.getElementById('observaciones').value = resident.observaciones || '';
    }

    async saveResident() {
        try {
            const formData = this.getFormData();
            
            // Validación básica
            if (!this.validateForm(formData)) {
                return;
            }

            // Simular guardado en API
            await this.saveResidentToAPI(formData);
            
            // Cerrar modal y recargar
            bootstrap.Modal.getInstance(document.getElementById('residentModal')).hide();
            this.loadResidents();
            
            this.showSuccess('Residente guardado correctamente');
            
        } catch (error) {
            console.error('Error saving resident:', error);
            this.showError('Error al guardar el residente');
        }
    }

    getFormData() {
        return {
            nombre: document.getElementById('nombre').value,
            apellidos: document.getElementById('apellidos').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            departamento: document.getElementById('departamento').value,
            fechaIngreso: document.getElementById('fechaIngreso').value,
            tipoContrato: document.getElementById('tipoContrato').value,
            estado: document.getElementById('estado').value,
            observaciones: document.getElementById('observaciones').value
        };
    }

    validateForm(data) {
        if (!data.nombre || !data.apellidos || !data.email || !data.telefono || !data.departamento) {
            this.showError('Por favor complete todos los campos obligatorios');
            return false;
        }

        if (!this.isValidEmail(data.email)) {
            this.showError('Por favor ingrese un email válido');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async saveResidentToAPI(data) {
        // Simular llamada a API
        return new Promise((resolve) => {
            setTimeout(() => resolve(data), 1000);
        });
    }

    viewResident(id) {
        // Implementar vista de detalles
        console.log('Ver residente:', id);
        this.showInfo('Funcionalidad de detalles en desarrollo');
    }

    editResident(id) {
        // Implementar edición
        console.log('Editar residente:', id);
        this.showInfo('Funcionalidad de edición en desarrollo');
    }

    contactResident(resident) {
        // Implementar contacto
        const subject = `Contacto desde Residencias Lux`;
        const body = `Hola ${resident.nombre}, nos ponemos en contacto contigo desde la administración de Residencias Lux.`;
        const mailto = `mailto:${resident.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
    }

    deleteResident(id) {
        if (confirm('¿Está seguro de que desea eliminar este residente?')) {
            // Implementar eliminación
            console.log('Eliminar residente:', id);
            this.showSuccess('Residente eliminado correctamente');
            this.loadResidents();
        }
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.resident-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            this.toggleResidentSelection(checkbox.dataset.id, checked);
        });
    }

    toggleResidentSelection(id, selected) {
        if (selected) {
            this.selectedResidents.add(id);
        } else {
            this.selectedResidents.delete(id);
        }
        this.updateBulkActions();
    }

    updateBulkActions() {
        // Implementar acciones en lote si es necesario
    }

    async loadDepartments() {
        // Simular carga de departamentos disponibles
        const departments = [
            'Torre A - 301',
            'Torre A - 302', 
            'Torre A - 303',
            'Torre B - 401',
            'Torre B - 402',
            'Torre B - 403'
        ];

        const select = document.getElementById('departamento');
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            select.appendChild(option);
        });
    }

    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('towerFilter').value = '';
        document.getElementById('paymentFilter').value = '';
        document.getElementById('dateFilter').value = '';
        
        this.currentFilter = {};
        this.currentPage = 1;
        this.loadResidents();
    }

    exportResidents() {
        // Implementar exportación
        this.showInfo('Funcionalidad de exportación en desarrollo');
    }

    showLoading() {
        const tbody = document.getElementById('residentsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Cargando residentes...</p>
                </td>
            </tr>
        `;
    }

    getEmptyState() {
        return `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-users"></i>
                    <h4>No se encontraron residentes</h4>
                    <p>Intenta ajustar los filtros de búsqueda</p>
                    <button class="btn btn-primary mt-3" onclick="residentesManager.clearFilters()">
                        <i class="fas fa-times"></i>
                        Limpiar Filtros
                    </button>
                </td>
            </tr>
        `;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
        `;
        
        alert.innerHTML = `
            <strong>${type === 'success' ? 'Éxito!' : type === 'error' ? 'Error!' : 'Información'}</strong>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.residentesManager = new ResidentesManager();
});