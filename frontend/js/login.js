const API_URL = 'http://localhost:5000/api';

async function loginUsuario(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                correo: email,
                contrasenia: password
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Guardar usuario en localStorage
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            // Redirigir según el rol
            if (data.usuario.rol === 'Administrador') {
                window.location.href = '../admin/index.html';
            } else {
                window.location.href = '../dashboard/index.html';
            }
        } else {
            alert(data.error || 'Error en el login');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    }
}

// Ejemplo de uso en tu formulario de login
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginUsuario(email, password);
});