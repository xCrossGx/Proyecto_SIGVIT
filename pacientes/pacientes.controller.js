const express = require('express')
const router = express.Router()

const { readPacientes, readPaciente, createPaciente, deletePaciente } = require('./pacientes.service')

router.get('/', async (req, res) => {
    const pacientes = await readPacientes()
    res.json(pacientes)
});

router.get('/:cedula', async (req, res) => {
    const paciente = await readPaciente(req.params.cedula)
    res.json(paciente)
})

router.post('/', async (req, res) => {
    const { cedula, nombre, apellido, fechaNacimiento } = req.body
    const paciente = {
        cedula, nombre, apellido, fechaNacimiento
    }
    const result = await createPaciente(paciente)
    res.json(result)
})

/*
router.patch('/:cedula', async (req, res) => {
    const cedula = Number(req.params.cedula);
    const { nombre, apellido, fechaNacimiento } = req.body;
    
    const nuevoPaciente = {
        nombre, 
        apellido,  
        fechaNacimiento,
    };

    const result = await updatePatient(cedula, nuevoPaciente)
    if(result) {
       res.status(200).json(result)
    } else {
        res.status(204).json("El paciente no existe o hubo un error.")
    }
})*/

router.delete('/:cedula', async (req, res) => {
    const result = await deletePaciente(req.params.cedula);
    res.json(result)
})

module.exports = router