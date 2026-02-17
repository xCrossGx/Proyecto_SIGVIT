/*CREATE TABLE IF NOT EXISTS usuarios (
            uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            username CITEXT UNIQUE NOT NULL,
            email CITEXT UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            cedula VARCHAR(20) UNIQUE NOT NULL,
            nombre VARCHAR(100) NOT NULL,
            apellido VARCHAR(100) NOT NULL,
            fecha_registro timestamp DEFAULT CURRENT_TIMESTAMP
        );
*/

export interface CreateUsuario {
    username: string;
    email: string;
    password: string;
    cedula: string;
    nombre: string;
    apellido: string;
}