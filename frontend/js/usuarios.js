document.addEventListener('DOMContentLoaded', function () {
    // Verifica que estamos en la página de usuarios
    const usersTable = document.getElementById('usersTableBody');
    if (!usersTable) return;

    // Elementos del DOM
    const usersTableBody = document.getElementById('usersTableBody');
    const searchInput = document.querySelector('.search-input');
    const userForm = document.getElementById('userForm');
    const confirmUserDeleteBtn = document.getElementById('confirmUserDelete');
    
    // Variables de estado
    let users = [];
    let currentUserToDelete = null;
    let userModal, deleteUserConfirmModal;

    // Configuración de Supabase
    const supabaseUrl = 'https://onbgqjndemplsgxdaltr.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    // Inicialización de modales
    try {
        userModal = new bootstrap.Modal(document.getElementById('userModal'));
        deleteUserConfirmModal = new bootstrap.Modal(
            document.getElementById('deleteUserConfirmModal'), {
                backdrop: 'static',
                keyboard: false
            }
        );
    } catch (error) {
        console.error('Error al inicializar modales:', error);
    }

    // Event listeners
    if (document.getElementById('btnNewUser')) {
        document.getElementById('btnNewUser').addEventListener('click', () => showUserModal());
    }
    
    if (userForm) {
        userForm.addEventListener('submit', handleUserSubmit);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
    }

    if (confirmUserDeleteBtn) {
        confirmUserDeleteBtn.addEventListener('click', confirmDeleteUser);
    }

    // Iniciar la aplicación
    fetchUsers();

    // Función para obtener usuarios desde Supabase
    async function fetchUsers() {
        try {
            showLoading(true);
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
        } finally {
            showLoading(false);
        }
    }

    // Renderizar la tabla de usuarios
    function renderUsers(filteredUsers = null) {
        const usersToRender = filteredUsers || users;
        
        if (!usersTableBody) return;

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
                        <button class="btn-icon delete" onclick="showDeleteConfirmation(${user.id_usuario}, '${escapeHtml(user.nombre)}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
    }

    // Mostrar modal de confirmación para eliminar
    window.showDeleteConfirmation = function(userId, userName) {
        currentUserToDelete = userId;
        document.getElementById('deleteUserId').textContent = userId;
        document.getElementById('deleteUserName').textContent = userName;
        deleteUserConfirmModal.show();
    };

    // Confirmar eliminación de usuario
    async function confirmDeleteUser() {
        if (!currentUserToDelete) return;

        try {
            showLoading(true);
            const { error } = await supabaseClient
                .from('usuario')
                .delete()
                .eq('id_usuario', currentUserToDelete);

            if (error) throw error;

            showAlert('Usuario eliminado con éxito', 'success');
            deleteUserConfirmModal.hide();
            await fetchUsers();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            showAlert(`Error al eliminar usuario: ${error.message}`, 'danger');
        } finally {
            currentUserToDelete = null;
            showLoading(false);
        }
    }

    // Mostrar modal para nuevo/editar usuario
    async function showUserModal(userId = null) {
        if (!userForm || !userModal) return;
        
        userForm.reset();
        document.getElementById('userId').value = '';
        document.getElementById('password').value = '';

        if (userId) {
            try {
                showLoading(true);
                const { data: user, error } = await supabaseClient
                    .from('usuario')
                    .select('*')
                    .eq('id_usuario', userId)
                    .single();

                if (error) throw error;

                document.getElementById('userId').value = user.id_usuario;
                document.getElementById('nombre').value = user.nombre;
                document.getElementById('email').value = user.email;
                document.getElementById('rol').value = user.rol;
                document.getElementById('modalTitle').textContent = 'Editar Usuario';
                document.getElementById('password').placeholder = 'Dejar en blanco para no cambiar';
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                showAlert(`Error al cargar usuario: ${error.message}`, 'danger');
                return;
            } finally {
                showLoading(false);
            }
        } else {
            document.getElementById('modalTitle').textContent = 'Nuevo Usuario';
            document.getElementById('password').placeholder = 'Contraseña requerida';
        }

        userModal.show();
    }

    // Manejar envío del formulario
    async function handleUserSubmit(e) {
        e.preventDefault();

        const userId = document.getElementById('userId').value;
        const userData = {
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            rol: document.getElementById('rol').value
        };
        const password = document.getElementById('password').value;

        // Validación
        if (!userData.nombre || !userData.email || !userData.rol) {
            showAlert('Complete todos los campos requeridos', 'warning');
            return;
        }

        try {
            showLoading(true);
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

                const { error: dbError } = await supabaseClient
                    .from('usuario')
                    .insert({
                        ...userData,
                        contrasena: password
                    });

                if (dbError) throw dbError;

                showAlert('Usuario creado con éxito', 'success');
            }

            userModal.hide();
            await fetchUsers();
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            showAlert(error.message || 'Error al procesar la solicitud', 'danger');
        } finally {
            showLoading(false);
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

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;
        
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        setTimeout(() => alertContainer.innerHTML = '', 5000);
    }

    function showLoading(show) {
        // Implementar lógica de loading si es necesaria
    }

    // Funciones globales
    window.editUser = function (userId) {
        showUserModal(userId);
    };


    document.querySelector('#deleteUserConfirmModal .btn-secondary').addEventListener('click', function() {
    deleteUserConfirmModal.hide();
});
});