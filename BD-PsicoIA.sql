CREATE DATABASE PsicoIA;
GO

CREATE TABLE Usuarios (
    idUsuario INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    tipoUsuario VARCHAR(20) CHECK (tipoUsuario IN ('paciente', 'psicologo')) NOT NULL,
    fechaRegistro DATETIME DEFAULT GETDATE()
);

CREATE TABLE Predicciones (
    idPrediccion INT PRIMARY KEY IDENTITY(1,1),
    idUsuario INT NOT NULL,
    emocionDetectada VARCHAR(50) NOT NULL,
    fecha DATETIME DEFAULT GETDATE(),
    observaciones TEXT,
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario)
);

CREATE TABLE Citas (
    idCita INT PRIMARY KEY IDENTITY(1,1),
    idPaciente INT NOT NULL,
    idPsicologo INT NOT NULL,
    fechaCita DATETIME NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'completada', 'cancelada')) DEFAULT 'pendiente',
    FOREIGN KEY (idPaciente) REFERENCES Usuarios(idUsuario),
    FOREIGN KEY (idPsicologo) REFERENCES Usuarios(idUsuario)
);

CREATE TABLE DiarioEmocional (
    idEntrada INT PRIMARY KEY IDENTITY(1,1),
    idUsuario INT NOT NULL,
    fecha DATETIME DEFAULT GETDATE(),
    contenido TEXT NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario)
);

USE PsicoIA;
GO

SELECT * FROM Usuarios;

-- Verifica si esto es lo que tienes:
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Usuarios';