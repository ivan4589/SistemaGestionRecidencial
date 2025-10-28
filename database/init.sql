-- Crear base de datos
CREATE DATABASE IF NOT EXISTS sistema_residencial;
USE sistema_residencial;

-- Tabla de Roles
CREATE TABLE Rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de Usuarios
CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasenia VARCHAR(255) NOT NULL,
    genero ENUM('Masculino','Femenino','Otro'),
    telefono VARCHAR(255),
    pais VARCHAR(50),
    ciudad VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pin_generado VARCHAR(6)
);

-- Tabla de Residencias
CREATE TABLE Residencia (
    id_residencia INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    piso INT,
    tipo VARCHAR(50),
    descripcion TEXT,
    precio_base DECIMAL(12,2),
    disponible BOOLEAN DEFAULT true
);

-- Tabla de relación Usuario-Rol
CREATE TABLE UsuarioRol (
    id_usuario INT,
    id_rol INT,
    PRIMARY KEY (id_usuario, id_rol),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
);

-- Tabla de relación Usuario-Residencia
CREATE TABLE UsuarioResidencia (
    id_residencia INT,
    id_usuario INT,
    PRIMARY KEY (id_usuario, id_residencia),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_residencia) REFERENCES Residencia(id_residencia)
);

-- Tabla de Contratos de Alquiler
CREATE TABLE ContratoAlquiler (
    id_contrato INT AUTO_INCREMENT PRIMARY KEY,
    id_residencia INT,
    id_usuario INT,
    fecha_inicio DATE,
    fecha_fin DATE,
    monto_mensual DECIMAL(12,2),
    estado VARCHAR(30),
    contrato_digital VARCHAR(255),
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_residencia) REFERENCES Residencia(id_residencia),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- Tabla de Áreas Comunes
CREATE TABLE AreaComun (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    costo_por_hora DECIMAL(10,2),
    aforo INT,
    activo BOOLEAN DEFAULT true
);

-- Tabla de Reservas
CREATE TABLE Reserva (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_area INT,
    id_usuario INT,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    estado VARCHAR(30),
    FOREIGN KEY (id_area) REFERENCES AreaComun(id_area),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- Insertar datos iniciales

-- Roles
INSERT INTO Rol (nombre) VALUES 
('Administrador'),
('Residente'),
('Personal');

-- Usuario administrador por defecto (contraseña: admin123)
INSERT INTO Usuario (nombre, apellido, correo, contrasenia, genero, telefono, pais, ciudad) VALUES 
('Admin', 'Sistema', 'admin@sistema.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Masculino', '+1234567890', 'Perú', 'Lima');

-- Asignar rol de administrador
INSERT INTO UsuarioRol (id_usuario, id_rol) VALUES (1, 1);

-- Residencias de ejemplo
INSERT INTO Residencia (nombre, piso, tipo, descripcion, precio_base, disponible) VALUES 
('Departamento 101', 1, 'Departamento', 'Amplio departamento de 3 habitaciones', 1500.00, true),
('Departamento 201', 2, 'Departamento', 'Departamento con vista al mar', 1800.00, true),
('Departamento 301', 3, 'Penthouse', 'Penthouse de lujo con terraza', 2500.00, true);

-- Áreas comunes
INSERT INTO AreaComun (nombre, costo_por_hora, aforo, activo) VALUES 
('Sala de Eventos', 50.00, 100, true),
('Piscina', 30.00, 50, true),
('Gimnasio', 20.00, 25, true),
('Sala de Reuniones', 25.00, 15, true);