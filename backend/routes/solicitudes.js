const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

const solicitudCampos = new Set(['id_servicio', 'id_usuario', 'descripcion', 'estado', 'prioridad']);

router.get('/', async (_req, res) => {
    try {
        const [solicitudes] = await pool.execute(`
            SELECT s.id_solicitud, s.descripcion, s.estado, s.prioridad, s.creado_en, s.actualizado_en,
                   sv.nombre AS servicio,
                   CONCAT(u.nombre, ' ', u.apellido) AS solicitante
            FROM SolicitudServicio s
            INNER JOIN Servicio sv ON s.id_servicio = sv.id_servicio
            INNER JOIN Usuario u ON s.id_usuario = u.id_usuario
            ORDER BY s.creado_en DESC
        `);

        res.json(solicitudes);
    } catch (error) {
        console.error('Error listando solicitudes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [solicitudes] = await pool.execute(`
            SELECT s.*, sv.nombre AS servicio,
                   CONCAT(u.nombre, ' ', u.apellido) AS solicitante
            FROM SolicitudServicio s
            INNER JOIN Servicio sv ON s.id_servicio = sv.id_servicio
            INNER JOIN Usuario u ON s.id_usuario = u.id_usuario
            WHERE s.id_solicitud = ?
        `, [id]);

        if (solicitudes.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        res.json(solicitudes[0]);
    } catch (error) {
        console.error('Error obteniendo solicitud:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { id_servicio, id_usuario, descripcion, prioridad } = req.body;

        if (!id_servicio || !id_usuario || !descripcion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const [result] = await pool.execute(`
            INSERT INTO SolicitudServicio (id_servicio, id_usuario, descripcion, prioridad)
            VALUES (?, ?, ?, ?)
        `, [id_servicio, id_usuario, descripcion, prioridad || 'Media']);

        res.status(201).json({
            message: 'Solicitud registrada correctamente',
            id_solicitud: result.insertId
        });
    } catch (error) {
        console.error('Error creando solicitud:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};

        Object.entries(req.body).forEach(([field, value]) => {
            if (solicitudCampos.has(field) && value !== undefined) {
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
            `UPDATE SolicitudServicio SET ${setClause} WHERE id_solicitud = ?`,
            [...Object.values(updates), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        res.json({ message: 'Solicitud actualizada correctamente' });
    } catch (error) {
        console.error('Error actualizando solicitud:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.patch('/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({ error: 'Debe indicar el nuevo estado' });
        }

        const [result] = await pool.execute(
            'UPDATE SolicitudServicio SET estado = ?, actualizado_en = NOW() WHERE id_solicitud = ?',
            [estado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        res.json({ message: 'Estado de la solicitud actualizado' });
    } catch (error) {
        console.error('Error cambiando estado de solicitud:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;