document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();

    const mockTasks = {
        'TKT-2023-42': {
            id: 'TKT-2023-42',
            title: 'Campaña Verano 2023',
            type: 'design',
            client: 'Playa Resort',
            status: 'assigned',
            created_date: '2023-06-15',
            deadline: '2023-06-22',
            priority: 'high'
        },
        'TKT-2023-43': {
            id: 'TKT-2023-43',
            title: 'Brochure Digital',
            type: 'design',
            client: 'Industrias ABC',
            status: 'assigned',
            created_date: '2023-06-16',
            deadline: '2023-06-30',
            priority: 'medium'
        },
        'TKT-2023-37': {
            id: 'TKT-2023-37',
            title: 'Logo para Startup',
            type: 'design',
            client: 'TechStart',
            status: 'in-progress',
            created_date: '2023-06-10',
            deadline: '2023-06-21',
            priority: 'high'
        },
        'TKT-2023-36': {
            id: 'TKT-2023-36',
            title: 'Plantillas para Redes',
            type: 'design',
            client: 'Nutrición Esencial',
            status: 'in-progress',
            created_date: '2023-06-09',
            deadline: '2023-06-27',
            priority: 'medium'
        },
        'TKT-2023-35': {
            id: 'TKT-2023-35',
            title: 'Iconos para App',
            type: 'design',
            client: 'MobileDev',
            status: 'in-progress',
            created_date: '2023-06-08',
            deadline: '2023-06-29',
            priority: 'low'
        }
    };


    renderCalendar();
    
  
    document.getElementById('prevMonth').addEventListener('click', function() {
        navigateCalendar(-1);
    });
    
    document.getElementById('nextMonth').addEventListener('click', function() {
        navigateCalendar(1);
    });
    
    function renderCalendar() {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = (firstDay.getDay() + 6) % 7;
        

        document.getElementById('calendarTitle').textContent = new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';
        
     
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day inactive';
            calendarDays.appendChild(emptyDay);
        }
        
       
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            
            const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            
            const today = new Date();
            const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            
            if (isToday) {
                day.classList.add('today');
            }
            
         
            const dayEvents = Object.values(mockTasks).filter(task => task.deadline === currentDateString);
            
            day.innerHTML = `
                <div class="calendar-day-header">
                    <span class="day-number${isToday ? ' today' : ''}">${i}</span>
                </div>
                <div class="calendar-day-events">
                    ${dayEvents.map(event => `
                        <div class="calendar-event ${event.status}" onclick="viewTask('${event.id}')">
                            ${event.title}
                        </div>
                    `).join('')}
                </div>
            `;
            
            calendarDays.appendChild(day);
        }
        
        
        const totalCells = startDayOfWeek + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);
        
        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day inactive';
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
        const upcomingTasksTable = document.getElementById('upcomingTasksTable');
        if (!upcomingTasksTable) return;
        
   
        const sortedTasks = Object.values(mockTasks).sort((a, b) => {
            return new Date(a.deadline) - new Date(b.deadline);
        });
        
       
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingTasks = sortedTasks.filter(task => {
            const deadlineDate = new Date(task.deadline);
            return deadlineDate >= today;
        });
        
     
        upcomingTasksTable.innerHTML = '';
        
     
        upcomingTasks.forEach(task => {
            const deadlineDate = new Date(task.deadline);
            const diffTime = deadlineDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let daysText = diffDays === 1 ? '1 día' : `${diffDays} días`;
            let daysClass = '';
            
            if (diffDays <= 2) {
                daysClass = 'text-danger';
            } else if (diffDays <= 5) {
                daysClass = 'text-warning';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.id}</td>
                <td>${task.title}</td>
                <td>${task.client}</td>
                <td><span class="status-badge ${task.status}">${getStatusName(task.status)}</span></td>
                <td>${formatDate(task.deadline)}</td>
                <td class="${daysClass}">${daysText}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view" onclick="viewTask('${task.id}')">
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
    
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    

    window.viewTask = function(taskId) {
      
        window.location.href = `creative-view.html?task=${taskId}`;
    };
});