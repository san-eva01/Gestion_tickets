document.addEventListener("DOMContentLoaded", function () {
  const supabaseUrl = "https://onbgqjndemplsgxdaltr.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  let currentUser = null;
  let realDeliverables = [];

  let mockDeliverables = [];

  const deliverablesTableBody = document.querySelector(".custom-table tbody");
  const searchInput = document.querySelector(".search-input");
  const statusFilter = document.getElementById("statusFilter");

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

  async function loadRealDeliverables() {
    try {
      await getCurrentUser();
      if (!currentUser) return;

      // Obtener entregables del usuario actual
      // Por ahora usaremos los tickets como base para entregables
      const { data: ticketsData, error } = await supabaseClient
        .from("ticket")
        .select("*")
        .eq("id_usuario_asignado", currentUser.id_usuario)
        .in("estado", ["delivered", "approved", "review"]);

      if (error) throw error;

      // Convertir tickets a formato de entregables
      realDeliverables = ticketsData.map((ticket) => ({
        id: `DEL-${ticket.id_ticket}`,
        order_id: `TKT-${ticket.id_ticket}`,
        title: ticket.titulo,
        type: ticket.categoria,
        creative: {
          id: currentUser.id_usuario,
          name: currentUser.nombre,
          avatar: getUserInitials(currentUser.nombre),
        },
        status: ticket.estado === "review" ? "pending" : "approved",
        submitted_date: ticket.fecha_creacion?.split("T")[0],
        client: "Cliente", // Puedes mejorar esto obteniendo el cliente real
        files: [{ name: `${ticket.titulo}.pdf`, type: "pdf" }],
        comments: [],
      }));

      console.log("Entregables cargados:", realDeliverables.length);
    } catch (error) {
      console.error("Error al cargar entregables:", error);
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

  function renderDeliverables(deliverables = mockDeliverables) {
    deliverablesTableBody.innerHTML = "";

    if (deliverables.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
            <td colspan="7" class="text-center py-4 text-muted">
                No se encontraron entregables
            </td>
        `;
      deliverablesTableBody.appendChild(emptyRow);
      return;
    }

    deliverables.forEach((deliverable) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${deliverable.id}</td>
            <td>${deliverable.order_id}</td>
            <td>${deliverable.title}</td>
            <td>${deliverable.client}</td>
            <td>${formatDate(deliverable.submitted_date)}</td>
            <td><span class="status-badge ${
              deliverable.status
            }">${getStatusName(deliverable.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon view" onclick="viewDeliverable('${
                      deliverable.id
                    }')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
      deliverablesTableBody.appendChild(row);
    });
  }

  function filterDeliverables() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;

    const filtered = mockDeliverables.filter((deliverable) => {
      const matchesSearch =
        deliverable.id.toLowerCase().includes(searchTerm) ||
        deliverable.order_id.toLowerCase().includes(searchTerm) ||
        deliverable.title.toLowerCase().includes(searchTerm) ||
        deliverable.client.toLowerCase().includes(searchTerm);

      const matchesStatus = statusValue
        ? deliverable.status === statusValue
        : true;

      return matchesSearch && matchesStatus;
    });

    renderDeliverables(filtered);
  }

  searchInput.addEventListener("input", filterDeliverables);
  statusFilter.addEventListener("change", filterDeliverables);

  renderDeliverables();

  document
    .getElementById("addDeliverableComment")
    .addEventListener("click", addComment);

  window.viewDeliverable = function (deliverableId) {
    const deliverable = mockDeliverables.find((d) => d.id === deliverableId);
    if (!deliverable) return;

    document.getElementById("viewDeliverableId").textContent = deliverable.id;
    document.getElementById("viewDeliverableTitle").textContent =
      deliverable.title;
    document.getElementById("viewDeliverableOrder").textContent =
      deliverable.order_id;
    document.getElementById("viewDeliverableStatus").textContent =
      getStatusName(deliverable.status);
    document.getElementById(
      "viewDeliverableStatus"
    ).className = `status-badge ${deliverable.status}`;
    document.getElementById("viewDeliverableClient").textContent =
      deliverable.client;
    document.getElementById("viewDeliverableSubmitted").textContent =
      formatDate(deliverable.submitted_date);

    if (deliverable.reviewed_date) {
      document.getElementById("viewDeliverableReviewed").textContent =
        formatDate(deliverable.reviewed_date);
      document.getElementById("viewReviewedDateGroup").style.display = "block";
    } else {
      document.getElementById("viewReviewedDateGroup").style.display = "none";
    }

    const filesList = document.getElementById("viewDeliverableFiles");
    filesList.innerHTML = "";

    if (deliverable.files && deliverable.files.length > 0) {
      deliverable.files.forEach((file) => {
        const icon = getFileIcon(file.type);
        const fileItem = document.createElement("div");
        fileItem.className = "attachment-item";
        fileItem.innerHTML = `
                    <i class="${icon}"></i>
                    <a href="#" onclick="downloadFile('${file.name}'); return false;">${file.name}</a>
                `;
        filesList.appendChild(fileItem);
      });
    }

    const feedbackSection = document.getElementById("viewFeedbackSection");
    if (deliverable.feedback) {
      document.getElementById("viewFeedback").textContent =
        deliverable.feedback;
      feedbackSection.style.display = "block";
    } else {
      feedbackSection.style.display = "none";
    }

    const commentsContainer = document.getElementById(
      "viewDeliverableComments"
    );
    commentsContainer.innerHTML = "";

    if (deliverable.comments && deliverable.comments.length > 0) {
      deliverable.comments.forEach((comment) => {
        const commentElement = document.createElement("div");
        commentElement.className = "comment";
        commentElement.innerHTML = `
                    <div class="comment-avatar">${comment.user.avatar}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">${
                              comment.user.name
                            }</span>
                            <span class="comment-date">${formatDateTime(
                              comment.date
                            )}</span>
                        </div>
                        <p class="comment-text">${comment.text}</p>
                    </div>
                `;
        commentsContainer.appendChild(commentElement);
      });
    } else {
      commentsContainer.innerHTML =
        '<p class="text-center text-muted">No hay comentarios</p>';
    }

    const viewDeliverableModal = new bootstrap.Modal(
      document.getElementById("viewDeliverableModal")
    );
    viewDeliverableModal.show();
  };

  function addComment() {
    const deliverableId =
      document.getElementById("viewDeliverableId").textContent;
    const commentText = document.getElementById("newDeliverableComment").value;

    if (!commentText.trim()) return;

    const deliverable = mockDeliverables.find((d) => d.id === deliverableId);
    if (!deliverable) return;

    if (!deliverable.comments) {
      deliverable.comments = [];
    }

    const newComment = {
      id: Date.now(),
      user: { id: 2, name: "Carlos Ruiz", avatar: "CR" },
      date: new Date().toISOString(),
      text: commentText,
    };

    deliverable.comments.push(newComment);

    const commentsContainer = document.getElementById(
      "viewDeliverableComments"
    );
    const commentElement = document.createElement("div");
    commentElement.className = "comment";
    commentElement.innerHTML = `
            <div class="comment-avatar">${newComment.user.avatar}</div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${newComment.user.name}</span>
                    <span class="comment-date">${formatDateTime(
                      newComment.date
                    )}</span>
                </div>
                <p class="comment-text">${newComment.text}</p>
            </div>
        `;
    commentsContainer.appendChild(commentElement);

    document.getElementById("newDeliverableComment").value = "";

    showAlert("Comentario agregado", "success");
  }

  function getFileIcon(fileType) {
    const iconMap = {
      pdf: "far fa-file-pdf",
      doc: "far fa-file-word",
      docx: "far fa-file-word",
      xls: "far fa-file-excel",
      xlsx: "far fa-file-excel",
      ppt: "far fa-file-powerpoint",
      pptx: "far fa-file-powerpoint",
      jpg: "far fa-file-image",
      jpeg: "far fa-file-image",
      png: "far fa-file-image",
      gif: "far fa-file-image",
      zip: "far fa-file-archive",
      rar: "far fa-file-archive",
      ai: "far fa-file-image",
      psd: "far fa-file-image",
      txt: "far fa-file-alt",
      mp4: "far fa-file-video",
      mp3: "far fa-file-audio",
    };

    return iconMap[fileType] || "far fa-file";
  }

  function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatDateTime(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusName(status) {
    const statusMap = {
      pending: "Pendiente de Revisión",
      approved: "Aprobado",
      rejected: "Rechazado",
    };
    return statusMap[status] || status;
  }

  window.downloadFile = function (fileName) {
    showAlert(`Descargando archivo: ${fileName}`, "info");
    return false;
  };

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

  // AGREGAR al final
  loadRealDeliverables().then(() => {
    mockDeliverables = realDeliverables;
    renderDeliverables();
  });
});
