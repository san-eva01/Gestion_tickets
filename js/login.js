document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const loginError = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');
    const loading = document.getElementById('loading');

    // Configurar Supabase
    const supabaseUrl = 'https://onbgqjndemplsgxdaltr.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw';
    
    // Verificar que Supabase esté disponible
    if (typeof supabase === 'undefined') {
        console.error('Supabase no está cargado. Asegúrate de incluir el script antes de login.js');
        showError('Error de configuración. Por favor, recarga la página.');
        return;
    }

    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye-slash');
                icon.classList.toggle('fa-eye');
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!email || !password) {
                showError('Por favor, completa todos los campos.');
                return;
            }

            setLoading(true);
            hideError();

            try {
                // Buscar usuario en la base de datos
                const { data: users, error: dbError } = await supabaseClient
                    .from('usuario')
                    .select('*')
                    .eq('email', email)
                    .limit(1);

                if (dbError) {
                    throw new Error('Error al consultar la base de datos: ' + dbError.message);
                }

                if (!users || users.length === 0) {
                    throw new Error('Usuario no encontrado');
                }

                const user = users[0];

                // Verificar contraseña (en producción deberías usar hash)
                if (user.contrasena !== password) {
                    throw new Error('Contraseña incorrecta');
                }

                // Guardar datos del usuario en localStorage
                const userData = {
                    id: user.id_usuario,
                    name: user.nombre,
                    email: user.email,
                    role: user.rol,
                    avatar: getInitials(user.nombre)
                };

                localStorage.setItem('taskflow_user', JSON.stringify(userData));
                localStorage.setItem('taskflow_token', 'authenticated-' + Date.now());

                // Redirigir según el rol
                if (user.rol === 'Admin') {
                    window.location.href = 'dashboard.html'; // o dashboard.html
                } else if (user.rol === 'Creativo') {
                    window.location.href = 'creative-view.html';
                } else {
                    window.location.href = 'dashboard.html'; // fallback
                }

            } catch (error) {
                console.error('Error de login:', error);
                showError(error.message || 'Error al iniciar sesión');
                
                if (passwordInput) {
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            } finally {
                setLoading(false);
            }
        });
    }

    // Verificar si ya está autenticado al cargar la página
    checkExistingAuth();

    // Funciones auxiliares
    function showError(message) {
        if (loginError) {
            loginError.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
            loginError.style.display = 'block';
            
            setTimeout(() => {
                hideError();
            }, 5000);
        }
    }

    function hideError() {
        if (loginError) {
            loginError.style.display = 'none';
        }
    }

    function setLoading(isLoading) {
        if (loginBtn) {
            loginBtn.disabled = isLoading;
            const btnText = loginBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = isLoading ? 'Iniciando...' : 'Iniciar Sesión';
            }
        }
        
        if (loading) {
            loading.style.display = isLoading ? 'block' : 'none';
        }
    }

    function getInitials(name) {
        if (!name) return '??';
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    function checkExistingAuth() {
        const token = localStorage.getItem('taskflow_token');
        const userStr = localStorage.getItem('taskflow_user');
        
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role) {
                    if (user.role === 'Admin') {
                        window.location.href = 'index.html';
                    } else if (user.role === 'Creativo') {
                        window.location.href = 'creative-view.html';
                    }
                }
            } catch (error) {
                console.error('Error al parsear datos del usuario:', error);
                // Limpiar datos corruptos
                localStorage.removeItem('taskflow_token');
                localStorage.removeItem('taskflow_user');
            }
        }
    }

    // Fallback para usuarios mock (solo para desarrollo/testing)
    window.loginWithMockUser = function(email, password) {
        const mockUsers = [
            { email: 'ana.martinez@agencia.com', password: 'admin123', name: 'Ana Martínez', role: 'Admin', avatar: 'AM' },
            { email: 'carlos.ruiz@agencia.com', password: 'creative123', name: 'Carlos Ruiz', role: 'Creativo', avatar: 'CR' },
            { email: 'maria.lopez@agencia.com', password: 'creative123', name: 'María López', role: 'Creativo', avatar: 'ML' }
        ];

        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('taskflow_user', JSON.stringify({
                id: user.email === 'ana.martinez@agencia.com' ? 1 : 2,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }));

            localStorage.setItem('taskflow_token', 'mock-token-for-demo-purposes');

            if (user.role === 'Admin') {
                window.location.href = 'index.html';
            } else {
                window.location.href = 'creative-view.html';
            }
            return true;
        }
        return false;
    };
});