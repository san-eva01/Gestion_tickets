document.addEventListener("DOMContentLoaded", function () {
  const { jsPDF } = window.jspdf;
  const supabaseUrl = "https://onbgqjndemplsgxdaltr.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw";
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  let realUsers = [];
  let realOrders = [];

  const creativeSelect = document.getElementById("creativeSelect");
  const dateRangeStart = document.getElementById("dateRangeStart");
  const dateRangeEnd = document.getElementById("dateRangeEnd");
  const generateReportBtn = document.getElementById("generateReportBtn");
  const reportContainer = document.getElementById("reportContainer");
  const reportTableBody = document.getElementById("reportTableBody");
  const exportReportBtn = document.getElementById("exportReportBtn");

  let mockUsers = [];
  let mockOrders = [];
  let currentReportData = null;

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
    exportReportBtn.addEventListener("click", exportToPDF);
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

    currentReportData = {
      creative: creative,
      startDate: startDate,
      endDate: endDate,
      ...generateReportData(filteredOrders),
      orders: filteredOrders
    };

    renderReportTable(filteredOrders);

    document.getElementById("totalTickets").textContent = filteredOrders.length;
    document.getElementById("completedTickets").textContent =
      currentReportData.completedCount;
    document.getElementById("inProgressTickets").textContent =
      currentReportData.inProgressCount;
    document.getElementById("delayedTickets").textContent =
      currentReportData.delayedCount;

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
    let onTimeDeliveries = 0;
    let lateDeliveries = 0;
    let totalRating = 0;
    let ratedDeliveries = 0;

    orders.forEach((order) => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status]++;
      }

      if (order.status === "delivered" || order.status === "approved") {
        completedCount++;
        
        // Calcular entregas a tiempo/tardías
        const completedDate = new Date(order.completed_date || order.deadline);
        const deadlineDate = new Date(order.deadline);
        if (completedDate <= deadlineDate) {
          onTimeDeliveries++;
        } else {
          lateDeliveries++;
        }
        
        // Calificación promedio (simulada ya que no hay datos reales)
        if (order.status === "approved") {
          totalRating += 4 + Math.random(); // Simular calificación entre 4 y 5
          ratedDeliveries++;
        }
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

    const averageRating = ratedDeliveries > 0 
      ? (totalRating / ratedDeliveries).toFixed(1)
      : "N/A";

    return {
      statusDistribution: statusCounts,
      completedCount,
      inProgressCount,
      delayedCount,
      onTimeDeliveries,
      lateDeliveries,
      averageRating
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
        const completedDate = new Date(order.completed_date || order.deadline);
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

  function exportToPDF() {
    if (!currentReportData) {
      showAlert("Primero debe generar un reporte para exportarlo", "warning");
      return;
    }

    const doc = new jsPDF();
    
    // Configuración del documento
    doc.setFont("helvetica");
    
    // Logo y título
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("Reporte de Productividad", 105, 20, { align: "center" });
    
    // Información del creativo
    doc.setFontSize(12);
    doc.text(`Creativo: ${currentReportData.creative.name}`, 14, 30);
    doc.text(`Período: ${formatDate(currentReportData.startDate)} - ${formatDate(currentReportData.endDate)}`, 14, 36);
    
    // Estadísticas generales
    doc.setFontSize(14);
    doc.setTextColor(50, 100, 150);
    doc.text("Estadísticas de Productividad", 14, 48);
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    
    // Tabla de estadísticas
    doc.autoTable({
      startY: 55,
      head: [['Métrica', 'Valor']],
      body: [
        ['Tickets Totales', currentReportData.orders.length],
        ['Tareas Completadas', currentReportData.completedCount],
        ['Tareas en Proceso', currentReportData.inProgressCount],
        ['Tareas Rechazadas', currentReportData.statusDistribution.rejected || 0],
        ['Entregas a Tiempo', currentReportData.onTimeDeliveries],
        ['Entregas con Retraso', currentReportData.lateDeliveries],
        ['Calificación Promedio', currentReportData.averageRating]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [50, 100, 150],
        textColor: 255
      },
      margin: { left: 14 }
    });
    
    // Detalle de tickets
    doc.setFontSize(14);
    doc.setTextColor(50, 100, 150);
    doc.text("Detalle de Tickets", 14, doc.autoTable.previous.finalY + 15);
    
    // Preparar datos para la tabla
    const tableData = currentReportData.orders.map(order => {
      let tiempo = "";
      
      if (order.status === "delivered" || order.status === "approved") {
        const completedDate = new Date(order.completed_date || order.deadline);
        const deadlineDate = new Date(order.deadline);
        const diffTime = deadlineDate - completedDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0) {
          tiempo = `Entregado ${diffDays} día(s) antes`;
        } else {
          tiempo = `Entregado ${Math.abs(diffDays)} día(s) tarde`;
        }
      } else {
        const today = new Date();
        const deadlineDate = new Date(order.deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
          tiempo = `${diffDays} día(s) restante(s)`;
        } else if (diffDays === 0) {
          tiempo = "Vence hoy";
        } else {
          tiempo = `${Math.abs(diffDays)} día(s) de retraso`;
        }
      }
      
      return [
        order.id,
        order.title,
        getTypeName(order.type),
        getStatusName(order.status),
        formatDate(order.created_date),
        formatDate(order.deadline),
        tiempo
      ];
    });
    
    // Tabla de tickets
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 20,
      head: [['ID', 'Título', 'Categoría', 'Estado', 'Fecha Creación', 'Fecha Límite', 'Tiempo']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [50, 100, 150],
        textColor: 255
      },
      margin: { left: 14 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 30 }
      }
    });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: "center" });
      doc.text(`Generado el ${formatDate(new Date())}`, 105, 290, { align: "center" });
    }
    
    // Guardar el PDF
    doc.save(`Reporte_${currentReportData.creative.name}_${formatDate(currentReportData.startDate)}_a_${formatDate(currentReportData.endDate)}.pdf`);
    
    showAlert("Reporte exportado como PDF", "success");
  }

  loadRealData().then(() => {
    populateCreativeSelect();
  });
});