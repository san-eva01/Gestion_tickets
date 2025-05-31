document.addEventListener('DOMContentLoaded', function () {
    // Verifica que estamos en la página de usuarios
    const usersTable = document.getElementById('usersTableBody');
    if (!usersTable) return;  // Si no existe, termina la ejecución
    
    // Declarar todas las variables necesarias
    const usersTableBody = document.getElementById('usersTableBody');
    const searchInput = document.querySelector('.search-input');
    const userForm = document.getElementById('userForm');
    let users = [];
    let userModal;
    
    // Inicializar modal de Bootstrap
    try {
        userModal = new bootstrap.Modal(document.getElementById('userModal'));
    } catch (error) {
        console.error('Error al inicializar modal:', error);
    }
    
    // Configura Supabase (SOLO se ejecutará en usuarios.html)
    const supabaseUrl = 'https://onbgqjndemplsgxdaltr.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw';
    
    // Verificar que Supabase esté disponible globalmente
    if (typeof supabase === 'undefined') {
        console.error('Supabase no está cargado. Verifica que el script esté incluido.');
        showAlert('Error: No se puede conectar a la base de datos', 'danger');
        return;
    }
    
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    
    console.log('Supabase inicializado:', supabaseClient);
    
    // Event listeners - verificar que los elementos existan
    const btnNewUser = document.getElementById('btnNewUser');
    if (btnNewUser) {
        btnNewUser.addEventListener('click', () => showUserModal());
    }
    
    if (userForm) {
        userForm.addEventListener('submit', handleUserSubmit);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
    }

    // Cargar usuarios al iniciar
    fetchUsers();

    // Función para obtener usuarios desde Supabase
    async function fetchUsers() {
        try {
            const { data, error } = await supabaseClient
                .from('usuario')
                .select('*')
                .order('id_usuario', { ascending: true });

            if (error) throw error;

            users = data || [];
            renderUsers();
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            showAlert(`Error al cargar usuarios: ${error.message}`, 'danger');
        }
    }

    function renderUsers(filteredUsers = null) {
        const usersToRender = filteredUsers || users;
        
        if (!usersTableBody) {
            console.error('Elemento usersTableBody no encontrado');
            return;
        }
        
        usersTableBody.innerHTML = '';

        if (usersToRender.length === 0) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">No se encontraron usuarios</td>
                </tr>
            `;
            return;
        }

        usersToRender.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'table-row';
            row.innerHTML = `
                <td>${user.id_usuario}</td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${getUserInitials(user.nombre)}</div>
                        <span>${user.nombre}</span>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="role-badge ${getRolClass(user.rol)}">${user.rol}</span></td>
                <td>${formatDate(user.fecha_creacion)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="editUser(${user.id_usuario})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteUser(${user.id_usuario})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
    }

    // Funciones auxiliares
    function getUserInitials(name) {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    function getRolClass(rol) {
        if (!rol) return 'bg-gray-200';
        switch (rol.toLowerCase()) {
            case 'admin': return 'bg-purple text-white';
            case 'creativo': return 'bg-blue text-white';
            case 'editor': return 'bg-amber text-white';
            default: return 'bg-gray-200';
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-ES');
        } catch {
            return dateStr;
        }
    }

    // Mostrar modal para nuevo/editar usuario
    async function showUserModal(userId = null) {
        if (!userForm || !userModal) {
            console.error('Form o modal no disponible');
            return;
        }
        
        userForm.reset();
        const userIdInput = document.getElementById('userId');
        const passwordInput = document.getElementById('password');
        
        if (userIdInput) userIdInput.value = '';
        if (passwordInput) passwordInput.value = '';

        if (userId) {
            try {
                const { data: user, error } = await supabaseClient
                    .from('usuario')
                    .select('*')
                    .eq('id_usuario', userId)
                    .single();

                if (error) throw error;

                const elements = {
                    userId: document.getElementById('userId'),
                    nombre: document.getElementById('nombre'),
                    email: document.getElementById('email'),
                    rol: document.getElementById('rol'),
                    modalTitle: document.getElementById('modalTitle'),
                    password: document.getElementById('password')
                };

                if (elements.userId) elements.userId.value = user.id_usuario;
                if (elements.nombre) elements.nombre.value = user.nombre;
                if (elements.email) elements.email.value = user.email;
                if (elements.rol) elements.rol.value = user.rol;
                if (elements.modalTitle) elements.modalTitle.textContent = 'Editar Usuario';
                if (elements.password) elements.password.placeholder = 'Dejar en blanco para no cambiar';
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                showAlert(`Error al cargar usuario: ${error.message}`, 'danger');
                return;
            }
        } else {
            const modalTitle = document.getElementById('modalTitle');
            const passwordInput = document.getElementById('password');
            
            if (modalTitle) modalTitle.textContent = 'Nuevo Usuario';
            if (passwordInput) passwordInput.placeholder = 'Contraseña requerida';
        }

        userModal.show();
    }

    // Manejar envío del formulario
    async function handleUserSubmit(e) {
        e.preventDefault();

        const userIdInput = document.getElementById('userId');
        const nombreInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        const rolInput = document.getElementById('rol');
        const passwordInput = document.getElementById('password');

        const userId = userIdInput ? userIdInput.value : '';
        const userData = {
            nombre: nombreInput ? nombreInput.value.trim() : '',
            email: emailInput ? emailInput.value.trim() : '',
            rol: rolInput ? rolInput.value : ''
        };

        const password = passwordInput ? passwordInput.value : '';

        // Validación
        if (!userData.nombre || !userData.email || !userData.rol) {
            showAlert('Complete todos los campos requeridos', 'warning');
            return;
        }

        try {
            if (userId) {
                // Actualizar usuario existente
                const { error } = await supabaseClient
                    .from('usuario')
                    .update(userData)
                    .eq('id_usuario', userId);

                if (error) throw error;

                // Actualizar contraseña si se proporcionó
                if (password) {
                    const { error: pwError } = await supabaseClient.auth.updateUser({
                        password: password
                    });
                    if (pwError) console.warn('Error al actualizar contraseña:', pwError);
                }

                showAlert('Usuario actualizado con éxito', 'success');
            } else {
                // Crear nuevo usuario
                if (!password) {
                    showAlert('La contraseña es requerida para nuevos usuarios', 'warning');
                    return;
                }

                // Insertar en tabla public.usuario
                const { error: dbError } = await supabaseClient
                    .from('usuario')
                    .insert({
                        nombre: userData.nombre,
                        email: userData.email,
                        rol: userData.rol,
                        contrasena: password // En producción deberías hashearla
                    });

                if (dbError) throw dbError;

                showAlert('Usuario creado con éxito', 'success');
            }

            userModal.hide();
            await fetchUsers();
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            showAlert(error.message || 'Error al procesar la solicitud', 'danger');
        }
    }

    // Filtrar usuarios
    function filterUsers() {
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filtered = users.filter(user =>
            user.nombre.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.rol.toLowerCase().includes(searchTerm) ||
            user.id_usuario.toString().includes(searchTerm)
        );
        renderUsers(filtered);
    }

    // Mostrar alertas
    function showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) {
            console.error('Alert container no encontrado');
            return;
        }
        
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        setTimeout(() => alertContainer.innerHTML = '', 5000);
    }

    // Funciones globales para los botones
    window.editUser = function (userId) {
        showUserModal(userId);
    };

    window.deleteUser = async function (userId) {
        if (!confirm('¿Eliminar este usuario permanentemente?')) return;

        try {
            // Eliminar de la tabla
            const { error } = await supabaseClient
                .from('usuario')
                .delete()
                .eq('id_usuario', userId);

            if (error) throw error;

            showAlert('Usuario eliminado', 'success');
            await fetchUsers();
        } catch (error) {
            console.error('Error al eliminar:', error);
            showAlert('Error al eliminar usuario', 'danger');
        }
    };
});