const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

const areaCampos = new Set(['nombre', 'costo_por_hora', 'aforo', 'activo']);

router.get('/', async (_req, res) => {
    try {
        const [areas] = await pool.execute(
            'SELECT id_area, nombre, costo_por_hora, aforo, activo FROM AreaComun ORDER BY nombre'
        );
        res.json(areas);
    } catch (error) {
        console.error('Error obteniendo áreas comunes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/:id/reservas', async (req, res) => {
    try {
        const { id } = req.params;
        const [reservas] = await pool.execute(`
            SELECT r.id_reserva, r.fecha_inicio, r.fecha_fin, r.estado,
                   CONCAT(u.nombre, ' ', u.apellido) AS solicitante
            FROM Reserva r
            INNER JOIN Usuario u ON r.id_usuario = u.id_usuario
            WHERE r.id_area = ?
            ORDER BY r.fecha_inicio DESC
        `, [id]);

        res.json(reservas);
    } catch (error) {
        console.error('Error obteniendo reservas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nombre, costo_por_hora, aforo, activo } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del área es obligatorio' });
        }

        const [result] = await pool.execute(
            'INSERT INTO AreaComun (nombre, costo_por_hora, aforo, activo) VALUES (?, ?, ?, ?)',
            [nombre, costo_por_hora || 0, aforo || 0, activo !== undefined ? !!activo : true]
        );

        res.status(201).json({
            message: 'Área común creada correctamente',
            id_area: result.insertId
        });
    } catch (error) {
        console.error('Error creando área común:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};

        Object.entries(req.body).forEach(([field, value]) => {
            if (areaCampos.has(field) && value !== undefined) {
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
            `UPDATE AreaComun SET ${setClause} WHERE id_area = ?`,
            [...Object.values(updates), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Área común no encontrada' });
        }

        res.json({ message: 'Área común actualizada correctamente' });
    } catch (error) {
        console.error('Error actualizando área común:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/:id/reservas', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usuario, fecha_inicio, fecha_fin } = req.body;

        if (!id_usuario || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: 'Faltan datos para crear la reserva' });
        }

        const [solapadas] = await pool.execute(`
            SELECT COUNT(*) AS total
            FROM Reserva
            WHERE id_area = ?
              AND estado <> 'Cancelada'
              AND ((? BETWEEN fecha_inicio AND fecha_fin)
                   OR (? BETWEEN fecha_inicio AND fecha_fin)
                   OR (fecha_inicio <= ? AND fecha_fin >= ?))
        `, [id, fecha_inicio, fecha_fin, fecha_inicio, fecha_fin]);

        if (solapadas[0].total > 0) {
            return res.status(409).json({ error: 'El horario seleccionado ya está reservado' });
        }

        const [result] = await pool.execute(`
            INSERT INTO Reserva (id_area, id_usuario, fecha_inicio, fecha_fin, estado)
            VALUES (?, ?, ?, ?, 'Pendiente')
        `, [id, id_usuario, fecha_inicio, fecha_fin]);

        res.status(201).json({
            message: 'Reserva creada correctamente',
            id_reserva: result.insertId
        });
    } catch (error) {
        console.error('Error creando reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;