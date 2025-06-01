document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('editProfileBtn').addEventListener('click', enableEditMode);
    document.getElementById('cancelEditBtn').addEventListener('click', disableEditMode);
    document.getElementById('profileForm').addEventListener('submit', saveProfile);
    document.getElementById('passwordForm').addEventListener('submit', changePassword);
    
    function enableEditMode() {

        const formInputs = document.querySelectorAll('#profileForm input, #profileForm textarea');
        formInputs.forEach(input => {
            input.disabled = false;
        });
        
     
        document.getElementById('saveProfileBtnContainer').style.display = 'block';
        
   
        document.getElementById('editProfileBtn').style.display = 'none';
    }
    
    function disableEditMode() {
 
        const formInputs = document.querySelectorAll('#profileForm input, #profileForm textarea');
        formInputs.forEach(input => {
            input.disabled = true;
        });
        
       
        document.getElementById('saveProfileBtnContainer').style.display = 'none';
        
    
        document.getElementById('editProfileBtn').style.display = 'block';
        
       
        document.getElementById('profileForm').reset();
    }
    
    function saveProfile(e) {
        e.preventDefault();
        
        showAlert('Perfil actualizado con éxito', 'success');
        disableEditMode();
    }
    
    function changePassword(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            showAlert('Por favor complete todos los campos', 'warning');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showAlert('Las contraseñas nuevas no coinciden', 'danger');
            return;
        }
        
        
        showAlert('Contraseña actualizada con éxito', 'success');
        document.getElementById('passwordForm').reset();
    }
    
    function showAlert(message, type = 'success') {
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
    }
});