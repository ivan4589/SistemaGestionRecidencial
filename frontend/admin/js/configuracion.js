// configuracion.js - Gestión de configuración del sistema

const configManager = {
    // Configuración actual
    config: {
        general: {
            nombreResidencia: 'Residencias Lux',
            rif: 'J-123456789-0',
            direccion: 'Av. Principal, Urb. Las Mercedes',
            telefono: '+58 212-555-1234',
            email: 'info@residenciaslux.com',
            website: 'https://residenciaslux.com',
            descripcion: 'Complejo residencial de lujo con amenities exclusivos y seguridad 24/7',
            diaVencimiento: 5,
            zonaHoraria: 'America/Caracas',
            formatoFecha: 'dd/mm/yyyy',
            tema: 'blue'
        },
        finanzas: {
            moneda: 'USD',
            simbolo: '$',
            metodosPago: ['efectivo', 'transferencia'],
            recargoMora: 5,
            plantillaRecibos: 'moderna',
            envioAutomatico: true,
            notasRecibos: 'Gracias por su puntualidad. Para cualquier consulta, contacte a la administración.'
        },
        notificaciones: {
            email: {
                pagos: true,
                mantenimiento: true,
                incidentes: false
            },
            sistema: {
                pagos: true,
                mantenimiento: true,
                residentes: false
            },
            smtp: {
                server: 'smtp.residenciaslux.com',
                port: 587,
                email: 'notificaciones@residenciaslux.com',
                nombre: 'Residencias Lux'
            }
        },
        seguridad: {
            authDosPasos: true,
            expiracionSesion: 60,
            maxIntentosLogin: 5,
            bloquearIP: true
        },
        usuarios: [
            {
                id: 1,
                username: 'admin',
                nombre: 'Admin Lux',
                email: 'admin@residenciaslux.com',
                rol: 'admin',
                ultimoAcceso: '01/06/2024 09:15',
                estado: 'activo'
            },
            {
                id: 2,
                username: 'finanzas',
                nombre: 'María González',
                email: 'finanzas@residenciaslux.com',
                rol: 'finanzas',
                ultimoAcceso: '31/05/2024 16:30',
                estado: 'activo'
            }
        ],
        avanzado: {
            limiteRegistros: 50,
            tiempoCache: 30,
            modoDebug: false,
            nivelLog: 'warning',
            apiKey: 'sk_live_123456789abcdef'
        },
        backups: [
            {
                id: 1,
                nombre: 'backup_20240601_093000.json',
                fecha: '01/06/2024 09:30',
                tamaño: '2.4 MB',
                tipo: 'Completo'
            },
            {
                id: 2,
                nombre: 'backup_20240525_143000.json',
                fecha: '25/05/2024 14:30',
                tamaño: '2.1 MB',
                tipo: 'Completo'
            }
        ]
    },

    init: function() {
        this.cargarConfiguracion();
        this.inicializarEventListeners();
        this.cargarUsuarios();
        this.cargarBackups();
        this.inicializarPasswordStrength();
    },

    inicializarEventListeners: function() {
        // Navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.cambiarSeccion(e.target.getAttribute('data-target'));
            });
        });

        // Botones principales
        document.getElementById('guardarConfiguracionBtn').addEventListener('click', () => {
            this.guardarConfiguracion();
        });

        document.getElementById('restaurarDefaultsBtn').addEventListener('click', () => {
            this.restaurarValoresPorDefecto();
        });

        // Selector de temas
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.seleccionarTema(e.currentTarget.getAttribute('data-theme'));
            });
        });

        // Upload de logo
        document.getElementById('logoUpload').addEventListener('change', (e) => {
            this.cambiarLogo(e.target.files[0]);
        });

        // Cambio de contraseña
        document.getElementById('cambiarPasswordBtn').addEventListener('click', () => {
            this.cambiarPassword();
        });

        document.getElementById('nuevaPassword').addEventListener('input', (e) => {
            this.actualizarPasswordStrength(e.target.value);
        });

        // Gestión de usuarios
        document.getElementById('nuevoUsuarioBtn').addEventListener('click', () => {
            this.openNuevoUsuario();
        });

        document.getElementById('guardarUsuarioBtn').addEventListener('click', () => {
            this.guardarUsuario();
        });

        // API Key
        document.getElementById('nuevaPassword').addEventListener('input', (e) => {
            this.actualizarPasswordStrength(e.target.value);
        });
    },

    cargarConfiguracion: function() {
        // Cargar configuración general
        document.getElementById('nombreResidencia').value = this.config.general.nombreResidencia;
        document.getElementById('rifResidencia').value = this.config.general.rif;
        document.getElementById('direccionResidencia').value = this.config.general.direccion;
        document.getElementById('telefonoResidencia').value = this.config.general.telefono;
        document.getElementById('emailResidencia').value = this.config.general.email;
        document.getElementById('websiteResidencia').value = this.config.general.website;
        document.getElementById('descripcionResidencia').value = this.config.general.descripcion;
        document.getElementById('diaVencimiento').value = this.config.general.diaVencimiento;
        document.getElementById('zonaHoraria').value = this.config.general.zonaHoraria;
        document.getElementById('formatoFecha').value = this.config.general.formatoFecha;

        // Seleccionar tema actual
        this.seleccionarTema(this.config.general.tema);

        // Cargar configuración de finanzas
        document.getElementById('monedaPrincipal').value = this.config.finanzas.moneda;
        document.getElementById('simboloMoneda').value = this.config.finanzas.simbolo;
        document.getElementById('recargoMora').value = this.config.finanzas.recargoMora;
        document.getElementById('plantillaRecibos').value = this.config.finanzas.plantillaRecibos;
        document.getElementById('envioAutomaticoRecibos').value = this.config.finanzas.envioAutomatico ? 'si' : 'no';
        document.getElementById('notasRecibos').value = this.config.finanzas.notasRecibos;

        // Métodos de pago
        this.config.finanzas.metodosPago.forEach(metodo => {
            const checkbox = document.getElementById(`pago${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`);
            if (checkbox) checkbox.checked = true;
        });

        // Cargar configuración de notificaciones
        document.getElementById('notifPagos').checked = this.config.notificaciones.email.pagos;
        document.getElementById('notifMantenimiento').checked = this.config.notificaciones.email.mantenimiento;
        document.getElementById('notifIncidentes').checked = this.config.notificaciones.email.incidentes;
        document.getElementById('notifSistemaPagos').checked = this.config.notificaciones.sistema.pagos;
        document.getElementById('notifSistemaMantenimiento').checked = this.config.notificaciones.sistema.mantenimiento;
        document.getElementById('notifSistemaResidentes').checked = this.config.notificaciones.sistema.residentes;

        document.getElementById('smtpServer').value = this.config.notificaciones.smtp.server;
        document.getElementById('smtpPort').value = this.config.notificaciones.smtp.port;
        document.getElementById('emailRemitente').value = this.config.notificaciones.smtp.email;
        document.getElementById('nombreRemitente').value = this.config.notificaciones.smtp.nombre;

        // Cargar configuración de seguridad
        document.getElementById('authDosPasos').value = this.config.seguridad.authDosPasos ? 'si' : 'no';
        document.getElementById('expiracionSesion').value = this.config.seguridad.expiracionSesion;
        document.getElementById('maxIntentosLogin').value = this.config.seguridad.maxIntentosLogin;
        document.getElementById('bloquearIP').value = this.config.seguridad.bloquearIP ? 'si' : 'no';

        // Cargar configuración avanzada
        document.getElementById('limiteRegistros').value = this.config.avanzado.limiteRegistros;
        document.getElementById('tiempoCache').value = this.config.avanzado.tiempoCache;
        document.getElementById('modoDebug').value = this.config.avanzado.modoDebug ? 'si' : 'no';
        document.getElementById('nivelLog').value = this.config.avanzado.nivelLog;
        document.getElementById('apiKey').value = this.config.avanzado.apiKey;
    },

    cambiarSeccion: function(seccion) {
        // Actualizar navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-target="${seccion}"]`).classList.add('active');

        // Mostrar sección correspondiente
        document.querySelectorAll('.config-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${seccion}-section`).classList.add('active');
    },

    seleccionarTema: function(tema) {
        // Actualizar selector visual
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-theme="${tema}"]`).classList.add('active');

        // Aquí iría la lógica para aplicar el tema al sistema
        this.config.general.tema = tema;
        this.showNotification(`Tema ${tema} seleccionado`, 'info');
    },

    cambiarLogo: function(archivo) {
        if (archivo) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('logoPreview').src = e.target.result;
                this.showNotification('Logo actualizado correctamente', 'success');
            };
            reader.readAsDataURL(archivo);
        }
    },

    eliminarLogo: function() {
        if (confirm('¿Estás seguro de que quieres eliminar el logo actual?')) {
            document.getElementById('logoPreview').src = 'https://via.placeholder.com/150x150/0d6efd/ffffff?text=RL';
            this.showNotification('Logo eliminado', 'info');
        }
    },

    inicializarPasswordStrength: function() {
        // Inicializar fuerza de contraseña
        this.actualizarPasswordStrength('');
    },

    actualizarPasswordStrength: function(password) {
        const strengthBar = document.getElementById('passwordStrength');
        const feedback = document.getElementById('passwordFeedback');
        
        let strength = 0;
        let message = 'La contraseña debe tener al menos 8 caracteres';
        
        if (password.length >= 8) {
            strength += 25;
            message = 'Contraseña débil';
        }
        
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
            strength += 25;
            message = 'Contraseña aceptable';
        }
        
        if (password.match(/\d/)) {
            strength += 25;
            message = 'Contraseña buena';
        }
        
        if (password.match(/[^a-zA-Z\d]/)) {
            strength += 25;
            message = 'Contraseña fuerte';
        }

        strengthBar.style.width = `${strength}%`;
        
        // Actualizar colores según la fuerza
        if (strength < 50) {
            strengthBar.className = 'progress-bar bg-danger';
        } else if (strength < 75) {
            strengthBar.className = 'progress-bar bg-warning';
        } else {
            strengthBar.className = 'progress-bar bg-success';
        }
        
        feedback.textContent = message;
    },

    cambiarPassword: function() {
        const passwordActual = document.getElementById('passwordActual').value;
        const nuevaPassword = document.getElementById('nuevaPassword').value;
        const confirmarPassword = document.getElementById('confirmarPassword').value;

        if (!passwordActual) {
            this.showNotification('Debes ingresar tu contraseña actual', 'warning');
            return;
        }

        if (nuevaPassword.length < 8) {
            this.showNotification('La nueva contraseña debe tener al menos 8 caracteres', 'warning');
            return;
        }

        if (nuevaPassword !== confirmarPassword) {
            this.showNotification('Las contraseñas no coinciden', 'warning');
            return;
        }

        // Simular cambio de contraseña
        this.showNotification('Cambiando contraseña...', 'info');
        
        setTimeout(() => {
            // Limpiar campos
            document.getElementById('passwordActual').value = '';
            document.getElementById('nuevaPassword').value = '';
            document.getElementById('confirmarPassword').value = '';
            
            this.showNotification('Contraseña cambiada exitosamente', 'success');
        }, 2000);
    },

    cargarUsuarios: function() {
        const tbody = document.getElementById('usuariosTableBody');
        tbody.innerHTML = '';

        this.config.usuarios.forEach(usuario => {
            const row = this.crearFilaUsuario(usuario);
            tbody.appendChild(row);
        });
    },

    crearFilaUsuario: function(usuario) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${usuario.username}</strong>
            </td>
            <td>${usuario.nombre}</td>
            <td>
                <span class="badge ${this.getRolBadgeClass(usuario.rol)}">
                    ${this.getRolTexto(usuario.rol)}
                </span>
            </td>
            <td>${usuario.email}</td>
            <td>${usuario.ultimoAcceso}</td>
            <td>
                <span class="estado-usuario ${usuario.estado}">
                    ${this.getEstadoTexto(usuario.estado)}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="configManager.editarUsuario(${usuario.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="configManager.resetearPassword(${usuario.id})">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="configManager.eliminarUsuario(${usuario.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        return row;
    },

    openNuevoUsuario: function() {
        document.getElementById('usuarioForm').reset();
        document.getElementById('passwordTemporal').value = this.generarPasswordTemporal();
        
        const modal = new bootstrap.Modal(document.getElementById('usuarioModal'));
        modal.show();
    },

    guardarUsuario: function() {
        const form = document.getElementById('usuarioForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const nuevoUsuario = {
            id: Date.now(),
            username: document.getElementById('usernameUsuario').value,
            nombre: document.getElementById('nombreUsuario').value,
            email: document.getElementById('emailUsuario').value,
            rol: document.getElementById('rolUsuario').value,
            ultimoAcceso: 'Nunca',
            estado: 'activo'
        };

        this.config.usuarios.push(nuevoUsuario);
        this.cargarUsuarios();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('usuarioModal'));
        modal.hide();

        this.showNotification('Usuario creado exitosamente', 'success');
    },

    editarUsuario: function(id) {
        const usuario = this.config.usuarios.find(u => u.id === id);
        this.showNotification(`Editando usuario: ${usuario.nombre}`, 'info');
    },

    resetearPassword: function(id) {
        const usuario = this.config.usuarios.find(u => u.id === id);
        const nuevaPassword = this.generarPasswordTemporal();
        
        if (confirm(`¿Resetear contraseña de ${usuario.nombre}? La nueva contraseña será: ${nuevaPassword}`)) {
            this.showNotification(`Contraseña reseteada para ${usuario.nombre}`, 'success');
        }
    },

    eliminarUsuario: function(id) {
        const usuario = this.config.usuarios.find(u => u.id === id);
        
        if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre}?`)) {
            this.config.usuarios = this.config.usuarios.filter(u => u.id !== id);
            this.cargarUsuarios();
            this.showNotification('Usuario eliminado', 'success');
        }
    },

    cargarBackups: function() {
        const tbody = document.getElementById('backupsTableBody');
        tbody.innerHTML = '';

        this.config.backups.forEach(backup => {
            const row = this.crearFilaBackup(backup);
            tbody.appendChild(row);
        });
    },

    crearFilaBackup: function(backup) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${backup.nombre}</td>
            <td>${backup.fecha}</td>
            <td>${backup.tamaño}</td>
            <td>${backup.tipo}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="configManager.descargarBackup(${backup.id})">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="configManager.restaurarBackup(${backup.id})">
                        <i class="fas fa-upload"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="configManager.eliminarBackup(${backup.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        return row;
    },

    crearBackup: function() {
        this.showNotification('Creando backup del sistema...', 'info');
        
        setTimeout(() => {
            const nuevoBackup = {
                id: Date.now(),
                nombre: `backup_${new Date().toISOString().replace(/[:.]/g, '')}.json`,
                fecha: new Date().toLocaleString('es-ES'),
                tamaño: '2.3 MB',
                tipo: 'Completo'
            };
            
            this.config.backups.unshift(nuevoBackup);
            this.cargarBackups();
            this.showNotification('Backup creado exitosamente', 'success');
        }, 3000);
    },

    descargarBackup: function(id) {
        const backup = this.config.backups.find(b => b.id === id);
        this.showNotification(`Descargando backup: ${backup.nombre}`, 'info');
    },

    restaurarBackup: function(id) {
        const backup = this.config.backups.find(b => b.id === id);
        
        if (confirm(`¿Estás seguro de restaurar el backup ${backup.nombre}? Esto sobrescribirá la configuración actual.`)) {
            this.showNotification(`Restaurando backup: ${backup.nombre}...`, 'info');
            
            setTimeout(() => {
                this.showNotification('Sistema restaurado exitosamente', 'success');
            }, 2000);
        }
    },

    eliminarBackup: function(id) {
        const backup = this.config.backups.find(b => b.id === id);
        
        if (confirm(`¿Estás seguro de eliminar el backup ${backup.nombre}?`)) {
            this.config.backups = this.config.backups.filter(b => b.id !== id);
            this.cargarBackups();
            this.showNotification('Backup eliminado', 'success');
        }
    },

    regenerarApiKey: function() {
        if (confirm('¿Estás seguro de regenerar la API Key? Esto afectará a todas las integraciones existentes.')) {
            const nuevaApiKey = 'sk_live_' + Math.random().toString(36).substr(2, 24);
            document.getElementById('apiKey').value = nuevaApiKey;
            this.config.avanzado.apiKey = nuevaApiKey;
            this.showNotification('API Key regenerada exitosamente', 'success');
        }
    },

    mostrarApiKey: function() {
        const apiKeyInput = document.getElementById('apiKey');
        apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
    },

    guardarConfiguracion: function() {
        this.showNotification('Guardando configuración...', 'info');
        
        // Simular guardado
        setTimeout(() => {
            // Aquí iría la lógica real para guardar la configuración
            this.actualizarConfiguracionDesdeFormulario();
            this.showNotification('Configuración guardada exitosamente', 'success');
            
            // Efecto visual de guardado
            const saveBtn = document.getElementById('guardarConfiguracionBtn');
            saveBtn.classList.add('saving');
            setTimeout(() => {
                saveBtn.classList.remove('saving');
                saveBtn.classList.add('saved');
                setTimeout(() => saveBtn.classList.remove('saved'), 2000);
            }, 1000);
        }, 2000);
    },

    actualizarConfiguracionDesdeFormulario: function() {
        // Actualizar configuración general desde el formulario
        this.config.general.nombreResidencia = document.getElementById('nombreResidencia').value;
        this.config.general.rif = document.getElementById('rifResidencia').value;
        this.config.general.direccion = document.getElementById('direccionResidencia').value;
        this.config.general.telefono = document.getElementById('telefonoResidencia').value;
        this.config.general.email = document.getElementById('emailResidencia').value;
        this.config.general.website = document.getElementById('websiteResidencia').value;
        this.config.general.descripcion = document.getElementById('descripcionResidencia').value;
        this.config.general.diaVencimiento = parseInt(document.getElementById('diaVencimiento').value);
        this.config.general.zonaHoraria = document.getElementById('zonaHoraria').value;
        this.config.general.formatoFecha = document.getElementById('formatoFecha').value;

        // Guardar en localStorage (simulación)
        localStorage.setItem('residenciasLuxConfig', JSON.stringify(this.config));
    },

    restaurarValoresPorDefecto: function() {
        if (confirm('¿Estás seguro de restaurar todos los valores por defecto? Se perderán los cambios no guardados.')) {
            // Recargar configuración por defecto
            this.cargarConfiguracion();
            this.showNotification('Valores por defecto restaurados', 'info');
        }
    },

    // Helper functions
    generarPasswordTemporal: function() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    },

    getRolTexto: function(rol) {
        const roles = {
            'admin': 'Administrador General',
            'finanzas': 'Administrador Finanzas',
            'residentes': 'Gestor Residentes'
        };
        return roles[rol] || rol;
    },

    getRolBadgeClass: function(rol) {
        const clases = {
            'admin': 'bg-primary',
            'finanzas': 'bg-success',
            'residentes': 'bg-info'
        };
        return clases[rol] || 'bg-secondary';
    },

    getEstadoTexto: function(estado) {
        const estados = {
            'activo': 'Activo',
            'inactivo': 'Inactivo',
            'bloqueado': 'Bloqueado'
        };
        return estados[estado] || estado;
    },

    showNotification: function(message, type = 'info') {
        if (typeof AdminDashboard !== 'undefined' && AdminDashboard.showNotification) {
            AdminDashboard.showNotification(message, type);
        } else {
            // Fallback simple
            const alertClass = {
                'success': 'alert-success',
                'warning': 'alert-warning',
                'danger': 'alert-danger',
                'info': 'alert-info'
            }[type] || 'alert-info';

            const alert = document.createElement('div');
            alert.className = `alert ${alertClass} alert-dismissible fade show`;
            alert.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            alert.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
            
            document.body.appendChild(alert);
            
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    configManager.init();
});