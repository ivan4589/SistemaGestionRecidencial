const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Importar rutas
const authRoutes = require('./routes/auth');
const usuarioRoutes = require('./routes/usuarios');
const residenciaRoutes = require('./routes/residencias');
const contratoRoutes = require('./routes/contratos');
const servicioRoutes = require('./routes/servicios');
const areaComunRoutes = require('./routes/areasComunes');
const mantenimientoRoutes = require('./routes/mantenimiento');
const solicitudRoutes = require('./routes/solicitudes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/residencias', residenciaRoutes);
app.use('/api/contratos', contratoRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/areas-comunes', areaComunRoutes);
app.use('/api/mantenimiento', mantenimientoRoutes);
app.use('/api/solicitudes', solicitudRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend del Sistema Residencial funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Inicializar servidor
const startServer = async () => {
    const dbConnected = await testConnection();
    if (dbConnected) {
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`📊 Panel: http://localhost:${PORT}/api/test`);
        });
    } else {
        console.log('❌ No se pudo iniciar el servidor por error en BD');
        process.exit(1);
    }
};

startServer();  