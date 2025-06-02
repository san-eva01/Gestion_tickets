document.addEventListener("DOMContentLoaded", function () {
  const supabaseUrl = "https://onbgqjndemplsgxdaltr.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  let realUsers = [];
  let realOrders = [];

  const creativeSelect = document.getElementById("creativeSelect");
  const dateRangeStart = document.getElementById("dateRangeStart");
  const dateRangeEnd = document.getElementById("dateRangeEnd");
  const generateReportBtn = document.getElementById("generateReportBtn");
  const reportContainer = document.getElementById("reportContainer");
  const reportTableBody = document.getElementById("reportTableBody");

  let mockUsers = [];
  let mockOrders = [];

  init();

  function init() {
    populateCreativeSelect();
    setupDatePickers();
    setupEventListeners();

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    dateRangeStart.value = formatDateForInput(thirtyDaysAgo);
    dateRangeEnd.value = formatDateForInput(today);
  }

  // AGREGAR ESTAS FUNCIONES
  async function loadRealData() {
    try {
      // Cargar usuarios
      const { data: usersData, error: usersError } = await supabaseClient
        .from("usuario")
        .select("*")
        .eq("rol", "Creativo")
        .order("nombre", { ascending: true });

      if (usersError) throw usersError;

      realUsers = usersData.map((user) => ({
        id: user.id_usuario,
        name: user.nombre,
        avatar: getUserInitials(user.nombre),
        role: user.rol,
      }));

      // Cargar tickets
      const { data: ticketsData, error: ticketsError } = await supabaseClient
        .from("ticket")
        .select(
          `
                *,
                usuario:id_usuario_asignado(nombre),
                cliente:id_cliente_entregable(nombre)
            `
        )
        .order("fecha_creacion", { ascending: false });

      if (ticketsError) throw ticketsError;

      realOrders = ticketsData.map((ticket) => ({
        id: `TKT-${ticket.id_ticket}`,
        title: ticket.titulo,
        type: ticket.categoria,
        assigned_to: ticket.usuario
          ? {
              id: ticket.id_usuario_asignado,
              name: ticket.usuario.nombre,
            }
          : null,
        status: ticket.estado,
        created_date: ticket.fecha_creacion?.split("T")[0],
        deadline: ticket.fecha_limite?.split("T")[0],
        completed_date:
          ticket.estado === "delivered" || ticket.estado === "approved"
            ? ticket.fecha_limite?.split("T")[0]
            : null,
        client: ticket.cliente?.nombre || "Sin cliente",
        priority: ticket.prioridad || "medium",
      }));

      // Actualizar las variables globales
      mockUsers = realUsers;
      mockOrders = realOrders;

      console.log(
        "Datos de reportes cargados:",
        mockUsers.length,
        "usuarios,",
        mockOrders.length,
        "tickets"
      );
    } catch (error) {
      console.error("Error al cargar datos de reportes:", error);
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

  function populateCreativeSelect() {
    creativeSelect.innerHTML =
      '<option value="">Seleccionar creativo...</option>';

    mockUsers.forEach((user) => {
      if (user.role === "Creativo") {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        creativeSelect.appendChild(option);
      }
    });
  }

  function setupDatePickers() {}

  function setupEventListeners() {
    generateReportBtn.addEventListener("click", generateReport);
  }

  function generateReport() {
    const creativeId = parseInt(creativeSelect.value);
    const startDate = dateRangeStart.value
      ? new Date(dateRangeStart.value)
      : null;
    const endDate = dateRangeEnd.value ? new Date(dateRangeEnd.value) : null;

    if (!creativeId) {
      showAlert("Por favor seleccione un creativo", "warning");
      return;
    }

    if (!startDate || !endDate) {
      showAlert("Por favor seleccione un rango de fechas", "warning");
      return;
    }

    const creative = mockUsers.find((user) => user.id === creativeId);
    if (!creative) {
      showAlert("Creativo no encontrado", "error");
      return;
    }

    const filteredOrders = mockOrders.filter((order) => {
      const orderDate = new Date(order.created_date);
      return (
        order.assigned_to &&
        order.assigned_to.id === creativeId &&
        orderDate >= startDate &&
        orderDate <= endDate
      );
    });

    if (filteredOrders.length === 0) {
      showAlert(
        "No hay tickets para este creativo en el rango de fechas seleccionado",
        "warning"
      );
      reportContainer.style.display = "none";
      return;
    }

    reportContainer.style.display = "block";

    document.getElementById("reportCreativeName").textContent = creative.name;
    document.getElementById("reportDateRange").textContent = `${formatDate(
      startDate
    )} - ${formatDate(endDate)}`;

    const reportData = generateReportData(filteredOrders);

    renderReportTable(filteredOrders);

    document.getElementById("totalTickets").textContent = filteredOrders.length;
    document.getElementById("completedTickets").textContent =
      reportData.completedCount;
    document.getElementById("inProgressTickets").textContent =
      reportData.inProgressCount;
    document.getElementById("delayedTickets").textContent =
      reportData.delayedCount;

    showAlert("Reporte generado con éxito", "success");
  }

  function generateReportData(orders) {
    const statusCounts = {
      assigned: 0,
      "in-progress": 0,
      review: 0,
      approved: 0,
      delivered: 0,
      rejected: 0,
    };

    let completedCount = 0;
    let inProgressCount = 0;
    let delayedCount = 0;

    orders.forEach((order) => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status]++;
      }

      if (order.status === "delivered" || order.status === "approved") {
        completedCount++;
      } else if (order.status === "in-progress" || order.status === "review") {
        inProgressCount++;
      }

      const today = new Date();
      const deadlineDate = new Date(order.deadline);
      if (
        deadlineDate < today &&
        order.status !== "delivered" &&
        order.status !== "approved"
      ) {
        delayedCount++;
      }
    });

    return {
      statusDistribution: statusCounts,
      completedCount,
      inProgressCount,
      delayedCount,
    };
  }

  function renderReportTable(orders) {
    reportTableBody.innerHTML = "";

    if (orders.length === 0) {
      reportTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No hay datos disponibles</td>
                </tr>
            `;
      return;
    }

    const sortedOrders = [...orders].sort((a, b) => {
      return new Date(b.created_date) - new Date(a.created_date);
    });

    sortedOrders.forEach((order) => {
      const row = document.createElement("tr");

      let daysText = "";
      let daysClass = "";

      if (order.status === "delivered" || order.status === "approved") {
        const completedDate = new Date(order.completed_date);
        const deadlineDate = new Date(order.deadline);
        const diffTime = deadlineDate - completedDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0) {
          daysText = `Entregado ${diffDays} día(s) antes`;
          daysClass = "text-success";
        } else {
          daysText = `Entregado ${Math.abs(diffDays)} día(s) tarde`;
          daysClass = "text-danger";
        }
      } else {
        const today = new Date();
        const deadlineDate = new Date(order.deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          daysText = `${diffDays} día(s) restante(s)`;
          daysClass = "";
        } else if (diffDays === 0) {
          daysText = "Vence hoy";
          daysClass = "text-warning";
        } else {
          daysText = `${Math.abs(diffDays)} día(s) de retraso`;
          daysClass = "text-danger";
        }
      }

      row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.title}</td>
                <td><span class="type-badge ${order.type}">${getTypeName(
        order.type
      )}</span></td>
                <td><span class="status-badge ${order.status}">${getStatusName(
        order.status
      )}</span></td>
                <td>${formatDate(order.created_date)}</td>
                <td>${formatDate(order.deadline)}</td>
                <td class="${daysClass}">${daysText}</td>
            `;

      reportTableBody.appendChild(row);
    });
  }

  function formatDate(date) {
    if (!date) return "";

    if (typeof date === "string") {
      date = new Date(date);
    }

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatDateForInput(date) {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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

  document
    .getElementById("exportReportBtn")
    .addEventListener("click", function () {
      const creativeId = parseInt(creativeSelect.value);
      if (!creativeId) {
        showAlert("Primero debe generar un reporte para exportarlo", "warning");
        return;
      }

      const creative = mockUsers.find((user) => user.id === creativeId);
      if (!creative) return;

      const startDate = dateRangeStart.value
        ? formatDate(new Date(dateRangeStart.value))
        : "";
      const endDate = dateRangeEnd.value
        ? formatDate(new Date(dateRangeEnd.value))
        : "";

      showAlert(
        `Exportando reporte de productividad para ${creative.name} (${startDate} - ${endDate})`,
        "info"
      );
    });

  loadRealData().then(() => {
    populateCreativeSelect();
  });
});
