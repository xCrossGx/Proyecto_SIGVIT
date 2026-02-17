export interface CreatePaciente {
    cedula: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
}

export interface UpdatePaciente {
    nombre?: string;
    apellido?: string;
    fecha_nacimiento?: Date;
}