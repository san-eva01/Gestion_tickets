document.addEventListener('DOMContentLoaded', function () {
    const usersTableBody = document.getElementById('usersTableBody');
    const userForm = document.getElementById('userForm');
    const userModal = new bootstrap.Modal(document.getElementById('userModal'));
    const searchInput = document.querySelector('.search-input');

    // URL base de tu API (ajusta según tu configuración)
    const API_BASE_URL = 'https://gestiontickets-production.up.railway.app/api/usuarios';
    
    // Variable para almacenar los usuarios
    let users = [];

    document.getElementById('btnNewUser').addEventListener('click', () => showUserModal());
    userForm.addEventListener('submit', handleUserSubmit);
    searchInput.addEventListener('input', filterUsers);

    // Cargar usuarios al iniciar
    fetchUsers();

    // Función utilitaria para manejar respuestas API
    async function handleApiResponse(response) {
        const contentType = response.headers.get('content-type');
        const responseText = await response.text();
        
        if (!response.ok) {
            try {
                // Intenta parsear como JSON si es posible
                const errorData = JSON.parse(responseText);
                throw new Error(errorData.message || errorData.error || 'Error en la solicitud');
            } catch {
                // Si no es JSON válido, usa el texto plano
                throw new Error(responseText || 'Error en la solicitud');
            }
        }
        
        if (contentType && contentType.includes('application/json')) {
            return JSON.parse(responseText);
        }
        
        return responseText;
    }

    // Función para obtener usuarios desde el API
    async function fetchUsers() {
        try {
            const response = await fetch(API_BASE_URL);
            const data = await handleApiResponse(response);
            
            users = Array.isArray(data) ? data : [];
            renderUsers();
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            showAlert(`Error al cargar usuarios: ${error.message}`, 'danger');
        }
    }

    function renderUsers(filteredUsers = null) {
        const usersToRender = filteredUsers || users;
        usersTableBody.innerHTML = '';

        if (usersToRender.length === 0) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">No se encontraron usuarios que coincidan con su búsqueda</td>
                </tr>
            `;
            return;
        }

        usersToRender.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'table-row';
            row.innerHTML = `
                <td>${user.id || 'N/A'}</td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${getUserInitials(user.nombre)}</div>
                        <span>${user.nombre || 'Sin nombre'}</span>
                    </div>
                </td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="role-badge ${getRolClass(user.rol)}">${user.rol || 'Sin rol'}</span></td>
                <td>${formatDate(user.fechaCreacion)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
    }

    function getUserInitials(name) {
        if (!name) return 'NN';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
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

    async function showUserModal(userId = null) {
        userForm.reset();
        document.getElementById('userId').value = '';
        document.getElementById('password').value = '';

        if (userId) {
            try {
                const response = await fetch(`${API_BASE_URL}/${userId}`);
                const user = await handleApiResponse(response);
                
                document.getElementById('userId').value = user.id;
                document.getElementById('nombre').value = user.nombre || '';
                document.getElementById('email').value = user.email || '';
                document.getElementById('rol').value = user.rol || '';
                document.getElementById('modalTitle').textContent = 'Editar Usuario';
                document.getElementById('password').required = false;
                document.getElementById('password').placeholder = 'Dejar en blanco para no cambiar';
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                showAlert(`Error al cargar usuario: ${error.message}`, 'danger');
                return;
            }
        } else {
            document.getElementById('modalTitle').textContent = 'Nuevo Usuario';
            document.getElementById('password').required = true;
            document.getElementById('password').placeholder = 'Contraseña requerida';
        }

        userModal.show();
    }

    async function handleUserSubmit(e) {
        e.preventDefault();

        const userId = document.getElementById('userId').value;
        const userData = {
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            rol: document.getElementById('rol').value
        };

        const password = document.getElementById('password').value;
        if (password) {
            userData.contrasena = password;
        }

        // Validación básica
        if (!userData.nombre || !userData.email || !userData.rol) {
            showAlert('Por favor complete todos los campos requeridos', 'warning');
            return;
        }

        try {
            let response;
            if (userId) {
                // Actualizar usuario existente
                response = await fetch(`${API_BASE_URL}/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            } else {
                // Crear nuevo usuario
                response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            }

            const result = await handleApiResponse(response);
            
            showAlert(userId ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito', 'success');
            userModal.hide();
            await fetchUsers(); // Recargar la lista de usuarios
            searchInput.value = '';
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            showAlert(error.message || 'Ocurrió un error al procesar la solicitud', 'danger');
        }
    }

    function filterUsers() {
        const searchTerm = searchInput.value?.toLowerCase().trim();

        if (!searchTerm) {
            renderUsers();
            return;
        }

        const filtered = users.filter(user =>
            (user.nombre && user.nombre.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm)) ||
            (user.rol && user.rol.toLowerCase().includes(searchTerm)) ||
            (user.id && user.id.toString().includes(searchTerm))
        );

        renderUsers(filtered);
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        
        try {
            // Manejar diferentes formatos de fecha
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return dateStr.split('-').reverse().join('/');
            }
            return date.toLocaleDateString('es-ES');
        } catch {
            return dateStr;
        }
    }

    function showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        
        // Limpiar alertas anteriores
        alertContainer.innerHTML = '';
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    window.editUser = function (userId) {
        showUserModal(userId);
    };

    window.deleteUser = async function (userId) {
        if (!confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${userId}`, {
                method: 'DELETE'
            });

            await handleApiResponse(response);
            showAlert('Usuario eliminado con éxito', 'success');
            await fetchUsers(); // Recargar la lista de usuarios
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            showAlert(`No se pudo eliminar el usuario: ${error.message}`, 'danger');
        }
    };
});