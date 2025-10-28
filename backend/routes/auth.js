const express = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { pool } = require('../config/database');

const router = express.Router();

// Registro de usuario
router.post('/registro', async (req, res) => {
    try {
        const { nombre, apellido, correo, contrasenia, genero, telefono, pais, ciudad } = req.body;

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.obtenerPorEmail(correo);
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Hash de la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contrasenia, saltRounds);

        // Crear usuario
        const usuarioData = {
            nombre, apellido, correo, 
            contrasenia: hashedPassword, 
            genero, telefono, pais, ciudad
        };

        const userId = await Usuario.crear(usuarioData);

        // Asignar rol por defecto (Residente)
        await pool.execute(
            'INSERT INTO UsuarioRol (id_usuario, id_rol) VALUES (?, ?)',
            [userId, 2] // 2 = Rol de Residente
        );

        res.status(201).json({ 
            message: 'Usuario registrado exitosamente',
            id_usuario: userId 
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { correo, contrasenia } = req.body;

        // Buscar usuario
        const usuario = await Usuario.obtenerPorEmail(correo);
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const contraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
        if (!contraseniaValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Obtener información completa del usuario
        const usuarioCompleto = await Usuario.obtenerPorId(usuario.id_usuario);

        res.json({
            message: 'Login exitoso',
            usuario: {
                id_usuario: usuarioCompleto.id_usuario,
                nombre: usuarioCompleto.nombre,
                apellido: usuarioCompleto.apellido,
                correo: usuarioCompleto.correo,
                rol: usuarioCompleto.rol,
                pais: usuarioCompleto.pais,
                ciudad: usuarioCompleto.ciudad
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;