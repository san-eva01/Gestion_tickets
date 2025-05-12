document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const loginError = document.getElementById('loginError');
    
    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        this.querySelector('i').classList.toggle('fa-eye-slash');
        this.querySelector('i').classList.toggle('fa-eye');
    });
    
    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value;
        const password = passwordInput.value;
        
        // Conectar con el backend usando el endpoint de usuarios
        try {
            // Buscar usuario por email
            const response = await fetch('/api/usuarios/buscar?nombre=' + encodeURIComponent(email));
            
            if (!response.ok) {
                throw new Error('Error al conectar con el servidor');
            }
            
            const usuarios = await response.json();
            
            // Buscar usuario con email exacto
            const usuario = usuarios.find(u => u.email === email);
            
            if (usuario) {
                // TODO: En un entorno real, validar password con el hash
                // Por ahora simulamos que la contraseña es válida
                
                // Guardar información del usuario en localStorage
                localStorage.setItem('taskflow_user', JSON.stringify({
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,
                    avatar: usuario.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                }));
                
                localStorage.setItem('taskflow_token', 'session-' + Date.now());
                
                // Redirigir según el rol
                if (usuario.rol === 'Admin') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'creative-view.html';
                }
            } else {
                // Usuario no encontrado
                showLoginError('Credenciales inválidas');
            }
        } catch (error) {
            console.error('Error:', error);
            showLoginError('Error al conectar con el servidor');
        }
    });
    
    function showLoginError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
        
        // Clear password
        passwordInput.value = '';
        
        // Focus email
        emailInput.focus();
        
        // Hide error after 3 seconds
        setTimeout(() => {
            loginError.style.display = 'none';
        }, 3000);
    }
    
    // Check if already logged in
    if (localStorage.getItem('taskflow_token')) {
        const user = JSON.parse(localStorage.getItem('taskflow_user') || '{}');
        if (user.rol === 'Admin') {
            window.location.href = 'dashboard.html';
        } else if (user.rol === 'Creativo') {
            window.location.href = 'creative-view.html';
        }
    }
});