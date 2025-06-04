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


  const clientSelect = document.getElementById("clientSelect");
  const clientDateRangeStart = document.getElementById("clientDateRangeStart");
  const clientDateRangeEnd = document.getElementById("clientDateRangeEnd");
  const generateClientReportBtn = document.getElementById("generateClientReportBtn");
  let realClients = [];

  let mockUsers = [];
  let mockOrders = [];
  let currentReportData = null;

  init();

  function init() {
    populateCreativeSelect();
    setupDatePickers();
    setupEventListeners();
    populateClientSelect();

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

  async function loadClients() {
    try {
      const { data: clientsData, error: clientsError } = await supabaseClient
        .from("cliente")
        .select("*")
        .order("nombre", { ascending: true });

      if (clientsError) throw clientsError;

      realClients = clientsData.map((client) => ({
        id: client.id_cliente,
        name: client.nombre,
        type: client.tipo,
        email: client.email,
        phone: client.telefono,
        creationDate: client.fecha_creacion
      }));

      console.log("Clientes cargados:", realClients.length);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  }

  // Agrega esta función para poblar el select de clientes
  function populateClientSelect() {
    clientSelect.innerHTML = '<option value="">Seleccionar cliente...</option>';

    realClients.forEach((client) => {
      const option = document.createElement("option");
      option.value = client.id;
      option.textContent = client.name;
      clientSelect.appendChild(option);
    });
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

  function setupDatePickers() { }

  function setupEventListeners() {
    generateReportBtn.addEventListener("click", generateReport);
    generateClientReportBtn.addEventListener("click", generateClientReport); // Nueva función
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



async function generateClientReport() {
    const clientId = parseInt(clientSelect.value);
    const startDate = clientDateRangeStart.value ? new Date(clientDateRangeStart.value) : null;
    const endDate = clientDateRangeEnd.value ? new Date(clientDateRangeEnd.value) : null;

    if (!clientId) {
        showAlert("Por favor seleccione un cliente", "warning");
        return;
    }

    if (!startDate || !endDate) {
        showAlert("Por favor seleccione un rango de fechas", "warning");
        return;
    }

    const client = realClients.find(c => c.id === clientId);
    if (!client) {
        showAlert("Cliente no encontrado", "error");
        return;
    }

    // Cargar tickets del cliente
    try {
        const { data: ticketsData, error: ticketsError } = await supabaseClient
            .from("ticket")
            .select(`
                *,
                usuario:id_usuario_asignado(nombre),
                cliente:id_cliente_entregable(nombre)
            `)
            .eq('id_cliente_entregable', clientId)
            .gte('fecha_creacion', startDate.toISOString())
            .lte('fecha_creacion', endDate.toISOString());

        if (ticketsError) throw ticketsError;

        const clientOrders = ticketsData.map((ticket) => ({
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

        if (clientOrders.length === 0) {
            showAlert("No hay tickets para este cliente en el rango de fechas seleccionado", "warning");
            return;
        }

        reportContainer.style.display = "block";

        document.getElementById("reportCreativeName").textContent = client.name;
        document.getElementById("reportDateRange").textContent = `${formatDate(startDate)} - ${formatDate(endDate)}`;

        currentReportData = {
            client: client,
            startDate: startDate,
            endDate: endDate,
            ...generateReportData(clientOrders),
            orders: clientOrders
        };

        renderReportTable(clientOrders);

        document.getElementById("totalTickets").textContent = clientOrders.length;
        document.getElementById("completedTickets").textContent = currentReportData.completedCount;
        document.getElementById("inProgressTickets").textContent = currentReportData.inProgressCount;
        document.getElementById("delayedTickets").textContent = currentReportData.delayedCount;

        showAlert("Reporte de cliente generado con éxito", "success");

    } catch (error) {
        console.error("Error al generar reporte de cliente:", error);
        showAlert("Error al generar reporte de cliente", "error");
    }
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
    doc.setFont("helvetica");

     // Agregar logo en la esquina superior izquierda
const imgData = 'data:image/png;base64,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'; // tu código base64 completo aquí
doc.addImage(imgData, 'PNG', 10, 5, 30, 15);
    
    // Configuración inicial del documento
    const isClientReport = !!currentReportData.client;
    const reportTitle = isClientReport ? "Reporte de Cliente" : "Reporte de Productividad";
    const entityName = isClientReport ? currentReportData.client.name : currentReportData.creative.name;
    
    // Logo y título
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text(reportTitle, 105, 20, { align: "center" });
    
    // Información del reporte
    doc.setFontSize(12);
    
    if (isClientReport) {
        // Información específica del cliente
        doc.text(`Cliente: ${currentReportData.client.name}`, 14, 30);
        doc.text(`Tipo: ${currentReportData.client.type || 'No especificado'}`, 14, 36);
        doc.text(`Email: ${currentReportData.client.email}`, 14, 42);
        doc.text(`Teléfono: ${currentReportData.client.phone || 'No especificado'}`, 14, 48);
        doc.text(`Período: ${formatDate(currentReportData.startDate)} - ${formatDate(currentReportData.endDate)}`, 14, 54);
    } else {
        // Información para reporte de creativo
        doc.text(`Creativo: ${currentReportData.creative.name}`, 14, 30);
        doc.text(`Período: ${formatDate(currentReportData.startDate)} - ${formatDate(currentReportData.endDate)}`, 14, 36);
    }
    
    // Estadísticas generales
    doc.setFontSize(14);
    doc.setTextColor(50, 100, 150);
    doc.text(isClientReport ? "Resumen de Actividad" : "Estadísticas de Productividad", 14, isClientReport ? 66 : 48);
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    
    // Tabla de estadísticas
    const statsBody = [
        ['Tickets Totales', currentReportData.orders.length],
        ['Tickets Completados', currentReportData.completedCount],
        ['Tickets en Proceso', currentReportData.inProgressCount],
        ['Tickets Retrasados', currentReportData.delayedCount],
        ['Tickets Rechazados', currentReportData.statusDistribution.rejected || 0]
    ];

    if (isClientReport) {
        statsBody.push(
            ['Entregas a Tiempo', currentReportData.onTimeDeliveries],
            ['Entregas con Retraso', currentReportData.lateDeliveries]
        );
    } else {
        statsBody.push(
            ['Calificación Promedio', currentReportData.averageRating]
        );
    }

    doc.autoTable({
        startY: isClientReport ? 73 : 55,
        head: [['Métrica', 'Valor']],
        body: statsBody,
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
        let statusClass = "";
        
        if (order.status === "delivered" || order.status === "approved") {
            const completedDate = new Date(order.completed_date || order.deadline);
            const deadlineDate = new Date(order.deadline);
            const diffTime = deadlineDate - completedDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0) {
                tiempo = `Entregado ${diffDays} día(s) antes`;
                statusClass = "green";
            } else {
                tiempo = `Entregado ${Math.abs(diffDays)} día(s) tarde`;
                statusClass = "red";
            }
        } else {
            const today = new Date();
            const deadlineDate = new Date(order.deadline);
            const diffTime = deadlineDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 0) {
                tiempo = `${diffDays} día(s) restante(s)`;
                statusClass = "black";
            } else if (diffDays === 0) {
                tiempo = "Vence hoy";
                statusClass = "orange";
            } else {
                tiempo = `${Math.abs(diffDays)} día(s) de retraso`;
                statusClass = "red";
            }
        }
        
        return isClientReport 
            ? [
                order.id,
                order.title,
                getTypeName(order.type),
                getStatusName(order.status),
                order.assigned_to?.name || "Sin asignar",
                formatDate(order.created_date),
                formatDate(order.deadline),
                tiempo
            ]
            : [
                order.id,
                order.title,
                getTypeName(order.type),
                getStatusName(order.status),
                formatDate(order.created_date),
                formatDate(order.deadline),
                tiempo
            ];
    });
    
    // Configuración de columnas según tipo de reporte
    const columns = isClientReport
        ? [
            { header: 'ID', dataKey: '0', cellWidth: 15 },
            { header: 'Título', dataKey: '1', cellWidth: 30 },
            { header: 'Categoría', dataKey: '2', cellWidth: 20 },
            { header: 'Estado', dataKey: '3', cellWidth: 20 },
            { header: 'Asignado a', dataKey: '4', cellWidth: 25 },
            { header: 'Fecha Creación', dataKey: '5', cellWidth: 20 },
            { header: 'Fecha Límite', dataKey: '6', cellWidth: 20 },
            { header: 'Tiempo', dataKey: '7', cellWidth: 25 }
        ]
        : [
            { header: 'ID', dataKey: '0', cellWidth: 20 },
            { header: 'Título', dataKey: '1', cellWidth: 30 },
            { header: 'Categoría', dataKey: '2', cellWidth: 25 },
            { header: 'Estado', dataKey: '3', cellWidth: 25 },
            { header: 'Fecha Creación', dataKey: '4', cellWidth: 25 },
            { header: 'Fecha Límite', dataKey: '5', cellWidth: 25 },
            { header: 'Tiempo', dataKey: '6', cellWidth: 30 }
        ];

    // Tabla de tickets
   doc.autoTable({
        startY: doc.autoTable.previous.finalY + 20,
        head: [columns.map(col => col.header)],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [50, 100, 150],
            textColor: 255,
            fontSize: 8
        },
        margin: { left: 14 },
        styles: { 
            fontSize: 7,
            cellPadding: 2,
            textColor: 0 // Todos los textos en negro
        },
        columnStyles: columns.reduce((acc, col) => {
            acc[col.dataKey] = { cellWidth: col.cellWidth };
            return acc;
        }, {})
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
    const fileName = isClientReport 
        ? `Reporte_Cliente_${currentReportData.client.name}_${formatDate(currentReportData.startDate)}_a_${formatDate(currentReportData.endDate)}.pdf`
        : `Reporte_${currentReportData.creative.name}_${formatDate(currentReportData.startDate)}_a_${formatDate(currentReportData.endDate)}.pdf`;
    
    doc.save(fileName);
    showAlert("Reporte exportado como PDF", "success");
}

  loadRealData().then(() => {
    populateCreativeSelect();
    return loadClients(); // Nueva función
}).then(() => {
    populateClientSelect();
}).catch(error => {
    console.error("Error al cargar datos:", error);
});
});