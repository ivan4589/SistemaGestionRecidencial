const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Obtener todas las residencias disponibles
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT r.*, 
                   COUNT(ur.id_usuario) as residentes_actuales
            FROM Residencia r
            LEFT JOIN UsuarioResidencia ur ON r.id_residencia = ur.id_residencia
            WHERE r.disponible = true
            GROUP BY r.id_residencia
        `;
        
        const [residencias] = await pool.execute(query);
        res.json(residencias);
    } catch (error) {
        console.error('Error obteniendo residencias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener residencia por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT r.*, 
                   GROUP_CONCAT(DISTINCT CONCAT(u.nombre, ' ', u.apellido)) as residentes
            FROM Residencia r
            LEFT JOIN UsuarioResidencia ur ON r.id_residencia = ur.id_residencia
            LEFT JOIN Usuario u ON ur.id_usuario = u.id_usuario
            WHERE r.id_residencia = ?
            GROUP BY r.id_residencia
        `;
        
        const [residencias] = await pool.execute(query, [id]);
        
        if (residencias.length === 0) {
            return res.status(404).json({ error: 'Residencia no encontrada' });
        }
        
        res.json(residencias[0]);
    } catch (error) {
        console.error('Error obteniendo residencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Crear nueva residencia (Admin)
router.post('/', async (req, res) => {
    try {
        const { nombre, piso, tipo, descripcion, precio_base } = req.body;
        
        const query = `
            INSERT INTO Residencia (nombre, piso, tipo, descripcion, precio_base, disponible)
            VALUES (?, ?, ?, ?, ?, true)
        `;
        
        const [result] = await pool.execute(query, [nombre, piso, tipo, descripcion, precio_base]);
        
        res.status(201).json({
            message: 'Residencia creada exitosamente',
            id_residencia: result.insertId
        });
    } catch (error) {
        console.error('Error creando residencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;