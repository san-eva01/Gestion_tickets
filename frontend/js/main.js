document.addEventListener('DOMContentLoaded', function() {

    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.appendChild(menuToggle);

    const sidebar = document.querySelector('.sidebar');
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('show');
    });


    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !menuToggle.contains(event.target) && window.innerWidth <= 768) {
            sidebar.classList.remove('show');
        }
    });


    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();

            localStorage.removeItem('taskflow_user');
            localStorage.removeItem('taskflow_token');
            window.location.href = 'index.html';
        });
    }


    window.showAlert = function(message, type = 'success') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.appendChild(alert);

  
        setTimeout(() => alert.remove(), 5000);
    };


    const checkAuth = function() {
     
        const user = localStorage.getItem('taskflow_user');
        const token = localStorage.getItem('taskflow_token');
        
       
        if (!user || !token) {
            window.location.href = 'index.html';
            return;
        }

     
        const userInfo = JSON.parse(user);
        const userNameElement = document.querySelector('.user-name');
        const roleBadgeElement = document.querySelector('.role-badge');
        
        if (userNameElement && userInfo) {
            userNameElement.textContent = userInfo.name;
        }
        
        if (roleBadgeElement && userInfo) {
            roleBadgeElement.textContent = userInfo.role;
        }

        // main.js
        window.currentUser = {
        name: userInfo.name,
        role: userInfo.role
        };



        handleRoleBasedNavigation(userInfo);
    };


    function handleRoleBasedNavigation(userInfo) {
        if (!userInfo) return;

        const isCreative = userInfo.role === 'Creativo';
        const currentPath = window.location.pathname;

       
        const adminOnlyPages = [
            '/dashboard.html',
            '/work-orders.html',
            '/usuarios.html',
            '/reports.html',
            '/review-deliverables.html',
            '/settings.html'
        ];

        
        const creativeOnlyPages = [
            '/creative-view.html',
            '/creative-deliverables.html',
            '/creative-calendar.html',
            '/creative-profile.html'
        ];

      
        if (isCreative) {
            let shouldRedirect = false;
            
            for (const page of adminOnlyPages) {
                if (currentPath.endsWith(page)) {
                    shouldRedirect = true;
                    break;
                }
            }
            
            if (shouldRedirect && !currentPath.includes('creative-')) {
                window.location.href = 'creative-view.html';
            }
        } 
      
        else if (!isCreative) {
            let shouldRedirect = false;
            
            for (const page of creativeOnlyPages) {
                if (currentPath.endsWith(page)) {
                    shouldRedirect = true;
                    break;
                }
            }
            
            if (shouldRedirect) {
                window.location.href = 'dashboard.html';
            }
        }
    }


    if (!window.location.pathname.endsWith('index.html')) {
        checkAuth();
    }

  
    window.formatDate = function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

  
    window.formatCurrency = function(value) {
        if (!value) return '$0';
        return '$' + parseFloat(value).toLocaleString('es-MX');
    };

    window.getStatusName = function(status) {
        const statusMap = {
            'created': 'Creado',
            'assigned': 'Asignado',
            'in-progress': 'En Proceso',
            'review': 'En Revisión',
            'approved': 'Aprobado',
            'delivered': 'Entregado/Publicado',
            'rejected': 'Rechazado'
        };
        return statusMap[status] || status;
    };


    window.getTypeName = function(type) {
        const typeMap = {
            'design': 'Diseño Gráfico',
            'web': 'Desarrollo Web',
            'video': 'Producción Audiovisual',
            'copy': 'Copywriting',
            'social': 'Pauta en Redes'
        };
        return typeMap[type] || type;
    };

   
    window.getPriorityName = function(priority) {
        const priorityMap = {
            'low': 'Baja',
            'medium': 'Media',
            'high': 'Alta',
            'urgent': 'Urgente'
        };
        return priorityMap[priority] || priority;
    };
});