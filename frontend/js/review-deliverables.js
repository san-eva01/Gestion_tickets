document.addEventListener("DOMContentLoaded", function () {
  const supabaseUrl = "https://onbgqjndemplsgxdaltr.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  let realDeliverables = [];

  const deliverableTableBody = document.getElementById("deliverableTableBody");
  const searchInput = document.querySelector(".search-input");
  const statusFilter = document.getElementById("statusFilter");
  const typeFilter = document.getElementById("typeFilter");

  const viewDeliverableModal = new bootstrap.Modal(document.getElementById("viewDeliverableModal"));
  const rejectModal = new bootstrap.Modal(document.getElementById("rejectModal"));

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
        files: (ticket.entregables || []).map((url) => {
          const fileName = decodeURIComponent(url.split('/').pop());
          const ext = fileName.split('.').pop().toLowerCase();
          return {
            name: fileName,
            type: ext,
            url: url,
          };
        }),
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
    
    // Evento para hacer click en las filas de la tabla
    deliverableTableBody.addEventListener('click', function(e) {
      const row = e.target.closest('tr');
      if (!row) return;
      
      // Si el click fue en un botón de acción, no hacer nada (dejamos que su evento propio se maneje)
      if (e.target.closest('.action-buttons')) {
        return;
      }
      
      const deliverableId = row.cells[0].textContent;
      viewDeliverable(deliverableId);
    });
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
                        <button class="btn-icon view" onclick="event.stopPropagation(); viewDeliverable('${
                          deliverable.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${
                          deliverable.status === "pending"
                            ? `
                            <button class="btn-icon edit" onclick="event.stopPropagation(); reviewDeliverable('${deliverable.id}')">
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

  window.viewDeliverable = function (deliverableId) {
    const deliverable = mockDeliverables.find(d => d.id === deliverableId);
    if (!deliverable) return;

    // Mostrar datos básicos
    document.getElementById("viewDeliverableId").textContent = deliverable.id;
    document.getElementById("viewDeliverableTitle").textContent = deliverable.title;
    document.getElementById("viewDeliverableType").textContent = getTypeName(deliverable.type);
    document.getElementById("viewDeliverableType").className = `type-badge ${deliverable.type}`;
    document.getElementById("viewDeliverableStatus").textContent = getStatusName(deliverable.status);
    document.getElementById("viewDeliverableStatus").className = `status-badge ${deliverable.status}`;
    document.getElementById("viewDeliverableCreative").textContent = deliverable.creative.name;
    document.getElementById("viewDeliverableClient").textContent = deliverable.client;
    document.getElementById("viewDeliverableSubmitted").textContent = formatDate(deliverable.submitted_date);

    if (deliverable.reviewed_date) {
      document.getElementById("viewDeliverableReviewed").textContent = formatDate(deliverable.reviewed_date);
      document.getElementById("viewReviewedDateGroup").style.display = "block";
    } else {
      document.getElementById("viewReviewedDateGroup").style.display = "none";
    }

    // Archivos adjuntos
    const filesList = document.getElementById("viewDeliverableFiles");
    filesList.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin me-2"></i>Cargando archivos...</div>';

    const ticketId = deliverableId.replace("DEL-", "");

    (async () => {
      try {
        const { data, error } = await supabaseClient
          .from("ticket")
          .select("entregables")
          .eq("id_ticket", ticketId)
          .single();

        if (error) throw error;

        const entregables = data?.entregables || [];

        if (!entregables.length) {
          filesList.innerHTML = '<p class="text-muted text-center">No hay archivos adjuntos</p>';
          return;
        }

        filesList.innerHTML = "";

        entregables.forEach(url => {
          const filename = decodeURIComponent(url.split("/").pop());
          const ext = filename.split(".").pop().toLowerCase();
          const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
          const isPDF = ext === "pdf";

          const fileItem = document.createElement("div");
          fileItem.className = "attachment-item mb-3 p-3 border rounded bg-light";

          const preview = isImage
            ? `<img src="${url}" alt="${filename}" class="img-fluid rounded shadow-sm" style="max-height: 200px;">`
            : isPDF
              ? `<embed src="${url}" type="application/pdf" width="100%" height="200px" class="rounded shadow-sm">`
              : "";

          fileItem.innerHTML = `
            <div class="row align-items-center">
              <div class="col-md-4 text-center mb-3 mb-md-0">${preview}</div>
              <div class="col-md-8">
                <div class="d-flex flex-column justify-content-between h-100">
                  <div class="mb-2">
                    <i class="${getFileIcon(ext)} text-primary me-2"></i>
                    <strong>${filename}</strong>
                  </div>
                  <div>
                    <a href="#" onclick="forceDownload('${url}', '${filename}'); return false;" class="btn btn-outline-primary btn-sm">
                      <i class="fas fa-download me-1"></i> Descargar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          `;

          filesList.appendChild(fileItem);
        });
      } catch (err) {
        console.error("Error al cargar archivos:", err);
        filesList.innerHTML = `
          <div class="alert alert-danger mb-0">
            <i class="fas fa-exclamation-circle me-2"></i>Error al cargar los archivos
          </div>`;
      }
    })();

    // Feedback y comentarios
    const feedbackSection = document.getElementById("viewFeedbackSection");
    if (deliverable.feedback) {
      document.getElementById("viewFeedback").textContent = deliverable.feedback;
      feedbackSection.style.display = "block";
    } else {
      feedbackSection.style.display = "none";
    }

const commentsContainer = document.getElementById("viewDeliverableComments");
commentsContainer.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin me-2"></i>Cargando comentarios...</div>';

(async () => {
  try {
    const { data, error } = await supabaseClient
      .from("ticket")
      .select("comentarios")
      .eq("id_ticket", ticketId)
      .single();

    if (error) throw error;

    const comentariosTexto = data?.comentarios || "";

    if (!comentariosTexto.trim()) {
      commentsContainer.innerHTML = '<p class="text-center text-muted">No hay comentarios</p>';
      return;
    }

    const comentarios = comentariosTexto.trim().split("\n").filter(Boolean);

    commentsContainer.innerHTML = "";
comentarios.forEach(linea => {
  const match = linea.match(/^\[(.+?)\]\s*(.+?):\s*(.+)$/);
  const commentElement = document.createElement("div");
  commentElement.className = "comment";

  if (match) {
    const [, fecha, autor, texto] = match;
    commentElement.innerHTML = `
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">${autor}</span>
          <span class="comment-date">${fecha}</span>
        </div>
        <p class="comment-text">${texto}</p>
      </div>`;
  } else {
    // Mostrar comentarios sin formato
    commentElement.innerHTML = `
      <div class="comment-content">
        <p class="comment-text">${linea}</p>
      </div>`;
  }

  commentsContainer.appendChild(commentElement);
});


  } catch (err) {
    console.error("Error al cargar comentarios:", err);
    commentsContainer.innerHTML = '<p class="text-danger text-center">Error al cargar los comentarios</p>';
  }
})();

    // Configurar botones de acción
    document.getElementById("approveDeliverableBtn").onclick = async () => {
      const deliverableId = document.getElementById('viewDeliverableId').textContent;
      const ticketId = deliverableId.replace('DEL-', '');

      try {
          const { error } = await supabaseClient
              .from('ticket')
              .update({ 
                  estado: 'approved',
                  fecha_limite: new Date().toISOString()
              })
              .eq('id_ticket', ticketId);

          if (error) throw error;

          viewDeliverableModal.hide();
          
          const deliverable = mockDeliverables.find(d => d.id === deliverableId);
          if (deliverable) {
              deliverable.status = 'approved';
              deliverable.reviewed_date = new Date().toISOString().split('T')[0];
          }

          renderDeliverables();
          showAlert('Entregable aprobado con éxito', 'success');

      } catch (err) {
          console.error('Error al aprobar entregable:', err);
          showAlert('Error al aprobar el entregable', 'danger');
      }
    };

    document.getElementById("confirmRejectBtn").onclick = async () => {
      const newComment = document.getElementById("rejectComment").value.trim();
      if (!newComment) {
        alert("Ingresa un motivo del rechazo.");
        return;
      }
      
      const deliverableId = document.getElementById('viewDeliverableId').textContent;
      const ticketId = deliverableId.replace('DEL-', '');
        
      try {
    const { data, error: fetchError } = await supabaseClient
      .from("ticket")
      .select("comentarios")
      .eq("id_ticket", ticketId)
      .single();

    if (fetchError) throw fetchError;

    const currentComments = data?.comentarios || "";
    const userName = window.currentUser?.name || "Usuario desconocido";
    const datetime = new Date().toLocaleString();
    const formattedComment = `\n[${datetime}] ${userName}: ${newComment}`;
    const updatedComments = currentComments + formattedComment;

    const { error: updateError } = await supabaseClient
      .from("ticket")
      .update({ estado: 'in-progress', comentarios: updatedComments })
      .eq("id_ticket", ticketId);

    if (updateError) throw updateError;

    rejectModal.hide();
    viewDeliverableModal.hide();

    const deliverable = mockDeliverables.find(d => d.id === deliverableId);
      if (deliverable) {
              deliverable.status = 'rejected';
              deliverable.reviewed_date = new Date().toISOString().split('T')[0];
      }

      renderDeliverables();
    showAlert('Entregable rechazado con éxito', 'success');



  } catch (err) {
    console.error("Error al guardar comentario:", err);
    showAlert("Hubo un error al guardar el comentario", "danger");
  }

      
    };

    viewDeliverableModal.show();
  };



  // Fuera de viewDeliverable
window.addComment = async function () {
  const ticketId = document.getElementById('viewDeliverableId').textContent.replace("DEL-", "");
  const newComment = document.getElementById('newComment').value.trim();

  if (!newComment) {
    alert("El comentario no puede estar vacío.");
    return;
  }

  try {
    const { data, error: fetchError } = await supabaseClient
      .from("ticket")
      .select("comentarios")
      .eq("id_ticket", ticketId)
      .single();

    if (fetchError) throw fetchError;

    const currentComments = data?.comentarios || "";
    const userName = window.currentUser?.name || "Usuario desconocido";
    const datetime = new Date().toLocaleString();
    const formattedComment = `\n[${datetime}] ${userName}: ${newComment}`;
    const updatedComments = currentComments + formattedComment;

    const { error: updateError } = await supabaseClient
      .from("ticket")
      .update({ comentarios: updatedComments })
      .eq("id_ticket", ticketId);

    if (updateError) throw updateError;

    // Añadir nuevo comentario visualmente
    const commentsContainer = document.getElementById("viewDeliverableComments");
    const newCommentElement = document.createElement("div");
    newCommentElement.className = "comment";
    newCommentElement.innerHTML = `
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">${userName}</span>
          <span class="comment-date">${datetime}</span>
        </div>
        <p class="comment-text">${newComment}</p>
      </div>`;
    commentsContainer.appendChild(newCommentElement);

    document.getElementById('newComment').value = "";
    showAlert("Comentario guardado correctamente", "success");

  } catch (err) {
    console.error("Error al guardar comentario:", err);
    showAlert("Hubo un error al guardar el comentario", "danger");
  }
};


  window.reviewDeliverable = function (deliverableId) {
    const deliverable = mockDeliverables.find(d => d.id === deliverableId);
    if (!deliverable) return;
    
    // Primero mostramos la vista normal
    viewDeliverable(deliverableId);
    
    // Luego abrimos el modal de revisión
    // (aquí puedes implementar la lógica específica para el modal de revisión si es diferente)
  };

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

  window.forceDownload = function (url, fileName) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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