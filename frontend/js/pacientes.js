// js/pacientes.js
// Renderiza la lista de pacientes reales en el dashboard del psicólogo

document.addEventListener('DOMContentLoaded', () => {
  const listaPacientes = document.getElementById('listaPacientesPsicologo');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user || user.tipoUsuario !== 'psicologo') {
    // Redirigir si no es psicólogo autenticado
    window.location.href = 'login.html';
    return;
  }

  fetch('/api/citas/pacientes/psicologo', {
    headers: {
      'Authorization': token
    }
  })
    .then(res => res.json())
    .then(pacientes => {
      listaPacientes.innerHTML = '';
      if (pacientes.length === 0) {
        listaPacientes.innerHTML = '<li>No hay pacientes asignados.</li>';
        return;
      }
      pacientes.forEach(paciente => {
        const li = document.createElement('li');
        li.className = 'paciente-item';
        li.innerHTML = `
          <strong>${paciente.nombre}</strong><br>
          <small>${paciente.correo}</small>
        `;
        listaPacientes.appendChild(li);
      });
    })
    .catch(() => {
      listaPacientes.innerHTML = '<li>Error al cargar pacientes.</li>';
    });
});
