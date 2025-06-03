document.addEventListener('DOMContentLoaded', function() {
    const supabaseUrl = "https://onbgqjndemplsgxdaltr.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw";
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    let categoryChart = null;

    async function loadClientProductivity() {
        try {
            // Obtener tickets con información de cliente
            const { data: tickets, error: ticketsError } = await supabaseClient
                .from('ticket')
                .select(`
                    *,
                    cliente:id_cliente_entregable(
                        id_cliente,
                        nombre,
                        tipo
                    )
                `);

            if (ticketsError) throw ticketsError;

            // Procesar datos
            const clientStats = processClientData(tickets);
            
            // Actualizar contadores generales
            updateGeneralStats(tickets, clientStats);
            
            // Renderizar tabla de clientes
            renderClientTable(clientStats);
            
            // Actualizar gráfico de categorías
            updateCategoryChart(tickets);

        } catch (error) {
            console.error('Error al cargar datos:', error);
            showAlert('Error al cargar estadísticas de clientes', 'danger');
        }
    }

    function processClientData(tickets) {
        const clientStats = {};

        tickets.forEach(ticket => {
            const clientId = ticket.id_cliente_entregable;
            const client = ticket.cliente;

            if (!client) return;

            if (!clientStats[clientId]) {
                clientStats[clientId] = {
                    name: client.nombre,
                    type: client.tipo,
                    totalTickets: 0,
                    completedTickets: 0,
                    categories: {},
                    avgCompletionTime: 0,
                    totalCompletionTime: 0
                };
            }

            clientStats[clientId].totalTickets++;

            // Contar por categoría
            if (!clientStats[clientId].categories[ticket.categoria]) {
                clientStats[clientId].categories[ticket.categoria] = 0;
            }
            clientStats[clientId].categories[ticket.categoria]++;

            // Calcular tickets completados y tiempo
            if (ticket.estado === 'delivered' || ticket.estado === 'approved') {
                clientStats[clientId].completedTickets++;
                
                const startDate = new Date(ticket.fecha_creacion);
                const endDate = new Date(ticket.fecha_limite);
                const completionTime = endDate - startDate;
                
                clientStats[clientId].totalCompletionTime += completionTime;
            }
        });

        // Calcular promedios
        Object.values(clientStats).forEach(client => {
            if (client.completedTickets > 0) {
                client.avgCompletionTime = client.totalCompletionTime / client.completedTickets;
            }
        });

        return clientStats;
    }

    function updateGeneralStats(tickets, clientStats) {
        const totalClients = Object.keys(clientStats).length;
        const totalTickets = tickets.length;
        const completedTickets = tickets.filter(t => 
            t.estado === 'delivered' || t.estado === 'approved'
        ).length;

        let totalTime = 0;
        let timeCount = 0;

        tickets.forEach(ticket => {
            if (ticket.estado === 'delivered' || ticket.estado === 'approved') {
                const startDate = new Date(ticket.fecha_creacion);
                const endDate = new Date(ticket.fecha_limite);
                totalTime += endDate - startDate;
                timeCount++;
            }
        });

        const avgTime = timeCount > 0 ? totalTime / timeCount : 0;
        const avgDays = Math.round(avgTime / (1000 * 60 * 60 * 24));

        document.getElementById('totalClients').textContent = totalClients;
        document.getElementById('totalTickets').textContent = totalTickets;
        document.getElementById('completedTickets').textContent = completedTickets;
        document.getElementById('avgCompletionTime').textContent = `${avgDays} días`;
    }

    function renderClientTable(clientStats) {
        const tbody = document.getElementById('clientTableBody');
        tbody.innerHTML = '';

        Object.entries(clientStats)
            .sort(([,a], [,b]) => b.totalTickets - a.totalTickets)
            .forEach(([clientId, client]) => {
                const row = document.createElement('tr');
                
                const completionRate = (client.completedTickets / client.totalTickets) * 100;
                const avgDays = Math.round(client.avgCompletionTime / (1000 * 60 * 60 * 24));
                
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="fw-semibold">${client.name}</span>
                            <span class="badge bg-light text-dark ms-2">${client.type}</span>
                        </div>
                    </td>
                    <td>${client.totalTickets}</td>
                    <td>
                        <div class="category-distribution">
                            ${Object.entries(client.categories).map(([category, count]) => `
                                <span class="type-badge ${category}">
                                    ${getTypeName(category)}: ${count}
                                </span>
                            `).join('')}
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="completion-rate">
                                <div class="completion-rate-bar" style="width: ${completionRate}%"></div>
                            </div>
                            <span>${Math.round(completionRate)}%</span>
                        </div>
                    </td>
                    <td>
                        <span class="time-badge ${getTimeClass(avgDays)}">
                            ${avgDays} días
                        </span>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
    }

    function updateCategoryChart(tickets) {
        const categories = {};
        
        tickets.forEach(ticket => {
            if (!categories[ticket.categoria]) {
                categories[ticket.categoria] = 0;
            }
            categories[ticket.categoria]++;
        });

        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        if (categoryChart) {
            categoryChart.destroy();
        }

        categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories).map(getTypeName),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        '#A78BFA', // Softer purple
                        '#60A5FA', // Softer blue  
                        '#34D399', // Softer green
                        '#FBBF24', // Softer yellow
                        '#F87171'  // Softer red
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

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

    function getTimeClass(days) {
        if (days <= 7) return 'fast';
        if (days <= 14) return 'medium';
        return 'slow';
    }

    function showAlert(message, type = 'success') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.appendChild(alert);

        setTimeout(() => alert.remove(), 5000);
    }

    // Event Listeners
    document.getElementById('timeFilter').addEventListener('change', function(e) {
        loadClientProductivity(); // Recargar datos con el nuevo filtro
    });

    // Initial load
    loadClientProductivity();
});