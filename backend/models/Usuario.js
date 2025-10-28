const { pool } = require('../config/database');

class Usuario {
    // Crear usuario
    static async crear(usuarioData) {
        const {
            nombre, apellido, correo, contrasenia, genero, 
            telefono, pais, ciudad
        } = usuarioData;
        
        const query = `
            INSERT INTO Usuario (nombre, apellido, correo, contrasenia, genero, telefono, pais, ciudad, fecha_registro)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        const [result] = await pool.execute(query, [
            nombre, apellido, correo, contrasenia, genero, telefono, pais, ciudad
        ]);
        
        return result.insertId;
    }

    // Obtener usuario por email
    static async obtenerPorEmail(correo) {
        const query = 'SELECT * FROM Usuario WHERE correo = ?';
        const [rows] = await pool.execute(query, [correo]);
        return rows[0];
    }

    // Obtener usuario por ID
    static async obtenerPorId(id_usuario) {
        const query = `
            SELECT u.*, r.nombre as rol 
            FROM Usuario u 
            LEFT JOIN UsuarioRol ur ON u.id_usuario = ur.id_usuario 
            LEFT JOIN Rol r ON ur.id_rol = r.id_rol 
            WHERE u.id_usuario = ?
        `;
        const [rows] = await pool.execute(query, [id_usuario]);
        return rows[0];
    }

    // Actualizar usuario
    static async actualizar(id_usuario, datosActualizados) {
        const campos = Object.keys(datosActualizados);
        const valores = Object.values(datosActualizados);
        
        const setClause = campos.map(campo => `${campo} = ?`).join(', ');
        const query = `UPDATE Usuario SET ${setClause} WHERE id_usuario = ?`;
        
        const [result] = await pool.execute(query, [...valores, id_usuario]);
        return result.affectedRows > 0;
    }
}

module.exports = Usuario;