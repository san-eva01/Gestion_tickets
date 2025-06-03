document.addEventListener("DOMContentLoaded", function () {
  // AGREGAR al inicio del archivo, después de DOMContentLoaded
  const supabaseUrl = "https://onbgqjndemplsgxdaltr.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  let allTickets = [];
  let users = [];
  let clients = [];
  let currentUser = null;

  let mockTasks = {};

  // COPIAR Y PEGAR - NUEVAS FUNCIONES
  // Obtener usuario actual del localStorage
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

      // Actualizar UI con info del usuario
      const userNameElement = document.querySelector(".user-name");
      if (userNameElement) {
        userNameElement.textContent = currentUser.nombre;
      }

      return currentUser;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  }

  // Cargar datos reales de la BD
  async function loadRealData() {
    try {
      // Obtener usuario actual
      await getCurrentUser();
      if (!currentUser) return;

      // Obtener todos los tickets
      const { data: ticketsData, error: ticketsError } = await supabaseClient
        .from("ticket")
        .select("*")
        .order("fecha_creacion", { ascending: false });

      if (ticketsError) throw ticketsError;
      allTickets = ticketsData || [];

      // Obtener usuarios
      const { data: usersData, error: usersError } = await supabaseClient
        .from("usuario")
        .select("*");

      if (usersError) throw usersError;
      users = usersData || [];

      // Obtener clientes
      const { data: clientsData, error: clientsError } = await supabaseClient
        .from("cliente")
        .select("*");

      if (clientsError) throw clientsError;
      clients = clientsData || [];

      // Filtrar tickets del usuario actual y convertir al formato mockTasks
      convertToMockFormat();
      console.log("Usuario actual:", currentUser);
      console.log("Total tickets en BD:", allTickets.length);
      console.log("Mis tickets filtrados:", Object.keys(mockTasks).length);
      console.log("MockTasks:", mockTasks);
      console.log(
        "Datos reales cargados:",
        Object.keys(mockTasks).length,
        "tickets"
      );
    } catch (error) {
      console.error("Error al cargar datos reales:", error);
    }
  }

  // Convertir datos reales al formato que espera el código existente
  function convertToMockFormat() {
    mockTasks = {};

    // Filtrar solo tickets del usuario actual
    const myTickets = allTickets.filter(
      (ticket) => ticket.id_usuario_asignado === currentUser.id_usuario
    );

    myTickets.forEach((ticket) => {
      const assignedUser = users.find(
        (u) => u.id_usuario === ticket.id_usuario_asignado
      );
      const creatorUser = users.find((u) => u.id_usuario === ticket.id_creador);
      const client = clients.find(
        (c) => c.id_cliente === ticket.id_cliente_entregable
      );

      mockTasks[`TKT-${ticket.id_ticket}`] = {
        id: `TKT-${ticket.id_ticket}`,
        title: ticket.titulo,
        type: ticket.categoria,
        client: client ? client.nombre : "Cliente desconocido",
        status: ticket.estado,
        created_date: ticket.fecha_creacion?.split("T")[0],
        deadline: ticket.fecha_limite?.split("T")[0],
        priority: ticket.prioridad || "medium",
        description: ticket.descripcion,
        progress: ticket.progreso || 0,
        created_by: creatorUser ? creatorUser.nombre : "Sistema",
        attachments: [],
        comments: [],
        timeline: [
          {
            date: ticket.fecha_creacion,
            action: "created",
            user: creatorUser ? creatorUser.nombre : "Sistema",
          },
          {
            date: ticket.fecha_creacion,
            action: "assigned",
            user: creatorUser ? creatorUser.nombre : "Sistema",
            assignee: assignedUser ? assignedUser.nombre : "Usuario",
          },
        ],
      };
    });
  }

  // Actualizar contadores con datos reales
  function updateRealCounters() {
    const tickets = Object.values(mockTasks);

    const assignedCount = tickets.filter((t) => t.status === "assigned").length;
    const inProgressCount = tickets.filter(
      (t) => t.status === "in-progress"
    ).length;
    const completedCount = getCompletedThisMonth(tickets);
    const dueCount = getDueSoonTickets(tickets);

    const assignedElement = document.getElementById("assigned-count");
    const inProgressElement = document.getElementById("in-progress-count");
    const completedElement = document.getElementById("completed-count");
    const dueElement = document.getElementById("due-count");

    if (assignedElement) assignedElement.textContent = assignedCount;
    if (inProgressElement) inProgressElement.textContent = inProgressCount;
    if (completedElement) completedElement.textContent = completedCount;
    if (dueElement) dueElement.textContent = dueCount;
  }

  // Calcular completados este mes
  function getCompletedThisMonth(tickets) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return tickets.filter((ticket) => {
      if (ticket.status !== "delivered" && ticket.status !== "approved")
        return false;

      const createdDate = new Date(ticket.created_date);
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    }).length;
  }

  // Calcular próximos a vencer
  function getDueSoonTickets(tickets) {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return tickets.filter((ticket) => {
      if (ticket.status === "delivered" || ticket.status === "approved")
        return false;

      const deadline = new Date(ticket.deadline);
      return deadline >= today && deadline <= nextWeek;
    }).length;
  }

function renderAllTickets() {
    document.getElementById("pending-tasks-container").innerHTML = "";
    document.getElementById("in-progress-tasks-container").innerHTML = "";
    document.getElementById("review-tasks-container").innerHTML = ""; // Add this line
    document.getElementById("completed-tasks-container").innerHTML = "";

    Object.values(mockTasks).forEach((task) => {
        const card = createTaskCard(task);

        if (task.status === "assigned") {
            document.getElementById("pending-tasks-container").appendChild(card);
        } else if (task.status === "in-progress") {
            document.getElementById("in-progress-tasks-container").appendChild(card);
        } else if (task.status === "review") { // Add this condition
            document.getElementById("review-tasks-container").appendChild(card);
        } else if (task.status === "delivered" || task.status === "approved") {
            document.getElementById("completed-tasks-container").appendChild(card);
        }
    });

    updateRealCounters();
    renderUpcomingDeliveriesTable();
}


  function renderUpcomingDeliveriesTable() {
    const tableBody = document.querySelector(".custom-table tbody");
    if (!tableBody) return;

    // Filtrar tickets próximos a vencer y ordenar por fecha
    const upcomingTickets = Object.values(mockTasks)
      .filter((ticket) => {
        if (ticket.status === "delivered" || ticket.status === "approved")
          return false;
        const deadline = new Date(ticket.deadline);
        const today = new Date();
        return deadline >= today;
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5); // Mostrar solo los primeros 5

    tableBody.innerHTML = "";

    if (upcomingTickets.length === 0) {
      tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">No tienes entregas próximas</td>
            </tr>
        `;
      return;
    }

    upcomingTickets.forEach((ticket) => {
      const row = document.createElement("tr");
      const daysRemaining = getDaysRemaining(ticket.deadline);

      row.innerHTML = `
            <td>${ticket.id}</td>
            <td>${ticket.title}</td>
            <td>${ticket.client}</td>
            <td><span class="type-badge ${ticket.type}">${getTypeName(
        ticket.type
      )}</span></td>
            <td><span class="status-badge ${ticket.status}">${getStatusName(
        ticket.status
      )}</span></td>
            <td>${formatDate(ticket.deadline)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon view" onclick="viewTask('${
                      ticket.id
                    }')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;

      tableBody.appendChild(row);
    });
  }

  function createTaskCard(task) {
    const card = document.createElement("div");
    card.className = "order-card";

    let actionButtons = "";
    if (task.status === "assigned") {
      actionButtons = `
                <button class="btn-primary" onclick="startTask('${task.id}')">
                    <i class="fas fa-play"></i> Iniciar
                </button>
            `;
    } else if (task.status === "in-progress") {
      actionButtons = `
                <button class="btn-info" onclick="viewTask('${task.id}')">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <button class="btn-warning" onclick="handleDeliveryConfirmation('${task.id}')">
                    <i class="fas fa-clipboard-check"></i> Entregar
                </button>
            `;
    } else if (task.status === "delivered") {
      actionButtons = `
                <button class="btn-info" onclick="viewTask('${task.id}')">
                    <i class="fas fa-eye"></i> Ver
                </button>
            `;
    }

    card.innerHTML = `
            <div class="order-card-header">
                <h3 class="order-card-title">${task.title}</h3>
                <div class="order-card-meta">
                    <span class="type-badge ${task.type}">${getTypeName(
      task.type
    )}</span>
                    <span class="status-badge ${task.status}">${getStatusName(
      task.status
    )}</span>
                    <span class="priority-badge ${
                      task.priority
                    }">${getPriorityName(task.priority)}</span>
                </div>
            </div>
            <div class="order-card-body">
                <div class="order-info-item">
                    <span class="order-info-label">Cliente:</span>
                    <span class="order-info-value">${task.client}</span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Fecha Entrega:</span>
                    <span class="order-info-value">${formatDate(
                      task.deadline
                    )}</span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Tiempo Restante:</span>
                    <span class="order-info-value ${
                      getDaysRemaining(task.deadline) <= 3 ? "text-danger" : ""
                    }">
                        ${getDaysRemaining(task.deadline)} días
                    </span>
                </div>
                ${
                  task.status === "in-progress"
                    ? `
                <div class="order-info-item">
                    <span class="order-info-label">Progreso:</span>
                    <div class="progress" style="height: 10px; margin-top: 5px;">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${task.progress}%;" 
                             aria-valuenow="${task.progress}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
                `
                    : ""
                }
                <div class="order-description mt-2">
                    <p>${task.description}</p>
                </div>
            </div>
            <div class="order-card-footer">
                <span class="order-id">#${task.id}</span>
                <div class="action-buttons">
                    ${actionButtons}
                </div>
            </div>
        `;

    return card;
  }

  function getDaysRemaining(deadline) {
    const today = new Date();
    const deadlineDate = new Date(deadline);

    if (isNaN(deadlineDate.getTime())) return "Fecha inválida";

    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays < 0 ? 0 : diffDays;
  }

  function updateCounters() {
    let assigned = 0;
    let inProgress = 0;
    let completed = 0;
    let dueSoon = 0;

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    Object.values(mockTasks).forEach((task) => {
      const deadline = new Date(task.deadline);

      if (task.status === "assigned") assigned++;
      if (task.status === "in-progress") inProgress++;
      if (task.status === "delivered") completed++;

      if (
        deadline < nextWeek &&
        deadline > today &&
        (task.status === "assigned" || task.status === "in-progress")
      ) {
        dueSoon++;
      }
    });

    document.getElementById("assigned-count").textContent = assigned;
    document.getElementById("in-progress-count").textContent = inProgress;
    document.getElementById("completed-count").textContent = completed;
    document.getElementById("due-count").textContent = dueSoon;
  }

window.startTask = async function (taskId) {
  console.log("🔍 taskId recibido:", taskId);

  const task = mockTasks[taskId];

  const ticketId = taskId.replace("TKT-", ""); 

  const { data, error } = await supabaseClient
    .from('ticket')
    .update({ estado: "in-progress" })
    .eq('id_ticket', ticketId); 

  const resultado = document.getElementById("resultado");

  if (error) {
    console.error("❌ Error al actualizar:", error);
    if (resultado) {
      resultado.textContent = "Error: " + error.message;
    }
    return;
  }

  if (resultado) {
    resultado.textContent = "Ticket actualizado correctamente.";
  }
  if (task) {
      task.status = "in-progress";
      task.progress = 5;
  }
  showAlert(`Ticket "${task.title}" iniciado`, "success");
  renderAllTickets();
}

window.handleDeliveryConfirmation = async function (taskId) {
  const task = mockTasks[taskId];
const modalHTML = `
    <div class="modal fade" id="deliveryModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow border-0 rounded-3 overflow-hidden">
          <!-- Header -->
          <div class="modal-header bg-gradient-primary text-white py-3" 
               style="background: linear-gradient(135deg, var(--primary-color), var(--accent-color))">
            <h5 class="modal-title d-flex align-items-center gap-2 mb-0" style="color:#ffffff;">
              <i class="fas fa-paper-plane"></i> 
              Entregar Ticket #${task.id}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <!-- Body -->
          <div class="modal-body p-4">
            <!-- Ticket Details -->
            <div class="bg-light p-4 rounded-3 shadow-sm mb-4">
              <h6 class="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                <i class="fas fa-info-circle"></i> 
                Detalles del Ticket
              </h6>
              
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-semibold">Título</label>
                  <div class="fw-medium">${task.title}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-semibold">Cliente</label>
                  <div class="fw-medium">${task.client}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-semibold">Categoría</label>
                  <div><span class="type-badge ${task.type}">${getTypeName(task.type)}</span></div>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-semibold">Prioridad</label>
                  <div><span class="priority-badge ${task.priority}">${getPriorityName(task.priority)}</span></div>
                </div>
                <div class="col-12">
                  <label class="form-label text-muted small fw-semibold">Descripción</label>
                  <div class="text-muted small">${task.description || "Sin descripción"}</div>
                </div>
              </div>
            </div>

            <!-- File Upload -->
            <div class="bg-white p-4 rounded-3 shadow-sm border">
              <h6 class="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                <i class="fas fa-cloud-upload-alt"></i>
                Archivos Entregables
              </h6>
              
              <div class="file-upload-container bg-light rounded-3 p-4 text-center position-relative">
                <input type="file" id="deliveryFiles" multiple 
                       class="position-absolute top-0 start-0 w-100 h-100 opacity-0" 
                       style="cursor: pointer;">
                <div class="py-3">
                  <i class="fas fa-cloud-upload-alt fa-2x text-primary mb-2"></i>
                  <p class="mb-1 fw-medium">Arrastra archivos aquí o haz clic para seleccionar</p>
                  <p class="text-muted small mb-0">Formatos soportados: PDF, Word, Excel, PowerPoint, ZIP, Imágenes</p>
                </div>
              </div>
              
              <div id="deliveryFilesList" class="mt-3">
                <!-- Files will be listed here -->
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-2"></i>Cancelar
            </button>
            <button type="button" class="btn btn-success px-4" id="confirmDeliveryBtn">
              <i class="fas fa-check-circle me-2"></i>Confirmar Entrega
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  // Add modal to document
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Get modal elements
  const deliveryModal = new bootstrap.Modal(document.getElementById('deliveryModal'));
  const deliveryFiles = document.getElementById('deliveryFiles');
  const deliveryFilesList = document.getElementById('deliveryFilesList');
  const confirmDeliveryBtn = document.getElementById('confirmDeliveryBtn');

  // Setup file upload handling
  deliveryFiles.addEventListener('change', function() {
    deliveryFilesList.innerHTML = '';
    
    if (this.files.length > 0) {
      for (const file of this.files) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
          <span><i class="${getFileIcon(file.name.split('.').pop())} me-2"></i>${file.name}</span>
          <i class="fas fa-times remove-file"></i>
        `;
        deliveryFilesList.appendChild(fileItem);
      }

      // Setup remove file buttons
      document.querySelectorAll('.remove-file').forEach(btn => {
        btn.addEventListener('click', function() {
          this.closest('.file-item').remove();
        });
      });
    }
  });

confirmDeliveryBtn.addEventListener('click', async () => {
  if (deliveryFiles.files.length === 0) {
    showAlert('Debes subir al menos un entregable', 'warning');
    return;
  }

  const ticketId = taskId.replace("TKT-", "");
  const uploadedUrls = [];

  try {
    for (const file of deliveryFiles.files) {
      const timestamp = Date.now();
      const filePath = `${ticketId}/${timestamp}-${file.name}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('ticket-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Error al subir archivo:', uploadError);
        showAlert(`Error al subir archivo: ${file.name}`, 'danger');
        return;
      }

      const publicUrl = `${supabaseClient.storage
        .from('ticket-attachments')
        .getPublicUrl(filePath).data.publicUrl}`;

      uploadedUrls.push(publicUrl);
    }

    // Actualizar ticket en la tabla
    const { error: updateError } = await supabaseClient
      .from('ticket')
      .update({
        estado: 'review',
        entregables: uploadedUrls
      })
      .eq('id_ticket', ticketId);

    if (updateError) {
      console.error("❌ Error al actualizar ticket:", updateError);
      showAlert("Error al actualizar el ticket", 'danger');
      return;
    }

    // Actualizar estado local
    task.status = 'review';
    task.timeline = task.timeline || [];
    task.timeline.push({
      date: new Date().toISOString(),
      action: 'status_change',
      user: currentUser.nombre,
      from_status: 'in-progress',
      to_status: 'review'
    });

    // Cerrar modal
    deliveryModal.hide();
    if (taskModalInstance) taskModalInstance.hide();
    document.getElementById('deliveryModal').remove();

    showAlert(`Ticket "${task.title}" enviado a revisión`, 'success');
    renderAllTickets();

  } catch (error) {
    console.error("❌ Error en entrega:", error);
    showAlert('Ocurrió un error al entregar el ticket', 'danger');
  }
});


  // Show the modal
  deliveryModal.show();
}



  let taskModalInstance = null;

  window.viewTask = function (taskId) {
    if (!taskId) {
      console.error("No se proporcionó un ID de tarea válido");
      return;
    }

    const task = mockTasks[taskId];
    if (!task) {
      console.error(`No se encontró la tarea con ID: ${taskId}`);
      showAlert("No se pudo cargar la tarea solicitada", "danger");
      return;
    }

    const modalElement = document.getElementById("viewTaskModal");
    if (!modalElement) {
      console.error("No se encontró el elemento del modal");
      return;
    }

    const closeModalHandler = () => {
      if (taskModalInstance) {
        taskModalInstance.hide();
      }
    };

    const hiddenModalHandler = () => {
      resetModalState();
    };

    const resetModalState = () => {
      const elementsToReset = [
        "viewTaskId",
        "viewTaskTitle",
        "viewTaskType",
        "viewTaskStatus",
        "viewTaskPriority",
        "viewTaskClient",
        "viewCreatedBy",
        "viewCreatedDate",
        "viewDeadline",
        "viewDescription",
        "progressPercentage",
      ];

      elementsToReset.forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.textContent = "";
      });

      const classElements = [
        { id: "viewTaskType", className: "type-badge" },
        { id: "viewTaskStatus", className: "status-badge" },
        { id: "viewTaskPriority", className: "priority-badge" },
      ];

      classElements.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) element.className = item.className;
      });

      const listsToClear = [
        "viewAttachmentsList",
        "deliverablesList",
        "taskTimeline",
        "viewCommentsContainer",
      ];

      listsToClear.forEach((id) => {
        const list = document.getElementById(id);
        if (list) list.innerHTML = "";
      });
    };

    if (taskModalInstance) {
      try {
        const closeButton = modalElement.querySelector(".btn-close");
        if (closeButton) {
          closeButton.removeEventListener("click", closeModalHandler);
        }
        modalElement.removeEventListener("hidden.bs.modal", hiddenModalHandler);
        taskModalInstance.dispose();
      } catch (e) {
        console.warn("Error al limpiar la instancia anterior del modal:", e);
      }
    }

    try {
      taskModalInstance = new bootstrap.Modal(modalElement, {
        backdrop: "static",
        keyboard: false,
      });
    } catch (e) {
      console.error("Error al crear la instancia del modal:", e);
      return;
    }

    const closeButton = modalElement.querySelector(".btn-close");
    if (closeButton) {
      closeButton.addEventListener("click", closeModalHandler);
    }
    modalElement.addEventListener("hidden.bs.modal", hiddenModalHandler, {
      once: true,
    });

    const setContentSafe = (
      elementId,
      content,
      isAttribute = false,
      attrName = "textContent"
    ) => {
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`Elemento con ID ${elementId} no encontrado`);
        return;
      }

      try {
        if (isAttribute) {
          element.setAttribute(attrName, content);
        } else {
          element[attrName] = content;
        }
      } catch (e) {
        console.error(`Error al establecer contenido para ${elementId}:`, e);
      }
    };

    setContentSafe("viewTaskId", task.id);
    setContentSafe("viewTaskTitle", task.title);
    setContentSafe("viewTaskType", getTypeName(task.type));
    setContentSafe("viewTaskStatus", getStatusName(task.status));
    setContentSafe("viewTaskPriority", getPriorityName(task.priority));
    setContentSafe("viewTaskClient", task.client);
    setContentSafe("viewCreatedBy", task.created_by);
    setContentSafe("viewCreatedDate", formatDate(task.created_date));
    setContentSafe("viewDeadline", formatDate(task.deadline));
    setContentSafe("viewDescription", task.description);

    const setClassSafe = (elementId, ...classNames) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.className = "";
        classNames.forEach((className) => {
          if (className) element.classList.add(className);
        });
      }
    };

    setClassSafe("viewTaskType", "type-badge", task.type);
    setClassSafe("viewTaskStatus", "status-badge", task.status);
    setClassSafe("viewTaskPriority", "priority-badge", task.priority);

    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
      progressBar.style.width = `${task.progress}%`;
      progressBar.setAttribute("aria-valuenow", task.progress);
    }
    setContentSafe("progressPercentage", `${task.progress}%`);

    const newProgressSlider = document.getElementById("newProgress");
    if (newProgressSlider) {
      newProgressSlider.value = task.progress;
    }

    const updateProgressGroup = document.getElementById("updateProgressGroup");
    if (updateProgressGroup) {
      updateProgressGroup.style.display =
        task.status === "in-progress" ? "block" : "none";
    }

    const attachmentsList = document.getElementById("viewAttachmentsList");
    if (attachmentsList) {
      attachmentsList.innerHTML = "";

      if (task.attachments?.length > 0) {
        task.attachments.forEach((file) => {
          const icon = getFileIcon(file.type);
          const attachmentItem = document.createElement("div");
          attachmentItem.className = "attachment-item";
          attachmentItem.innerHTML = `
                    <i class="${icon}"></i>
                    <a href="#" onclick="downloadFile('${file.name}'); return false;">${file.name}</a>
                `;
          attachmentsList.appendChild(attachmentItem);
        });
      }
    }

    const attachmentsSection = document.getElementById("viewAttachments");
    if (attachmentsSection) {
      attachmentsSection.style.display =
        task.attachments?.length > 0 ? "block" : "none";
    }

    const deliverableSection = document.getElementById("deliverableSection");
    if (deliverableSection) {
      deliverableSection.style.display =
        task.status === "in-progress" ? "block" : "none";
    }

    const deliverablesList = document.getElementById("deliverablesList");
    if (deliverablesList) {
      deliverablesList.innerHTML = "";

      if (task.deliverables?.length > 0) {
        task.deliverables.forEach((file) => {
          const icon = getFileIcon(file.type);
          const deliverableItem = document.createElement("div");
          deliverableItem.className = "file-item";
          deliverableItem.innerHTML = `
                    <span><i class="${icon} me-2"></i>${file.name}</span>
                    <i class="fas fa-download" onclick="downloadFile('${file.name}')"></i>
                `;
          deliverablesList.appendChild(deliverableItem);
        });
      }
    }

    const timeline = document.getElementById("taskTimeline");
    if (timeline) {
      timeline.innerHTML = "";

      if (task.timeline?.length > 0) {
        task.timeline.forEach((event) => {
          const timelineItem = document.createElement("div");
          timelineItem.className = "timeline-item";

          let iconClass = "";
          let actionText = "";

          switch (event.action) {
            case "created":
              iconClass = "fas fa-plus";
              actionText = `<strong>${event.user}</strong> creó el ticket`;
              break;
            case "assigned":
              iconClass = "fas fa-user-check";
              actionText = `<strong>${event.user}</strong> asignó el ticket a <strong>${event.assignee}</strong>`;
              break;
            case "status_change":
              iconClass = "fas fa-sync-alt";
              actionText = `<strong>${
                event.user
              }</strong> cambió el estado de <strong>${getStatusName(
                event.from_status
              )}</strong> a <strong>${getStatusName(event.to_status)}</strong>`;
              break;
            case "comment":
              iconClass = "fas fa-comment";
              actionText = `<strong>${event.user}</strong> agregó un comentario`;
              break;
            case "deliverable_upload":
              iconClass = "fas fa-cloud-upload-alt";
              actionText = `<strong>${event.user}</strong> subió el archivo: ${event.files}`;
              break;
            case "progress_update":
              iconClass = "fas fa-tasks";
              actionText = `<strong>${event.user}</strong> actualizó el progreso a ${event.progress}`;
              break;
          }

          timelineItem.innerHTML = `
                    <div class="timeline-icon bg-primary">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="timeline-content">
                        <p>${actionText}</p>
                        <span class="timeline-date">${formatDateTime(
                          event.date
                        )}</span>
                    </div>
                `;

          timeline.appendChild(timelineItem);
        });
      } else {
        timeline.innerHTML =
          '<p class="text-center text-muted">No hay eventos en el historial</p>';
      }
    }

    const commentsContainer = document.getElementById("viewCommentsContainer");
    if (commentsContainer) {
      commentsContainer.innerHTML = "";

      if (task.comments?.length > 0) {
        task.comments.forEach((comment) => {
          const commentElement = document.createElement("div");
          commentElement.className = "comment";
          commentElement.innerHTML = `
                    <div class="comment-avatar">${comment.avatar}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">${comment.user}</span>
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
    }

    setupTaskActions(task);

    try {
      taskModalInstance.show();
    } catch (e) {
      console.error("Error al mostrar el modal:", e);
      showAlert("Error al abrir la vista de tarea", "danger");
    }
  };

  function setupTaskActions(task) {
    const taskActions = document.getElementById("taskActions");
    taskActions.innerHTML = "";

    switch (task.status) {
      case "assigned":
        const startBtn = document.createElement("button");
        startBtn.className = "btn-primary";
        startBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar Ticket';
        startBtn.addEventListener("click", () => startTask(task.id));
        taskActions.appendChild(startBtn);
        break;

      case "in-progress":
        const reviewBtn = document.createElement("button");
        reviewBtn.className = "btn-warning";
        reviewBtn.innerHTML =
          '<i class="fas fa-clipboard-check"></i> Enviar a Revisión';
        reviewBtn.addEventListener("click", () => {
          if (!task.deliverables || task.deliverables.length === 0) {
            const fileInput = document.getElementById("taskDeliverables");
            if (fileInput.files.length === 0) {
              showAlert(
                "Debes subir al menos un entregable antes de enviar a revisión",
                "warning"
              );
              return;
            }
          }
          handleDeliveryConfirmation(task.id);
        });
        taskActions.appendChild(reviewBtn);
        break;

      case "delivered":
        const badge = document.createElement("span");
        badge.className = "status-badge delivered";
        badge.textContent = "Entregado";
        taskActions.appendChild(badge);
        break;
    }
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

  function addComment() {
    const taskId = document.getElementById("viewTaskId").textContent;
    const commentText = document.getElementById("newTaskComment").value;

    if (!commentText.trim()) return;

    const task = mockTasks[taskId];
    if (!task) return;

    if (!task.comments) {
      task.comments = [];
    }

    const newComment = {
      user: "Carlos Ruiz",
      avatar: "CR",
      date: new Date().toISOString(),
      text: commentText,
    };

    task.comments.push(newComment);

    if (!task.timeline) {
      task.timeline = [];
    }

    task.timeline.push({
      date: new Date().toISOString(),
      action: "comment",
      user: "Carlos Ruiz",
    });

    const commentsContainer = document.getElementById("viewCommentsContainer");
    const commentElement = document.createElement("div");
    commentElement.className = "comment";
    commentElement.innerHTML = `
            <div class="comment-avatar">${newComment.avatar}</div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${newComment.user}</span>
                    <span class="comment-date">${formatDateTime(
                      newComment.date
                    )}</span>
                </div>
                <p class="comment-text">${newComment.text}</p>
            </div>
        `;
    commentsContainer.appendChild(commentElement);

    document.getElementById("newTaskComment").value = "";

    showAlert("Comentario agregado", "success");
  }

  function updateProgress() {
    const taskId = document.getElementById("viewTaskId").textContent;
    const newProgress = parseInt(document.getElementById("newProgress").value);

    const task = mockTasks[taskId];
    if (!task) return;

    task.progress = newProgress;

    if (!task.timeline) {
      task.timeline = [];
    }

    task.timeline.push({
      date: new Date().toISOString(),
      action: "progress_update",
      user: "Carlos Ruiz",
      progress: `${newProgress}%`,
    });

    const progressBar = document.getElementById("progressBar");
    const progressPercentage = document.getElementById("progressPercentage");

    progressBar.style.width = `${newProgress}%`;
    progressBar.setAttribute("aria-valuenow", newProgress);
    progressPercentage.textContent = `${newProgress}%`;

    showAlert(`Progreso actualizado a ${newProgress}%`, "success");
  }

  function setupDeliverableUpload() {
    const taskDeliverables = document.getElementById("taskDeliverables");
    const deliverablesList = document.getElementById("deliverablesList");

    if (!taskDeliverables || !deliverablesList) return;

    taskDeliverables.addEventListener("change", function () {
      deliverablesList.innerHTML = "";

      if (this.files.length > 0) {
        for (const file of this.files) {
          const fileItem = document.createElement("div");
          fileItem.className = "file-item";
          fileItem.innerHTML = `
                        <span><i class="${getFileIcon(
                          file.name.split(".").pop()
                        )} me-2"></i>${file.name}</span>
                        <i class="fas fa-times remove-file"></i>
                    `;
          deliverablesList.appendChild(fileItem);
        }

        document.querySelectorAll(".remove-file").forEach((btn) => {
          btn.addEventListener("click", function () {
            this.closest(".file-item").remove();
          });
        });
      }
    });
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
      created: "Creado",
      assigned: "Asignado",
      "in-progress": "En Proceso",
      review: "En Revisión",
      approved: "Aprobado",
      delivered: "Entregado",
      rejected: "Rechazado",
    };
    return statusMap[status] || status;
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

  function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  loadRealData().then(() => {
    renderAllTickets();
  });
});
