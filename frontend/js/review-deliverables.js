document.addEventListener("DOMContentLoaded", function () {
  const supabaseUrl = "https://onbgqjndemplsgxdaltr.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  let realDeliverables = [];

  const deliverableTableBody = document.getElementById("deliverableTableBody");
  const searchInput = document.querySelector(".search-input");
  const statusFilter = document.getElementById("statusFilter");
  const typeFilter = document.getElementById("typeFilter");

  const reviewModal = new bootstrap.Modal(
    document.getElementById("reviewModal")
  );

  let mockDeliverables = [];

  init();

  function init() {
    renderDeliverables();
    setupEventListeners();
  }

  async function loadRealDeliverables() {
    try {
      const { data: ticketsData, error: ticketsError } = await supabaseClient
        .from("ticket")
        .select(
          `
                *,
                usuario:id_usuario_asignado(nombre),
                cliente:id_cliente_entregable(nombre)
            `
        )
        .in("estado", ["review", "delivered", "approved"])
        .order("fecha_creacion", { ascending: false });

      if (ticketsError) throw ticketsError;

      realDeliverables = ticketsData.map((ticket) => ({
        id: `DEL-${ticket.id_ticket}`,
        order_id: `TKT-${ticket.id_ticket}`,
        title: ticket.titulo,
        type: ticket.categoria,
        creative: {
          id: ticket.id_usuario_asignado,
          name: ticket.usuario?.nombre || "Usuario desconocido",
          avatar: getUserInitials(ticket.usuario?.nombre || "Usuario"),
        },
        status: ticket.estado === "review" ? "pending" : "approved",
        submitted_date: ticket.fecha_creacion?.split("T")[0],
        reviewed_date:
          ticket.estado !== "review"
            ? ticket.fecha_limite?.split("T")[0]
            : null,
        client: ticket.cliente?.nombre || "Sin cliente",
        files: [{ name: `${ticket.titulo}.pdf`, type: "pdf" }],
        comments: [],
        feedback: ticket.estado === "approved" ? "Entregable aprobado" : null,
      }));

      mockDeliverables = realDeliverables;
      console.log("Entregables cargados:", mockDeliverables.length);
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

  function setupEventListeners() {
    searchInput.addEventListener("input", filterDeliverables);
    statusFilter.addEventListener("change", filterDeliverables);
    typeFilter.addEventListener("change", filterDeliverables);
  }

  function renderDeliverables(filteredDeliverables = null) {
    const deliverablesToRender = filteredDeliverables || mockDeliverables;

    deliverableTableBody.innerHTML = "";

    if (deliverablesToRender.length === 0) {
      deliverableTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">No se encontraron entregables que coincidan con su búsqueda</td>
                </tr>
            `;
      return;
    }

    deliverablesToRender.forEach((deliverable) => {
      const row = document.createElement("tr");
      row.className = "clickable-row";
      row.setAttribute("data-id", deliverable.id);
      row.innerHTML = `
                <td>${deliverable.id}</td>
                <td>${deliverable.title}</td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${
                          deliverable.creative.avatar
                        }</div>
                        <span>${deliverable.creative.name}</span>
                    </div>
                </td>
                <td><span class="type-badge ${deliverable.type}">${getTypeName(
        deliverable.type
      )}</span></td>
                <td><span class="status-badge ${
                  deliverable.status
                }">${getStatusName(deliverable.status)}</span></td>
                <td>${formatDate(deliverable.submitted_date)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view" onclick="viewDeliverable('${
                          deliverable.id
                        }', event)">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${
                          deliverable.status === "pending"
                            ? `
                            <button class="btn-icon edit" onclick="reviewDeliverable('${deliverable.id}', event)">
                                <i class="fas fa-clipboard-check"></i>
                            </button>
                        `
                            : ""
                        }
                    </div>
                </td>
            `;
      deliverableTableBody.appendChild(row);
    });

    // Agregar evento click a las filas
    document.querySelectorAll(".clickable-row").forEach(row => {
      row.addEventListener("click", function(e) {
        // Verificar si el click fue en un botón de acción
        if (!e.target.closest(".action-buttons")) {
          const deliverableId = this.getAttribute("data-id");
          viewDeliverable(deliverableId);
        }
      });
    });
  }

  function filterDeliverables() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const typeValue = typeFilter.value;

    const filtered = mockDeliverables.filter((deliverable) => {
      const matchesSearch =
        !searchTerm ||
        deliverable.title.toLowerCase().includes(searchTerm) ||
        deliverable.id.toLowerCase().includes(searchTerm) ||
        deliverable.creative.name.toLowerCase().includes(searchTerm) ||
        deliverable.client.toLowerCase().includes(searchTerm);

      const matchesStatus = !statusValue || deliverable.status === statusValue;

      const matchesType = !typeValue || deliverable.type === typeValue;

      return matchesSearch && matchesStatus && matchesType;
    });

    renderDeliverables(filtered);
  }

  window.viewDeliverable = function (deliverableId, event = null) {
    if (event) {
      event.stopPropagation();
    }
    
    const deliverable = mockDeliverables.find((d) => d.id === deliverableId);
    if (!deliverable) return;

    document.getElementById("viewDeliverableId").textContent = deliverable.id;
    document.getElementById("viewDeliverableTitle").textContent =
      deliverable.title;
    document.getElementById("viewDeliverableType").textContent = getTypeName(
      deliverable.type
    );
    document.getElementById(
      "viewDeliverableType"
    ).className = `type-badge ${deliverable.type}`;
    document.getElementById("viewDeliverableStatus").textContent =
      getStatusName(deliverable.status);
    document.getElementById(
      "viewDeliverableStatus"
    ).className = `status-badge ${deliverable.status}`;
    document.getElementById("viewDeliverableCreative").textContent =
      deliverable.creative.name;
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

  window.reviewDeliverable = function (deliverableId, event = null) {
    if (event) {
      event.stopPropagation();
    }
    
    const deliverable = mockDeliverables.find((d) => d.id === deliverableId);
    if (!deliverable) return;

    document.getElementById("reviewDeliverableId").textContent = deliverable.id;
    document.getElementById("reviewDeliverableTitle").textContent =
      deliverable.title;
    document.getElementById("reviewDeliverableCreative").textContent =
      deliverable.creative.name;
    document.getElementById("reviewDeliverableClient").textContent =
      deliverable.client;

    const filesList = document.getElementById("reviewDeliverableFiles");
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

    document.getElementById("reviewFeedback").value = "";

    const reviewForm = document.getElementById("reviewForm");
    reviewForm.onsubmit = function (e) {
      e.preventDefault();
      submitReview(deliverableId);
    };

    reviewModal.show();
  };

  function submitReview(deliverableId) {
    const deliverable = mockDeliverables.find((d) => d.id === deliverableId);
    if (!deliverable) return;

    const decision = document.querySelector(
      'input[name="reviewDecision"]:checked'
    ).value;
    const feedback = document.getElementById("reviewFeedback").value;

    if (!feedback.trim()) {
      showAlert("Por favor proporcione feedback para el creativo", "warning");
      return;
    }

    deliverable.status = decision === "approve" ? "approved" : "rejected";
    deliverable.reviewed_date = new Date().toISOString().split("T")[0];
    deliverable.feedback = feedback;

    if (!deliverable.comments) {
      deliverable.comments = [];
    }

    deliverable.comments.push({
      id: Date.now(),
      user: { id: 1, name: "Ana Martínez", avatar: "AM" },
      date: new Date().toISOString(),
      text: `${
        decision === "approve" ? "Entregable aprobado" : "Entregable rechazado"
      }: ${feedback}`,
    });

    const orderId = deliverable.order_id;
    const order = window.mockOrders
      ? window.mockOrders.find((o) => o.id === orderId)
      : null;

    if (order) {
      order.status = decision === "approve" ? "approved" : "rejected";

      if (!order.timeline) {
        order.timeline = [];
      }

      order.timeline.push({
        date: new Date().toISOString(),
        action: "status_change",
        user: "Ana Martínez",
        from_status: "review",
        to_status: decision === "approve" ? "approved" : "rejected",
      });
    }

    reviewModal.hide();
    renderDeliverables();

    showAlert(
      `Entregable ${
        decision === "approve" ? "aprobado" : "rechazado"
      } con éxito`,
      "success"
    );
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

  function getTypeName(type) {
    const typeMap = {
      design: "Diseño Gráfico",
      web: "Desarrollo Web",
      video: "Producción Audiovisual",
      copy: "Copywriting",
      social: "Pauta en Redes",
    };
    return typeMap[type] || type;
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

  loadRealDeliverables().then(() => {
    renderDeliverables();
  });
});