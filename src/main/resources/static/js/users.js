class UserManager {
    constructor() {
        this.apiUrl = 'http://localhost:8080/api/usuarios';
        this.initializeEventListeners();
        this.loadUsers();
    }

    initializeEventListeners() {
        document.getElementById('btnNewUser').addEventListener('click', () => {
            this.showUserModal();
        });

        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });
    }

    async loadUsers() {
        try {
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`Error HTTP! estado: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.displayUsers(result.data);
            } else {
                throw new Error(result.message || 'Error al cargar usuarios');
            }
        } catch (error) {
            this.showNotification('Error al cargar usuarios: ' + error.message, 'error');
        }
    }

    displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${this.escapeHtml(user.nombre)}</td>
                <td>${this.escapeHtml(user.email)}</td>
                <td><span class="badge ${user.rol === 'Cliente' ? 'bg-primary' : 'bg-success'}">${user.rol}</span></td>
                <td>${user.fechaCreacion ? new Date(user.fechaCreacion).toLocaleString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-2" onclick="userManager.editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="userManager.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    showUserModal(userData = null) {
        const form = document.getElementById('userForm');
        form.reset();

        if (userData) {
            document.getElementById('userId').value = userData.id;
            document.getElementById('nombre').value = userData.nombre;
            document.getElementById('email').value = userData.email;
            document.getElementById('rol').value = userData.rol;
            document.getElementById('modalTitle').textContent = 'Editar Usuario';
            document.getElementById('password').required = false;
        } else {
            document.getElementById('userId').value = '';
            document.getElementById('modalTitle').textContent = 'Nuevo Usuario';
            document.getElementById('password').required = true;
        }

        const modal = document.getElementById('userModal');
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    async saveUser() {
        const form = document.getElementById('userForm');
        const userId = document.getElementById('userId').value;
        
        const userData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            rol: document.getElementById('rol').value
        };

        const password = document.getElementById('password').value;
        if (password) {
            userData.contraseña = password;
        }

        try {
            let response;
            if (userId) {
                // Para actualización
                response = await fetch(`${this.apiUrl}/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
            } else {
                // Para creación
                response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
            }

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `Error HTTP! estado: ${response.status}`);
            }

            this.showNotification(
                result.message || (userId ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito'),
                'success'
            );
            
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            this.loadUsers();
        } catch (error) {
            this.showNotification('Error: ' + error.message, 'error');
        }
    }

    async editUser(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `Error HTTP! estado: ${response.status}`);
            }

            this.showUserModal(result.data);
        } catch (error) {
            this.showNotification('Error al cargar el usuario: ' + error.message, 'error');
        }
    }

    async deleteUser(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `Error HTTP! estado: ${response.status}`);
            }

            this.showNotification(result.message || 'Usuario eliminado con éxito', 'success');
            this.loadUsers();
        } catch (error) {
            this.showNotification('Error al eliminar el usuario: ' + error.message, 'error');
        }
    }

    showNotification(message, type) {
        const alertContainer = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${this.escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

let userManager;
document.addEventListener('DOMContentLoaded', () => {
    userManager = new UserManager();
});