// auth.js - Maneja el registro y login de usuarios

document.addEventListener('DOMContentLoaded', () => {
    // Registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            try {
                const res = await fetch('/api/auth/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: name, correo: email, contrasena: password })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Registro exitoso. Ahora puedes iniciar sesión.');
                    window.location.href = 'login.html';
                } else {
                    alert(data.error || 'Error en el registro.');
                }
            } catch (err) {
                alert('Error de conexión con el servidor.');
            }
        });
    }

    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo: email, contrasena: password })
                });
                const data = await res.json();
                if (res.ok) {
                    // Guardar token y datos de usuario por separado
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify({
                        idUsuario: data.idUsuario,
                        tipoUsuario: data.tipoUsuario,
                        nombre: data.nombre
                    }));
                    if (data.tipoUsuario === 'psicologo') {
                        window.location.href = 'dashboard_psicologo.html';
                    } else {
                        window.location.href = 'dashboard_paciente.html';
                    }
                } else {
                    alert(data.error || 'Error en el login.');
                }
            } catch (err) {
                alert('Error de conexión con el servidor.');
            }
        });
    }
});
