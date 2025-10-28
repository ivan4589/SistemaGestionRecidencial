const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

const servicioCampos = new Set(['nombre', 'descripcion', 'precio', 'activo']);

router.get('/', async (_req, res) => {
    try {
        const [servicios] = await pool.execute(
            'SELECT id_servicio, nombre, descripcion, precio, activo FROM Servicio ORDER BY nombre'
        );
        res.json(servicios);
    } catch (error) {
        console.error('Error listando servicios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion, precio, activo } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del servicio es obligatorio' });
        }

        const [result] = await pool.execute(
            'INSERT INTO Servicio (nombre, descripcion, precio, activo) VALUES (?, ?, ?, ?)',
            [nombre, descripcion || null, precio || 0, activo !== undefined ? !!activo : true]
        );

        res.status(201).json({
            message: 'Servicio creado correctamente',
            id_servicio: result.insertId
        });
    } catch (error) {
        console.error('Error creando servicio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};

        Object.entries(req.body).forEach(([field, value]) => {
            if (servicioCampos.has(field) && value !== undefined) {
                updates[field] = field === 'activo' ? !!value : value;
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No se enviaron campos válidos para actualizar' });
        }

        const setClause = Object.keys(updates)
            .map(field => `${field} = ?`)
            .join(', ');

        const [result] = await pool.execute(
            `UPDATE Servicio SET ${setClause} WHERE id_servicio = ?`,
            [...Object.values(updates), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        res.json({ message: 'Servicio actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando servicio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.patch('/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;

        if (activo === undefined) {
            return res.status(400).json({ error: 'Debe indicar el nuevo estado del servicio' });
        }

        const [result] = await pool.execute(
            'UPDATE Servicio SET activo = ? WHERE id_servicio = ?',
            [!!activo, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        res.json({ message: 'Estado del servicio actualizado' });
    } catch (error) {
        console.error('Error cambiando estado de servicio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;