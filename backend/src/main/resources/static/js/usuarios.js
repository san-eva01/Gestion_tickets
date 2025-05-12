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

    // Función para obtener usuarios desde el API
    async function fetchUsers() {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error('Error al obtener usuarios');
            }
            users = await response.json();
            renderUsers();
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error al cargar usuarios', 'danger');
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
                <td>${user.id}</td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${getUserInitials(user.nombre)}</div>
                        <span>${user.nombre}</span>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="role-badge ${getRolClass(user.rol)}">${user.rol}</span></td>
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

        if (userId) {
            try {
                const response = await fetch(`${API_BASE_URL}/${userId}`);
                if (!response.ok) {
                    throw new Error('Error al obtener usuario');
                }
                const user = await response.json();
                
                document.getElementById('userId').value = user.id;
                document.getElementById('nombre').value = user.nombre || '';
                document.getElementById('email').value = user.email || '';
                document.getElementById('rol').value = user.rol || '';
                document.getElementById('modalTitle').textContent = 'Editar Usuario';
                document.getElementById('password').required = false;
            } catch (error) {
                console.error('Error:', error);
                showAlert('Error al cargar usuario', 'danger');
            }
        } else {
            document.getElementById('modalTitle').textContent = 'Nuevo Usuario';
            document.getElementById('password').required = true;
        }

        userModal.show();
    }

    async function handleUserSubmit(e) {
        e.preventDefault();

        const userId = document.getElementById('userId').value;
        const userData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            rol: document.getElementById('rol').value
        };

        const password = document.getElementById('password').value;
        if (password) {
            userData.contrasena = password;
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al procesar la solicitud');
            }

            const result = await response.json();
            showAlert(userId ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito', 'success');
            userModal.hide();
            await fetchUsers(); // Recargar la lista de usuarios
            searchInput.value = '';
        } catch (error) {
            console.error('Error:', error);
            showAlert(error.message || 'Ocurrió un error', 'danger');
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
        return dateStr.split('-').reverse().join('/');
    }

    function showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
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
        if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/${userId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar usuario');
                }

                showAlert('Usuario eliminado con éxito', 'success');
                await fetchUsers(); // Recargar la lista de usuarios
            } catch (error) {
                console.error('Error:', error);
                showAlert('No se pudo eliminar el usuario', 'danger');
            }
        }
    };
});