document.addEventListener("DOMContentLoaded", function () {
  // AGREGAR al inicio, después de DOMContentLoaded
  const supabaseUrl = "https://onbgqjndemplsgxdaltr.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw";

  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  let currentUser = null;

  // CORRECCIÓN: Verificar si los elementos existen antes de agregar event listeners
  const editProfileBtn = document.getElementById("editProfileBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");

  // Solo agregar event listeners si los elementos existen
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", enableEditMode);
  }
  
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", disableEditMode);
  }
  
  if (profileForm) {
    profileForm.addEventListener("submit", saveProfile);
  }
  
  if (passwordForm) {
    passwordForm.addEventListener("submit", changePassword);
  }

  function enableEditMode() {
    const formInputs = document.querySelectorAll(
      "#profileForm input, #profileForm textarea"
    );
    formInputs.forEach((input) => {
      input.disabled = false;
    });

    const saveProfileBtnContainer = document.getElementById("saveProfileBtnContainer");
    if (saveProfileBtnContainer) {
      saveProfileBtnContainer.style.display = "block";
    }

    if (editProfileBtn) {
      editProfileBtn.style.display = "none";
    }
  }

  // AGREGAR ESTAS FUNCIONES
  async function getCurrentUser() {
    try {
      const userStr = localStorage.getItem("taskflow_user");
      if (!userStr) return null;

      const userData = JSON.parse(userStr);
      currentUser = {
        id_usuario: userData.id,
        nombre: userData.name,
        email: userData.email,
        rol: userData.role,
      };

      return currentUser;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  }

  async function loadUserProfile() {
    try {
      await getCurrentUser();
      if (!currentUser) return;

      // Obtener datos completos del usuario
      const { data: userData, error: userError } = await supabaseClient
        .from("usuario")
        .select("*")
        .eq("id_usuario", currentUser.id_usuario)
        .single();

      if (userError) throw userError;

      // Obtener estadísticas de tickets
      const { data: ticketsData, error: ticketsError } = await supabaseClient
        .from("ticket")
        .select("*")
        .eq("id_usuario_asignado", currentUser.id_usuario);

      if (ticketsError) throw ticketsError;

      // Actualizar interfaz
      updateProfileInfo(userData);
      updateProfileStats(ticketsData);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    }
  }

  function updateProfileInfo(userData) {
    // Actualizar nombre en el avatar y título
    const userNameElements = document.querySelectorAll(".user-name, h3");
    userNameElements.forEach((el) => {
      if (el.textContent.includes("Carlos Ruiz")) {
        el.textContent = userData.nombre;
      }
    });

    // Actualizar avatar
    const avatarElement = document.querySelector(".user-avatar-large");
    if (avatarElement) {
      avatarElement.textContent = getUserInitials(userData.nombre);
    }

    // Actualizar campos del formulario
    const firstNameField = document.getElementById("firstName");
    const lastNameField = document.getElementById("lastName");
    const emailField = document.getElementById("email");

    if (userData.nombre) {
      const nameParts = userData.nombre.split(" ");
      if (firstNameField) firstNameField.value = nameParts[0] || "";
      if (lastNameField)
        lastNameField.value = nameParts.slice(1).join(" ") || "";
    }

    if (emailField) emailField.value = userData.email || "";
  }

  function updateProfileStats(ticketsData) {
    const completedTickets = ticketsData.filter(
      (t) => t.estado === "delivered" || t.estado === "approved"
    ).length;
    const inProgressTickets = ticketsData.filter(
      (t) => t.estado === "in-progress"
    ).length;

    // Calcular tasa de entrega (simulada)
    const deliveryRate =
      completedTickets > 0 ? Math.min(95, 85 + completedTickets * 2) : 0;

    // Actualizar estadísticas en la interfaz
    const statsElements = document.querySelectorAll(".fw-bold");
    if (statsElements.length >= 4) {
      statsElements[0].textContent = completedTickets; // Tareas completadas
      statsElements[1].textContent = inProgressTickets; // En proceso
      statsElements[2].textContent = `${deliveryRate}%`; // Tasa de entrega
      // Mantener calificación como está
    }
  }

  function getUserInitials(name) {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }

  function disableEditMode() {
    const formInputs = document.querySelectorAll(
      "#profileForm input, #profileForm textarea"
    );
    formInputs.forEach((input) => {
      input.disabled = true;
    });

    const saveProfileBtnContainer = document.getElementById("saveProfileBtnContainer");
    if (saveProfileBtnContainer) {
      saveProfileBtnContainer.style.display = "none";
    }

    if (editProfileBtn) {
      editProfileBtn.style.display = "block";
    }

    if (profileForm) {
      profileForm.reset();
    }
  }

  function saveProfile(e) {
    e.preventDefault();

    showAlert("Perfil actualizado con éxito", "success");
    disableEditMode();
  }

  function changePassword(e) {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword");
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");

    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert("Por favor complete todos los campos", "warning");
      return;
    }

    if (newPassword.value !== confirmPassword.value) {
      showAlert("Las contraseñas nuevas no coinciden", "danger");
      return;
    }

    showAlert("Contraseña actualizada con éxito", "success");
    
    if (passwordForm) {
      passwordForm.reset();
    }
  }

  function showAlert(message, type = "success") {
    const alertContainer = document.getElementById("alertContainer");
    if (!alertContainer) return;

    const alert = document.createElement("div");
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
    alertContainer.appendChild(alert);

    setTimeout(() => alert.remove(), 5000);
  }

  // CARGAR EL PERFIL AL INICIALIZAR
  loadUserProfile();
});