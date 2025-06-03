document.addEventListener("DOMContentLoaded", function () {
  const supabaseUrl = "https://onbgqjndemplsgxdaltr.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  let currentUser = null;
  let realDeliverables = [];
  let users = [];
  let clients = [];

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

  // Cargar usuarios y clientes para mostrar información completa
  async function loadUsers() {
    try {
      const { data, error } = await supabaseClient.from("usuario").select("*");

      if (error) throw error;
      users = data || [];
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  }

  async function loadClients() {
    try {
      const { data, error } = await supabaseClient.from("cliente").select("*");

      if (error) throw error;
      clients = data || [];
    } catch (error) {
      console.error("Error al cargar clientes:", error);
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
        ticket_id: ticket.id_ticket,
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
        // Datos adicionales del ticket para el modal expandido
        ticketData: ticket,
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

  function setupEventListeners() {
    searchInput.addEventListener("input", filterDeliverables);
    statusFilter.addEventListener("change", filterDeliverables);

    // Evento para hacer click en las filas de la tabla
    deliverablesTableBody.addEventListener("click", function (e) {
      const row = e.target.closest("tr");
      if (!row) return;

      // Si el click fue en un botón de acción, no hacer nada (dejamos que su evento propio se maneje)
      if (e.target.closest(".action-buttons")) {
        return;
      }

      const deliverableId = row.cells[0].textContent;
      viewDeliverableExpanded(deliverableId);
    });
  }

  function renderDeliverables(filteredDeliverables = null) {
    const deliverablesToRender = filteredDeliverables || mockDeliverables;

    deliverablesTableBody.innerHTML = "";

    if (deliverablesToRender.length === 0) {
      deliverablesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">No se encontraron entregables que coincidan con su búsqueda</td>
                </tr>
            `;
      return;
    }

    deliverablesToRender.forEach((deliverable) => {
      const row = document.createElement("tr");
      row.style.cursor = "pointer"; // Indicar que es clickeable
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
                        <button class="btn-icon view" onclick="event.stopPropagation(); viewDeliverableExpanded('${
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

  // NUEVA FUNCIÓN: Modal expandido para entregables (similar al de tickets)
  async function viewDeliverableExpanded(deliverableId) {
    const deliverable = mockDeliverables.find((d) => d.id === deliverableId);
    if (!deliverable || !deliverable.ticketData) return;

    const ticket = deliverable.ticketData;

    // Encontrar datos relacionados
    const assignedUser = users.find(
      (u) => u.id_usuario === ticket.id_usuario_asignado
    );
    const creatorUser = users.find((u) => u.id_usuario === ticket.id_creador);
    const client = clients.find(
      (c) => c.id_cliente === ticket.id_cliente_entregable
    );

    // Crear modal expandido
    const modalHtml = `
      <div class="modal fade" id="expandedDeliverableModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-ticket-alt text-primary me-2"></i>
                Ticket #${ticket.id_ticket} - ${deliverable.title}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <!-- Header del ticket -->
              <div class="order-header mb-4">
                <div class="row">
                  <div class="col-md-8">
                    <h3>${ticket.titulo}</h3>
                    <div class="order-meta mt-2">
                      <span class="type-badge ${
                        ticket.categoria
                      }">${getTypeName(ticket.categoria)}</span>
                      <span class="status-badge ${
                        ticket.estado
                      }">${getStatusName(ticket.estado)}</span>
                      <span class="priority-badge ${
                        ticket.prioridad || "medium"
                      }">${getPriorityName(ticket.prioridad || "medium")}</span>
                    </div>
                  </div>
                  <div class="col-md-4 text-end">
                    <div class="text-muted small">
                      <div><strong>ID Ticket:</strong> #${
                        ticket.id_ticket
                      }</div>
                      <div><strong>ID Entregable:</strong> ${
                        deliverable.id
                      }</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Información del ticket -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="card border-0 bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-primary mb-3">
                        <i class="fas fa-info-circle me-2"></i>Información del Proyecto
                      </h6>
                      <div class="detail-group mb-2">
                        <label class="text-muted small">Cliente:</label>
                        <p class="mb-0 fw-medium">${
                          client ? client.nombre : "Sin cliente"
                        }</p>
                      </div>
                      <div class="detail-group mb-2">
                        <label class="text-muted small">Asignado a:</label>
                        <p class="mb-0 fw-medium">${
                          assignedUser ? assignedUser.nombre : "No asignado"
                        }</p>
                      </div>
                      <div class="detail-group mb-2">
                        <label class="text-muted small">Creado por:</label>
                        <p class="mb-0 fw-medium">${
                          creatorUser ? creatorUser.nombre : "Sistema"
                        }</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card border-0 bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-primary mb-3">
                        <i class="fas fa-calendar-alt me-2"></i>Fechas Importantes
                      </h6>
                      <div class="detail-group mb-2">
                        <label class="text-muted small">Fecha de Creación:</label>
                        <p class="mb-0 fw-medium">${formatDate(
                          ticket.fecha_creacion
                        )}</p>
                      </div>
                      <div class="detail-group mb-2">
                        <label class="text-muted small">Fecha Límite:</label>
                        <p class="mb-0 fw-medium">${formatDate(
                          ticket.fecha_limite
                        )}</p>
                      </div>
                      <div class="detail-group mb-2">
                        <label class="text-muted small">Fecha de Entrega:</label>
                        <p class="mb-0 fw-medium">${formatDate(
                          deliverable.submitted_date
                        )}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Descripción -->
              <div class="mb-4">
                <h6 class="text-primary mb-3">
                  <i class="fas fa-align-left me-2"></i>Descripción del Proyecto
                </h6>
                <div class="card border-0 bg-light">
                  <div class="card-body">
                    <p class="mb-0">${
                      ticket.descripcion || "Sin descripción"
                    }</p>
                  </div>
                </div>
              </div>

              <!-- Archivos adjuntos del ticket -->
              <div class="mb-4" id="ticketAttachments">
                <h6 class="text-primary mb-3">
                  <i class="fas fa-paperclip me-2"></i>Archivos del Brief
                </h6>
                <div id="ticketAttachmentsList" class="attachments-list">
                  <!-- Se llenará dinámicamente -->
                </div>
              </div>

              <!-- Archivos entregables -->
              <div class="mb-4" id="deliverableFiles">
                <h6 class="text-primary mb-3">
                  <i class="fas fa-cloud-upload-alt me-2"></i>Archivos Entregables
                </h6>
                <div id="deliverableFilesList" class="attachments-list">
                  <!-- Se llenará dinámicamente -->
                </div>
              </div>

              <!-- Comentarios -->
              <div class="mb-4">
                <h6 class="text-primary mb-3">
                  <i class="fas fa-comments me-2"></i>Comentarios del Proyecto
                </h6>
                <div class="card border-0 bg-light">
                  <div class="card-body">
                    <div id="expandedCommentsContainer">
                      ${
                        ticket.comentarios
                          ? `<p class="mb-0">${ticket.comentarios}</p>`
                          : '<p class="text-muted mb-0">No hay comentarios</p>'
                      }
                    </div>
                  </div>
                </div>
              </div>

              <!-- Timeline del ticket -->
              <div class="mb-4">
                <h6 class="text-primary mb-3">
                  <i class="fas fa-history me-2"></i>Historial del Ticket
                </h6>
                <div class="timeline" id="expandedTimeline">
                  <!-- Se llenará dinámicamente -->
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <i class="fas fa-times me-2"></i>Cerrar
              </button>
              <button type="button" class="btn btn-primary" onclick="viewDeliverable('${
                deliverable.id
              }'); bootstrap.Modal.getInstance(document.getElementById('expandedDeliverableModal')).hide();">
                <i class="fas fa-eye me-2"></i>Ver Entregable
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remover modal anterior si existe
    const existingModal = document.getElementById("expandedDeliverableModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Agregar modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Llenar archivos adjuntos del ticket
    const ticketAttachmentsList = document.getElementById(
      "ticketAttachmentsList"
    );
    if (ticket.adjuntos && ticket.adjuntos.length > 0) {
      ticketAttachmentsList.innerHTML = "";
      ticket.adjuntos.forEach((url, index) => {
        const fileName = decodeURIComponent(url.split("/").pop());
        const ext = fileName.split(".").pop().toLowerCase();
        const attachmentItem = document.createElement("div");
        attachmentItem.className = "attachment-item";
        attachmentItem.innerHTML = `
          <div class="d-flex align-items-center">
            <i class="${getFileIcon(ext)} text-primary me-2"></i>
            <span class="me-auto">${fileName}</span>
            <a href="${url}" target="_blank" class="btn btn-sm btn-outline-primary">
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        `;
        ticketAttachmentsList.appendChild(attachmentItem);
      });
    } else {
      ticketAttachmentsList.innerHTML =
        '<p class="text-muted">No hay archivos adjuntos en el brief</p>';
    }

    // Llenar archivos entregables
    await loadDeliverableFiles(
      deliverable,
      document.getElementById("deliverableFilesList")
    );

    // Llenar timeline
    createTimeline(ticket, document.getElementById("expandedTimeline"));

    // Mostrar modal
    const modal = new bootstrap.Modal(
      document.getElementById("expandedDeliverableModal")
    );
    modal.show();

    // Limpiar al cerrar
    document
      .getElementById("expandedDeliverableModal")
      .addEventListener("hidden.bs.modal", () => {
        document.getElementById("expandedDeliverableModal").remove();
      });
  }

  // NUEVA FUNCIÓN: Modal expandido para entregables (versión compacta)
  async function viewDeliverableExpanded(deliverableId) {
    const deliverable = mockDeliverables.find((d) => d.id === deliverableId);
    if (!deliverable || !deliverable.ticketData) return;

    const ticket = deliverable.ticketData;

    // Encontrar datos relacionados
    const assignedUser = users.find(
      (u) => u.id_usuario === ticket.id_usuario_asignado
    );
    const creatorUser = users.find((u) => u.id_usuario === ticket.id_creador);
    const client = clients.find(
      (c) => c.id_cliente === ticket.id_cliente_entregable
    );

    // Crear modal expandido compacto
    const modalHtml = `
      <div class="modal fade" id="expandedDeliverableModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header compact-header">
              <div class="w-100">
                <h5 class="modal-title mb-1">
                  <i class="fas fa-ticket-alt text-primary me-2"></i>
                  Ticket #${ticket.id_ticket}
                </h5>
                <h6 class="text-muted mb-0">${deliverable.title}</h6>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body compact-body">
              <!-- Estado y categoría -->
              <div class="status-section mb-3">
                <span class="type-badge ${ticket.categoria}">${getTypeName(
      ticket.categoria
    )}</span>
                <span class="status-badge ${ticket.estado}">${getStatusName(
      ticket.estado
    )}</span>
                <span class="priority-badge ${
                  ticket.prioridad || "medium"
                }">${getPriorityName(ticket.prioridad || "medium")}</span>
              </div>

              <!-- Información básica en formato compacto -->
              <div class="info-grid mb-3">
                <div class="info-item">
                  <i class="fas fa-user text-primary"></i>
                  <div>
                    <small class="text-muted">Cliente</small>
                    <div class="fw-medium">${
                      client ? client.nombre : "Sin cliente"
                    }</div>
                  </div>
                </div>
                <div class="info-item">
                  <i class="fas fa-user-check text-primary"></i>
                  <div>
                    <small class="text-muted">Asignado a</small>
                    <div class="fw-medium">${
                      assignedUser ? assignedUser.nombre : "No asignado"
                    }</div>
                  </div>
                </div>
                <div class="info-item">
                  <i class="fas fa-calendar text-primary"></i>
                  <div>
                    <small class="text-muted">Fecha Límite</small>
                    <div class="fw-medium">${formatDate(
                      ticket.fecha_limite
                    )}</div>
                  </div>
                </div>
                <div class="info-item">
                  <i class="fas fa-clock text-primary"></i>
                  <div>
                    <small class="text-muted">Entregado</small>
                    <div class="fw-medium">${formatDate(
                      deliverable.submitted_date
                    )}</div>
                  </div>
                </div>
              </div>

              <!-- Descripción -->
              <div class="section-divider mb-3">
                <h6 class="section-title">
                  <i class="fas fa-align-left me-2"></i>Descripción del Proyecto
                </h6>
                <div class="content-box">
                  ${ticket.descripcion || "Sin descripción"}
                </div>
              </div>

              <!-- Archivos del Brief -->
              <div class="section-divider mb-3" id="ticketAttachments">
                <h6 class="section-title">
                  <i class="fas fa-paperclip me-2"></i>Archivos del Brief
                </h6>
                <div id="ticketAttachmentsList" class="files-compact">
                  <!-- Se llenará dinámicamente -->
                </div>
              </div>

              <!-- Archivos Entregables -->
              <div class="section-divider mb-3" id="deliverableFiles">
                <h6 class="section-title">
                  <i class="fas fa-cloud-upload-alt me-2"></i>Archivos Entregables
                </h6>
                <div id="deliverableFilesList" class="files-compact">
                  <!-- Se llenará dinámicamente -->
                </div>
              </div>

              <!-- Comentarios -->
              <div class="section-divider mb-3">
                <h6 class="section-title">
                  <i class="fas fa-comments me-2"></i>Comentarios
                </h6>
                <div class="content-box">
                  ${
                    ticket.comentarios
                      ? ticket.comentarios
                      : '<span class="text-muted">No hay comentarios</span>'
                  }
                </div>
              </div>

              <!-- Timeline compacto -->
              <div class="section-divider">
                <h6 class="section-title">
                  <i class="fas fa-history me-2"></i>Historial del Proyecto
                </h6>
                <div class="timeline-compact" id="expandedTimeline">
                  <!-- Se llenará dinámicamente -->
                </div>
              </div>
            </div>
            
            <div class="modal-footer compact-footer">
              <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">
                <i class="fas fa-times me-1"></i>Cerrar
              </button>
              <button type="button" class="btn btn-primary btn-sm" onclick="viewDeliverable('${
                deliverable.id
              }'); bootstrap.Modal.getInstance(document.getElementById('expandedDeliverableModal')).hide();">
                <i class="fas fa-eye me-1"></i>Ver Entregable
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remover modal anterior si existe
    const existingModal = document.getElementById("expandedDeliverableModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Agregar modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Llenar archivos adjuntos del ticket
    const ticketAttachmentsList = document.getElementById(
      "ticketAttachmentsList"
    );
    if (ticket.adjuntos && ticket.adjuntos.length > 0) {
      ticketAttachmentsList.innerHTML = "";
      ticket.adjuntos.forEach((url, index) => {
        const fileName = decodeURIComponent(url.split("/").pop());
        const ext = fileName.split(".").pop().toLowerCase();
        const fileItem = document.createElement("div");
        fileItem.className = "file-item-compact";
        fileItem.innerHTML = `
          <i class="${getFileIcon(ext)} me-2"></i>
          <span class="file-name">${fileName}</span>
          <a href="${url}" target="_blank" class="btn btn-sm btn-outline-primary ms-auto">
            <i class="fas fa-external-link-alt"></i>
          </a>
        `;
        ticketAttachmentsList.appendChild(fileItem);
      });
    } else {
      ticketAttachmentsList.innerHTML =
        '<div class="text-muted small">No hay archivos en el brief</div>';
    }

    // Llenar archivos entregables
    await loadDeliverableFilesCompact(
      deliverable,
      document.getElementById("deliverableFilesList")
    );

    // Llenar timeline compacto
    createTimelineCompact(ticket, document.getElementById("expandedTimeline"));

    // Mostrar modal
    const modal = new bootstrap.Modal(
      document.getElementById("expandedDeliverableModal")
    );
    modal.show();

    // Limpiar al cerrar
    document
      .getElementById("expandedDeliverableModal")
      .addEventListener("hidden.bs.modal", () => {
        document.getElementById("expandedDeliverableModal").remove();
      });
  }

  // Función para cargar archivos entregables en formato compacto
  async function loadDeliverableFilesCompact(deliverable, container) {
    try {
      const ticketId = deliverable.ticket_id;
      const { data, error } = await supabaseClient
        .from("ticket")
        .select("entregables")
        .eq("id_ticket", ticketId)
        .single();

      if (error) throw error;

      const entregables = data?.entregables || [];

      if (!entregables.length) {
        container.innerHTML =
          '<div class="text-muted small">No hay archivos entregables</div>';
        return;
      }

      container.innerHTML = "";

      entregables.forEach((url) => {
        const filename = decodeURIComponent(url.split("/").pop());
        const ext = filename.split(".").pop().toLowerCase();

        const fileItem = document.createElement("div");
        fileItem.className = "file-item-compact deliverable-file";

        fileItem.innerHTML = `
          <i class="${getFileIcon(ext)} me-2"></i>
          <span class="file-name">${filename}</span>
          <div class="file-actions">
            <a href="${url}" target="_blank" class="btn btn-sm btn-outline-primary me-1">
              <i class="fas fa-eye"></i>
            </a>
            <a href="${url}" download class="btn btn-sm btn-outline-secondary">
              <i class="fas fa-download"></i>
            </a>
          </div>
        `;

        container.appendChild(fileItem);
      });
    } catch (err) {
      console.error("Error al cargar archivos:", err);
      container.innerHTML = `
        <div class="alert alert-danger alert-sm">
          <i class="fas fa-exclamation-circle me-2"></i>Error al cargar archivos
        </div>`;
    }
  }

  // Función para crear timeline compacto
  function createTimelineCompact(ticket, container) {
    const timelineEvents = [
      {
        date: ticket.fecha_creacion,
        action: "created",
        user: "Sistema",
        description: "Ticket creado",
      },
      {
        date: ticket.fecha_creacion,
        action: "assigned",
        user: "Sistema",
        description: `Asignado a ${currentUser.nombre}`,
      },
    ];

    // Agregar eventos según el estado
    if (
      ticket.estado === "in-progress" ||
      ticket.estado === "review" ||
      ticket.estado === "delivered" ||
      ticket.estado === "approved"
    ) {
      timelineEvents.push({
        date: ticket.fecha_creacion,
        action: "started",
        user: currentUser.nombre,
        description: "Trabajo iniciado",
      });
    }

    if (
      ticket.estado === "review" ||
      ticket.estado === "delivered" ||
      ticket.estado === "approved"
    ) {
      timelineEvents.push({
        date: ticket.fecha_limite,
        action: "submitted",
        user: currentUser.nombre,
        description: "Entregable enviado para revisión",
      });
    }

    if (ticket.estado === "approved") {
      timelineEvents.push({
        date: ticket.fecha_limite,
        action: "approved",
        user: "Jefe de Operaciones",
        description: "Entregable aprobado",
      });
    }

    container.innerHTML = "";
    timelineEvents.forEach((event, index) => {
      const timelineItem = document.createElement("div");
      timelineItem.className = "timeline-item-compact";

      const iconClass = getTimelineIcon(event.action);
      const isLast = index === timelineEvents.length - 1;

      timelineItem.innerHTML = `
        <div class="timeline-marker ${isLast ? "last" : ""}">
          <div class="timeline-icon-compact">
            <i class="${iconClass}"></i>
          </div>
          ${!isLast ? '<div class="timeline-line"></div>' : ""}
        </div>
        <div class="timeline-content-compact">
          <div class="timeline-description">${event.description}</div>
          <div class="timeline-meta">
            <small class="text-muted">${event.user} • ${formatDate(
        event.date
      )}</small>
          </div>
        </div>
      `;

      container.appendChild(timelineItem);
    });
  }

  function getTimelineIcon(action) {
    const iconMap = {
      created: "fas fa-plus",
      assigned: "fas fa-user-check",
      started: "fas fa-play",
      submitted: "fas fa-upload",
      approved: "fas fa-check",
      rejected: "fas fa-times",
    };
    return iconMap[action] || "fas fa-circle";
  }

  // Función original viewDeliverable (mantener para compatibilidad)
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

  // Función global para vista expandida
  window.viewDeliverableExpanded = viewDeliverableExpanded;

  document
    .getElementById("addDeliverableComment")
    .addEventListener("click", addComment);

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

  function getPriorityName(priority) {
    const priorityMap = {
      low: "Baja",
      medium: "Media",
      high: "Alta",
      urgent: "Urgente",
    };
    return priorityMap[priority] || priority;
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

  // Inicialización
  async function init() {
    await loadUsers();
    await loadClients();
    await loadRealDeliverables();
    mockDeliverables = realDeliverables;
    renderDeliverables();
    setupEventListeners();
  }

  // Ejecutar inicialización
  init();
});
