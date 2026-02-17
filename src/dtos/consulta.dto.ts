export interface Consulta {
    id: string;
    cedula_paciente: string;
    cedula_medico: string;
    fecha_consulta: Date;
    descripcion: string;
}

export interface CreateConsulta {
    cedula_paciente: string;
    cedula_medico: string;
    descripcion: string;
}

export interface UpdateConsulta {
    descripcion?: string;
}