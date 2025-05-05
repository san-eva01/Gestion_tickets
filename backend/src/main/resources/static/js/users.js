class UserManager {
    constructor() {
        // Use relative URL instead of hardcoded localhost
        this.apiUrl = '/api/usuarios';
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
                throw new Error('Error HTTP! estado: ${response.status}');
            }
            
            // Directly use the array returned by the API
            const users = await response.json();
            this.displayUsers(users);
            
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
                <td>${user.idUsuario}</td>
                <td>${this.escapeHtml(user.nombre)}</td>
                <td>${this.escapeHtml(user.email)}</td>
                <td><span class="badge ${user.rol === 'Cliente' ? 'bg-primary' : 'bg-success'}">${user.rol}</span></td>
                <td>${user.fechaCreacion ? new Date(user.fechaCreacion).toLocaleString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-2" onclick="userManager.editUser(${user.idUsuario})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="userManager.deleteUser(${user.idUsuario})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async editUser(id) {
        try {
            const response = await fetch('${this.apiUrl}/${id}');
            
            if (!response.ok) {
                throw new Error('Error HTTP! estado: ${response.status}');
            }
            
            // Directly use the user object from the API
            const user = await response.json();
            this.showUserModal(user);
            
        } catch (error) {
            this.showNotification('Error al cargar el usuario: ' + error.message, 'error');
        }
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
            userData.contraseña = password; // Match this to your entity field
        }
    
        try {
            let response;
            if (userId) {
                response = await fetch('${this.apiUrl}/${userId}', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
            } else {
                response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
            }
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error HTTP! estado: ${response.status}');
            }
    
            const result = await response.json();
            
            this.showNotification(
                userId ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito',
                'success'
            );
            
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            this.loadUsers();
        } catch (error) {
            this.showNotification('Error: ' + error.message, 'error');
        }
    }

    async deleteUser(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) throw new Error(await response.text());
            
            this.showNotification('Usuario eliminado', 'success');
            this.loadUsers();
        } catch (error) {
            this.showNotification(error.message, 'error');
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




