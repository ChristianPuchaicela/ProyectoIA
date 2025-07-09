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
            const token = localStorage.getItem('token'); // Usar el token real
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
                    // Solo mostrar citas con estado pendiente
                    citas.filter(cita => cita.estado === 'pendiente').forEach(cita => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            ${cita.fechaCita} - Paciente: ${cita.paciente} - Motivo: ${cita.motivo || ''} - Estado: 
                            <select class="select-estado-cita">
                                <option value="pendiente" ${cita.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                                <option value="completada" ${cita.estado === 'completada' ? 'selected' : ''}>Completada</option>
                                <option value="cancelada" ${cita.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                            </select>
                            <button class="btn btn-small btn-guardar-estado">Guardar</button>
                        `;
                        li.dataset.idCita = cita.idCita;
                        listaCitasPsicologo.appendChild(li);
                    });

                    // Evento para guardar estado
                    listaCitasPsicologo.querySelectorAll('.btn-guardar-estado').forEach(btn => {
                        btn.addEventListener('click', async function() {
                            const li = this.closest('li');
                            const idCita = li.dataset.idCita;
                            const select = li.querySelector('.select-estado-cita');
                            const nuevoEstado = select.value;
                            const token = localStorage.getItem('token');
                            const res = await fetch(`/api/citas/estado/${idCita}` , {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': token
                                },
                                body: JSON.stringify({ estado: nuevoEstado })
                            });
                            if (res.ok) {
                                // Quitar la cita de la lista si ya no es pendiente
                                if (nuevoEstado !== 'pendiente') {
                                    li.remove();
                                }
                                alert('Estado actualizado');
                            } else {
                                alert('Error al actualizar estado');
                            }
                        });
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
                    // Solo mostrar citas pendientes
                    const citasPendientes = citas.filter(cita => cita.estado === 'pendiente');
                    if (citasPendientes.length === 0) {
                        listaCitasPaciente.innerHTML = '<li>No tienes citas programadas.</li>';
                        return;
                    }
                    citasPendientes.forEach((cita, idx) => {
                        const li = document.createElement('li');
                        li.className = 'appointment-item';
                        li.innerHTML = `
                            <strong>${idx === 0 ? 'Próxima cita:' : 'Cita programada:'}</strong> ${new Date(cita.fechaCita).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}<br>
                            <small>Dr. ${cita.psicologo} - ${cita.motivo || ''}</small>
                        `;
                        listaCitasPaciente.appendChild(li);
                    });
                });
        }
    }
});
