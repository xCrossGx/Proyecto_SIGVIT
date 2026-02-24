export interface Consulta {
    id: string;
    cedula_paciente: string;
    cedula_medico: string;
    descripcion: string;
    fecha_consulta: Date;
}

export interface CreateConsulta {
    cedula_paciente: string;
    cedula_medico: string;
    descripcion: string;
    fecha_consulta?: Date;
}

export interface UpdateConsulta {
    descripcion?: string;
}