const API_URL = 'http://localhost:5000/api';

// Cargar propiedades al iniciar la página
document.addEventListener('DOMContentLoaded', async function() {
    await cargarResidencias();
});

async function cargarResidencias() {
    try {
        const response = await fetch(`${API_URL}/residencias`);
        const residencias = await response.json();
        
        const tbody = document.getElementById('residencias-body');
        tbody.innerHTML = '';
        
        residencias.forEach(residencia => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${residencia.id_residencia}</td>
                <td>${residencia.nombre}</td>
                <td>${residencia.piso}</td>
                <td>${residencia.tipo}</td>
                <td>$${residencia.precio_base}</td>
                <td>${residencia.disponible ? 'Disponible' : 'Ocupada'}</td>
                <td>${residencia.residentes_actuales || 0}</td>
                <td>
                    <button class="btn-editar" onclick="editarResidencia(${residencia.id_residencia})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarResidencia(${residencia.id_residencia})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error cargando residencias:', error);
    }
}