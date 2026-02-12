const fs = require('fs/promises')

const path = './pacientes.json';

const readPatients = async () => {
    try {
            const data = await fs.readFile(path, 'utf8');
            return JSON.parse(data);
    } 
    catch (error) {
            return [];
    }
}

const savePatient = async (newPatient) => {
    try {
        const patients = await readPatients()
        const exists = patients.some(p => p.cedula === newPatient.cedula)
        if (exists) {
            return false;
        }
        patients.push(newPatient)
        await fs.writeFile(path, JSON.stringify(patients, null, 2));
        return true;

    } catch (error) {
        console.error("Error:", error);
        return false;
    }
};

const updatePatient = async (cedula, updatedPatient) => {
    try {
        const patients = await readPatients()
        const index = patients.findIndex(p => p.cedula === cedula)
        if (index !== -1) {
            const sanitizedPatient = Object.fromEntries(Object.entries(updatedPatient).filter(([_, value]) => value !== undefined))
            patients[index] = { ...patients[index], ...sanitizedPatient }
            await fs.writeFile(path, JSON.stringify(patients, null, 2))
            return patients[index]
        }
        return false;
    } catch(error) {
        console.error("Error:", error);
        return false;
    }
}

const deletePatient = async (cedula) => {
    try {
        const patients = await readPatients()
        const index = patients.findIndex(p => p.cedula === cedula)
        if (index !== -1) {
            patients.splice(index, 1)
            await fs.writeFile(path, JSON.stringify(patients, null, 2));
            return true;
        }
        return false;
    } catch(error) {
        console.error("Error:", error);
        return false;
    }
}

module.exports = {
    readPatients, 
    savePatient,
    updatePatient,
    deletePatient
}