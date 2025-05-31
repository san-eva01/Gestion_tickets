document.addEventListener('DOMContentLoaded', function() {

    const creativeSelect = document.getElementById('creativeSelect');
    const dateRangeStart = document.getElementById('dateRangeStart');
    const dateRangeEnd = document.getElementById('dateRangeEnd');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const reportContainer = document.getElementById('reportContainer');
    const reportTableBody = document.getElementById('reportTableBody');
    

    const mockUsers = [
        { id: 2, name: 'Carlos Ruiz', avatar: 'CR', role: 'Creativo' },
        { id: 3, name: 'María López', avatar: 'ML', role: 'Creativo' },
        { id: 4, name: 'Alberto Sánchez', avatar: 'AS', role: 'Creativo' },
        { id: 5, name: 'Laura Gómez', avatar: 'LG', role: 'Creativo' },
        { id: 6, name: 'Pedro Díaz', avatar: 'PD', role: 'Creativo' }
    ];
    

    const mockOrders = [
        {
            id: 'TKT-2023-42',
            title: 'Campaña Verano 2023',
            type: 'design',
            assigned_to: { id: 2, name: 'Carlos Ruiz' },
            status: 'in-progress',
            created_date: '2023-06-15',
            deadline: '2023-06-22',
            completed_date: null,
            client: 'Playa Resort',
            priority: 'high'
        },
        {
            id: 'TKT-2023-37',
            title: 'Logo para Startup',
            type: 'design',
            assigned_to: { id: 2, name: 'Carlos Ruiz' },
            status: 'in-progress',
            created_date: '2023-06-10',
            deadline: '2023-06-21',
            completed_date: null,
            client: 'TechStart',
            priority: 'high'
        },
        {
            id: 'TKT-2023-36',
            title: 'Plantillas para Redes',
            type: 'design',
            assigned_to: { id: 2, name: 'Carlos Ruiz' },
            status: 'in-progress',
            created_date: '2023-06-09',
            deadline: '2023-06-27',
            completed_date: null,
            client: 'Nutrición Esencial',
            priority: 'medium'
        },
        {
            id: 'TKT-2023-35',
            title: 'Iconos para App',
            type: 'design',
            assigned_to: { id: 2, name: 'Carlos Ruiz' },
            status: 'in-progress',
            created_date: '2023-06-08',
            deadline: '2023-06-29',
            completed_date: null,
            client: 'MobileDev',
            priority: 'low'
        },
        {
            id: 'TKT-2023-34',
            title: 'Diseño Vallas Publicitarias',
            type: 'design',
            assigned_to: { id: 2, name: 'Carlos Ruiz' },
            status: 'delivered',
            created_date: '2023-05-25',
            deadline: '2023-06-10',
            completed_date: '2023-06-10',
            client: 'Centro Comercial Plaza',
            priority: 'medium'
        },
        {
            id: 'TKT-2023-30',
            title: 'Rediseño Identidad Corporativa',
            type: 'design',
            assigned_to: { id: 2, name: 'Carlos Ruiz' },
            status: 'delivered',
            created_date: '2023-05-10',
            deadline: '2023-06-05',
            completed_date: '2023-06-05',
            client: 'Restaurante Sabores',
            priority: 'high'
        },
        {
            id: 'TKT-2023-41',
            title: 'Rediseño Sitio Web',
            type: 'web',
            assigned_to: { id: 3, name: 'María López' },
            status: 'review',
            created_date: '2023-06-10',
            deadline: '2023-06-18',
            completed_date: null,
            client: 'Tecnología Avanzada',
            priority: 'medium'
        },
        {
            id: 'TKT-2023-40',
            title: 'Video Corporativo',
            type: 'video',
            assigned_to: { id: 4, name: 'Alberto Sánchez' },
            status: 'approved',
            created_date: '2023-06-05',
            deadline: '2023-06-15',
            completed_date: '2023-06-15',
            client: 'Constructora Edificar',
            priority: 'medium'
        },
        {
            id: 'TKT-2023-39',
            title: 'Copy para Newsletter',
            type: 'copy',
            assigned_to: { id: 5, name: 'Laura Gómez' },
            status: 'delivered',
            created_date: '2023-06-01',
            deadline: '2023-06-14',
            completed_date: '2023-06-14',
            client: 'Moda Express',
            priority: 'low'
        },
        {
            id: 'TKT-2023-38',
            title: 'Pauta Publicitaria',
            type: 'social',
            assigned_to: { id: 6, name: 'Pedro Díaz' },
            status: 'assigned',
            created_date: '2023-06-18',
            deadline: '2023-06-25',
            completed_date: null,
            client: 'Cafetería Aroma',
            priority: 'medium'
        }
    ];
    

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
    
    function populateCreativeSelect() {
        creativeSelect.innerHTML = '<option value="">Seleccionar creativo...</option>';
        
        mockUsers.forEach(user => {
            if (user.role === 'Creativo') {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                creativeSelect.appendChild(option);
            }
        });
    }
    
    function setupDatePickers() {

    }
    
    function setupEventListeners() {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    function generateReport() {
        const creativeId = parseInt(creativeSelect.value);
        const startDate = dateRangeStart.value ? new Date(dateRangeStart.value) : null;
        const endDate = dateRangeEnd.value ? new Date(dateRangeEnd.value) : null;
        
        if (!creativeId) {
            showAlert('Por favor seleccione un creativo', 'warning');
            return;
        }
        
        if (!startDate || !endDate) {
            showAlert('Por favor seleccione un rango de fechas', 'warning');
            return;
        }
        

        const creative = mockUsers.find(user => user.id === creativeId);
        if (!creative) {
            showAlert('Creativo no encontrado', 'error');
            return;
        }
        

        const filteredOrders = mockOrders.filter(order => {
            const orderDate = new Date(order.created_date);
            return order.assigned_to && 
                   order.assigned_to.id === creativeId && 
                   orderDate >= startDate && 
                   orderDate <= endDate;
        });
        
        if (filteredOrders.length === 0) {
            showAlert('No hay tickets para este creativo en el rango de fechas seleccionado', 'warning');
            reportContainer.style.display = 'none';
            return;
        }
        

        reportContainer.style.display = 'block';
        

        document.getElementById('reportCreativeName').textContent = creative.name;
        document.getElementById('reportDateRange').textContent = `${formatDate(startDate)} - ${formatDate(endDate)}`;
        
    
        const reportData = generateReportData(filteredOrders);
        
      
        renderReportTable(filteredOrders);
        

        document.getElementById('totalTickets').textContent = filteredOrders.length;
        document.getElementById('completedTickets').textContent = reportData.completedCount;
        document.getElementById('inProgressTickets').textContent = reportData.inProgressCount;
        document.getElementById('delayedTickets').textContent = reportData.delayedCount;
        
        showAlert('Reporte generado con éxito', 'success');
    }
    
    function generateReportData(orders) {

        const statusCounts = {
            'assigned': 0,
            'in-progress': 0,
            'review': 0,
            'approved': 0,
            'delivered': 0,
            'rejected': 0
        };
        

        let completedCount = 0;
        let inProgressCount = 0;
        let delayedCount = 0;
        
        orders.forEach(order => {
      
            if (statusCounts.hasOwnProperty(order.status)) {
                statusCounts[order.status]++;
            }
            
  
            if (order.status === 'delivered' || order.status === 'approved') {
                completedCount++;
            } else if (order.status === 'in-progress' || order.status === 'review') {
                inProgressCount++;
            }
            
        
            const today = new Date();
            const deadlineDate = new Date(order.deadline);
            if (deadlineDate < today && order.status !== 'delivered' && order.status !== 'approved') {
                delayedCount++;
            }
        });
        
        return {
            statusDistribution: statusCounts,
            completedCount,
            inProgressCount,
            delayedCount
        };
    }
    
    function renderReportTable(orders) {
        reportTableBody.innerHTML = '';
        
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
        
        sortedOrders.forEach(order => {
            const row = document.createElement('tr');
            
        
            let daysText = '';
            let daysClass = '';
            
            if (order.status === 'delivered' || order.status === 'approved') {
                const completedDate = new Date(order.completed_date);
                const deadlineDate = new Date(order.deadline);
                const diffTime = deadlineDate - completedDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 0) {
                    daysText = `Entregado ${diffDays} día(s) antes`;
                    daysClass = 'text-success';
                } else {
                    daysText = `Entregado ${Math.abs(diffDays)} día(s) tarde`;
                    daysClass = 'text-danger';
                }
            } else {
                const today = new Date();
                const deadlineDate = new Date(order.deadline);
                const diffTime = deadlineDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays > 0) {
                    daysText = `${diffDays} día(s) restante(s)`;
                    daysClass = '';
                } else if (diffDays === 0) {
                    daysText = 'Vence hoy';
                    daysClass = 'text-warning';
                } else {
                    daysText = `${Math.abs(diffDays)} día(s) de retraso`;
                    daysClass = 'text-danger';
                }
            }
            
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.title}</td>
                <td><span class="type-badge ${order.type}">${getTypeName(order.type)}</span></td>
                <td><span class="status-badge ${order.status}">${getStatusName(order.status)}</span></td>
                <td>${formatDate(order.created_date)}</td>
                <td>${formatDate(order.deadline)}</td>
                <td class="${daysClass}">${daysText}</td>
            `;
            
            reportTableBody.appendChild(row);
        });
    }
    
    function formatDate(date) {
        if (!date) return '';
        
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    function formatDateForInput(date) {
        if (!date) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
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
    
 
    document.getElementById('exportReportBtn').addEventListener('click', function() {
        const creativeId = parseInt(creativeSelect.value);
        if (!creativeId) {
            showAlert('Primero debe generar un reporte para exportarlo', 'warning');
            return;
        }
        
        const creative = mockUsers.find(user => user.id === creativeId);
        if (!creative) return;
        
        const startDate = dateRangeStart.value ? formatDate(new Date(dateRangeStart.value)) : '';
        const endDate = dateRangeEnd.value ? formatDate(new Date(dateRangeEnd.value)) : '';
        
        showAlert(`Exportando reporte de productividad para ${creative.name} (${startDate} - ${endDate})`, 'info');
        
   
    });
});