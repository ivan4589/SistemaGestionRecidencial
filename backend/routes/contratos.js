const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

const mantenimientoCampos = new Set([
    'id_residencia',
    'id_usuario',
    'titulo',
    'descripcion',
    'estado',
    'programado_para',
    'completado_en'
]);

router.get('/', async (_req, res) => {
    try {
        const [tareas] = await pool.execute(`
            SELECT m.*, r.nombre AS residencia,
                   CONCAT(u.nombre, ' ', u.apellido) AS responsable
            FROM Mantenimiento m
            LEFT JOIN Residencia r ON m.id_residencia = r.id_residencia
            LEFT JOIN Usuario u ON m.id_usuario = u.id_usuario
            ORDER BY m.creado_en DESC
        `);

        res.json(tareas);
    } catch (error) {
        console.error('Error listando mantenimientos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { id_residencia, id_usuario, titulo, descripcion, programado_para } = req.body;

        if (!id_residencia || !titulo) {
            return res.status(400).json({ error: 'La residencia y el título son obligatorios' });
        }

        const [result] = await pool.execute(`
            INSERT INTO Mantenimiento (
                id_residencia, id_usuario, titulo, descripcion,
                estado, programado_para
            ) VALUES (?, ?, ?, ?, 'Pendiente', ?)
        `, [
            id_residencia,
            id_usuario || null,
            titulo,
            descripcion || null,
            programado_para || null
        ]);

        res.status(201).json({
            message: 'Solicitud de mantenimiento registrada',
            id_mantenimiento: result.insertId
        });
    } catch (error) {
        console.error('Error creando mantenimiento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};

        Object.entries(req.body).forEach(([field, value]) => {
            if (mantenimientoCampos.has(field) && value !== undefined) {
                updates[field] = value;
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron campos válidos para actualizar' });
        }

        const setClause = Object.keys(updates)
            .map(field => `${field} = ?`)
            .join(', ');

        const [result] = await pool.execute(
            `UPDATE Mantenimiento SET ${setClause} WHERE id_mantenimiento = ?`,
            [...Object.values(updates), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Registro de mantenimiento no encontrado' });
        }

        res.json({ message: 'Mantenimiento actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando mantenimiento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.patch('/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({ error: 'Debe proporcionar un estado' });
        }

        const [result] = await pool.execute(
            `UPDATE Mantenimiento SET estado = ?, completado_en = CASE WHEN ? = 'Completado' THEN NOW() ELSE completado_en END
             WHERE id_mantenimiento = ?`,
            [estado, estado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Registro de mantenimiento no encontrado' });
        }

        res.json({ message: 'Estado de mantenimiento actualizado' });
    } catch (error) {
        console.error('Error cambiando estado de mantenimiento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
