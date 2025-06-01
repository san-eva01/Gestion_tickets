document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    loadCalendarEvents();
    
    function initializeCharts() {
        // Gráfico de distribución de tickets centrado
        const orderDistributionCtx = document.getElementById('orderDistributionChart').getContext('2d');
        
        const orderDistributionData = {
            labels: ['Diseño Gráfico', 'Desarrollo Web', 'Producción Audiovisual', 'Copywriting', 'Pauta en Redes'],
            datasets: [{
                data: [7, 5, 4, 4, 4],
                backgroundColor: [
                    '#8B5CF6', 
                    '#3B82F6', 
                    '#F59E0B', 
                    '#10B981',
                    '#EC4899'  
                ],
                borderColor: 'white',
                borderWidth: 2
            }]
        };
        
        const orderDistributionOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom', // Cambiado de 'right' a 'bottom'
                    labels: {
                        boxWidth: 15,
                        padding: 10, // Reducido el padding
                        font: {
                            size: 11 // Ligeramente más pequeño
                        },
                        usePointStyle: true, // Hace los indicadores circulares
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    bodySpacing: 5,
                    boxPadding: 5
                }
            },
            cutout: '60%', // Ligeramente más pequeño para dejar espacio a la leyenda
            animation: {
                animateScale: true,
                animateRotate: true
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            }
        };
        
        new Chart(orderDistributionCtx, {
            type: 'doughnut',
            data: orderDistributionData,
            options: orderDistributionOptions
        });

        // Gráfico de productividad (si existe)
        if (document.getElementById('productivityChart')) {
            const productivityCtx = document.getElementById('productivityChart').getContext('2d');
            
            const productivityData = {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Tickets Completados',
                    data: [4, 6, 8, 5, 7, 9],
                    backgroundColor: '#8B5CF6',
                    borderColor: '#7C3AED',
                    borderWidth: 2,
                    tension: 0.4
                }]
            };
            
            const productivityOptions = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            };
            
            new Chart(productivityCtx, {
                type: 'line',
                data: productivityData,
                options: productivityOptions
            });
        }
    }

    function loadCalendarEvents() {
        // Resto del código del calendario se mantiene igual
        const calendarContainer = document.getElementById('upcomingCalendar');
        if (!calendarContainer) return;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        document.getElementById('calendarTitle').textContent = new Date(currentYear, currentMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        let startDayOfWeek = (firstDay.getDay() + 6) % 7;
        const daysInMonth = lastDay.getDate();
        
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';
        
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day inactive';
            calendarDays.appendChild(emptyDay);
        }
        
        const orders = getOrders();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            
            const currentDateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            const today = new Date();
            const isToday = i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            
            if (isToday) {
                day.classList.add('today');
            }
            
            const dayEvents = orders.filter(order => order.deadline === currentDateString);
            
            day.innerHTML = `
                <div class="calendar-day-header">
                    <span class="day-number${isToday ? ' today' : ''}">${i}</span>
                </div>
                <div class="calendar-day-events">
                    ${dayEvents.map(event => `
                        <div class="calendar-event ${event.status}" onclick="viewOrderDetails('${event.id}')">
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
    }

    function getOrders() {
        return [
            {
                id: 'TKT-2023-42',
                title: 'Campaña Verano 2023',
                type: 'design',
                status: 'in-progress',
                deadline: '2023-06-22'
            },
            {
                id: 'TKT-2023-41',
                title: 'Rediseño Sitio Web',
                type: 'web',
                status: 'review',
                deadline: '2023-06-18'
            },
            {
                id: 'TKT-2023-37',
                title: 'Logo para Startup',
                type: 'design',
                status: 'in-progress',
                deadline: '2023-06-21'
            },
            {
                id: 'TKT-2023-36',
                title: 'Plantillas para Redes',
                type: 'design',
                status: 'in-progress',
                deadline: '2023-06-27'
            }
        ];
    }

    document.getElementById('prevMonth').addEventListener('click', function() {
        navigateCalendar(-1);
    });
    
    document.getElementById('nextMonth').addEventListener('click', function() {
        navigateCalendar(1);
    });
    
    function navigateCalendar(direction) {
        const currentTitle = document.getElementById('calendarTitle').textContent;
        const [month, year] = currentTitle.split(' ');
        
        const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        let monthIndex = monthNames.indexOf(month.toLowerCase());
        let yearNum = parseInt(year);
        
        monthIndex += direction;
        
        if (monthIndex < 0) {
            monthIndex = 11;
            yearNum--;
        } else if (monthIndex > 11) {
            monthIndex = 0;
            yearNum++;
        }
        
        document.getElementById('calendarTitle').textContent = `${monthNames[monthIndex].charAt(0).toUpperCase() + monthNames[monthIndex].slice(1)} ${yearNum}`;
        
        loadCalendarEvents();
    }
});