class RegisterManager {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.fechaRegistro = document.getElementById('fechaRegistro');
        this.submitBtn = document.getElementById('submitBtn');
        this.alert = document.getElementById('alertMessage');
        this.alertText = document.getElementById('alertText');
        
        this.initEventListeners();
        this.setCurrentDate();
    }

    initEventListeners() {
        // Toggle password visibility for both password fields
        document.querySelectorAll('.password-toggle').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target.closest('.password-toggle').getAttribute('data-target');
                this.togglePasswordVisibility(target);
            });
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Real-time validation
        this.setupRealTimeValidation();
        
        // Password strength indicator
        document.getElementById('password').addEventListener('input', () => this.checkPasswordStrength());
        
        // Country change event
        document.getElementById('pais').addEventListener('change', (e) => this.handleCountryChange(e));
    }

    setCurrentDate() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        this.fechaRegistro.value = now.toLocaleDateString('es-ES', options);
    }

    togglePasswordVisibility(targetId) {
        const input = document.getElementById(targetId);
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        const icon = input.parentNode.querySelector('.password-toggle i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    setupRealTimeValidation() {
        // Nombre validation
        document.getElementById('nombre').addEventListener('input', () => this.validateNombre());
        
        // Apellidos validation
        document.getElementById('apellidos').addEventListener('input', () => this.validateApellidos());
        
        // Email validation
        document.getElementById('email').addEventListener('input', () => this.validateEmail());
        
        // Password validation
        document.getElementById('password').addEventListener('input', () => {
            this.validatePassword();
            this.validateConfirmPassword();
        });
        
        // Confirm password validation
        document.getElementById('confirmPassword').addEventListener('input', () => this.validateConfirmPassword());
        
        // Celular validation
        document.getElementById('celular').addEventListener('input', () => this.validateCelular());
        
        // Género validation
        document.getElementById('genero').addEventListener('change', () => this.validateGenero());
        
        // País validation
        document.getElementById('pais').addEventListener('change', () => this.validatePais());
        
        // Ciudad validation
        document.getElementById('ciudad').addEventListener('input', () => this.validateCiudad());
    }

    validateNombre() {
        const input = document.getElementById('nombre');
        const error = document.getElementById('nombreError');
        const value = input.value.trim();
        
        if (value === '') {
            this.showError(input, error, 'El nombre es obligatorio');
            return false;
        }
        
        if (value.length < 2) {
            this.showError(input, error, 'El nombre debe tener al menos 2 caracteres');
            return false;
        }
        
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
            this.showError(input, error, 'El nombre solo puede contener letras');
            return false;
        }
        
        this.showSuccess(input, error);
        return true;
    }

    validateApellidos() {
        const input = document.getElementById('apellidos');
        const error = document.getElementById('apellidosError');
        const value = input.value.trim();
        
        if (value === '') {
            this.showError(input, error, 'Los apellidos son obligatorios');
            return false;
        }
        
        if (value.length < 2) {
            this.showError(input, error, 'Los apellidos deben tener al menos 2 caracteres');
            return false;
        }
        
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
            this.showError(input, error, 'Los apellidos solo pueden contener letras');
            return false;
        }
        
        this.showSuccess(input, error);
        return true;
    }

    validateEmail() {
        const input = document.getElementById('email');
        const error = document.getElementById('emailError');
        const value = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (value === '') {
            this.showError(input, error, 'El correo electrónico es obligatorio');
            return false;
        }
        
        if (!emailRegex.test(value)) {
            this.showError(input, error, 'Formato de correo electrónico inválido');
            return false;
        }
        
        this.showSuccess(input, error);
        return true;
    }

    validatePassword() {
        const input = document.getElementById('password');
        const error = document.getElementById('passwordError');
        const value = input.value;
        
        if (value === '') {
            this.showError(input, error, 'La contraseña es obligatoria');
            return false;
        }
        
        if (value.length < 8) {
            this.showError(input, error, 'La contraseña debe tener al menos 8 caracteres');
            return false;
        }
        
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            this.showError(input, error, 'Debe contener mayúsculas, minúsculas y números');
            return false;
        }
        
        this.showSuccess(input, error);
        return true;
    }

    validateConfirmPassword() {
        const input = document.getElementById('confirmPassword');
        const error = document.getElementById('confirmPasswordError');
        const password = document.getElementById('password').value;
        const value = input.value;
        
        if (value === '') {
            this.showError(input, error, 'Confirma tu contraseña');
            return false;
        }
        
        if (value !== password) {
            this.showError(input, error, 'Las contraseñas no coinciden');
            return false;
        }
        
        this.showSuccess(input, error);
        return true;
    }

    validateGenero() {
        const input = document.getElementById('genero');
        const error = document.getElementById('generoError');
        const value = input.value;
        
        if (value === '') {
            this.showError(input, error, 'Selecciona tu género');
            return false;
        }
        
        this.showSuccess(input, error);
        return true;
    }

    validateCelular() {
        const input = document.getElementById('celular');
        const error = document.getElementById('celularError');
        const value = input.value.trim();
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        
        if (value === '') {
            this.showError(input, error, 'El número de celular es obligatorio');
            return false;
        }
        
        // Remove spaces, dashes, and parentheses for validation
        const cleanValue = value.replace(/[\s\-\(\)]/g, '');
        
        if (!phoneRegex.test(cleanValue)) {
            this.showError(input, error, 'Formato de número inválido');
            return false;
        }
        
        this.showSuccess(input, error);
        return true;
    }

    validatePais() {
        const input = document.getElementById('pais');
        const error = document.getElementById('paisError');
        const value = input.value;
        
        if (value === '') {
            this.showError(input, error, 'Selecciona tu país');
            return false;
        }
        
        this.showSuccess(input, error);
        return true;
    }

    validateCiudad() {
        const input = document.getElementById('ciudad');
        const error = document.getElementById('ciudadError');
        const value = input.value.trim();
        
        if (value === '') {
            this.showError(input, error, 'La ciudad es obligatoria');
            return false;
        }
        
        if (value.length < 2) {
            this.showError(input, error, 'La ciudad debe tener al menos 2 caracteres');
            return false;
        }
        
        this.showSuccess(input, error);
        return true;
    }

    checkPasswordStrength() {
        const password = document.getElementById('password').value;
        const strengthBar = document.getElementById('passwordStrengthBar');
        
        if (!strengthBar) return;
        
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        strengthBar.className = 'strength-bar';
        
        if (password.length === 0) {
            strengthBar.style.width = '0%';
        } else if (strength <= 2) {
            strengthBar.classList.add('strength-weak');
        } else if (strength <= 4) {
            strengthBar.classList.add('strength-medium');
        } else {
            strengthBar.classList.add('strength-strong');
        }
    }

    showError(input, errorElement, message) {
        input.classList.remove('valid');
        input.classList.add('invalid');
        errorElement.textContent = message;
    }

    showSuccess(input, errorElement) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        errorElement.textContent = '';
    }

    showAlert(message, type = 'error') {
        this.alert.className = `register-alert alert alert-${type === 'error' ? 'danger' : 'success'}`;
        this.alertText.textContent = message;
        this.alert.classList.remove('d-none');
        
        setTimeout(() => {
            this.hideAlert();
        }, 5000);
    }

    hideAlert() {
        this.alert.classList.add('d-none');
    }

    setLoading(state) {
        if (state) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Cargando...</span></div> Procesando...';
        } else {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<span class="btn-text">Crear Cuenta</span>';
        }
    }

    handleCountryChange(event) {
        // Puedes agregar lógica específica para la selección de país aquí
        console.log('País seleccionado:', event.target.value);
    }

    validateForm() {
        const validations = [
            this.validateNombre(),
            this.validateApellidos(),
            this.validateEmail(),
            this.validatePassword(),
            this.validateConfirmPassword(),
            this.validateGenero(),
            this.validateCelular(),
            this.validatePais(),
            this.validateCiudad()
        ];

        return validations.every(validation => validation === true);
    }

    async handleRegister(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            this.showAlert('Por favor, corrige los errores en el formulario.');
            return;
        }

        if (!document.getElementById('terminos').checked) {
            this.showAlert('Debes aceptar los términos y condiciones.');
            return;
        }
        
        const formData = {
            nombre: document.getElementById('nombre').value.trim(),
            apellidos: document.getElementById('apellidos').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            genero: this.mapGenderToSpanish(document.getElementById('genero').value),
            celular: document.getElementById('celular').value.trim(),
            pais: document.getElementById('pais').value,
            ciudad: document.getElementById('ciudad').value.trim()
        };
        
        this.setLoading(true);
        
        try {
            // Usar el servicio API real
            const response = await apiService.register(formData);
            
            this.showAlert('¡Registro exitoso! Redirigiendo al login...', 'success');
            
            // Limpiar formulario
            this.form.reset();
            this.setCurrentDate();
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error en registro:', error);
            
            // Mensajes de error específicos
            let errorMessage = 'Error en el registro. Por favor, intenta nuevamente.';
            
            if (error.message.includes('correo electrónico ya está registrado')) {
                errorMessage = 'Este correo electrónico ya está registrado.';
            } else if (error.message.includes('validación')) {
                errorMessage = 'Por favor, verifica que todos los campos estén correctamente completados.';
            } else if (error.message.includes('conexión') || error.message.includes('Network')) {
                errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
            }
            
            this.showAlert(errorMessage);
        } finally {
            this.setLoading(false);
        }
    }

    mapGenderToSpanish(gender) {
        const genderMap = {
            'hombre': 'Masculino',
            'mujer': 'Femenino',
            'otro': 'Otro'
        };
        return genderMap[gender] || 'Otro';
    }

    // Método para formatear el número de teléfono (opcional)
    formatPhoneNumber(phone) {
        // Eliminar todos los caracteres no numéricos
        const cleaned = phone.replace(/\D/g, '');
        
        // Aplicar formato según la longitud
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length > 10) {
            return `+${cleaned}`;
        }
        
        return phone;
    }
}

// Servicio API (debe estar definido en api.js)
const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (options.body) {
            config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: credentials
        });
    }

    async getProfile() {
        return this.request('/auth/profile');
    }
}

// Instancia global del servicio API
const apiService = new ApiService();

// Inicializar el manager de registro cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    const registerManager = new RegisterManager();
    
    // Verificar si el usuario ya está logueado
    if (localStorage.getItem('authToken')) {
        // Opcional: redirigir al dashboard si ya está autenticado
        // window.location.href = 'dashboard.html';
    }
    
    // Agregar formateo automático de teléfono
    const celularInput = document.getElementById('celular');
    if (celularInput) {
        celularInput.addEventListener('input', function(e) {
            const input = e.target;
            const cleaned = input.value.replace(/\D/g, '');
            
            if (cleaned.length <= 10) {
                input.value = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else {
                input.value = `+${cleaned}`;
            }
        });
    }
});

// Utilidades adicionales
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
}

// Exportar para uso en otros archivos (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RegisterManager, ApiService };
}
export { RegisterManager, ApiService };