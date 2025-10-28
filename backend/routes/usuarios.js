const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

const usuarioFields = new Set([
    'nombre',
    'apellido',
    'correo',
    'contrasenia',
    'genero',
    'telefono',
    'pais',
    'ciudad',
    'pin_generado'
]);

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.genero, u.telefono,
                   u.pais, u.ciudad, u.fecha_registro,
                   GROUP_CONCAT(DISTINCT r.nombre ORDER BY r.nombre) AS roles
            FROM Usuario u
            LEFT JOIN UsuarioRol ur ON u.id_usuario = ur.id_usuario
            LEFT JOIN Rol r ON ur.id_rol = r.id_rol
            GROUP BY u.id_usuario
            ORDER BY u.fecha_registro DESC
        `);

        const usuarios = rows.map(row => ({
            ...row,
            roles: row.roles ? row.roles.split(',') : []
        }));

        res.json(usuarios);
    } catch (error) {
        console.error('Error listando usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/roles', async (_req, res) => {
    try {
        const [roles] = await pool.execute('SELECT id_rol, nombre FROM Rol ORDER BY nombre');
        res.json(roles);
    } catch (error) {
        console.error('Error obteniendo roles:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [usuarios] = await pool.execute(`
            SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.genero, u.telefono,
                   u.pais, u.ciudad, u.fecha_registro,
                   GROUP_CONCAT(DISTINCT r.nombre ORDER BY r.nombre) AS roles
            FROM Usuario u
            LEFT JOIN UsuarioRol ur ON u.id_usuario = ur.id_usuario
            LEFT JOIN Rol r ON ur.id_rol = r.id_rol
            WHERE u.id_usuario = ?
            GROUP BY u.id_usuario
        `, [id]);

        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const [residencias] = await pool.execute(`
            SELECT r.id_residencia, r.nombre, r.piso, r.tipo
            FROM Residencia r
            INNER JOIN UsuarioResidencia ur ON r.id_residencia = ur.id_residencia
            WHERE ur.id_usuario = ?
        `, [id]);

        res.json({
            ...usuarios[0],
            roles: usuarios[0].roles ? usuarios[0].roles.split(',') : [],
            residencias
        });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};

        Object.entries(req.body).forEach(([field, value]) => {
            if (usuarioFields.has(field) && value !== undefined) {
                updates[field] = value;
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron campos válidos para actualizar' });
        }

        const setClause = Object.keys(updates)
            .map(field => `${field} = ?`)
            .join(', ');

        const values = [...Object.values(updates), id];
        const [result] = await pool.execute(`UPDATE Usuario SET ${setClause} WHERE id_usuario = ?`, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/:id/roles', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_rol } = req.body;

        if (!id_rol) {
            return res.status(400).json({ error: 'El id_rol es obligatorio' });
        }

        await pool.execute(
            'INSERT IGNORE INTO UsuarioRol (id_usuario, id_rol) VALUES (?, ?)',
            [id, id_rol]
        );

        res.status(201).json({ message: 'Rol asignado al usuario' });
    } catch (error) {
        console.error('Error asignando rol:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.delete('/:id/roles/:idRol', async (req, res) => {
    try {
        const { id, idRol } = req.params;

        const [result] = await pool.execute(
            'DELETE FROM UsuarioRol WHERE id_usuario = ? AND id_rol = ?',
            [id, idRol]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Rol o usuario no encontrados' });
        }

        res.json({ message: 'Rol eliminado del usuario' });
    } catch (error) {
        console.error('Error eliminando rol:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;