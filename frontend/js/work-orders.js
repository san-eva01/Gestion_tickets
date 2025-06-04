document.addEventListener("DOMContentLoaded", function () {
  // Verificar que estamos en la página de tickets
  const orderTableBody = document.getElementById("orderTableBody");
  if (!orderTableBody) return;

  // Configuración de Supabase
  const supabaseUrl = "https://onbgqjndemplsgxdaltr.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw";

  // Usar la librería global de Supabase
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // Agrega esto al inicio de tu archivo JS, después de crear el cliente Supabase
  const STORAGE_BUCKET = "ticket-attachments";

  // Función para configurar el bucket (ejecutar una sola vez)
  async function setupStorageBucket() {
    try {
      const { data, error } = await supabase.storage.createBucket(
        STORAGE_BUCKET,
        {
          public: false,
          allowedMimeTypes: ["image/*", "application/pdf"],
          fileSizeLimit: 5, // 5MB
        }
      );

      if (error && error.message !== "Bucket already exists") throw error;
      console.log("Bucket configurado correctamente");
    } catch (error) {
      console.error("Error configurando el bucket:", error);
    }
  }

  // Ejecutar esta función una vez para crear el bucket
  setupStorageBucket();

  // Elementos del DOM
  const ordersGrid = document.getElementById("ordersGrid");
  const calendarDays = document.getElementById("calendarDays");
  const orderForm = document.getElementById("orderForm");
  const searchInput = document.querySelector(".search-input");
  const statusFilter = document.getElementById("statusFilter");
  const typeFilter = document.getElementById("typeFilter");
  const dateFromFilter = document.getElementById("dateFrom");
  const dateToFilter = document.getElementById("dateTo");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const viewContainers = document.querySelectorAll(".view");
  const btnNewOrder = document.getElementById("btnNewOrder");

  // Modales
  const orderModal = new bootstrap.Modal(document.getElementById("orderModal"));
  const viewOrderModal = new bootstrap.Modal(
    document.getElementById("viewOrderModal")
  );
  const deleteConfirmModal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal"),
    {
      backdrop: "static",
      keyboard: false,
    }
  );

  // Variables de estado
  let tickets = [];
  let users = [];
  let clients = [];
  let currentUser = null;
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  let totalItems = 0;
  let allTickets = [];
  let filteredTickets = [];

  function getPagination(page, size) {
    const limit = size ? +size : 10;
    const from = page ? (page - 1) * limit : 0;
    const to = page ? from + size - 1 : size - 1;
    return { from, to, limit };
  }

  function updatePaginationInfo() {
    const paginationInfoElements =
      document.querySelectorAll(".pagination-info");
    const prevButtons = document.querySelectorAll(
      ".pagination-btn:first-child"
    );
    const nextButtons = document.querySelectorAll(".pagination-btn:last-child");

    // Actualizar texto de información
    paginationInfoElements.forEach((element) => {
      element.textContent = `Página ${currentPage} de ${totalPages} (${totalItems} tickets total)`;
    });

    // Actualizar estado de botones
    prevButtons.forEach((btn) => {
      btn.disabled = currentPage <= 1;
      btn.style.opacity = currentPage <= 1 ? "0.5" : "1";
      btn.style.cursor = currentPage <= 1 ? "not-allowed" : "pointer";
    });

    nextButtons.forEach((btn) => {
      btn.disabled = currentPage >= totalPages;
      btn.style.opacity = currentPage >= totalPages ? "0.5" : "1";
      btn.style.cursor = currentPage >= totalPages ? "not-allowed" : "pointer";
    });
  }

  function goToPreviousPage() {
    if (currentPage > 1) {
      fetchTickets(currentPage - 1, itemsPerPage);
    }
  }

  function goToNextPage() {
    if (currentPage < totalPages) {
      fetchTickets(currentPage + 1, itemsPerPage);
    }
  }

  async function filterWithPagination(
    searchTerm,
    statusValue,
    typeValue,
    dateFrom,
    dateTo
  ) {
    try {
      // Construir la query con filtros
      let query = supabase
        .from("ticket")
        .select("*", { count: "exact" })
        .order("fecha_creacion", { ascending: false });

      // Aplicar filtros a la query
      if (statusValue === "completed") {
        query = query.in("estado", ["delivered", "approved"]);
      } else if (statusValue) {
        query = query.eq("estado", statusValue);
      }

      if (typeValue) {
        query = query.eq("categoria", typeValue);
      }

      if (dateFrom && dateTo) {
        query = query
          .gte("fecha_limite", dateFrom.toISOString().split("T")[0])
          .lte("fecha_limite", dateTo.toISOString().split("T")[0]);
      } else if (dateFrom) {
        query = query.gte("fecha_limite", dateFrom.toISOString().split("T")[0]);
      } else if (dateTo) {
        query = query.lte("fecha_limite", dateTo.toISOString().split("T")[0]);
      }

      // Aplicar paginación
      const { from, to } = getPagination(currentPage, itemsPerPage);
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      // Filtrar por texto en el frontend (porque incluye datos de usuarios)
      let filteredData = data || [];

      if (searchTerm) {
        filteredData = filteredData.filter((ticket) => {
          const assignedUser = users.find(
            (u) => u.id_usuario === ticket.id_usuario_asignado
          );
          const assignedName = assignedUser
            ? assignedUser.nombre.toLowerCase()
            : "";
          const clientName = getClientName(
            ticket.id_cliente_entregable
          ).toLowerCase();

          return (
            ticket.titulo.toLowerCase().includes(searchTerm) ||
            ticket.id_ticket.toString().toLowerCase().includes(searchTerm) ||
            assignedName.includes(searchTerm) ||
            clientName.includes(searchTerm)
          );
        });
      }

      tickets = filteredData;
      totalItems = count;
      totalPages = Math.ceil(totalItems / itemsPerPage);

      updatePaginationInfo();
      renderOrders(filteredData);
    } catch (error) {
      console.error("Error al filtrar tickets:", error);
      showAlert(`Error al filtrar tickets: ${error.message}`, "danger");
    }
  }

  function changePageSize(newSize) {
    itemsPerPage = newSize;
    currentPage = 1; // Resetear a la primera página
    fetchTickets(1, itemsPerPage);
  }

  function checkAndApplyURLFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get("status");

    if (statusParam) {
      // Mostrar indicador de filtro activo
      showActiveFilterBadge(statusParam);

      // Aplicar el filtro según el parámetro
      applyFilterFromDashboard(statusParam);
    }
  }

  // Función para aplicar filtro basado en el parámetro del dashboard
  function applyFilterFromDashboard(statusParam) {
    const statusFilter = document.getElementById("statusFilter");
    if (!statusFilter) return;

    let filterValue = "";

    switch (statusParam) {
      case "in-progress":
        filterValue = "in-progress";
        break;
      case "review":
        filterValue = "review";
        break;
      case "completed":
        // Para completados, necesitamos filtrar por múltiples estados
        // Usaremos una función especial
        applyCompletedFilter();
        return;
      default:
        filterValue = "";
    }

    // Aplicar el filtro
    statusFilter.value = filterValue;
    filterOrders();
  }

  // Función especial para filtrar tickets completados (delivered + approved)
  function applyCompletedFilter() {
    const filteredTickets = tickets.filter(
      (ticket) => ticket.estado === "delivered" || ticket.estado === "approved"
    );

    renderOrders(filteredTickets);

    // Actualizar el dropdown para mostrar que hay un filtro personalizado
    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) {
      // Agregar opción temporal para "completados"
      const completedOption = document.createElement("option");
      completedOption.value = "completed";
      completedOption.textContent = "Completados (Dashboard)";
      completedOption.selected = true;
      statusFilter.appendChild(completedOption);
    }
  }

  // Función para limpiar el filtro del dashboard
  function clearDashboardFilter() {
    // Limpiar parámetros de URL
    const url = new URL(window.location);
    url.searchParams.delete("status");
    window.history.replaceState({}, "", url);

    // Ocultar badge
    const badge = document.getElementById("activeFilterBadge");
    if (badge) {
      badge.style.display = "none";
    }

    // Limpiar filtros
    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) {
      // Remover opción de completados si existe
      const completedOption = statusFilter.querySelector(
        'option[value="completed"]'
      );
      if (completedOption) {
        completedOption.remove();
      }

      statusFilter.value = "";
    }

    // Renderizar todos los tickets
    renderOrders();

    showAlert("Filtro eliminado", "info");
  }

  // Función modificada para filtrar órdenes (reemplazar la existente)
  function filterOrders() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const statusValue = statusFilter ? statusFilter.value : "";
    const typeValue = typeFilter ? typeFilter.value : "";
    const dateFrom =
      dateFromFilter && dateFromFilter.value
        ? new Date(dateFromFilter.value)
        : null;
    const dateTo =
      dateToFilter && dateToFilter.value ? new Date(dateToFilter.value) : null;

    const filtered = tickets.filter((ticket) => {
      const assignedUser = users.find(
        (u) => u.id_usuario === ticket.id_usuario_asignado
      );
      const assignedName = assignedUser
        ? assignedUser.nombre.toLowerCase()
        : "";

      const clientName = getClientName(
        ticket.id_cliente_entregable
      ).toLowerCase();

      const matchesSearch =
        !searchTerm ||
        ticket.titulo.toLowerCase().includes(searchTerm) ||
        ticket.id_ticket.toString().toLowerCase().includes(searchTerm) ||
        assignedName.includes(searchTerm) ||
        clientName.includes(searchTerm);

      // Manejar filtro de estado especial para "completed"
      let matchesStatus = true;
      if (statusValue === "completed") {
        matchesStatus =
          ticket.estado === "delivered" || ticket.estado === "approved";
      } else {
        matchesStatus = !statusValue || ticket.estado === statusValue;
      }

      const matchesType = !typeValue || ticket.categoria === typeValue;

      let matchesDate = true;
      const ticketDate = new Date(ticket.fecha_limite);

      if (dateFrom && dateTo) {
        matchesDate = ticketDate >= dateFrom && ticketDate <= dateTo;
      } else if (dateFrom) {
        matchesDate = ticketDate >= dateFrom;
      } else if (dateTo) {
        matchesDate = ticketDate <= dateTo;
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });

    renderOrders(filtered);
  }

  // Inicialización
  init();

  // Event Listeners
  if (btnNewOrder) {
    btnNewOrder.addEventListener("click", () => showOrderModal());
  }

  if (orderForm) {
    orderForm.addEventListener("submit", handleOrderSubmit);
  }

  if (document.getElementById("confirmDelete")) {
    document
      .getElementById("confirmDelete")
      .addEventListener("click", confirmDeleteOrder);
  }

  // Event listener adicional para el botón Cancelar
  document
    .querySelector("#deleteConfirmModal .btn-secondary")
    ?.addEventListener("click", function () {
      deleteConfirmModal.hide();
    });

  if (document.getElementById("editOrderBtn")) {
    document
      .getElementById("editOrderBtn")
      .addEventListener("click", handleEditButtonClick);
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterOrders);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", filterOrders);
  }

  if (typeFilter) {
    typeFilter.addEventListener("change", filterOrders);
  }

  if (dateFromFilter) {
    dateFromFilter.addEventListener("change", filterOrders);
  }

  if (dateToFilter) {
    dateToFilter.addEventListener("change", filterOrders);
  }

  if (document.getElementById("viewAddComment")) {
    document
      .getElementById("viewAddComment")
      .addEventListener("click", addViewComment);
  }

  if (document.getElementById("addComment")) {
    document.getElementById("addComment").addEventListener("click", addComment);
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      viewContainers.forEach((v) => v.classList.remove("active"));

      btn.classList.add("active");
      const viewId = btn.getAttribute("data-view") + "View";
      document.getElementById(viewId).classList.add("active");

      if (viewId === "calendarView") {
        renderCalendar();
      }
    });
  });

  document.querySelectorAll(".pagination-btn").forEach((btn, index) => {
    btn.addEventListener("click", function () {
      if (this.disabled) return;

      // Los botones pares (0, 2, 4...) son "anterior", los impares (1, 3, 5...) son "siguiente"
      if (index % 2 === 0) {
        goToPreviousPage();
      } else {
        goToNextPage();
      }
    });
  });

  // Funciones globales para los botones de acción
  window.editTicket = function (ticketId) {
    const ticket = tickets.find((t) => t.id_ticket === ticketId);

    if (!ticket) return;

    if (
      currentUser.rol !== "Admin" &&
      ticket.id_creador !== currentUser.id_usuario
    ) {
      showAlert("No tienes permiso para editar este ticket", "warning");
      return;
    }

    showOrderModal(ticketId);
  };

  // En work-orders.js, reemplaza la función clearDashboardFilter existente con esta versión corregida:

  // Función para limpiar el filtro del dashboard (CORREGIDA COMPLETAMENTE)
  // En work-orders.js, reemplaza la función clearDashboardFilter existente con esta versión corregida:

  // Función para limpiar el filtro del dashboard (SOLUCIÓN DEFINITIVA)
  window.clearDashboardFilter = function () {
    console.log("🔍 Iniciando limpieza de filtros...");

    // 1. Limpiar parámetros de URL
    const url = new URL(window.location);
    url.searchParams.delete("status");
    window.history.replaceState({}, "", url);

    // 2. Ocultar badge
    const badge = document.getElementById("activeFilterBadge");
    if (badge) {
      badge.style.display = "none";
      console.log("✅ Badge ocultado");
    }

    // 3. Resetear TODOS los filtros
    const statusFilter = document.getElementById("statusFilter");
    const typeFilter = document.getElementById("typeFilter");
    const searchInput = document.querySelector(".search-input");
    const dateFromFilter = document.getElementById("dateFrom");
    const dateToFilter = document.getElementById("dateTo");

    if (statusFilter) {
      const completedOption = statusFilter.querySelector(
        'option[value="completed"]'
      );
      if (completedOption) {
        completedOption.remove();
      }
      statusFilter.selectedIndex = 0;
      statusFilter.value = "";
      console.log("✅ Filtro de estado reseteado");
    }

    if (typeFilter) {
      typeFilter.selectedIndex = 0;
      typeFilter.value = "";
    }
    if (searchInput) searchInput.value = "";
    if (dateFromFilter) dateFromFilter.value = "";
    if (dateToFilter) dateToFilter.value = "";

    // 4. FORZAR recarga sin filtros
    currentPage = 1;

    console.log("🔄 Recargando todos los tickets...");

    // Método principal: recargar desde BD
    if (typeof fetchTickets === "function") {
      fetchTickets(1, itemsPerPage);
    } else {
      // Método de respaldo: renderizar todos los tickets actuales
      console.log("📋 Usando método de respaldo...");
      if (typeof tickets !== "undefined" && tickets.length > 0) {
        if (typeof renderOrders === "function") {
          renderOrders(tickets);
        }
      } else {
        // Último recurso: recargar página
        console.log("🔄 Recargando página...");
        window.location.reload();
      }
    }

    showAlert("Filtros eliminados - Mostrando todos los tickets", "success");
    console.log("✅ Limpieza completada");
  };

  // También actualiza la función showActiveFilterBadge para asegurar que el evento click funcione:
  function showActiveFilterBadge(statusParam) {
    // Crear badge si no existe
    let badge = document.getElementById("activeFilterBadge");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "activeFilterBadge";
      badge.className = "active-filter-badge";

      const filterControls = document.querySelector(".filter-controls");
      if (filterControls) {
        filterControls.insertBefore(badge, filterControls.firstChild);
      }
    }

    // Configurar contenido del badge
    let badgeText = "";
    let badgeIcon = "fas fa-filter";

    switch (statusParam) {
      case "in-progress":
        badgeText = "Filtro: En Proceso";
        break;
      case "review":
        badgeText = "Filtro: En Revisión";
        break;
      case "completed":
        badgeText = "Filtro: Completados";
        break;
      default:
        badgeText = "Filtro aplicado desde Dashboard";
    }

    badge.innerHTML = `
      <div class="badge-content">
          <i class="${badgeIcon}"></i>
          <span>${badgeText}</span>
          <button class="clear-filter-btn" type="button" title="Limpiar filtro">
              <i class="fas fa-times"></i>
          </button>
      </div>
  `;

    // IMPORTANTE: Agregar el event listener directamente al botón
    const clearBtn = badge.querySelector(".clear-filter-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearDashboardFilter();
      });
    }

    badge.style.display = "flex";
  }

  // También actualiza la función showActiveFilterBadge para asegurar que el evento click funcione:
  function showActiveFilterBadge(statusParam) {
    // Crear badge si no existe
    let badge = document.getElementById("activeFilterBadge");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "activeFilterBadge";
      badge.className = "active-filter-badge";

      const filterControls = document.querySelector(".filter-controls");
      if (filterControls) {
        filterControls.insertBefore(badge, filterControls.firstChild);
      }
    }

    // Configurar contenido del badge
    let badgeText = "";
    let badgeIcon = "fas fa-filter";

    switch (statusParam) {
      case "in-progress":
        badgeText = "Filtro: En Proceso";
        break;
      case "review":
        badgeText = "Filtro: En Revisión";
        break;
      case "completed":
        badgeText = "Filtro: Completados";
        break;
      default:
        badgeText = "Filtro aplicado desde Dashboard";
    }

    badge.innerHTML = `
      <div class="badge-content">
          <i class="${badgeIcon}"></i>
          <span>${badgeText}</span>
          <button class="clear-filter-btn" type="button" title="Limpiar filtro">
              <i class="fas fa-times"></i>
          </button>
      </div>
  `;

    // IMPORTANTE: Agregar el event listener directamente al botón
    const clearBtn = badge.querySelector(".clear-filter-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearDashboardFilter();
      });
    }

    badge.style.display = "flex";
  }

  function showActiveFilterBadge(statusParam) {
    // Crear badge si no existe
    let badge = document.getElementById("activeFilterBadge");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "activeFilterBadge";
      badge.className = "active-filter-badge";

      const filterControls = document.querySelector(".filter-controls");
      if (filterControls) {
        filterControls.insertBefore(badge, filterControls.firstChild);
      }
    }

    // Configurar contenido del badge
    let badgeText = "";
    let badgeIcon = "fas fa-filter";

    switch (statusParam) {
      case "in-progress":
        badgeText = "Filtro: En Proceso";
        break;
      case "review":
        badgeText = "Filtro: En Revisión";
        break;
      case "completed":
        badgeText = "Filtro: Completados";
        break;
      default:
        badgeText = "Filtro aplicado desde Dashboard";
    }

    badge.innerHTML = `
      <div class="badge-content">
          <i class="${badgeIcon}"></i>
          <span>${badgeText}</span>
          <button class="clear-filter-btn" type="button" title="Limpiar filtro">
              <i class="fas fa-times"></i>
          </button>
      </div>
  `;

    // IMPORTANTE: Agregar el event listener directamente al botón
    const clearBtn = badge.querySelector(".clear-filter-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearDashboardFilter();
      });
    }

    badge.style.display = "flex";
  }

  // También actualiza la función showActiveFilterBadge para asegurar que el evento click funcione:
  function showActiveFilterBadge(statusParam) {
    // Crear badge si no existe
    let badge = document.getElementById("activeFilterBadge");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "activeFilterBadge";
      badge.className = "active-filter-badge";

      const filterControls = document.querySelector(".filter-controls");
      if (filterControls) {
        filterControls.insertBefore(badge, filterControls.firstChild);
      }
    }

    // Configurar contenido del badge
    let badgeText = "";
    let badgeIcon = "fas fa-filter";

    switch (statusParam) {
      case "in-progress":
        badgeText = "Filtro: En Proceso";
        break;
      case "review":
        badgeText = "Filtro: En Revisión";
        break;
      case "completed":
        badgeText = "Filtro: Completados";
        break;
      default:
        badgeText = "Filtro aplicado desde Dashboard";
    }

    badge.innerHTML = `
      <div class="badge-content">
          <i class="${badgeIcon}"></i>
          <span>${badgeText}</span>
          <button class="clear-filter-btn" type="button" title="Limpiar filtro">
              <i class="fas fa-times"></i>
          </button>
      </div>
  `;

    // IMPORTANTE: Agregar el event listener directamente al botón
    const clearBtn = badge.querySelector(".clear-filter-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearDashboardFilter();
      });
    }

    badge.style.display = "flex";
  }

  window.deleteTicket = function (ticketId) {
    const ticket = tickets.find((t) => t.id_ticket === ticketId);

    if (!ticket) return;

    if (
      currentUser.rol !== "Admin" &&
      ticket.id_creador !== currentUser.id_usuario
    ) {
      showAlert("No tienes permiso para eliminar este ticket", "warning");
      return;
    }

    document.getElementById("deleteOrderId").textContent = ticketId;
    deleteConfirmModal.show();
  };

  // Funciones principales
  async function init() {
    const isAuthenticated = await checkAuthStatus();
    if (!isAuthenticated) return;

    await getCurrentUser();

    // CAMBIO: Cargar usuarios y clientes ANTES que los tickets
    await fetchUsers();
    await fetchClients();

    // Ahora cargar los tickets después de tener usuarios y clientes
    await fetchTickets(1, itemsPerPage);
    checkAndApplyURLFilters();

    populateAssigneeDropdown();
    populateClientDropdown();
    setupFileUpload();
    renderCalendar();
  }

  async function checkAuthStatus() {
    const token = localStorage.getItem("taskflow_token");
    if (!token) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  async function getCurrentUser() {
    try {
      const userStr = localStorage.getItem("taskflow_user");
      if (!userStr) {
        console.error("No se encontró usuario en localStorage");
        return null;
      }

      const userData = JSON.parse(userStr);

      if (!userData.id || !userData.name) {
        console.error("Datos de usuario incompletos en localStorage");
        return null;
      }

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

  async function fetchTickets(page = 1, pageSize = itemsPerPage) {
    try {
      currentPage = page;
      itemsPerPage = pageSize;

      // Primero obtenemos el conteo total
      const { count, error: countError } = await supabase
        .from("ticket")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      totalItems = count;
      totalPages = Math.ceil(totalItems / itemsPerPage);

      // Luego obtenemos los datos paginados
      const { from, to } = getPagination(page, pageSize);

      const { data, error } = await supabase
        .from("ticket")
        .select("*")
        .order("fecha_creacion", { ascending: false })
        .range(from, to);

      if (error) throw error;

      tickets = data || [];
      filteredTickets = [...tickets]; // Inicializar filteredTickets

      updatePaginationInfo();
      renderOrders();
    } catch (error) {
      console.error("Error al obtener tickets:", error);
      showAlert(`Error al cargar tickets: ${error.message}`, "danger");
    }
  }

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("usuario")
        .select("id_usuario, nombre, rol")
        .order("nombre", { ascending: true });

      if (error) throw error;

      users = data || [];
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      showAlert(`Error al cargar usuarios: ${error.message}`, "danger");
    }
  }

  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from("cliente")
        .select("id_cliente, nombre, email, tipo")
        .order("nombre", { ascending: true });

      if (error) throw error;

      clients = data || [];
      console.log("Clientes cargados:", clients.length);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      showAlert(`Error al cargar clientes: ${error.message}`, "danger");
    }
  }

  function renderOrders(filteredTickets = null) {
    const ticketsToRender = filteredTickets || tickets;
    renderTableView(ticketsToRender);
    renderGridView(ticketsToRender);
  }

  function renderTableView(tickets) {
    if (!orderTableBody) return;

    orderTableBody.innerHTML = "";

    if (tickets.length === 0) {
      orderTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4">No se encontraron tickets que coincidan con su búsqueda</td>
      </tr>
    `;
      return;
    }

    tickets.forEach((ticket) => {
      const assignedUser = users.find(
        (u) => u.id_usuario === ticket.id_usuario_asignado
      );
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${ticket.id_ticket}</td>
      <td>${ticket.titulo}</td>
      <td><span class="type-badge ${ticket.categoria}">${getTypeName(
        ticket.categoria
      )}</span></td>
      <td>
        <div class="user-info">
          ${
            assignedUser
              ? `
              <div class="user-avatar">${getUserInitials(
                assignedUser.nombre
              )}</div>
              <span>${assignedUser.nombre}</span>
            `
              : '<span class="text-muted">No asignado</span>'
          }
        </div>
      </td>
      <td><span class="status-badge ${ticket.estado}">${getStatusName(
        ticket.estado
      )}</span></td>
      <td>${formatDate(ticket.fecha_creacion)}</td>
      <td>${formatDate(ticket.fecha_limite)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon view" data-id="${ticket.id_ticket}">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-icon edit" onclick="editTicket(${
            ticket.id_ticket
          })">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete" onclick="deleteTicket(${
            ticket.id_ticket
          })">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;

      // Agregar evento click a la fila
      row.addEventListener("click", (e) => {
        // Evitar que se active si se hizo click en los botones de acción
        if (e.target.closest(".action-buttons")) {
          return;
        }
        viewOrderDetails(ticket.id_ticket);
      });

      orderTableBody.appendChild(row);
    });
  }

  function renderGridView(tickets) {
    if (!ordersGrid) return;

    ordersGrid.innerHTML = "";

    if (tickets.length === 0) {
      ordersGrid.innerHTML = `
        <div class="text-center py-4 w-100">No se encontraron tickets que coincidan con su búsqueda</div>
      `;
      return;
    }

    tickets.forEach((ticket) => {
      const assignedUser = users.find(
        (u) => u.id_usuario === ticket.id_usuario_asignado
      );
      const card = document.createElement("div");
      card.className = "order-card";
      card.innerHTML = `
        <div class="order-card-header">
          <h3 class="order-card-title">${ticket.titulo}</h3>
          <div class="order-card-meta">
            <span class="status-badge ${ticket.estado}">${getStatusName(
        ticket.estado
      )}</span>
            <span class="type-badge ${ticket.categoria}">${getTypeName(
        ticket.categoria
      )}</span>
          </div>
        </div>
        <div class="order-card-body">
          <div class="order-info-item">
            <span class="order-info-label">Cliente:</span>
            <span class="order-info-value">${getClientName(
              ticket.id_cliente_entregable
            )}</span>
          </div>
          <div class="order-info-item">
            <span class="order-info-label">Fecha Límite:</span>
            <span class="order-info-value">${formatDate(
              ticket.fecha_limite
            )}</span>
          </div>
          <div class="order-info-item">
            <span class="order-info-label">Asignado a:</span>
            <span class="order-info-value">
              ${assignedUser ? assignedUser.nombre : "No asignado"}
            </span>
          </div>
          <div class="order-info-item">
            <span class="order-info-label">Prioridad:</span>
            <span class="order-info-value">
              <span class="priority-badge ${
                ticket.priority || "medium"
              }">${getPriorityName(ticket.priority || "medium")}</span>
            </span>
          </div>
        </div>
        <div class="order-card-footer">
          <span class="order-id">${ticket.id_ticket}</span>
          <div class="action-buttons">
            <button class="btn-icon view" data-id="${ticket.id_ticket}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon edit" onclick="editTicket(${
              ticket.id_ticket
            })">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete" onclick="deleteTicket(${
              ticket.id_ticket
            })">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      ordersGrid.appendChild(card);
    });
  }

  function renderCalendar() {
    if (!calendarDays) return;

    const currentDate = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;

    document.querySelector(".calendar-title").textContent = new Date(
      year,
      month
    ).toLocaleDateString("es-ES", { month: "long", year: "numeric" });

    calendarDays.innerHTML = "";

    for (let i = 0; i < startDayOfWeek; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "calendar-day inactive";
      calendarDays.appendChild(emptyDay);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const day = document.createElement("div");
      day.className = "calendar-day";

      const currentDateString = `${year}-${String(month + 1).padStart(
        2,
        "0"
      )}-${String(i).padStart(2, "0")}`;

      const today = new Date();
      const isToday =
        i === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      if (isToday) {
        day.classList.add("today");
      }

      const dayEvents = tickets.filter(
        (ticket) => ticket.fecha_limite === currentDateString
      );

      day.innerHTML = `
        <div class="calendar-day-header">
          <span class="day-number${isToday ? " today" : ""}">${i}</span>
        </div>
        <div class="calendar-day-events">
          ${dayEvents
            .map(
              (event) => `
              <div class="calendar-event ${event.estado}" data-id="${event.id_ticket}">
                ${event.titulo}
              </div>
            `
            )
            .join("")}
        </div>
      `;

      calendarDays.appendChild(day);
    }

    const totalCells = startDayOfWeek + daysInMonth;
    const remainingCells = 7 - (totalCells % 7);

    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.className = "calendar-day inactive";
        calendarDays.appendChild(emptyDay);
      }
    }
  }

  function populateAssigneeDropdown() {
    const assignedToSelect = document.getElementById("assignedTo");
    if (!assignedToSelect) return;

    assignedToSelect.innerHTML = '<option value="">Sin asignar</option>';

    users.forEach((user) => {
      if (user.rol === "Creativo" || user.rol === "Editor") {
        const option = document.createElement("option");
        option.value = user.id_usuario;
        option.textContent = user.nombre;
        assignedToSelect.appendChild(option);
      }
    });
  }

  function populateClientDropdown() {
    const orderClientSelect = document.getElementById("orderClient");
    if (!orderClientSelect) return;

    orderClientSelect.innerHTML =
      '<option value="">Seleccionar cliente...</option>';

    clients.forEach((client) => {
      const option = document.createElement("option");
      option.value = client.id_cliente;
      option.textContent = `${client.nombre} ${
        client.tipo ? `(${client.tipo})` : ""
      }`;
      orderClientSelect.appendChild(option);
    });
  }

  function setupFileUpload() {
    const fileAttachments = document.getElementById("fileAttachments");
    const fileList = document.getElementById("fileList");

    if (!fileAttachments || !fileList) return;

    fileAttachments.addEventListener("change", function () {
      fileList.innerHTML = "";

      if (this.files.length > 0) {
        for (const file of this.files) {
          const fileItem = document.createElement("div");
          fileItem.className = "file-item";
          fileItem.innerHTML = `
            <span>${file.name}</span>
            <i class="fas fa-times remove-file"></i>
          `;
          fileList.appendChild(fileItem);
        }

        document.querySelectorAll(".remove-file").forEach((btn) => {
          btn.addEventListener("click", function () {
            this.closest(".file-item").remove();
          });
        });
      }
    });
  }

  function showOrderModal(ticketId = null) {
    if (!orderForm) return;

    orderForm.reset();
    document.getElementById("orderId").value = "";
    document.getElementById("fileList").innerHTML = "";
    document.getElementById("commentsSection").style.display = "none";

    if (ticketId) {
      const ticket = tickets.find((t) => t.id_ticket === ticketId);
      if (ticket) {
        document.getElementById("orderId").value = ticket.id_ticket;
        document.getElementById("orderTitle").value = ticket.titulo;
        document.getElementById("orderType").value = ticket.categoria;
        document.getElementById("assignedTo").value =
          ticket.id_usuario_asignado || "";
        document.getElementById("orderStatus").value = ticket.estado;
        document.getElementById("priority").value = ticket.priority || "medium";
        document.getElementById("orderClient").value =
          ticket.id_cliente_entregable || "";
        document.getElementById("orderDeadline").value = ticket.fecha_limite;
        document.getElementById("orderDescription").value = ticket.descripcion;

        document.getElementById("modalTitle").textContent = "Editar Ticket";
      }
    } else {
      document.getElementById("modalTitle").textContent = "Nuevo Ticket";
      document.getElementById("orderStatus").value = "created";
    }

    orderModal.show();
  }

  async function handleOrderSubmit(e) {
    e.preventDefault();

    if (!currentUser) {
      showAlert("No se pudo identificar al usuario actual", "danger");
      return;
    }

    const ticketId = document.getElementById("orderId").value;
    const assignedToId = document.getElementById("assignedTo").value;
    const fileInput = document.getElementById("fileAttachments");
    const files = fileInput.files;

    // Subir archivos primero si hay alguno
    let attachments = [];
    if (files.length > 0) {
      try {
        const uploadPromises = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}.${fileExt}`;
          const filePath = `${ticketId || "new"}/${fileName}`;

          uploadPromises.push(
            supabase.storage.from(STORAGE_BUCKET).upload(filePath, file)
          );
        }

        const results = await Promise.all(uploadPromises);
        attachments = results.map((result) => {
          if (result.error) throw result.error;
          const { data } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(result.data.path);
          return data.publicUrl;
        });
      } catch (error) {
        console.error("Error subiendo archivos:", error);
        showAlert(`Error subiendo archivos: ${error.message}`, "danger");
        return;
      }
    }

    const ticketData = {
      titulo: document.getElementById("orderTitle").value,
      categoria: document.getElementById("orderType").value,
      id_usuario_asignado: assignedToId || null,
      estado: document.getElementById("orderStatus").value,
      fecha_limite: document.getElementById("orderDeadline").value,
      id_cliente_entregable:
        parseInt(document.getElementById("orderClient").value) || null,
      descripcion: document.getElementById("orderDescription").value,
      id_creador: currentUser.id_usuario,
      adjuntos: attachments,
    };

    try {
      if (ticketId) {
        // Para edición, combinar con archivos existentes
        const { data: existingTicket, error: fetchError } = await supabase
          .from("ticket")
          .select("adjuntos")
          .eq("id_ticket", ticketId)
          .single();

        if (fetchError) throw fetchError;

        if (existingTicket.adjuntos && existingTicket.adjuntos.length > 0) {
          ticketData.adjuntos = [...existingTicket.adjuntos, ...attachments];
        }

        const { data, error } = await supabase
          .from("ticket")
          .update(ticketData)
          .eq("id_ticket", ticketId)
          .select();

        if (error) throw error;

        showAlert("Ticket actualizado con éxito", "success");
      } else {
        const { data, error } = await supabase
          .from("ticket")
          .insert([
            {
              ...ticketData,
              fecha_creacion: new Date().toISOString(),
            },
          ])
          .select();

        if (error) throw error;

        showAlert("Ticket creado con éxito", "success");
      }

      orderModal.hide();
      await fetchTickets();
      if (
        document.querySelector(".tab-btn.active").getAttribute("data-view") ===
        "calendar"
      ) {
        renderCalendar();
      }
    } catch (error) {
      console.error("Error al guardar ticket:", error);
      showAlert(`Error al guardar ticket: ${error.message}`, "danger");
    }
  }

  async function viewOrderDetails(ticketId) {
    try {
      const { data: ticket, error } = await supabase
        .from("ticket")
        .select("*")
        .eq("id_ticket", ticketId)
        .single();

      if (error) throw error;

      if (!ticket) {
        showAlert("Ticket no encontrado", "warning");
        return;
      }

      const assignedUser = users.find(
        (u) => u.id_usuario === ticket.id_usuario_asignado
      );
      const creatorUser = users.find((u) => u.id_usuario === ticket.id_creador);

      document.getElementById("viewOrderId").textContent = ticket.id_ticket;
      document.getElementById("viewOrderTitle").textContent = ticket.titulo;
      document.getElementById("viewOrderType").textContent = getTypeName(
        ticket.categoria
      );
      document.getElementById(
        "viewOrderType"
      ).className = `type-badge ${ticket.categoria}`;
      document.getElementById("viewOrderStatus").textContent = getStatusName(
        ticket.estado
      );
      document.getElementById(
        "viewOrderStatus"
      ).className = `status-badge ${ticket.estado}`;
      document.getElementById("viewOrderPriority").textContent =
        getPriorityName(ticket.priority || "medium");
      document.getElementById(
        "viewOrderPriority"
      ).className = `priority-badge ${ticket.priority || "medium"}`;
      document.getElementById("viewOrderClient").textContent = getClientName(
        ticket.id_cliente_entregable
      );
      document.getElementById("viewAssignedTo").textContent = assignedUser
        ? assignedUser.nombre
        : "No asignado";
      document.getElementById("viewCreatedBy").textContent = creatorUser
        ? creatorUser.nombre
        : "Sistema";
      document.getElementById("viewCreatedDate").textContent = formatDate(
        ticket.fecha_creacion
      );
      document.getElementById("viewDeadline").textContent = formatDate(
        ticket.fecha_limite
      );
      document.getElementById("viewDescription").textContent =
        ticket.descripcion;

      // Mostrar adjuntos
      const attachmentsList = document.getElementById("viewAttachmentsList");
      attachmentsList.innerHTML = "";

      if (ticket.adjuntos && ticket.adjuntos.length > 0) {
        ticket.adjuntos.forEach((url, index) => {
          const fileExt = url.split(".").pop().toLowerCase();
          const attachmentItem = document.createElement("div");
          attachmentItem.className = "attachment-item";

          if (["jpg", "jpeg", "png", "gif"].includes(fileExt)) {
            // Es una imagen
            attachmentItem.innerHTML = `
            <div class="attachment-preview">
              <img src="${url}" alt="Adjunto ${
              index + 1
            }" class="img-thumbnail">
              <div class="attachment-actions">
                <a href="${url}" target="_blank" class="btn btn-sm btn-primary">
                  <i class="fas fa-expand"></i> Ver
                </a>
                <a href="${url}" download class="btn btn-sm btn-secondary">
                  <i class="fas fa-download"></i> Descargar
                </a>
              </div>
            </div>
            <div class="attachment-info">
              <span class="attachment-name">Imagen ${
                index + 1
              }.${fileExt}</span>
            </div>
          `;
          } else if (fileExt === "pdf") {
            // Es un PDF
            attachmentItem.innerHTML = `
            <div class="attachment-preview">
              <i class="fas fa-file-pdf pdf-icon"></i>
              <div class="attachment-actions">
                <a href="${url}" target="_blank" class="btn btn-sm btn-primary">
                  <i class="fas fa-expand"></i> Ver
                </a>
                <a href="${url}" download class="btn btn-sm btn-secondary">
                  <i class="fas fa-download"></i> Descargar
                </a>
              </div>
            </div>
            <div class="attachment-info">
              <span class="attachment-name">Documento ${index + 1}.pdf</span>
            </div>
          `;
          } else {
            // Otro tipo de archivo
            attachmentItem.innerHTML = `
            <div class="attachment-preview">
              <i class="fas fa-file-alt"></i>
              <div class="attachment-actions">
                <a href="${url}" target="_blank" class="btn btn-sm btn-primary">
                  <i class="fas fa-expand"></i> Ver
                </a>
                <a href="${url}" download class="btn btn-sm btn-secondary">
                  <i class="fas fa-download"></i> Descargar
                </a>
              </div>
            </div>
            <div class="attachment-info">
              <span class="attachment-name">Archivo ${
                index + 1
              }.${fileExt}</span>
            </div>
          `;
          }

          attachmentsList.appendChild(attachmentItem);
        });
      } else {
        attachmentsList.innerHTML =
          '<p class="text-muted">No hay archivos adjuntos</p>';
      }

      viewOrderModal.show();
    } catch (error) {
      console.error("Error al obtener detalles del ticket:", error);
      showAlert(
        `Error al cargar detalles del ticket: ${error.message}`,
        "danger"
      );
    }
  }

  async function confirmDeleteOrder() {
    const ticketId = document.getElementById("deleteOrderId").textContent;

    try {
      const { error } = await supabase
        .from("ticket")
        .delete()
        .eq("id_ticket", ticketId);

      if (error) throw error;

      deleteConfirmModal.hide();
      await fetchTickets();
      showAlert("Ticket eliminado con éxito", "success");
    } catch (error) {
      console.error("Error al eliminar ticket:", error);
      showAlert(`Error al eliminar ticket: ${error.message}`, "danger");
    }
  }

  function handleEditButtonClick() {
    const ticketId = document.getElementById("viewOrderId").textContent;
    viewOrderModal.hide();

    setTimeout(() => {
      editTicket(ticketId);
    }, 400);
  }

  function filterOrders() {
    console.log("🔍 Ejecutando filterOrders...");

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const statusValue = statusFilter ? statusFilter.value : "";
    const typeValue = typeFilter ? typeFilter.value : "";
    const dateFrom =
      dateFromFilter && dateFromFilter.value
        ? new Date(dateFromFilter.value)
        : null;
    const dateTo =
      dateToFilter && dateToFilter.value ? new Date(dateToFilter.value) : null;

    console.log("📋 Filtros aplicados:", {
      searchTerm,
      statusValue,
      typeValue,
      dateFrom,
      dateTo,
      totalTickets: tickets ? tickets.length : 0,
    });

    // VERIFICAR que la variable tickets existe y tiene datos
    if (!tickets || !Array.isArray(tickets)) {
      console.log("❌ Variable tickets no disponible o no es array:", tickets);
      // Si no hay tickets, intentar recargar
      if (typeof fetchTickets === "function") {
        console.log("🔄 Recargando tickets desde la base de datos...");
        fetchTickets(1, itemsPerPage);
      }
      return;
    }

    const filtered = tickets.filter((ticket) => {
      const assignedUser = users.find(
        (u) => u.id_usuario === ticket.id_usuario_asignado
      );
      const assignedName = assignedUser
        ? assignedUser.nombre.toLowerCase()
        : "";

      const clientName = getClientName(
        ticket.id_cliente_entregable
      ).toLowerCase();

      const matchesSearch =
        !searchTerm ||
        ticket.titulo.toLowerCase().includes(searchTerm) ||
        ticket.id_ticket.toString().toLowerCase().includes(searchTerm) ||
        assignedName.includes(searchTerm) ||
        clientName.includes(searchTerm);

      // Manejar filtro de estado especial para "completed"
      let matchesStatus = true;
      if (statusValue === "completed") {
        matchesStatus =
          ticket.estado === "delivered" || ticket.estado === "approved";
      } else {
        matchesStatus = !statusValue || ticket.estado === statusValue;
      }

      const matchesType = !typeValue || ticket.categoria === typeValue;

      let matchesDate = true;
      const ticketDate = new Date(ticket.fecha_limite);

      if (dateFrom && dateTo) {
        matchesDate = ticketDate >= dateFrom && ticketDate <= dateTo;
      } else if (dateFrom) {
        matchesDate = ticketDate >= dateFrom;
      } else if (dateTo) {
        matchesDate = ticketDate <= dateTo;
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });

    console.log("✅ Tickets filtrados:", filtered.length, "de", tickets.length);

    // ASEGURAR que renderOrders existe antes de llamarla
    if (typeof renderOrders === "function") {
      renderOrders(filtered);
    } else {
      console.log("❌ Función renderOrders no disponible");
      // Como respaldo, intentar renderizar directamente
      if (
        typeof renderTableView === "function" &&
        typeof renderGridView === "function"
      ) {
        renderTableView(filtered);
        renderGridView(filtered);
      }
    }
  }
  // Funciones auxiliares
  function getTypeName(type) {
    const types = {
      design: "Diseño Gráfico",
      web: "Desarrollo Web",
      video: "Producción Audiovisual",
      copy: "Copywriting",
      social: "Pauta en Redes",
    };
    return types[type] || type;
  }

  function getStatusName(status) {
    const statuses = {
      created: "Creado",
      assigned: "Asignado",
      "in-progress": "En Proceso",
      review: "En Revisión",
      approved: "Aprobado",
      delivered: "Entregado",
    };
    return statuses[status] || status;
  }

  function getPriorityName(priority) {
    const priorities = {
      low: "Baja",
      medium: "Media",
      high: "Alta",
      urgent: "Urgente",
    };
    return priorities[priority] || priority;
  }

  function getClientName(clientId) {
    if (!clientId) return "Sin cliente";
    const client = clients.find((c) => c.id_cliente === clientId);
    return client
      ? `${client.nombre} (${client.tipo || "Sin tipo"})`
      : `Cliente ID: ${clientId}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES");
    } catch {
      return dateStr;
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

  function showAlert(message, type = "info") {
    const alertContainer = document.getElementById("alertContainer");
    if (!alertContainer) {
      console.error("Alert container no encontrado");
      return;
    }

    alertContainer.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    setTimeout(() => (alertContainer.innerHTML = ""), 5000);
  }

  // Funciones de comentarios (stubs para evitar errores)
  function addComment() {
    console.log("Función addComment no implementada");
  }

  function addViewComment() {
    console.log("Función addViewComment no implementada");
  }
});
