document.addEventListener("DOMContentLoaded", function () {
  let currentDate = new Date();
  // AGREGAR al inicio, después de DOMContentLoaded
  const supabaseUrl = "https://onbgqjndemplsgxdaltr.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw";

  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  let currentUser = null;
  let realTasks = {};

  let mockTasks = {};

  renderCalendar();

  document.getElementById("prevMonth").addEventListener("click", function () {
    navigateCalendar(-1);
  });

  document.getElementById("nextMonth").addEventListener("click", function () {
    navigateCalendar(1);
  });

  async function getCurrentUser() {
    try {
      const userStr = localStorage.getItem("taskflow_user");
      console.log("LocalStorage user string:", userStr); // AGREGAR

      if (!userStr) return null;

      const userData = JSON.parse(userStr);
      console.log("Parsed user data:", userData); // AGREGAR

      currentUser = {
        id_usuario: userData.id,
        nombre: userData.name,
        email: userData.email,
        rol: userData.role,
      };

      console.log("Current user object:", currentUser); // AGREGAR
      return currentUser;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  }

  async function loadCalendarTasks() {
    try {
      await getCurrentUser();
      if (!currentUser) return;

      const { data: ticketsData, error } = await supabaseClient
        .from("ticket")
        .select("*")
        .eq("id_usuario_asignado", currentUser.id_usuario);

      if (error) throw error;

      // Convertir a formato mockTasks
      realTasks = {};
      ticketsData.forEach((ticket) => {
        realTasks[`TKT-${ticket.id_ticket}`] = {
          id: `TKT-${ticket.id_ticket}`,
          title: ticket.titulo,
          type: ticket.categoria,
          client: "Cliente",
          status: ticket.estado,
          created_date: ticket.fecha_creacion?.split("T")[0],
          deadline: ticket.fecha_limite?.split("T")[0],
          priority: ticket.prioridad || "medium",
        };
      });

      console.log(
        "Tareas del calendario cargadas:",
        Object.keys(realTasks).length
      );
    } catch (error) {
      console.error("Error al cargar tareas del calendario:", error);
    }
  }

  function renderCalendar() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;

    document.getElementById("calendarTitle").textContent = new Date(
      year,
      month
    ).toLocaleDateString("es-ES", { month: "long", year: "numeric" });

    const calendarDays = document.getElementById("calendarDays");
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

      const dayEvents = Object.values(realTasks).filter(
        (task) => task.deadline === currentDateString
      );

      day.innerHTML = `
                <div class="calendar-day-header">
                    <span class="day-number${
                      isToday ? " today" : ""
                    }">${i}</span>
                </div>
                <div class="calendar-day-events">
                    ${dayEvents
                      .map(
                        (event) => `
                        <div class="calendar-event ${event.status}" onclick="viewTask('${event.id}')">
                            ${event.title}
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

    updateUpcomingTasks();
  }

  function navigateCalendar(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
  }

  function updateUpcomingTasks() {
    const upcomingTasksTable = document.getElementById("upcomingTasksTable");
    if (!upcomingTasksTable) return;

    const sortedTasks = Object.values(mockTasks).sort((a, b) => {
      return new Date(a.deadline) - new Date(b.deadline);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingTasks = sortedTasks.filter((task) => {
      const deadlineDate = new Date(task.deadline);
      return deadlineDate >= today;
    });

    upcomingTasksTable.innerHTML = "";

    upcomingTasks.forEach((task) => {
      const deadlineDate = new Date(task.deadline);
      const diffTime = deadlineDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let daysText = diffDays === 1 ? "1 día" : `${diffDays} días`;
      let daysClass = "";

      if (diffDays <= 2) {
        daysClass = "text-danger";
      } else if (diffDays <= 5) {
        daysClass = "text-warning";
      }

      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${task.id}</td>
                <td>${task.title}</td>
                <td>${task.client}</td>
                <td><span class="status-badge ${task.status}">${getStatusName(
        task.status
      )}</span></td>
                <td>${formatDate(task.deadline)}</td>
                <td class="${daysClass}">${daysText}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view" onclick="viewTask('${
                          task.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
      upcomingTasksTable.appendChild(row);
    });
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

  function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  window.viewTask = function (taskId) {
    window.location.href = `creative-view.html?task=${taskId}`;
  };

  loadCalendarTasks().then(() => {
    mockTasks = realTasks;
    renderCalendar();
    updateUpcomingTasks();
  });
});
