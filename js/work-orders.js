
document.addEventListener('DOMContentLoaded', function() {

    const orderTableBody = document.getElementById('orderTableBody');
    const ordersGrid = document.getElementById('ordersGrid');
    const calendarDays = document.getElementById('calendarDays');
    const orderForm = document.getElementById('orderForm');
    const searchInput = document.querySelector('.search-input');
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const dateFromFilter = document.getElementById('dateFrom');
    const dateToFilter = document.getElementById('dateTo');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const viewContainers = document.querySelectorAll('.view');
    const btnNewOrder = document.getElementById('btnNewOrder');
    

    const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    const viewOrderModal = new bootstrap.Modal(document.getElementById('viewOrderModal'));
    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    

    window.mockOrders = [
        {
            id: 'TKT-2023-42',
            title: 'Campaña Verano 2023',
            type: 'design',
            assigned_to: {
                id: 2,
                name: 'Carlos Ruiz',
                avatar: 'CR'
            },
            status: 'in-progress',
            created_date: '2023-06-15',
            deadline: '2023-06-22',
            client: 'Playa Resort',
            description: 'Diseño de materiales promocionales para la campaña de verano 2023, incluyendo banners, posts para redes sociales y folletos digitales.',
            priority: 'high',
            created_by: {
                id: 1,
                name: 'Ana Martínez',
                avatar: 'AM'
            },
            attachments: [
                { name: 'brief_campaña.pdf', type: 'pdf' },
                { name: 'logos_cliente.zip', type: 'zip' }
            ],
            comments: [
                {
                    id: 1,
                    user: { id: 1, name: 'Ana Martínez', avatar: 'AM' },
                    date: '2023-06-15T13:45:00',
                    text: 'Por favor prioriza los banners digitales para redes sociales.'
                },
                {
                    id: 2,
                    user: { id: 2, name: 'Carlos Ruiz', avatar: 'CR' },
                    date: '2023-06-16T09:30:00',
                    text: 'Entendido, ya estoy trabajando en los diseños para Instagram y Facebook.'
                }
            ],
            timeline: [
                { date: '2023-06-15T10:00:00', action: 'created', user: 'Ana Martínez' },
                { date: '2023-06-15T10:05:00', action: 'assigned', user: 'Ana Martínez', assignee: 'Carlos Ruiz' },
                { date: '2023-06-16T08:30:00', action: 'status_change', user: 'Carlos Ruiz', from_status: 'assigned', to_status: 'in-progress' }
            ]
        },
        {
            id: 'TKT-2023-41',
            title: 'Rediseño Sitio Web',
            type: 'web',
            assigned_to: {
                id: 3,
                name: 'María López',
                avatar: 'ML'
            },
            status: 'review',
            created_date: '2023-06-10',
            deadline: '2023-06-18',
            client: 'Tecnología Avanzada',
            description: 'Rediseño completo del sitio web corporativo con enfoque en mejorar la experiencia de usuario y optimizar la conversión.',
            priority: 'medium',
            created_by: {
                id: 1,
                name: 'Ana Martínez',
                avatar: 'AM'
            },
            attachments: [
                { name: 'wireframes.pdf', type: 'pdf' },
                { name: 'contenido_paginas.docx', type: 'doc' }
            ],
            comments: [
                {
                    id: 3,
                    user: { id: 3, name: 'María López', avatar: 'ML' },
                    date: '2023-06-17T15:20:00',
                    text: 'He finalizado el rediseño. Pueden revisar en el enlace del repositorio.'
                }
            ],
            timeline: [
                { date: '2023-06-10T11:30:00', action: 'created', user: 'Ana Martínez' },
                { date: '2023-06-10T13:15:00', action: 'assigned', user: 'Ana Martínez', assignee: 'María López' },
                { date: '2023-06-11T09:00:00', action: 'status_change', user: 'María López', from_status: 'assigned', to_status: 'in-progress' },
                { date: '2023-06-17T15:20:00', action: 'status_change', user: 'María López', from_status: 'in-progress', to_status: 'review' }
            ]
        },
        {
            id: 'TKT-2023-40',
            title: 'Video Corporativo',
            type: 'video',
            assigned_to: {
                id: 4,
                name: 'Alberto Sánchez',
                avatar: 'AS'
            },
            status: 'approved',
            created_date: '2023-06-05',
            deadline: '2023-06-15',
            client: 'Constructora Edificar',
            description: 'Producción de un video corporativo de 2 minutos presentando la historia, valores y servicios de la empresa.',
            priority: 'medium',
            created_by: {
                id: 1,
                name: 'Ana Martínez',
                avatar: 'AM'
            },
            attachments: [
                { name: 'guion_video.docx', type: 'doc' },
                { name: 'logo_vectorizado.ai', type: 'ai' }
            ],
            comments: [
                {
                    id: 4,
                    user: { id: 4, name: 'Alberto Sánchez', avatar: 'AS' },
                    date: '2023-06-14T16:00:00',
                    text: 'Video completado y enviado para revisión.'
                },
                {
                    id: 5,
                    user: { id: 1, name: 'Ana Martínez', avatar: 'AM' },
                    date: '2023-06-15T10:30:00',
                    text: 'Video aprobado. Excelente trabajo, Alberto.'
                }
            ],
            timeline: [
                { date: '2023-06-05T09:45:00', action: 'created', user: 'Ana Martínez' },
                { date: '2023-06-05T10:00:00', action: 'assigned', user: 'Ana Martínez', assignee: 'Alberto Sánchez' },
                { date: '2023-06-06T08:30:00', action: 'status_change', user: 'Alberto Sánchez', from_status: 'assigned', to_status: 'in-progress' },
                { date: '2023-06-14T16:00:00', action: 'status_change', user: 'Alberto Sánchez', from_status: 'in-progress', to_status: 'review' },
                { date: '2023-06-15T10:30:00', action: 'status_change', user: 'Ana Martínez', from_status: 'review', to_status: 'approved' }
            ]
        },
        {
            id: 'TKT-2023-39',
            title: 'Copy para Newsletter',
            type: 'copy',
            assigned_to: {
                id: 5,
                name: 'Laura Gómez',
                avatar: 'LG'
            },
            status: 'delivered',
            created_date: '2023-06-01',
            deadline: '2023-06-14',
            client: 'Moda Express',
            description: 'Redacción del contenido para la newsletter mensual, con enfoque en las nuevas colecciones de verano y ofertas especiales.',
            priority: 'low',
            created_by: {
                id: 1,
                name: 'Ana Martínez',
                avatar: 'AM'
            },
            attachments: [
                { name: 'referencias_anteriores.pdf', type: 'pdf' }
            ],
            comments: [
                {
                    id: 6,
                    user: { id: 5, name: 'Laura Gómez', avatar: 'LG' },
                    date: '2023-06-13T11:20:00',
                    text: 'He entregado el copy final. Se ha incluido un CTA adicional para la promoción de temporada.'
                }
            ],
            timeline: [
                { date: '2023-06-01T15:30:00', action: 'created', user: 'Ana Martínez' },
                { date: '2023-06-01T15:45:00', action: 'assigned', user: 'Ana Martínez', assignee: 'Laura Gómez' },
                { date: '2023-06-02T09:15:00', action: 'status_change', user: 'Laura Gómez', from_status: 'assigned', to_status: 'in-progress' },
                { date: '2023-06-13T11:20:00', action: 'status_change', user: 'Laura Gómez', from_status: 'in-progress', to_status: 'review' },
                { date: '2023-06-13T16:00:00', action: 'status_change', user: 'Ana Martínez', from_status: 'review', to_status: 'approved' },
                { date: '2023-06-14T09:00:00', action: 'status_change', user: 'Ana Martínez', from_status: 'approved', to_status: 'delivered' }
            ]
        },
        {
            id: 'TKT-2023-38',
            title: 'Pauta Publicitaria',
            type: 'social',
            assigned_to: {
                id: 6,
                name: 'Pedro Díaz',
                avatar: 'PD'
            },
            status: 'assigned',
            created_date: '2023-06-18',
            deadline: '2023-06-25',
            client: 'Cafetería Aroma',
            description: 'Creación y gestión de campaña publicitaria en Facebook e Instagram para promocionar nuevos productos de cafetería.',
            priority: 'medium',
            created_by: {
                id: 1,
                name: 'Ana Martínez',
                avatar: 'AM'
            },
            attachments: [
                { name: 'imagenes_producto.zip', type: 'zip' }
            ],
            comments: [
                {
                    id: 7,
                    user: { id: 6, name: 'Pedro Díaz', avatar: 'PD' },
                    date: '2023-06-18T17:00:00',
                    text: 'Recibido. Comenzaré a analizar la estrategia para la campaña.'
                }
            ],
            timeline: [
                { date: '2023-06-18T14:00:00', action: 'created', user: 'Ana Martínez' },
                { date: '2023-06-18T14:15:00', action: 'assigned', user: 'Ana Martínez', assignee: 'Pedro Díaz' }
            ]
        }
    ];
    

    const mockUsers = [
        { id: 2, name: 'Carlos Ruiz', avatar: 'CR', role: 'Creativo' },
        { id: 3, name: 'María López', avatar: 'ML', role: 'Creativo' },
        { id: 4, name: 'Alberto Sánchez', avatar: 'AS', role: 'Creativo' },
        { id: 5, name: 'Laura Gómez', avatar: 'LG', role: 'Creativo' },
        { id: 6, name: 'Pedro Díaz', avatar: 'PD', role: 'Creativo' }
    ];
    

    init();
    

    if (btnNewOrder) {
        btnNewOrder.addEventListener('click', () => showOrderModal());
    }
    
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
    
    if (document.getElementById('confirmDelete')) {
        document.getElementById('confirmDelete').addEventListener('click', confirmDeleteOrder);
    }
    
    if (document.getElementById('editOrderBtn')) {
        document.getElementById('editOrderBtn').addEventListener('click', handleEditButtonClick);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', filterOrders);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterOrders);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', filterOrders);
    }
    
    if (dateFromFilter) {
        dateFromFilter.addEventListener('change', filterOrders);
    }
    
    if (dateToFilter) {
        dateToFilter.addEventListener('change', filterOrders);
    }
    
    if (document.getElementById('viewAddComment')) {
        document.getElementById('viewAddComment').addEventListener('click', addViewComment);
    }
    
    if (document.getElementById('addComment')) {
        document.getElementById('addComment').addEventListener('click', addComment);
    }


    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            viewContainers.forEach(v => v.classList.remove('active'));
            
            btn.classList.add('active');
            const viewId = btn.getAttribute('data-view') + 'View';
            document.getElementById(viewId).classList.add('active');
            
            if (viewId === 'calendarView') {
                renderCalendar();
            }
        });
    });
    
    function init() {
        renderOrders();
        populateAssigneeDropdown();
        setupFileUpload();
        renderCalendar();
    }
    
    function renderOrders(filteredOrders = null) {
        const ordersToRender = filteredOrders || mockOrders;
        

        renderTableView(ordersToRender);
        

        renderGridView(ordersToRender);
    }
    
    function renderTableView(orders) {
        if (!orderTableBody) return;
        
        orderTableBody.innerHTML = '';
        
        if (orders.length === 0) {
            orderTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">No se encontraron tickets que coincidan con su búsqueda</td>
                </tr>
            `;
            return;
        }
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.title}</td>
                <td><span class="type-badge ${order.type}">${getTypeName(order.type)}</span></td>
                <td>
                    <div class="user-info">
                        ${order.assigned_to ? `
                            <div class="user-avatar">${order.assigned_to.avatar}</div>
                            <span>${order.assigned_to.name}</span>
                        ` : '<span class="text-muted">No asignado</span>'}
                    </div>
                </td>
                <td><span class="status-badge ${order.status}">${getStatusName(order.status)}</span></td>
                <td>${formatDate(order.created_date)}</td>
                <td>${formatDate(order.deadline)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view" onclick="viewOrderDetails('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit" onclick="editOrder('${order.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteOrder('${order.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            orderTableBody.appendChild(row);
        });
    }
    
    function renderGridView(orders) {
        if (!ordersGrid) return;
        
        ordersGrid.innerHTML = '';
        
        if (orders.length === 0) {
            ordersGrid.innerHTML = `
                <div class="text-center py-4 w-100">No se encontraron tickets que coincidan con su búsqueda</div>
            `;
            return;
        }
        
        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'order-card';
            card.innerHTML = `
                <div class="order-card-header">
                    <h3 class="order-card-title">${order.title}</h3>
                    <div class="order-card-meta">
                        <span class="status-badge ${order.status}">${getStatusName(order.status)}</span>
                        <span class="type-badge ${order.type}">${getTypeName(order.type)}</span>
                    </div>
                </div>
                <div class="order-card-body">
                    <div class="order-info-item">
                        <span class="order-info-label">Cliente:</span>
                        <span class="order-info-value">${order.client}</span>
                    </div>
                    <div class="order-info-item">
                        <span class="order-info-label">Fecha Límite:</span>
                        <span class="order-info-value">${formatDate(order.deadline)}</span>
                    </div>
                    <div class="order-info-item">
                        <span class="order-info-label">Asignado a:</span>
                        <span class="order-info-value">
                            ${order.assigned_to ? order.assigned_to.name : 'No asignado'}
                        </span>
                    </div>
                    <div class="order-info-item">
                        <span class="order-info-label">Prioridad:</span>
                        <span class="order-info-value">
                            <span class="priority-badge ${order.priority}">${getPriorityName(order.priority)}</span>
                        </span>
                    </div>
                </div>
                <div class="order-card-footer">
                    <span class="order-id">${order.id}</span>
                    <div class="action-buttons">
                        <button class="btn-icon view" onclick="viewOrderDetails('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit" onclick="editOrder('${order.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteOrder('${order.id}')">
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
        

        document.querySelector('.calendar-title').textContent = new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
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
            
 
            const dayEvents = mockOrders.filter(order => order.deadline === currentDateString);
            
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
    
    function populateAssigneeDropdown() {
        const assignedToSelect = document.getElementById('assignedTo');
        if (!assignedToSelect) return;
        
        assignedToSelect.innerHTML = '<option value="">Sin asignar</option>';
        
        mockUsers.forEach(user => {
            if (user.role === 'Creativo' || user.role === 'Editor') {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                assignedToSelect.appendChild(option);
            }
        });
    }
    
    function setupFileUpload() {
        const fileAttachments = document.getElementById('fileAttachments');
        const fileList = document.getElementById('fileList');
        
        if (!fileAttachments || !fileList) return;
        
        fileAttachments.addEventListener('change', function() {
            fileList.innerHTML = '';
            
            if (this.files.length > 0) {
                for (const file of this.files) {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    fileItem.innerHTML = `
                        <span>${file.name}</span>
                        <i class="fas fa-times remove-file"></i>
                    `;
                    fileList.appendChild(fileItem);
                }
                

                document.querySelectorAll('.remove-file').forEach(btn => {
                    btn.addEventListener('click', function() {
                        this.closest('.file-item').remove();
                    });
                });
            }
        });
    }
    
    function showOrderModal(orderId = null) {
        if (!orderForm) return;
        
        orderForm.reset();
        document.getElementById('orderId').value = '';
        document.getElementById('fileList').innerHTML = '';
        document.getElementById('commentsSection').style.display = 'none';
        
        if(orderId) {
            const order = mockOrders.find(o => o.id === orderId);
            if(order) {
                document.getElementById('orderId').value = order.id;
                document.getElementById('orderTitle').value = order.title;
                document.getElementById('orderType').value = order.type;
                document.getElementById('assignedTo').value = order.assigned_to ? order.assigned_to.id : '';
                document.getElementById('orderStatus').value = order.status;
                document.getElementById('priority').value = order.priority;
                document.getElementById('orderClient').value = order.client;
                document.getElementById('orderDeadline').value = order.deadline;
                document.getElementById('orderDescription').value = order.description;
                

                if (order.attachments && order.attachments.length > 0) {
                    const fileList = document.getElementById('fileList');
                    fileList.innerHTML = '';
                    
                    order.attachments.forEach(file => {
                        const fileItem = document.createElement('div');
                        fileItem.className = 'file-item';
                        fileItem.innerHTML = `
                            <span>${file.name}</span>
                            <i class="fas fa-times remove-file"></i>
                        `;
                        fileList.appendChild(fileItem);
                    });
                }
                

                if (order.comments && order.comments.length > 0) {
                    const commentsContainer = document.getElementById('commentsContainer');
                    commentsContainer.innerHTML = '';
                    
                    order.comments.forEach(comment => {
                        const commentElement = document.createElement('div');
                        commentElement.className = 'comment';
                        commentElement.innerHTML = `
                            <div class="comment-avatar">${comment.user.avatar}</div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <span class="comment-author">${comment.user.name}</span>
                                    <span class="comment-date">${formatDateTime(comment.date)}</span>
                                </div>
                                <p class="comment-text">${comment.text}</p>
                            </div>
                        `;
                        commentsContainer.appendChild(commentElement);
                    });
                    
                    document.getElementById('commentsSection').style.display = 'block';
                }
                
                document.getElementById('modalTitle').textContent = 'Editar Ticket';
            }
        } else {
            document.getElementById('modalTitle').textContent = 'Nuevo Ticket';
            document.getElementById('orderStatus').value = 'created';
        }
        
        orderModal.show();
    }
    
    function handleOrderSubmit(e) {
        e.preventDefault();
        
        const orderId = document.getElementById('orderId').value;
        const assignedToId = document.getElementById('assignedTo').value;
        const assignedUser = assignedToId ? mockUsers.find(u => u.id == assignedToId) : null;
        
        const orderData = {
            title: document.getElementById('orderTitle').value,
            type: document.getElementById('orderType').value,
            assigned_to: assignedUser ? {
                id: assignedUser.id,
                name: assignedUser.name,
                avatar: assignedUser.avatar
            } : null,
            status: document.getElementById('orderStatus').value,
            deadline: document.getElementById('orderDeadline').value,
            client: document.getElementById('orderClient').value,
            description: document.getElementById('orderDescription').value,
            priority: document.getElementById('priority').value
        };
        
 
        const fileList = document.getElementById('fileList');
        const attachments = [];
        
        if (fileList.children.length > 0) {
            for (const fileItem of fileList.children) {
                const fileName = fileItem.querySelector('span').textContent;
                const fileExt = fileName.split('.').pop();
                
                attachments.push({
                    name: fileName,
                    type: fileExt
                });
            }
        }
        
        if(orderId) {

            const index = mockOrders.findIndex(o => o.id === orderId);
            if(index !== -1) {

                if (mockOrders[index].status !== orderData.status) {
                    const timelineEntry = {
                        date: new Date().toISOString(),
                        action: 'status_change',
                        user: 'Ana Martínez',
                        from_status: mockOrders[index].status,
                        to_status: orderData.status
                    };
                    
                    if (!mockOrders[index].timeline) {
                        mockOrders[index].timeline = [];
                    }
                    
                    mockOrders[index].timeline.push(timelineEntry);
                }
                

                orderData.comments = mockOrders[index].comments || [];
                orderData.timeline = mockOrders[index].timeline || [];
                orderData.attachments = attachments.length > 0 ? attachments : (mockOrders[index].attachments || []);
                orderData.created_date = mockOrders[index].created_date;
                orderData.created_by = mockOrders[index].created_by;
                
                mockOrders[index] = { ...mockOrders[index], ...orderData };
                showAlert('Ticket actualizado con éxito', 'success');
            }
        } else {

            const newId = `TKT-${new Date().getFullYear()}-${mockOrders.length + 38}`;
            const newOrder = {
                id: newId,
                ...orderData,
                created_date: new Date().toISOString().split('T')[0],
                created_by: {
                    id: 1,
                    name: 'Ana Martínez',
                    avatar: 'AM'
                },
                attachments: attachments,
                comments: [],
                timeline: [
                    { date: new Date().toISOString(), action: 'created', user: 'Ana Martínez' }
                ]
            };
            

            if (assignedUser) {
                newOrder.timeline.push({
                    date: new Date().toISOString(),
                    action: 'assigned',
                    user: 'Ana Martínez',
                    assignee: assignedUser.name
                });
            }
            
            mockOrders.unshift(newOrder);
            showAlert('Ticket creado con éxito', 'success');
        }
        
        orderModal.hide();
        renderOrders();
        if (document.querySelector('.tab-btn.active').getAttribute('data-view') === 'calendar') {
            renderCalendar();
        }
    }
    
    window.viewOrderDetails = function(orderId) {
        const order = mockOrders.find(o => o.id === orderId);
        if (!order) return;
        

        document.getElementById('viewOrderId').textContent = order.id;
        document.getElementById('viewOrderTitle').textContent = order.title;
        document.getElementById('viewOrderType').textContent = getTypeName(order.type);
        document.getElementById('viewOrderType').className = `type-badge ${order.type}`;
        document.getElementById('viewOrderStatus').textContent = getStatusName(order.status);
        document.getElementById('viewOrderStatus').className = `status-badge ${order.status}`;
        document.getElementById('viewOrderPriority').textContent = getPriorityName(order.priority);
        document.getElementById('viewOrderPriority').className = `priority-badge ${order.priority}`;
        document.getElementById('viewOrderClient').textContent = order.client;
        document.getElementById('viewAssignedTo').textContent = order.assigned_to ? order.assigned_to.name : 'No asignado';
        document.getElementById('viewCreatedBy').textContent = order.created_by ? order.created_by.name : 'Sistema';
        document.getElementById('viewCreatedDate').textContent = formatDate(order.created_date);
        document.getElementById('viewDeadline').textContent = formatDate(order.deadline);
        document.getElementById('viewDescription').textContent = order.description;
        

        const attachmentsList = document.getElementById('viewAttachmentsList');
        attachmentsList.innerHTML = '';
        
        if (order.attachments && order.attachments.length > 0) {
            order.attachments.forEach(file => {
                const icon = getFileIcon(file.type);
                const attachmentItem = document.createElement('div');
                attachmentItem.className = 'attachment-item';
                attachmentItem.innerHTML = `
                    <i class="${icon}"></i>
                    <a href="#" onclick="return false;">${file.name}</a>
                `;
                attachmentsList.appendChild(attachmentItem);
            });
        } else {
            document.getElementById('viewAttachments').style.display = 'none';
        }
        

        const timeline = document.getElementById('orderTimeline');
        timeline.innerHTML = '';
        
        if (order.timeline && order.timeline.length > 0) {
            order.timeline.forEach(event => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                
                let iconClass = '';
                let actionText = '';
                
                switch(event.action) {
                    case 'created':
                        iconClass = 'fas fa-plus';
                        actionText = `<strong>${event.user}</strong> creó el ticket`;
                        break;
                    case 'assigned':
                        iconClass = 'fas fa-user-check';
                        actionText = `<strong>${event.user}</strong> asignó el ticket a <strong>${event.assignee}</strong>`;
                        break;
                    case 'status_change':
                        iconClass = 'fas fa-sync-alt';
                        actionText = `<strong>${event.user}</strong> cambió el estado de <strong>${getStatusName(event.from_status)}</strong> a <strong>${getStatusName(event.to_status)}</strong>`;
                        break;
                    case 'comment':
                        iconClass = 'fas fa-comment';
                        actionText = `<strong>${event.user}</strong> agregó un comentario`;
                        break;
                    case 'attachment':
                        iconClass = 'fas fa-paperclip';
                        actionText = `<strong>${event.user}</strong> adjuntó un archivo: ${event.file_name}`;
                        break;
                }
                
                timelineItem.innerHTML = `
                    <div class="timeline-icon bg-purple">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="timeline-content">
                        <p>${actionText}</p>
                        <span class="timeline-date">${formatDateTime(event.date)}</span>
                    </div>
                `;
                
                timeline.appendChild(timelineItem);
            });
        } else {
            timeline.innerHTML = '<p class="text-center text-muted">No hay eventos en el historial</p>';
        }
        

        const commentsContainer = document.getElementById('viewCommentsContainer');
        commentsContainer.innerHTML = '';
        
        if (order.comments && order.comments.length > 0) {
            order.comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <div class="comment-avatar">${comment.user.avatar}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">${comment.user.name}</span>
                            <span class="comment-date">${formatDateTime(comment.date)}</span>
                        </div>
                        <p class="comment-text">${comment.text}</p>
                    </div>
                `;
                commentsContainer.appendChild(commentElement);
            });
        } else {
            commentsContainer.innerHTML = '<p class="text-center text-muted">No hay comentarios</p>';
        }
        

        setupStatusActions(order);
        
        viewOrderModal.show();
    };
    
    function setupStatusActions(order) {
        const statusActions = document.getElementById('statusActions');
        statusActions.innerHTML = '';
        
        const currentStatus = order.status;
        

        const currentUserRole = 'Admin'; 
        
        if (currentUserRole === 'Admin') {
            switch (currentStatus) {
                case 'created':
                    addStatusButton(statusActions, order.id, 'assigned', 'Asignar', 'fas fa-user-check');
                    break;
                case 'assigned':

                    break;
                case 'in-progress':

                    break;
                case 'review':
                    addStatusButton(statusActions, order.id, 'approved', 'Aprobar', 'fas fa-check', 'success');
                    addStatusButton(statusActions, order.id, 'rejected', 'Rechazar', 'fas fa-times', 'danger');
                    break;
                case 'approved':
                    addStatusButton(statusActions, order.id, 'delivered', 'Marcar como Entregado', 'fas fa-paper-plane', 'info');
                    break;
            }
        } else if (currentUserRole === 'Creativo') {
            switch (currentStatus) {
                case 'assigned':
                    addStatusButton(statusActions, order.id, 'in-progress', 'Iniciar Trabajo', 'fas fa-play', 'info');
                    break;
                case 'in-progress':
                    addStatusButton(statusActions, order.id, 'review', 'Enviar a Revisión', 'fas fa-clipboard-check', 'warning');
                    break;
                case 'rejected':
                    addStatusButton(statusActions, order.id, 'in-progress', 'Reanudar Trabajo', 'fas fa-redo', 'info');
                    break;
            }
        }
    }
    
    function addStatusButton(container, orderId, newStatus, label, icon, btnClass = 'primary') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn-${btnClass}`;
        btn.innerHTML = `<i class="${icon}"></i> ${label}`;
        btn.addEventListener('click', () => updateOrderStatus(orderId, newStatus));
        container.appendChild(btn);
    }
    
    function updateOrderStatus(orderId, newStatus) {
        const orderIndex = mockOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        const oldStatus = mockOrders[orderIndex].status;
        mockOrders[orderIndex].status = newStatus;
        
 
        if (!mockOrders[orderIndex].timeline) {
            mockOrders[orderIndex].timeline = [];
        }
        
        mockOrders[orderIndex].timeline.push({
            date: new Date().toISOString(),
            action: 'status_change',
            user: 'Ana Martínez',
            from_status: oldStatus,
            to_status: newStatus
        });
        
        viewOrderModal.hide();
        renderOrders();
        showAlert(`Estado del ticket actualizado a "${getStatusName(newStatus)}"`, 'success');
    }
    
    function handleEditButtonClick() {
        const orderId = document.getElementById('viewOrderId').textContent;
        viewOrderModal.hide();
        

        setTimeout(() => {
            editOrder(orderId);
        }, 400);
    }
    
    function addComment() {
        const orderId = document.getElementById('orderId').value;
        const commentText = document.getElementById('newComment').value;
        
        if (!commentText.trim()) return;
        
        const orderIndex = mockOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        if (!mockOrders[orderIndex].comments) {
            mockOrders[orderIndex].comments = [];
        }
        

        const newComment = {
            id: Date.now(),
            user: { id: 1, name: 'Ana Martínez', avatar: 'AM' },
            date: new Date().toISOString(),
            text: commentText
        };
        
        mockOrders[orderIndex].comments.push(newComment);
        

        if (!mockOrders[orderIndex].timeline) {
            mockOrders[orderIndex].timeline = [];
        }
        
        mockOrders[orderIndex].timeline.push({
            date: new Date().toISOString(),
            action: 'comment',
            user: 'Ana Martínez' 
        });
        

        const commentsContainer = document.getElementById('commentsContainer');
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-avatar">${newComment.user.avatar}</div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${newComment.user.name}</span>
                    <span class="comment-date">${formatDateTime(newComment.date)}</span>
                </div>
                <p class="comment-text">${newComment.text}</p>
            </div>
        `;
        commentsContainer.appendChild(commentElement);
        

        document.getElementById('newComment').value = '';
        

        document.getElementById('commentsSection').style.display = 'block';
    }
    
    function addViewComment() {
        const orderId = document.getElementById('viewOrderId').textContent;
        const commentText = document.getElementById('viewNewComment').value;
        
        if (!commentText.trim()) return;
        
        const orderIndex = mockOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        if (!mockOrders[orderIndex].comments) {
            mockOrders[orderIndex].comments = [];
        }
        

        const newComment = {
            id: Date.now(),
            user: { id: 1, name: 'Ana Martínez', avatar: 'AM' }, 
            date: new Date().toISOString(),
            text: commentText
        };
        
        mockOrders[orderIndex].comments.push(newComment);
        

        if (!mockOrders[orderIndex].timeline) {
            mockOrders[orderIndex].timeline = [];
        }
        
        mockOrders[orderIndex].timeline.push({
            date: new Date().toISOString(),
            action: 'comment',
            user: 'Ana Martínez' 
        });
        

        const commentsContainer = document.getElementById('viewCommentsContainer');
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-avatar">${newComment.user.avatar}</div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${newComment.user.name}</span>
                    <span class="comment-date">${formatDateTime(newComment.date)}</span>
                </div>
                <p class="comment-text">${newComment.text}</p>
            </div>
        `;
        commentsContainer.appendChild(commentElement);
        

        document.getElementById('viewNewComment').value = '';
        
        showAlert('Comentario agregado', 'success');
    }
    
    function filterOrders() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        const typeValue = typeFilter.value;
        const dateFrom = dateFromFilter.value ? new Date(dateFromFilter.value) : null;
        const dateTo = dateToFilter.value ? new Date(dateToFilter.value) : null;
        
        const filtered = mockOrders.filter(order => {

            const matchesSearch = !searchTerm ||
                order.title.toLowerCase().includes(searchTerm) ||
                order.id.toLowerCase().includes(searchTerm) ||
                (order.assigned_to && order.assigned_to.name.toLowerCase().includes(searchTerm)) ||
                order.client.toLowerCase().includes(searchTerm);
            

            const matchesStatus = !statusValue || order.status === statusValue;
            

            const matchesType = !typeValue || order.type === typeValue;
            

            let matchesDate = true;
            const orderDate = new Date(order.deadline);
            
            if (dateFrom && dateTo) {
                matchesDate = orderDate >= dateFrom && orderDate <= dateTo;
            } else if (dateFrom) {
                matchesDate = orderDate >= dateFrom;
            } else if (dateTo) {
                matchesDate = orderDate <= dateTo;
            }
            
            return matchesSearch && matchesStatus && matchesType && matchesDate;
        });
        
        renderOrders(filtered);
    }
    
    function getFileIcon(fileType) {
        const iconMap = {
            'pdf': 'far fa-file-pdf',
            'doc': 'far fa-file-word',
            'docx': 'far fa-file-word',
            'xls': 'far fa-file-excel',
            'xlsx': 'far fa-file-excel',
            'ppt': 'far fa-file-powerpoint',
            'pptx': 'far fa-file-powerpoint',
            'jpg': 'far fa-file-image',
            'jpeg': 'far fa-file-image',
            'png': 'far fa-file-image',
            'gif': 'far fa-file-image',
            'zip': 'far fa-file-archive',
            'rar': 'far fa-file-archive',
            'ai': 'far fa-file-image',
            'psd': 'far fa-file-image',
            'txt': 'far fa-file-alt',
            'mp4': 'far fa-file-video',
            'mp3': 'far fa-file-audio'
        };
        
        return iconMap[fileType] || 'far fa-file';
    }
    
    function formatDateTime(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function confirmDeleteOrder() {
        const orderId = document.getElementById('deleteOrderId').textContent;
        mockOrders = mockOrders.filter(order => order.id !== orderId);
        
        deleteConfirmModal.hide();
        renderOrders();
        showAlert('Ticket eliminado con éxito', 'success');
    }
    

    window.viewOrderDetails = function(orderId) {
        viewOrderDetails(orderId);
    };
    
    window.editOrder = function(orderId) {
        showOrderModal(orderId);
    };
    
    window.deleteOrder = function(orderId) {
        document.getElementById('deleteOrderId').textContent = orderId;
        deleteConfirmModal.show();
    };
});