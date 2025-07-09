// citas.js - Lógica para agendar y mostrar citas

document.addEventListener('DOMContentLoaded', () => {
    // Mostrar psicólogos en el formulario de agendar cita
    const selectPsicologo = document.getElementById('selectPsicologo');
    if (selectPsicologo) {
        fetch('/api/citas/psicologos')
            .then(res => res.json())
            .then(psicologos => {
                psicologos.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.idUsuario; // Usar idUsuario como value
                    option.textContent = p.nombre;
                    selectPsicologo.appendChild(option);
                });
            })
            .catch(err => {
                // alert('Error obteniendo psicólogos: ' + err);
            });
    }

    // Agendar cita
    const formCita = document.getElementById('formCita');
    if (formCita) {
        formCita.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('user'));
            const idPaciente = user?.idUsuario;
            const idPsicologo = selectPsicologo.value;
            const fechaCita = document.getElementById('fechaCita').value;
            const motivo = document.getElementById('motivo').value;
            const token = user?.token;
            if (!idPaciente) {
                alert('Debes iniciar sesión como paciente.');
                return;
            }
            const res = await fetch('/api/citas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ idPaciente, idPsicologo, fechaCita, motivo })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Cita agendada correctamente');
                formCita.reset();
            } else {
                alert(data.error || 'Error al agendar cita');
            }
        });
    }

    // Mostrar citas del psicólogo
    const listaCitasPsicologo = document.getElementById('listaCitasPsicologo');
    if (listaCitasPsicologo) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.tipoUsuario === 'psicologo') {
            fetch(`/api/citas/psicologo/${user.idUsuario}`)
                .then(res => res.json())
                .then(citas => {
                    listaCitasPsicologo.innerHTML = '';
                    citas.forEach(cita => {
                        const li = document.createElement('li');
                        li.textContent = `${cita.fechaCita} - Paciente: ${cita.paciente} - Motivo: ${cita.motivo || ''} - Estado: ${cita.estado}`;
                        listaCitasPsicologo.appendChild(li);
                    });
                });
        }
    }

    // Mostrar citas del paciente
    const listaCitasPaciente = document.getElementById('listaCitasPaciente');
    if (listaCitasPaciente) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.tipoUsuario === 'paciente') {
            fetch(`/api/citas/paciente/${user.idUsuario}`)
                .then(res => res.json())
                .then(citas => {
                    listaCitasPaciente.innerHTML = '';
                    citas.forEach(cita => {
                        const li = document.createElement('li');
                        li.textContent = `${cita.fechaCita} - Psicólogo: ${cita.psicologo} - Motivo: ${cita.motivo || ''} - Estado: ${cita.estado}`;
                        listaCitasPaciente.appendChild(li);
                    });
                });
        }
    }
});
