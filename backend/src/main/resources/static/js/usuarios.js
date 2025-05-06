document.addEventListener('DOMContentLoaded', function () {
 
    const usersTableBody = document.getElementById('usersTableBody');
    const userForm = document.getElementById('userForm');
    const userModal = new bootstrap.Modal(document.getElementById('userModal'));
    const searchInput = document.querySelector('.search-input');


    let users = [
        {
            id_usuario: 1,
            nombre: 'Ana Martínez',
            email: 'ana.martinez@agencia.com',
            rol: 'Admin',
            fecha_creacion: '2023-01-15'
        },
        {
            id_usuario: 2,
            nombre: 'Carlos Ruiz',
            email: 'carlos.ruiz@agencia.com',
            rol: 'Creativo',
            fecha_creacion: '2023-02-10'
        },
        {
            id_usuario: 3,
            nombre: 'María López',
            email: 'maria.lopez@agencia.com',
            rol: 'Creativo',
            fecha_creacion: '2023-03-05'
        },
        {
            id_usuario: 4,
            nombre: 'Alberto Sánchez',
            email: 'alberto.sanchez@agencia.com',
            rol: 'Creativo',
            fecha_creacion: '2023-04-20'
        },
        {
            id_usuario: 5,
            nombre: 'Laura Gómez',
            email: 'laura.gomez@agencia.com',
            rol: 'Creativo',
            fecha_creacion: '2023-05-12'
        }
    ];


    document.getElementById('btnNewUser').addEventListener('click', () => showUserModal());
    userForm.addEventListener('submit', handleUserSubmit);
    searchInput.addEventListener('input', filterUsers);


    renderUsers();


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

    function getUserInitials(name) {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    function getRolClass(rol) {
        switch (rol) {
            case 'Admin': return 'bg-purple text-white';
            case 'Creativo': return 'bg-blue text-white';
            case 'Editor': return 'bg-amber text-white';
            default: return 'bg-gray-200';
        }
    }

    function showUserModal(userId = null) {
        userForm.reset();
        document.getElementById('userId').value = '';

        if (userId) {
            const user = users.find(u => u.id_usuario === userId);
            if (user) {
                document.getElementById('userId').value = user.id_usuario;
                document.getElementById('nombre').value = user.nombre;
                document.getElementById('email').value = user.email;
                document.getElementById('rol').value = user.rol;
                document.getElementById('modalTitle').textContent = 'Editar Usuario';
                document.getElementById('password').required = false;
            }
        } else {
            document.getElementById('modalTitle').textContent = 'Nuevo Usuario';
            document.getElementById('password').required = true;
        }

        userModal.show();
    }

    function handleUserSubmit(e) {
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

        if (userId) {
            const index = users.findIndex(u => u.id_usuario == userId);
            if (index !== -1) {
                users[index] = { ...users[index], ...userData };
                showAlert('Usuario actualizado con exito', 'success');
            }
        } else {
            const newId = users.length > 0 ? Math.max(...users.map(u => u.id_usuario)) + 1 : 1;
            const newUser = {
                id_usuario: newId,
                ...userData,
                fecha_creacion: new Date().toISOString().split('T')[0]
            };
            users.push(newUser);
            showAlert('Usuario creado con exito', 'success');
        }

        userModal.hide();
        renderUsers();
        searchInput.value = ''; 
    }

    function filterUsers() {
        const searchTerm = searchInput.value?.toLowerCase().trim();

        if (!searchTerm) {
            renderUsers(); 
            return;
        }

        const filtered = users.filter(user =>
            user.nombre.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.rol.toLowerCase().includes(searchTerm) ||
            user.id_usuario.toString().includes(searchTerm)
        );

        renderUsers(filtered);
    }

    function formatDate(dateStr) {
        return dateStr.split('-').reverse().join('/');
    }

    function showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertContainer.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }


    window.editUser = function (userId) {
        showUserModal(userId);
    };

    window.deleteUser = function (userId) {
        if (confirm('¿Esta seguro de que desea eliminar este usuario?')) {
            users = users.filter(user => user.id_usuario !== userId);
            renderUsers();
            showAlert('Usuario eliminado con exito', 'success');
        }
    };
});
