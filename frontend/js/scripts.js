// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling
    const navLinks = document.querySelectorAll('a.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('header');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            
            // Simulate form submission
            alert(`¡Gracias ${name}! Hemos recibido tu solicitud y nos pondremos en contacto contigo pronto.`);
            
            // Reset form
            this.reset();
        });
    }
    
    // Property card animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe property cards
    const propertyCards = document.querySelectorAll('.property-card');
    propertyCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s, transform 0.5s';
        observer.observe(card);
    });
    
    // Observe feature items
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s, transform 0.5s';
        observer.observe(item);
    });
    
    // Add animation delay to feature items
    featureItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
    });
});
// Agregar este código al archivo script.js

// Modal de inicio de sesión
function initLoginModal() {
    // Crear el modal dinámicamente
    const loginModalHTML = `
    <div class="modal fade login-modal" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="loginModalLabel">Iniciar Sesión</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form class="login-form" id="loginForm">
                        <div class="mb-3">
                            <input type="email" class="form-control" id="loginEmail" placeholder="Correo electrónico" required>
                        </div>
                        <div class="mb-3">
                            <input type="password" class="form-control" id="loginPassword" placeholder="Contraseña" required>
                        </div>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="rememberMe">
                            <label class="form-check-label" for="rememberMe">Recordar mi sesión</label>
                        </div>
                        <button type="submit" class="btn btn-login">Iniciar Sesión</button>
                    </form>
                    
                    <div class="login-links">
                        <a href="#" id="forgotPassword">¿Olvidaste tu contraseña?</a>
                    </div>
                    
                    <div class="social-login">
                        <div class="social-divider">
                            <span>O inicia sesión con</span>
                        </div>
                        <div class="social-buttons">
                            <button type="button" class="social-btn google">
                                <i class="fab fa-google"></i> Google
                            </button>
                            <button type="button" class="social-btn facebook">
                                <i class="fab fa-facebook-f"></i> Facebook
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    
    // Agregar el modal al body
    document.body.insertAdjacentHTML('beforeend', loginModalHTML);
    
    // Configurar el evento del botón de inicio de sesión
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        });
    }
    
    // Configurar el envío del formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Simular proceso de login
            simulateLogin(email, password);
        });
    }
    
    // Configurar el enlace de "Olvidé mi contraseña"
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Función de recuperación de contraseña en desarrollo. Por favor contacte al administrador.');
        });
    }
    
    // Configurar botones de login social
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('google')) {
                alert('Inicio de sesión con Google - Función en desarrollo');
            } else if (this.classList.contains('facebook')) {
                alert('Inicio de sesión con Facebook - Función en desarrollo');
            }
        });
    });
}

// Función para simular el proceso de login
function simulateLogin(email, password) {
    // Mostrar carga
    const submitBtn = document.querySelector('#loginForm .btn-login');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
    submitBtn.disabled = true;
    
    // Simular llamada a API
    setTimeout(() => {
        // Aquí iría la lógica real de autenticación
        if (email && password) {
            // Login exitoso
            alert('¡Inicio de sesión exitoso! Redirigiendo al panel de control...');
            
            // Cerrar modal
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
            
            // Cambiar el botón a "Mi Cuenta"
            const loginBtn = document.getElementById('loginBtn');
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Mi Cuenta';
            loginBtn.classList.remove('btn-outline-primary');
            loginBtn.classList.add('btn-primary');
            
            // Remover el evento de login y agregar uno para ir al dashboard
            loginBtn.replaceWith(loginBtn.cloneNode(true));
            document.getElementById('loginBtn').addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'dashboard.html'; // Cambiar por la URL real del dashboard
            });
        } else {
            alert('Por favor ingresa un correo y contraseña válidos.');
        }
        
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Llamar a la función de inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initLoginModal();
});