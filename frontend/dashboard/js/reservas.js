class ReservasManager {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.selectedArea = '';
        this.selectedTimeSlot = null;
        this.reservas = [];
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.initCalendar();
        this.initEventListeners();
        this.loadReservas();
        this.generateTimeSlots();
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

    initCalendar() {
        this.renderCalendar();
        this.updateSelectedDateText();
    }

    initEventListeners() {
        // Navegación del calendario
        document.getElementById('prevMonth').addEventListener('click', () => this.previousMonth());
        document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());

        // Filtro de áreas
        document.getElementById('areaFilter').addEventListener('change', (e) => {
            this.selectedArea = e.target.value;
            this.renderCalendar();
            this.generateTimeSlots();
        });

        // Vista del calendario
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                // Aquí cambiarías la vista del calendario
            });
        });

        // Formulario de reserva
        document.getElementById('reservaForm').addEventListener('submit', (e) => this.submitReserva(e));
        
        // Selectores de hora
        document.getElementById('reservaHoraInicio').addEventListener('change', (e) => this.updateHoraFinOptions(e.target.value));
        
        // Botón nueva reserva
        document.getElementById('nuevaReservaBtn').addEventListener('click', () => this.resetForm());
        
        // Confirmación final
        document.getElementById('finalConfirmBtn').addEventListener('click', () => this.confirmReserva());
        
        // Inicializar datepicker
        this.initDatePicker();
    }

    initDatePicker() {
        const fechaInput = document.getElementById('reservaFecha');
        if (fechaInput) {
            flatpickr(fechaInput, {
                locale: 'es',
                minDate: 'today',
                maxDate: new Date().fp_incr(30), // 30 días desde hoy
                dateFormat: 'd/m/Y',
                onChange: (selectedDates) => {
                    if (selectedDates.length > 0) {
                        this.selectedDate = selectedDates[0];
                        this.updateSelectedDateText();
                        this.generateTimeSlots();
                        this.renderCalendar();
                    }
                }
            });
        }
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Actualizar texto del mes
        document.getElementById('currentMonth').textContent = 
            this.currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

        // Obtener primer día del mes y último día
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.

        // Limpiar calendario
        calendarGrid.innerHTML = '';

        // Encabezados de días
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        days.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day-header';
            dayElement.textContent = day;
            calendarGrid.appendChild(dayElement);
        });

        // Días del mes anterior
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const dayElement = this.createDayElement(prevMonthLastDay - i, true);
            calendarGrid.appendChild(dayElement);
        }

        // Días del mes actual
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = this.createDayElement(day, false);
            calendarGrid.appendChild(dayElement);
        }

        // Días del próximo mes para completar la grid
        const totalCells = 42; // 6 semanas * 7 días
        const remainingCells = totalCells - (startingDay + lastDay.getDate());
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElement(day, true);
            calendarGrid.appendChild(dayElement);
        }
    }

    createDayElement(day, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        } else {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            
            // Verificar si es hoy
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            // Verificar si está seleccionado
            if (date.toDateString() === this.selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }

            // Verificar disponibilidad (simulada)
            this.checkDayAvailability(date, dayElement);

            // Evento click
            dayElement.addEventListener('click', () => this.selectDate(date));
        }

        dayElement.textContent = day;
        return dayElement;
    }

    checkDayAvailability(date, dayElement) {
        // Simular verificación de disponibilidad
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const hasReservations = Math.random() > 0.7; // Simulación

        if (hasReservations) {
            // Verificar si el usuario tiene reservas este día
            const userHasReservation = this.reservas.some(reserva => 
                new Date(reserva.fecha).toDateString() === date.toDateString()
            );

            if (userHasReservation) {
                dayElement.classList.add('reserved');
            } else {
                dayElement.classList.add('occupied');
            }
        } else {
            dayElement.classList.add('available');
        }
    }

    selectDate(date) {
        this.selectedDate = date;
        this.updateSelectedDateText();
        this.renderCalendar();
        this.generateTimeSlots();
        
        // Actualizar el campo de fecha en el formulario
        const fechaInput = document.getElementById('reservaFecha');
        if (fechaInput) {
            fechaInput.value = date.toLocaleDateString('es-ES');
        }
    }

    updateSelectedDateText() {
        const selectedDateText = document.getElementById('selectedDateText');
        if (selectedDateText) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            selectedDateText.textContent = this.selectedDate.toLocaleDateString('es-ES', options);
        }
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    generateTimeSlots() {
        const timeSlotsContainer = document.getElementById('timeSlots');
        if (!timeSlotsContainer) return;

        timeSlotsContainer.innerHTML = '';

        // Generar horarios de 8:00 AM a 10:00 PM
        for (let hour = 8; hour <= 22; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.textContent = timeString;
                timeSlot.dataset.time = timeString;

                // Simular disponibilidad
                const isAvailable = Math.random() > 0.3;
                if (!isAvailable) {
                    timeSlot.classList.add('occupied');
                } else {
                    timeSlot.classList.add('available');
                    timeSlot.addEventListener('click', () => this.selectTimeSlot(timeSlot));
                }

                timeSlotsContainer.appendChild(timeSlot);
            }
        }

        this.updateHoraOptions();
    }

    selectTimeSlot(timeSlot) {
        // Deseleccionar anterior
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });

        // Seleccionar nuevo
        timeSlot.classList.add('selected');
        this.selectedTimeSlot = timeSlot.dataset.time;

        // Actualizar formulario
        document.getElementById('reservaHoraInicio').value = this.selectedTimeSlot;
        this.updateHoraFinOptions(this.selectedTimeSlot);
    }

    updateHoraOptions() {
        const horaInicioSelect = document.getElementById('reservaHoraInicio');
        const horaFinSelect = document.getElementById('reservaHoraFin');
        
        if (!horaInicioSelect || !horaFinSelect) return;

        // Limpiar opciones
        horaInicioSelect.innerHTML = '<option value="">Seleccionar</option>';
        horaFinSelect.innerHTML = '<option value="">Seleccionar</option>';

        // Generar opciones de hora
        for (let hour = 8; hour <= 22; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                const optionInicio = document.createElement('option');
                optionInicio.value = timeString;
                optionInicio.textContent = timeString;
                horaInicioSelect.appendChild(optionInicio);

                const optionFin = document.createElement('option');
                optionFin.value = timeString;
                optionFin.textContent = timeString;
                horaFinSelect.appendChild(optionFin);
            }
        }
    }

    updateHoraFinOptions(horaInicio) {
        const horaFinSelect = document.getElementById('reservaHoraFin');
        if (!horaFinSelect || !horaInicio) return;

        // Habilitar solo horarios posteriores al inicio
        const options = horaFinSelect.querySelectorAll('option');
        options.forEach(option => {
            if (option.value && option.value > horaInicio) {
                option.disabled = false;
            } else {
                option.disabled = true;
            }
        });

        // Seleccionar automáticamente 1 hora después
        const [hours, minutes] = horaInicio.split(':').map(Number);
        let endHours = hours + 1;
        let endMinutes = minutes;
        
        if (endHours > 22) {
            endHours = 22;
            endMinutes = 0;
        }
        
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        horaFinSelect.value = endTime;
    }

    async loadReservas() {
        try {
            // Simular carga de reservas
            this.reservas = await this.fetchReservas();
            this.renderReservasList();
        } catch (error) {
            console.error('Error loading reservations:', error);
        }
    }

    async fetchReservas() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        area: 'Piscina',
                        fecha: new Date(2024, 10, 20, 16, 0), // 20 Nov 2024, 16:00
                        horaInicio: '16:00',
                        horaFin: '18:00',
                        personas: 4,
                        motivo: 'Celebración familiar',
                        status: 'confirmed'
                    },
                    {
                        id: 2,
                        area: 'Gimnasio',
                        fecha: new Date(2024, 10, 21, 7, 0), // 21 Nov 2024, 7:00
                        horaInicio: '07:00',
                        horaFin: '08:00',
                        personas: 1,
                        motivo: 'Entrenamiento personal',
                        status: 'confirmed'
                    },
                    {
                        id: 3,
                        area: 'Salón de Eventos',
                        fecha: new Date(2024, 10, 25, 15, 0), // 25 Nov 2024, 15:00
                        horaInicio: '15:00',
                        horaFin: '18:00',
                        personas: 20,
                        motivo: 'Fiesta de cumpleaños',
                        status: 'pending'
                    }
                ]);
            }, 1000);
        });
    }

    renderReservasList() {
        const reservasList = document.getElementById('reservasList');
        if (!reservasList) return;

        reservasList.innerHTML = '';

        this.reservas.forEach(reserva => {
            const reservaElement = this.createReservaElement(reserva);
            reservasList.appendChild(reservaElement);
        });
    }

    createReservaElement(reserva) {
        const div = document.createElement('div');
        div.className = 'reserva-item';
        div.classList.add(`area-${reserva.area.toLowerCase().replace(' ', '-')}`);

        const iconClass = this.getAreaIcon(reserva.area);
        const statusClass = `status-${reserva.status}`;
        const statusText = this.getStatusText(reserva.status);

        div.innerHTML = `
            <div class="reserva-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="reserva-details">
                <h6>${reserva.area}</h6>
                <p>${reserva.fecha.toLocaleDateString('es-ES')} - ${reserva.horaInicio} a ${reserva.horaFin}</p>
                <span class="reserva-status ${statusClass}">${statusText}</span>
            </div>
            <div class="reserva-actions">
                <button class="btn btn-sm btn-outline-danger" onclick="reservasManager.cancelReserva(${reserva.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        return div;
    }

    getAreaIcon(area) {
        const icons = {
            'Piscina': 'fas fa-swimming-pool',
            'Gimnasio': 'fas fa-dumbbell',
            'Salón de Eventos': 'fas fa-concierge-bell',
            'Área BBQ': 'fas fa-tree',
            'Cancha Deportiva': 'fas fa-basketball-ball',
            'Sala de Cine': 'fas fa-film',
            'Espacio Coworking': 'fas fa-laptop-house'
        };
        return icons[area] || 'fas fa-calendar-check';
    }

    getStatusText(status) {
        const statusMap = {
            'confirmed': 'Confirmada',
            'pending': 'Pendiente',
            'cancelled': 'Cancelada'
        };
        return statusMap[status] || status;
    }

    async submitReserva(e) {
        e.preventDefault();
        
        if (!this.validateReservaForm()) {
            return;
        }

        const reservaData = this.getReservaFormData();
        this.showReservaSummary(reservaData);
    }

    validateReservaForm() {
        const area = document.getElementById('reservaArea').value;
        const fecha = document.getElementById('reservaFecha').value;
        const horaInicio = document.getElementById('reservaHoraInicio').value;
        const horaFin = document.getElementById('reservaHoraFin').value;

        if (!area) {
            this.showNotification('Por favor selecciona un área', 'error');
            return false;
        }

        if (!fecha) {
            this.showNotification('Por favor selecciona una fecha', 'error');
            return false;
        }

        if (!horaInicio || !horaFin) {
            this.showNotification('Por favor selecciona horario de inicio y fin', 'error');
            return false;
        }

        if (horaInicio >= horaFin) {
            this.showNotification('La hora de fin debe ser posterior a la hora de inicio', 'error');
            return false;
        }

        // Verificar duración máxima (2 horas)
        const [startHours, startMinutes] = horaInicio.split(':').map(Number);
        const [endHours, endMinutes] = horaFin.split(':').map(Number);
        const duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        
        if (duration > 120) { // 2 horas en minutos
            this.showNotification('La reserva no puede exceder 2 horas', 'error');
            return false;
        }

        return true;
    }

    getReservaFormData() {
        return {
            area: document.getElementById('reservaArea').value,
            areaText: document.getElementById('reservaArea').options[document.getElementById('reservaArea').selectedIndex].text,
            fecha: document.getElementById('reservaFecha').value,
            horaInicio: document.getElementById('reservaHoraInicio').value,
            horaFin: document.getElementById('reservaHoraFin').value,
            personas: document.getElementById('reservaPersonas').value,
            motivo: document.getElementById('reservaMotivo').value
        };
    }

    showReservaSummary(reservaData) {
        const summaryContainer = document.getElementById('reservaSummary');
        
        summaryContainer.innerHTML = `
            <div class="summary-item">
                <strong>Área:</strong>
                <span class="value">${reservaData.areaText}</span>
            </div>
            <div class="summary-item">
                <strong>Fecha:</strong>
                <span class="value">${reservaData.fecha}</span>
            </div>
            <div class="summary-item">
                <strong>Horario:</strong>
                <span class="value">${reservaData.horaInicio} - ${reservaData.horaFin}</span>
            </div>
            <div class="summary-item">
                <strong>Personas:</strong>
                <span class="value">${reservaData.personas}</span>
            </div>
            ${reservaData.motivo ? `
            <div class="summary-item">
                <strong>Motivo:</strong>
                <span class="value">${reservaData.motivo}</span>
            </div>
            ` : ''}
            <div class="summary-item mt-3">
                <strong>Normas:</strong>
                <span class="value">Acepto las reglas de uso</span>
            </div>
        `;

        // Guardar datos temporalmente para la confirmación
        this.pendingReserva = reservaData;

        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        modal.show();
    }

    async confirmReserva() {
        const confirmBtn = document.getElementById('finalConfirmBtn');
        this.setLoading(confirmBtn, true);

        try {
            // Simular envío a la API
            await this.sendReservaToAPI(this.pendingReserva);
            
            this.showNotification('¡Reserva confirmada exitosamente!', 'success');
            this.closeModal();
            this.resetForm();
            this.loadReservas(); // Recargar lista
        } catch (error) {
            this.showNotification('Error al confirmar la reserva', 'error');
        } finally {
            this.setLoading(confirmBtn, false);
        }
    }

    async sendReservaToAPI(reservaData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Reserva enviada:', reservaData);
                resolve({ success: true, id: Date.now() });
            }, 1500);
        });
    }

    async cancelReserva(reservaId) {
        if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
            return;
        }

        try {
            // Simular cancelación
            await this.cancelReservaInAPI(reservaId);
            this.showNotification('Reserva cancelada exitosamente', 'success');
            this.loadReservas(); // Recargar lista
        } catch (error) {
            this.showNotification('Error al cancelar la reserva', 'error');
        }
    }

    async cancelReservaInAPI(reservaId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Reserva cancelada:', reservaId);
                resolve({ success: true });
            }, 1000);
        });
    }

    resetForm() {
        document.getElementById('reservaForm').reset();
        this.selectedTimeSlot = null;
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });
    }

    closeModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
        modal.hide();
    }

    setLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        } else {
            button.disabled = false;
            button.innerHTML = 'Confirmar Reserva';
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
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Inicializar el manager de reservas
const reservasManager = new ReservasManager();