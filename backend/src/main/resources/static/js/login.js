document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const loginError = document.getElementById('loginError');
    

    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        

        this.querySelector('i').classList.toggle('fa-eye-slash');
        this.querySelector('i').classList.toggle('fa-eye');
    });
    

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value;
        const password = passwordInput.value;
        
  
        const mockUsers = [
            { email: 'ana.martinez@agencia.com', password: 'admin123', name: 'Ana Martínez', role: 'Admin', avatar: 'AM' },
            { email: 'carlos.ruiz@agencia.com', password: 'creative123', name: 'Carlos Ruiz', role: 'Creativo', avatar: 'CR' },
            { email: 'maria.lopez@agencia.com', password: 'creative123', name: 'María López', role: 'Creativo', avatar: 'ML' },
            { email: 'alberto.sanchez@agencia.com', password: 'creative123', name: 'Alberto Sánchez', role: 'Creativo', avatar: 'AS' },
            { email: 'laura.gomez@agencia.com', password: 'creative123', name: 'Laura Gómez', role: 'Creativo', avatar: 'LG' },
            { email: 'pedro.diaz@agencia.com', password: 'creative123', name: 'Pedro Díaz', role: 'Creativo', avatar: 'PD' }
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
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'creative-view.html';
            }
        } else {
   
            loginError.style.display = 'block';
            

            passwordInput.value = '';
            
            
            emailInput.focus();
            

            setTimeout(() => {
                loginError.style.display = 'none';
            }, 3000);
        }
    });
    

    if (localStorage.getItem('taskflow_token')) {
        const user = JSON.parse(localStorage.getItem('taskflow_user') || '{}');
        if (user.role === 'Admin') {
            window.location.href = 'dashboard.html';
        } else if (user.role === 'Creativo') {
            window.location.href = 'creative-view.html';
        }
    }
});