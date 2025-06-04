document.addEventListener('DOMContentLoaded', function () {
    // Configuración de Supabase
    const supabaseUrl = 'https://onbgqjndemplsgxdaltr.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw';

    if (typeof supabase === 'undefined') {
        console.error('Supabase no está cargado');
        return;
    }

    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    // Variables globales
    let tickets = [];
    let users = [];
    let clients = [];
    let currentDate = new Date();

    // Inicialización
    init();

    async function init() {
        try {
            // Cargar todos los datos necesarios
            await Promise.all([
                fetchTickets(),
                fetchUsers(),
                fetchClients()
            ]);

            // Renderizar todas las secciones del dashboard
            updateSummaryCards();
            renderRecentTickets();
            renderCalendar();
            initializeCharts();
            renderActiveCreatives();
            renderRecentActivity();
        } catch (error) {
            console.error('Error al inicializar dashboard:', error);
            showAlert('Error al cargar datos del dashboard', 'danger');
        }
    }

    // Funciones para obtener datos de la base de datos
    async function fetchTickets() {
        try {
            const { data, error } = await supabaseClient
                .from('ticket')
                .select('*')
                .order('fecha_creacion', { ascending: false });

            if (error) throw error;
            tickets = data || [];
            console.log('Tickets cargados:', tickets.length);
        } catch (error) {
            console.error('Error al obtener tickets:', error);
            tickets = [];
        }
    }

    async function fetchUsers() {
        try {
            const { data, error } = await supabaseClient
                .from('usuario')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            users = data || [];
            console.log('Usuarios cargados:', users.length);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            users = [];
        }
    }

    async function fetchClients() {
        try {
            const { data, error } = await supabaseClient
                .from('cliente')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            clients = data || [];
            console.log('Clientes cargados:', clients.length);
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            clients = [];
        }
    }

    // Actualizar tarjetas de resumen
    function updateSummaryCards() {
        const totalTickets = tickets.length;
        const inProgressTickets = tickets.filter(t => t.estado === 'in-progress').length;
        const reviewTickets = tickets.filter(t => t.estado === 'review').length;
        const completedTickets = tickets.filter(t =>
            t.estado === 'delivered' || t.estado === 'approved'
        ).length;

        // Actualizar los números en las tarjetas
        const summaryCards = document.querySelectorAll('.summary-card');
        if (summaryCards.length >= 4) {
            summaryCards[0].querySelector('h3').textContent = totalTickets;
            summaryCards[1].querySelector('h3').textContent = inProgressTickets;
            summaryCards[2].querySelector('h3').textContent = reviewTickets;
            summaryCards[3].querySelector('h3').textContent = completedTickets;

            // Agregar eventos click a las tarjetas
            setupSummaryCardClicks(summaryCards);
        }
    }

    // Configurar eventos click para las tarjetas de resumen
    function setupSummaryCardClicks(summaryCards) {
        // Tarjeta 1: Tickets Totales (sin filtro)
        summaryCards[0].addEventListener('click', function () {
            navigateToTickets();
        });

        // Tarjeta 2: En Proceso
        summaryCards[1].addEventListener('click', function () {
            navigateToTickets('in-progress');
        });

        // Tarjeta 3: En Revisión
        summaryCards[2].addEventListener('click', function () {
            navigateToTickets('review');
        });

        // Tarjeta 4: Completados (delivered + approved)
        summaryCards[3].addEventListener('click', function () {
            navigateToTickets('completed');
        });

        // Agregar efecto visual a las tarjetas
        summaryCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.setAttribute('title', 'Click para ver tickets');
        });
    }

    // Función para navegar a la página de tickets con filtros
    function navigateToTickets(status = null) {
        let url = 'work-orders.html';

        if (status) {
            url += `?status=${status}`;
        }

        // Agregar efecto de loading antes de navegar
        showNavigationFeedback();

        // Navegar después de un pequeño delay para mostrar el feedback
        setTimeout(() => {
            window.location.href = url;
        }, 200);
    }

    // Feedback visual al hacer click
    function showNavigationFeedback() {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--primary-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            font-weight: 500;
            animation: fadeInOut 0.3s ease;
        `;
        feedback.innerHTML = '<i class="fas fa-arrow-right me-2"></i>Navegando a tickets...';

        document.body.appendChild(feedback);

        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }

    // Renderizar tickets recientes
    function renderRecentTickets() {
        const tableBody = document.querySelector('.custom-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        // Tomar los últimos 5 tickets
        const recentTickets = tickets.slice(0, 5);

        if (recentTickets.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">No hay tickets disponibles</td>
                </tr>
            `;
            return;
        }

        recentTickets.forEach(ticket => {
            const assignedUser = users.find(u => u.id_usuario === ticket.id_usuario_asignado);
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>#${ticket.id_ticket}</td>
                <td>${ticket.titulo}</td>
                <td>${getTypeName(ticket.categoria)}</td>
                <td>${assignedUser ? assignedUser.nombre : 'No asignado'}</td>
                <td><span class="status-badge ${ticket.estado}">${getStatusName(ticket.estado)}</span></td>
                <td>${formatDate(ticket.fecha_limite)}</td>
            `;

            // Agregar evento click a la fila completa
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => viewTicketDetails(ticket.id_ticket));

            tableBody.appendChild(row);
        });
    }

    // Renderizar calendario
    function renderCalendar() {
        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;

        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = (firstDay.getDay() + 6) % 7;

        // Actualizar título del calendario
        const calendarTitle = document.getElementById('calendarTitle');
        if (calendarTitle) {
            calendarTitle.textContent = new Date(year, month).toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric'
            });
        }

        calendarDays.innerHTML = '';

        // Días vacíos al inicio
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day inactive';
            calendarDays.appendChild(emptyDay);
        }

        // Días del mes
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';

            const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            const today = new Date();
            const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            if (isToday) {
                day.classList.add('today');
            }

            // Filtrar tickets con fecha límite en este día
            const dayTickets = tickets.filter(ticket => {
                if (!ticket.fecha_limite) return false;
                const ticketDate = ticket.fecha_limite.split('T')[0]; // Obtener solo la fecha
                return ticketDate === currentDateString;
            });

            day.innerHTML = `
                <div class="calendar-day-header">
                    <span class="day-number${isToday ? ' today' : ''}">${i}</span>
                </div>
                <div class="calendar-day-events">
                    ${dayTickets.map(ticket => `
                        <div class="calendar-event ${ticket.estado}" onclick="viewTicketDetails('${ticket.id_ticket}')">
                            ${ticket.titulo.substring(0, 20)}${ticket.titulo.length > 20 ? '...' : ''}
                        </div>
                    `).join('')}
                </div>
            `;

            calendarDays.appendChild(day);
        }

        // Días vacíos al final
        const totalCells = startDayOfWeek + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);

        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day inactive';
                calendarDays.appendChild(emptyDay);
            }
        }
    }

    // Inicializar gráficos
    function initializeCharts() {
        const chartCanvas = document.getElementById('orderDistributionChart');
        if (!chartCanvas) return;

        const ctx = chartCanvas.getContext('2d');

        // Calcular distribución por categoría
        const categoryCount = {};
        tickets.forEach(ticket => {
            const category = ticket.categoria || 'otros';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const categories = Object.keys(categoryCount);
        const counts = Object.values(categoryCount);

        const colors = [
            '#8B5CF6', '#3B82F6', '#F59E0B', '#10B981', '#EC4899', '#6B7280'
        ];

        const chartData = {
            labels: categories.map(cat => getTypeName(cat)),
            datasets: [{
                data: counts,
                backgroundColor: colors.slice(0, categories.length),
                borderColor: 'white',
                borderWidth: 2
            }]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 15,
                        padding: 10,
                        font: { size: 11 },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 }
                }
            },
            cutout: '60%',
            animation: {
                animateScale: true,
                animateRotate: true
            }
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: chartOptions
        });
    }

    // Renderizar creativos más activos
    function renderActiveCreatives() {
        const teamStatsContainer = document.querySelector('.team-stats');
        if (!teamStatsContainer) return;

        // Contar tickets por usuario creativo
        const creativeStats = {};

        tickets.forEach(ticket => {
            if (ticket.id_usuario_asignado) {
                const user = users.find(u => u.id_usuario === ticket.id_usuario_asignado);
                if (user && user.rol === 'Creativo') {
                    const userId = user.id_usuario;
                    if (!creativeStats[userId]) {
                        creativeStats[userId] = {
                            user: user,
                            count: 0
                        };
                    }
                    creativeStats[userId].count++;
                }
            }
        });

        // Ordenar por cantidad de tickets
        const sortedCreatives = Object.values(creativeStats)
            .sort((a, b) => b.count - a.count)
            .slice(0, 4); // Tomar los top 4

        teamStatsContainer.innerHTML = '';

        if (sortedCreatives.length === 0) {
            teamStatsContainer.innerHTML = `
                <div class="text-center py-4 text-muted">
                    No hay creativos activos
                </div>
            `;
            return;
        }

        sortedCreatives.forEach(creative => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'team-member';

            memberDiv.innerHTML = `
                <div class="user-avatar">${getUserInitials(creative.user.nombre)}</div>
                <div class="member-info">
                    <h4>${creative.user.nombre}</h4>
                    <p>${creative.user.rol}</p>
                </div>
                <div class="task-count">${creative.count} ticket${creative.count !== 1 ? 's' : ''}</div>
            `;

            teamStatsContainer.appendChild(memberDiv);
        });
    }

    // Renderizar actividad reciente
    function renderRecentActivity() {
        const activityFeed = document.querySelector('.activity-feed');
        if (!activityFeed) return;

        // Crear actividades basadas en los tickets recientes
        const recentActivities = [];

        // Actividades de creación de tickets
        tickets.slice(0, 3).forEach(ticket => {
            const creator = users.find(u => u.id_usuario === ticket.id_creador);
            recentActivities.push({
                icon: 'fas fa-plus-circle',
                iconBg: 'bg-purple',
                text: `<strong>${creator ? creator.nombre : 'Sistema'}</strong> creó el ticket <a href="#" onclick="viewTicketDetails('${ticket.id_ticket}'); return false;">#${ticket.id_ticket}</a>`,
                time: getRelativeTime(ticket.fecha_creacion)
            });
        });

        // Actividades de tickets en progreso
        const inProgressTickets = tickets.filter(t => t.estado === 'in-progress').slice(0, 2);
        inProgressTickets.forEach(ticket => {
            const assignedUser = users.find(u => u.id_usuario === ticket.id_usuario_asignado);
            recentActivities.push({
                icon: 'fas fa-user-edit',
                iconBg: 'bg-amber',
                text: `<strong>${assignedUser ? assignedUser.nombre : 'Usuario'}</strong> está trabajando en <a href="#" onclick="viewTicketDetails('${ticket.id_ticket}'); return false;">#${ticket.id_ticket}</a>`,
                time: 'En progreso'
            });
        });

        // Actividades de tickets completados
        const completedTickets = tickets.filter(t => t.estado === 'delivered' || t.estado === 'approved').slice(0, 2);
        completedTickets.forEach(ticket => {
            const assignedUser = users.find(u => u.id_usuario === ticket.id_usuario_asignado);
            recentActivities.push({
                icon: 'fas fa-check-double',
                iconBg: 'bg-green',
                text: `<strong>${assignedUser ? assignedUser.nombre : 'Usuario'}</strong> completó <a href="#" onclick="viewTicketDetails('${ticket.id_ticket}'); return false;">#${ticket.id_ticket}</a>`,
                time: 'Completado'
            });
        });

        // Limitar a 5 actividades
        const limitedActivities = recentActivities.slice(0, 5);

        activityFeed.innerHTML = '';

        if (limitedActivities.length === 0) {
            activityFeed.innerHTML = `
                <div class="text-center py-4 text-muted">
                    No hay actividad reciente
                </div>
            `;
            return;
        }

        limitedActivities.forEach(activity => {
            const activityDiv = document.createElement('div');
            activityDiv.className = 'activity-item';

            activityDiv.innerHTML = `
                <div class="activity-icon ${activity.iconBg}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-details">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `;

            activityFeed.appendChild(activityDiv);
        });
    }

    // Event listeners para navegación del calendario
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function () {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function () {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Funciones auxiliares
    function getTypeName(type) {
        const typeMap = {
            'design': 'Diseño Gráfico',
            'web': 'Desarrollo Web',
            'video': 'Producción Audiovisual',
            'copy': 'Copywriting',
            'social': 'Pauta en Redes'
        };
        return typeMap[type] || type;
    }

    function getStatusName(status) {
        const statusMap = {
            'created': 'Creado',
            'assigned': 'Asignado',
            'in-progress': 'En Proceso',
            'review': 'En Revisión',
            'approved': 'Aprobado',
            'delivered': 'Entregado',
            'rejected': 'Rechazado'
        };
        return statusMap[status] || status;
    }

    function getPriorityName(priority) {
        const priorityMap = {
            'low': 'Baja',
            'medium': 'Media',
            'high': 'Alta',
            'urgent': 'Urgente'
        };
        return priorityMap[priority] || priority;
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    function getUserInitials(name) {
        if (!name) return '??';
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    function getRelativeTime(dateString) {
        if (!dateString) return 'Fecha desconocida';

        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                return 'Hace 1 día';
            } else if (diffDays < 7) {
                return `Hace ${diffDays} días`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
            } else {
                return formatDate(dateString);
            }
        } catch {
            return 'Fecha desconocida';
        }
    }

    function getFileIcon(ext) {
        const iconMap = {
            pdf: 'fas fa-file-pdf',
            doc: 'fas fa-file-word',
            docx: 'fas fa-file-word',
            xls: 'fas fa-file-excel',
            xlsx: 'fas fa-file-excel',
            ppt: 'fas fa-file-powerpoint',
            pptx: 'fas fa-file-powerpoint',
            jpg: 'fas fa-file-image',
            jpeg: 'fas fa-file-image',
            png: 'fas fa-file-image',
            gif: 'fas fa-file-image',
            zip: 'fas fa-file-archive',
            rar: 'fas fa-file-archive',
            mp4: 'fas fa-file-video',
            mov: 'fas fa-file-video',
            mp3: 'fas fa-file-audio',
            psd: 'fas fa-file-image',
            ai: 'fas fa-file-image',
            txt: 'fas fa-file-alt'
        };
        return iconMap[ext] || 'fas fa-file';
    }

    function createTimeline(ticket, container) {
        if (!container) return;

        container.innerHTML = '';

        // Ordenar eventos por fecha (de más reciente a más antiguo)
        const events = [
            {
                type: 'created',
                date: ticket.fecha_creacion,
                user: ticket.id_creador,
                description: 'Ticket creado'
            },
            // Aquí podrías agregar más eventos del historial si los tienes
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (events.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay historial disponible</p>';
            return;
        }

        events.forEach(event => {
            const user = users.find(u => u.id_usuario === event.user);
            const eventElement = document.createElement('div');
            eventElement.className = 'timeline-item';

            eventElement.innerHTML = `
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-event-type">${event.description}</span>
                        <span class="timeline-date">${formatDate(event.date)}</span>
                    </div>
                    ${user ? `<p class="timeline-user">Por: ${user.nombre}</p>` : ''}
                </div>
            `;

            container.appendChild(eventElement);
        });
    }

    function showAlert(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        // Implementar sistema de alertas si es necesario
    }

    // Función global para ver detalles de ticket (VERSIÓN COMPLETA)
    window.viewTicketDetails = async function (ticketId) {
        const ticket = tickets.find((t) => t.id_ticket == ticketId);
        if (!ticket) return;

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
  <div class="modal fade" id="expandedTicketModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg"> <!-- Cambiado a modal-lg -->
      <div class="modal-content">
        <!-- Header compacto -->
        <div class="compact-header d-flex justify-content-between align-items-center">
          <h5 class="modal-title">
            <i class="fas fa-ticket-alt text-primary me-2"></i>
            Ticket #${ticket.id_ticket}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        
        <!-- Body compacto -->
        <div class="compact-body">
          <!-- Header info -->
          <div class="mb-3">
            <h4 class="mb-2 fs-5">${ticket.titulo}</h4>
            <div class="status-section">
              <span class="type-badge ${ticket.categoria}">${getTypeName(ticket.categoria)}</span>
              <span class="status-badge ${ticket.estado}">${getStatusName(ticket.estado)}</span>
              <span class="priority-badge ${ticket.prioridad || "medium"}">${getPriorityName(ticket.prioridad || "medium")}</span>
            </div>
          </div>

          <!-- Grid de información más compacto -->
          <div class="info-grid mb-3">
            <div class="info-item">
              <i class="fas fa-user"></i>
              <div>
                <small class="text-muted">Cliente</small>
                <div class="fw-medium text-truncate">${client ? client.nombre : "Sin cliente"}</div>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-user-tag"></i>
              <div>
                <small class="text-muted">Asignado</small>
                <div class="fw-medium text-truncate">${assignedUser ? assignedUser.nombre : "No asignado"}</div>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-user-edit"></i>
              <div>
                <small class="text-muted">Creado por</small>
                <div class="fw-medium text-truncate">${creatorUser ? creatorUser.nombre : "Sistema"}</div>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-calendar-day"></i>
              <div>
                <small class="text-muted">Creación</small>
                <div class="fw-medium">${formatDate(ticket.fecha_creacion)}</div>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <div>
                <small class="text-muted">Límite</small>
                <div class="fw-medium">${formatDate(ticket.fecha_limite)}</div>
              </div>
            </div>
          </div>

          <!-- Descripción compacta -->
          <div class="mb-3 section-divider">
            <div class="section-title">
              <i class="fas fa-align-left me-2"></i>Descripción
            </div>
            <div class="content-box small">
              ${ticket.descripcion || "Sin descripción"}
            </div>
          </div>

          <!-- Archivos adjuntos compactos -->
          <div class="mb-3 section-divider" id="ticketAttachments">
            <div class="section-title">
              <i class="fas fa-paperclip me-2"></i>Archivos
            </div>
            <div class="files-compact small" id="ticketAttachmentsList">
              <!-- Se llenará dinámicamente -->
            </div>
          </div>

          <!-- Comentarios compactos -->
          <div class="mb-3 section-divider">
            <div class="section-title">
              <i class="fas fa-comments me-2"></i>Comentarios
            </div>
            <div class="content-box small">
              <div id="expandedCommentsContainer">
                ${ticket.comentarios
                ? ticket.comentarios
                : '<span class="text-muted">No hay comentarios</span>'
            }
              </div>
            </div>
          </div>

          <!-- Timeline compacto -->
          <div class="mb-2 section-divider">
            <div class="section-title">
              <i class="fas fa-history me-2"></i>Historial
            </div>
            <div class="timeline-compact small" id="expandedTimeline">
              <!-- Se llenará dinámicamente -->
            </div>
          </div>
        </div>

        <!-- Footer compacto -->
        <div class="compact-footer d-flex justify-content-between">
          <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">
            <i class="fas fa-times me-1"></i>Cerrar
          </button>
          <button type="button" class="btn btn-sm btn-outline-primary" onclick="window.location.href='work-orders.html?ticket=${ticket.id_ticket}'">
            <i class="fas fa-external-link-alt me-1"></i>Detalles
          </button>
        </div>
      </div>
    </div>
  </div>
`;

        // Remover modal anterior si existe
        const existingModal = document.getElementById("expandedTicketModal");
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar modal al DOM
        document.body.insertAdjacentHTML("beforeend", modalHtml);

        // Llenar archivos adjuntos del ticket
        const ticketAttachmentsList = document.getElementById("ticketAttachmentsList");
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

        // Llenar timeline
        createTimeline(ticket, document.getElementById("expandedTimeline"));

        // Mostrar modal
        const modal = new bootstrap.Modal(
            document.getElementById("expandedTicketModal")
        );
        modal.show();

        // Limpiar al cerrar
        document
            .getElementById("expandedTicketModal")
            .addEventListener("hidden.bs.modal", () => {
                document.getElementById("expandedTicketModal").remove();
            });
    };
});