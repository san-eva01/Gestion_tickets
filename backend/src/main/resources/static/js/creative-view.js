document.addEventListener('DOMContentLoaded', function() {
    const mockTasks = {
        'TKT-2023-42': {
            id: 'TKT-2023-42',
            title: 'Campaña Verano 2023',
            type: 'design',
            client: 'Playa Resort',
            status: 'assigned',
            created_date: '2023-06-15',
            deadline: '2023-06-22',
            priority: 'high',
            description: 'Diseño de materiales promocionales para la campaña de verano 2023, incluyendo banners, posts para redes sociales y folletos digitales.',
            progress: 0,
            created_by: 'Ana Martínez',
            attachments: [
                { name: 'brief_campaña.pdf', type: 'pdf' },
                { name: 'logos_cliente.zip', type: 'zip' }
            ],
            comments: [
                { user: 'Ana Martínez', avatar: 'AM', date: '2023-06-15T13:45:00', text: 'Por favor prioriza los banners digitales para redes sociales.' }
            ],
            timeline: [
                { date: '2023-06-15T10:00:00', action: 'created', user: 'Ana Martínez' },
                { date: '2023-06-15T10:05:00', action: 'assigned', user: 'Ana Martínez', assignee: 'Carlos Ruiz' }
            ]
        },
        'TKT-2023-43': {
            id: 'TKT-2023-43',
            title: 'Brochure Digital',
            type: 'design',
            client: 'Industrias ABC',
            status: 'assigned',
            created_date: '2023-06-16',
            deadline: '2023-06-30',
            priority: 'medium',
            description: 'Diseño de brochure digital de 8 páginas presentando los nuevos productos de la compañía con enfoque en la sostenibilidad.',
            progress: 0,
            created_by: 'Ana Martínez',
            attachments: [
                { name: 'productos_fotos.zip', type: 'zip' },
                { name: 'textos_brochure.docx', type: 'doc' }
            ],
            comments: [],
            timeline: [
                { date: '2023-06-16T11:00:00', action: 'created', user: 'Ana Martínez' },
                { date: '2023-06-16T11:15:00', action: 'assigned', user: 'Ana Martínez', assignee: 'Carlos Ruiz' }
            ]
        },
        'TKT-2023-37': {
            id: 'TKT-2023-37',
            title: 'Logo para Startup',
            type: 'design',
            client: 'TechStart',
            status: 'in-progress',
            created_date: '2023-06-10',
            deadline: '2023-06-21',
            priority: 'high',
            description: 'Diseño de logo y manual básico de identidad para startup de tecnología. El cliente busca un diseño moderno, minimalista y que transmita innovación.',
            progress: 75,
            created_by: 'Ana Martínez',
            attachments: [
                { name: 'brief_logo.pdf', type: 'pdf' },
                { name: 'referencias_visuales.zip', type: 'zip' }
            ],
            comments: [
                { user: 'Ana Martínez', avatar: 'AM', date: '2023-06-10T14:30:00', text: 'El cliente ha especificado que quiere usar colores azul y verde en su logo.' },
                { user: 'Carlos Ruiz', avatar: 'CR', date: '2023-06-14T09:45:00', text: 'He subido tres propuestas iniciales. Por favor revisa y comenta cual prefieres para desarrollar más a fondo.' },
                { user: 'Ana Martínez', avatar: 'AM', date: '2023-06-14T15:20:00', text: 'Me gusta la propuesta #2. Procede con esa dirección y desarrolla las aplicaciones básicas.' }
            ],
            timeline: [
                { date: '2023-06-10T10:00:00', action: 'created', user: 'Ana Martínez' },
                { date: '2023-06-10T10:30:00', action: 'assigned', user: 'Ana Martínez', assignee: 'Carlos Ruiz' },
                { date: '2023-06-12T08:45:00', action: 'status_change', user: 'Carlos Ruiz', from_status: 'assigned', to_status: 'in-progress' },
                { date: '2023-06-14T09:45:00', action: 'deliverable_upload', user: 'Carlos Ruiz', files: 'propuestas_iniciales.pdf' },
                { date: '2023-06-14T16:00:00', action: 'progress_update', user: 'Carlos Ruiz', progress: '60%' },
                { date: '2023-06-17T10:30:00', action: 'progress_update', user: 'Carlos Ruiz', progress: '75%' }
            ],
            deliverables: [
                { name: 'propuestas_iniciales.pdf', type: 'pdf', date: '2023-06-14T09:45:00' }
            ]
        },
        'TKT-2023-36': {
            id: 'TKT-2023-36',
            title: 'Plantillas para Redes',
            type: 'design',
            client: 'Nutrición Esencial',
            status: 'in-progress',
            created_date: '2023-06-09',
            deadline: '2023-06-27',
            priority: 'medium',
            description: 'Diseño de conjunto de 10 plantillas para publicaciones en Instagram y Facebook, con enfoque en contenido educativo sobre nutrición y bienestar.',
            progress: 40,
            created_by: 'Ana Martínez',
            attachments: [
                { name: 'guia_estilo.pdf', type: 'pdf' }
            ],
            comments: [
                { user: 'Ana Martínez', avatar: 'AM', date: '2023-06-09T11:20:00', text: 'Por favor asegúrate de seguir la guía de estilo adjunta. Los colores principales son verde #2E7D32 y naranja #FB8C00.' },
                { user: 'Carlos Ruiz', avatar: 'CR', date: '2023-06-15T16:30:00', text: 'He desarrollado 4 plantillas hasta ahora. ¿Quieres revisarlas antes de continuar con las demás?' }
            ],
            timeline: [
                { date: '2023-06-09T11:00:00', action: 'created', user: 'Ana Martínez' },
                { date: '2023-06-09T11:10:00', action: 'assigned', user: 'Ana Martínez', assignee: 'Carlos Ruiz' },
                { date: '2023-06-13T09:15:00', action: 'status_change', user: 'Carlos Ruiz', from_status: 'assigned', to_status: 'in-progress' },
                { date: '2023-06-15T16:30:00', action: 'progress_update', user: 'Carlos Ruiz', progress: '40%' }
            ]
        },
        'TKT-2023-35': {
            id: 'TKT-2023-35',
            title: 'Iconos para App',
            type: 'design',
            client: 'MobileDev',
            status: 'in-progress',
            created_date: '2023-06-08',
            deadline: '2023-06-29',
            priority: 'low',
            description: 'Diseño de set de 20 iconos para aplicación móvil de fitness. Estilo minimalista, line art, con opción de versión sólida.',
            progress: 20,
            created_by: 'Ana Martínez',
            attachments: [
                { name: 'especificaciones_iconos.pdf', type: 'pdf' }
            ],
            comments: [
                { user: 'Ana Martínez', avatar: 'AM', date: '2023-06-08T15:00:00', text: 'El cliente necesita los iconos en formato SVG y PNG con fondo transparente.' }
            ],
            timeline: [
                { date: '2023-06-08T14:30:00', action: 'created', user: 'Ana Martínez' },
                { date: '2023-06-08T14:45:00', action: 'assigned', user: 'Ana Martínez', assignee: 'Carlos Ruiz' },
                { date: '2023-06-14T08:30:00', action: 'status_change', user: 'Carlos Ruiz', from_status: 'assigned', to_status: 'in-progress' },
                { date: '2023-06-16T11:45:00', action: 'progress_update', user: 'Carlos Ruiz', progress: '20%' }
            ]
        },
        'TKT-2023-34': {
            id: 'TKT-2023-34',
            title: 'Diseño Vallas Publicitarias',
            type: 'design',
            client: 'Centro Comercial Plaza',
            status: 'delivered',
            created_date: '2023-05-25',
            deadline: '2023-06-10',
            priority: 'medium',
            description: 'Diseño de 3 vallas publicitarias para promocionar el aniversario del centro comercial. Medidas: 10x4 metros.',
            progress: 100,
            created_by: 'Ana Martínez',
            attachments: [
                { name: 'brief_vallas.pdf', type: 'pdf' },
                { name: 'fotos_centro_comercial.zip', type: 'zip' }
            ],
            comments: [
                { user: 'Ana Martínez', avatar: 'AM', date: '2023-05-25T09:30:00', text: 'Por favor incluye el slogan "15 años contigo" en lugar destacado.' },
                { user: 'Carlos Ruiz', avatar: 'CR', date: '2023-06-08T14:20:00', text: 'He subido los diseños finales en el formato solicitado para impresión.' },
                { user: 'Ana Martínez', avatar: 'AM', date: '2023-06-09T11:30:00', text: 'Diseños aprobados. Excelente trabajo, Carlos. El cliente está muy satisfecho.' }
            ],
            timeline: [
                { date: '2023-05-25T09:00:00', action: 'created', user: 'Ana Martínez' },
                { date: '2023-05-25T09:15:00', action: 'assigned', user: 'Ana Martínez', assignee: 'Carlos Ruiz' },
                { date: '2023-05-26T08:30:00', action: 'status_change', user: 'Carlos Ruiz', from_status: 'assigned', to_status: 'in-progress' },
                { date: '2023-06-08T14:20:00', action: 'status_change', user: 'Carlos Ruiz', from_status: 'in-progress', to_status: 'review' },
                { date: '2023-06-09T11:30:00', action: 'status_change', user: 'Ana Martínez', from_status: 'review', to_status: 'approved' },
                { date: '2023-06-10T09:00:00', action: 'status_change', user: 'Ana Martínez', from_status: 'approved', to_status: 'delivered' }
            ],
            deliverables: [
                { name: 'vallas_final.pdf', type: 'pdf', date: '2023-06-08T14:20:00' },
                { name: 'vallas_sources.ai', type: 'ai', date: '2023-06-08T14:20:00' }
            ],
            feedback: 'Diseños aprobados sin cambios. El cliente está muy satisfecho con el resultado.'
        },
        'TKT-2023-30': {
            id: 'TKT-2023-30',
            title: 'Rediseño Identidad Corporativa',
            type: 'design',
            client: 'Restaurante Sabores',
            status: 'delivered',
            created_date: '2023-05-10',
            deadline: '2023-06-05',
            priority: 'high',
            description: 'Rediseño completo de la identidad corporativa del restaurante, incluyendo logo, papelería y aplicaciones básicas.',
            progress: 100,
            created_by: 'Ana Martínez',
            attachments: [
                { name: 'brief_identidad.pdf', type: 'pdf' },
                { name: 'logo_anterior.ai', type: 'ai' }
            ],
            comments: [
                { user: 'Ana Martínez', avatar: 'AM', date: '2023-05-10T10:30:00', text: 'El cliente quiere mantener los colores cálidos pero modernizar su imagen.' },
                { user: 'Carlos Ruiz', avatar: 'CR', date: '2023-05-22T15:45:00', text: 'He subido 3 propuestas de logo para revisión inicial.' },
                { user: 'Ana Martínez', avatar: 'AM', date: '2023-05-23T09:30:00', text: 'El cliente prefiere la propuesta #1 con algunos ajustes menores en la tipografía.' },
                { user: 'Carlos Ruiz', avatar: 'CR', date: '2023-06-01T16:20:00', text: 'He finalizado todos los elementos del manual de identidad y aplicaciones.' },
                { user: 'Ana Martínez', avatar: 'AM', date: '2023-06-02T11:00:00', text: 'Trabajo sobresaliente, Carlos. El cliente está encantado con el resultado final.' }
            ],
            timeline: [
                { date: '2023-05-10T10:00:00', action: 'created', user: 'Ana Martínez' },
                { date: '2023-05-10T10:15:00', action: 'assigned', user: 'Ana Martínez', assignee: 'Carlos Ruiz' },
                { date: '2023-05-11T08:30:00', action: 'status_change', user: 'Carlos Ruiz', from_status: 'assigned', to_status: 'in-progress' },
                { date: '2023-05-22T15:45:00', action: 'deliverable_upload', user: 'Carlos Ruiz', files: 'propuestas_logo.pdf' },
                { date: '2023-06-01T16:20:00', action: 'status_change', user: 'Carlos Ruiz', from_status: 'in-progress', to_status: 'review' },
                { date: '2023-06-02T11:00:00', action: 'status_change', user: 'Ana Martínez', from_status: 'review', to_status: 'approved' },
                { date: '2023-06-05T09:30:00', action: 'status_change', user: 'Ana Martínez', from_status: 'approved', to_status: 'delivered' }
            ],
            deliverables: [
                { name: 'propuestas_logo.pdf', type: 'pdf', date: '2023-05-22T15:45:00' },
                { name: 'identidad_final.pdf', type: 'pdf', date: '2023-06-01T16:20:00' },
                { name: 'manual_identidad.pdf', type: 'pdf', date: '2023-06-01T16:20:00' },
                { name: 'archivos_fuente.zip', type: 'zip', date: '2023-06-01T16:20:00' }
            ],
            feedback: 'El cliente está extremadamente satisfecho con el trabajo. Han destacado la profesionalidad y la atención al detalle.'
        }
    };


    function renderAllTickets() {

        document.getElementById('pending-tasks-container').innerHTML = '';
        document.getElementById('in-progress-tasks-container').innerHTML = '';
        document.getElementById('completed-tasks-container').innerHTML = '';
        
  
        Object.values(mockTasks).forEach(task => {
            const card = createTaskCard(task);
            
            if (task.status === 'assigned') {
                document.getElementById('pending-tasks-container').appendChild(card);
            } else if (task.status === 'in-progress') {
                document.getElementById('in-progress-tasks-container').appendChild(card);
            } else if (task.status === 'delivered') {
                document.getElementById('completed-tasks-container').appendChild(card);
            }
        });
        

        updateCounters();
    }

   
    function createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'order-card';
        
    
        let actionButtons = '';
        if (task.status === 'assigned') {
            actionButtons = `
                <button class="btn-primary" onclick="startTask('${task.id}')">
                    <i class="fas fa-play"></i> Iniciar
                </button>
            `;
        } else if (task.status === 'in-progress') {
            actionButtons = `
                <button class="btn-info" onclick="viewTask('${task.id}')">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <button class="btn-warning" onclick="submitForReview('${task.id}')">
                    <i class="fas fa-clipboard-check"></i> Entregar
                </button>
            `;
        } else if (task.status === 'delivered') {
            actionButtons = `
                <button class="btn-info" onclick="viewTask('${task.id}')">
                    <i class="fas fa-eye"></i> Ver
                </button>
            `;
        }
        
        card.innerHTML = `
            <div class="order-card-header">
                <h3 class="order-card-title">${task.title}</h3>
                <div class="order-card-meta">
                    <span class="type-badge ${task.type}">${getTypeName(task.type)}</span>
                    <span class="status-badge ${task.status}">${getStatusName(task.status)}</span>
                    <span class="priority-badge ${task.priority}">${getPriorityName(task.priority)}</span>
                </div>
            </div>
            <div class="order-card-body">
                <div class="order-info-item">
                    <span class="order-info-label">Cliente:</span>
                    <span class="order-info-value">${task.client}</span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Fecha Entrega:</span>
                    <span class="order-info-value">${formatDate(task.deadline)}</span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Tiempo Restante:</span>
                    <span class="order-info-value ${getDaysRemaining(task.deadline) <= 3 ? 'text-danger' : ''}">
                        ${getDaysRemaining(task.deadline)} días
                    </span>
                </div>
                ${task.status === 'in-progress' ? `
                <div class="order-info-item">
                    <span class="order-info-label">Progreso:</span>
                    <div class="progress" style="height: 10px; margin-top: 5px;">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${task.progress}%;" 
                             aria-valuenow="${task.progress}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
                ` : ''}
                <div class="order-description mt-2">
                    <p>${task.description}</p>
                </div>
            </div>
            <div class="order-card-footer">
                <span class="order-id">#${task.id}</span>
                <div class="action-buttons">
                    ${actionButtons}
                </div>
            </div>
        `;
        
        return card;
    }

    function getDaysRemaining(deadline) {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        
   
        if (isNaN(deadlineDate.getTime())) return "Fecha inválida";
        
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        

        return diffDays < 0 ? 0 : diffDays;
    }


    function updateCounters() {
        let assigned = 0;
        let inProgress = 0;
        let completed = 0;
        let dueSoon = 0;
        
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        Object.values(mockTasks).forEach(task => {
            const deadline = new Date(task.deadline);
            
            if (task.status === 'assigned') assigned++;
            if (task.status === 'in-progress') inProgress++;
            if (task.status === 'delivered') completed++;
            
            if (deadline < nextWeek && deadline > today && 
               (task.status === 'assigned' || task.status === 'in-progress')) {
                dueSoon++;
            }
        });
        
        document.getElementById('assigned-count').textContent = assigned;
        document.getElementById('in-progress-count').textContent = inProgress;
        document.getElementById('completed-count').textContent = completed;
        document.getElementById('due-count').textContent = dueSoon;
    }

    
    window.startTask = function(taskId) {
        const task = mockTasks[taskId];
        if (task) {
            task.status = 'in-progress';
            task.progress = 5;
            task.timeline.push({
                date: new Date().toISOString(),
                action: 'status_change',
                user: 'Carlos Ruiz',
                from_status: 'assigned',
                to_status: 'in-progress'
            });
            
            task.timeline.push({
                date: new Date().toISOString(),
                action: 'progress_update',
                user: 'Carlos Ruiz',
                progress: '5%'
            });
            
            showAlert(`Ticket "${task.title}" iniciado`, 'success');
            renderAllTickets(); 
        }
    };


    window.submitForReview = function(taskId) {
        const task = mockTasks[taskId];
        if (!task) return;
    
 
        if (taskModalInstance) {
            taskModalInstance.hide();
        }
    

        viewTask(taskId);
    

        setTimeout(() => {
            const modalElement = document.getElementById('viewTaskModal');
            if (!modalElement || !taskModalInstance) return;
    
         
            const modalTitle = modalElement.querySelector('.modal-title');
            if (modalTitle) modalTitle.textContent = `Entregar Ticket #${task.id}`;
    
         
            const deliverableSection = modalElement.querySelector('#deliverableSection');
            if (deliverableSection) {
                deliverableSection.style.display = 'block';
                deliverableSection.scrollIntoView({behavior: 'smooth'});
            }
    
         
            const taskActions = modalElement.querySelector('#taskActions');
            if (taskActions) {
                taskActions.innerHTML = '';
                
         
                const confirmBtn = document.createElement('button');
                confirmBtn.className = 'btn-success';
                confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirmar Entrega';
                confirmBtn.addEventListener('click', () => handleDeliveryConfirmation(task));
                
            
                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'btn-secondary ms-2';
                cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
                cancelBtn.addEventListener('click', () => taskModalInstance.hide());
                
                taskActions.append(confirmBtn, cancelBtn);
            }
        }, 50);
    };
    
    function handleDeliveryConfirmation(task) {
        const modalElement = document.getElementById('viewTaskModal');
        const deliverablesList = modalElement.querySelector('#deliverablesList');
        

        if (deliverablesList.children.length === 0 && (!task.deliverables || task.deliverables.length === 0)) {
            showAlert('Debes subir al menos un entregable', 'warning');
            return;
        }
    
     
        task.status = 'delivered';
        task.progress = 100;
        task.timeline.push({
            date: new Date().toISOString(),
            action: 'status_change',
            user: 'Carlos Ruiz',
            from_status: 'in-progress',
            to_status: 'delivered'
        });
    
   
        taskModalInstance.hide();
        showAlert(`Ticket "${task.title}" entregado`, 'success');
        renderAllTickets();
    }



let taskModalInstance = null;

window.viewTask = function(taskId) {

    if (!taskId) {
        console.error('No se proporcionó un ID de tarea válido');
        return;
    }

    const task = mockTasks[taskId];
    if (!task) {
        console.error(`No se encontró la tarea con ID: ${taskId}`);
        showAlert('No se pudo cargar la tarea solicitada', 'danger');
        return;
    }


    const modalElement = document.getElementById('viewTaskModal');
    if (!modalElement) {
        console.error('No se encontró el elemento del modal');
        return;
    }

 
    const closeModalHandler = () => {
        if (taskModalInstance) {
            taskModalInstance.hide();
        }
    };

    const hiddenModalHandler = () => {
        resetModalState();
    };

    const resetModalState = () => {
      
        const elementsToReset = [
            'viewTaskId', 'viewTaskTitle', 'viewTaskType', 
            'viewTaskStatus', 'viewTaskPriority', 'viewTaskClient',
            'viewCreatedBy', 'viewCreatedDate', 'viewDeadline',
            'viewDescription', 'progressPercentage'
        ];

        elementsToReset.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = '';
        });

       
        const classElements = [
            { id: 'viewTaskType', className: 'type-badge' },
            { id: 'viewTaskStatus', className: 'status-badge' },
            { id: 'viewTaskPriority', className: 'priority-badge' }
        ];

        classElements.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) element.className = item.className;
        });

      
        const listsToClear = [
            'viewAttachmentsList', 'deliverablesList',
            'taskTimeline', 'viewCommentsContainer'
        ];

        listsToClear.forEach(id => {
            const list = document.getElementById(id);
            if (list) list.innerHTML = '';
        });
    };

    
    if (taskModalInstance) {
        try {
            const closeButton = modalElement.querySelector('.btn-close');
            if (closeButton) {
                closeButton.removeEventListener('click', closeModalHandler);
            }
            modalElement.removeEventListener('hidden.bs.modal', hiddenModalHandler);
            taskModalInstance.dispose();
        } catch (e) {
            console.warn('Error al limpiar la instancia anterior del modal:', e);
        }
    }

   
    try {
        taskModalInstance = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
        });
    } catch (e) {
        console.error('Error al crear la instancia del modal:', e);
        return;
    }

    
    const closeButton = modalElement.querySelector('.btn-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModalHandler);
    }
    modalElement.addEventListener('hidden.bs.modal', hiddenModalHandler, { once: true });

    
    const setContentSafe = (elementId, content, isAttribute = false, attrName = 'textContent') => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Elemento con ID ${elementId} no encontrado`);
            return;
        }

        try {
            if (isAttribute) {
                element.setAttribute(attrName, content);
            } else {
                element[attrName] = content;
            }
        } catch (e) {
            console.error(`Error al establecer contenido para ${elementId}:`, e);
        }
    };

    
    setContentSafe('viewTaskId', task.id);
    setContentSafe('viewTaskTitle', task.title);
    setContentSafe('viewTaskType', getTypeName(task.type));
    setContentSafe('viewTaskStatus', getStatusName(task.status));
    setContentSafe('viewTaskPriority', getPriorityName(task.priority));
    setContentSafe('viewTaskClient', task.client);
    setContentSafe('viewCreatedBy', task.created_by);
    setContentSafe('viewCreatedDate', formatDate(task.created_date));
    setContentSafe('viewDeadline', formatDate(task.deadline));
    setContentSafe('viewDescription', task.description);

    
    const setClassSafe = (elementId, ...classNames) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.className = '';
            classNames.forEach(className => {
                if (className) element.classList.add(className);
            });
        }
    };

    setClassSafe('viewTaskType', 'type-badge', task.type);
    setClassSafe('viewTaskStatus', 'status-badge', task.status);
    setClassSafe('viewTaskPriority', 'priority-badge', task.priority);

    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${task.progress}%`;
        progressBar.setAttribute('aria-valuenow', task.progress);
    }
    setContentSafe('progressPercentage', `${task.progress}%`);

    const newProgressSlider = document.getElementById('newProgress');
    if (newProgressSlider) {
        newProgressSlider.value = task.progress;
    }

    
    const updateProgressGroup = document.getElementById('updateProgressGroup');
    if (updateProgressGroup) {
        updateProgressGroup.style.display = task.status === 'in-progress' ? 'block' : 'none';
    }

    
    const attachmentsList = document.getElementById('viewAttachmentsList');
    if (attachmentsList) {
        attachmentsList.innerHTML = '';

        if (task.attachments?.length > 0) {
            task.attachments.forEach(file => {
                const icon = getFileIcon(file.type);
                const attachmentItem = document.createElement('div');
                attachmentItem.className = 'attachment-item';
                attachmentItem.innerHTML = `
                    <i class="${icon}"></i>
                    <a href="#" onclick="downloadFile('${file.name}'); return false;">${file.name}</a>
                `;
                attachmentsList.appendChild(attachmentItem);
            });
        }
    }

   
    const attachmentsSection = document.getElementById('viewAttachments');
    if (attachmentsSection) {
        attachmentsSection.style.display = task.attachments?.length > 0 ? 'block' : 'none';
    }

    
    const deliverableSection = document.getElementById('deliverableSection');
    if (deliverableSection) {
        deliverableSection.style.display = task.status === 'in-progress' ? 'block' : 'none';
    }

    const deliverablesList = document.getElementById('deliverablesList');
    if (deliverablesList) {
        deliverablesList.innerHTML = '';

        if (task.deliverables?.length > 0) {
            task.deliverables.forEach(file => {
                const icon = getFileIcon(file.type);
                const deliverableItem = document.createElement('div');
                deliverableItem.className = 'file-item';
                deliverableItem.innerHTML = `
                    <span><i class="${icon} me-2"></i>${file.name}</span>
                    <i class="fas fa-download" onclick="downloadFile('${file.name}')"></i>
                `;
                deliverablesList.appendChild(deliverableItem);
            });
        }
    }

    
    const timeline = document.getElementById('taskTimeline');
    if (timeline) {
        timeline.innerHTML = '';

        if (task.timeline?.length > 0) {
            task.timeline.forEach(event => {
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
                    case 'deliverable_upload':
                        iconClass = 'fas fa-cloud-upload-alt';
                        actionText = `<strong>${event.user}</strong> subió el archivo: ${event.files}`;
                        break;
                    case 'progress_update':
                        iconClass = 'fas fa-tasks';
                        actionText = `<strong>${event.user}</strong> actualizó el progreso a ${event.progress}`;
                        break;
                }
                
                timelineItem.innerHTML = `
                    <div class="timeline-icon bg-primary">
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
    }

    
    const commentsContainer = document.getElementById('viewCommentsContainer');
    if (commentsContainer) {
        commentsContainer.innerHTML = '';

        if (task.comments?.length > 0) {
            task.comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <div class="comment-avatar">${comment.avatar}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">${comment.user}</span>
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
    }

    
    setupTaskActions(task);

    try {
        taskModalInstance.show();
    } catch (e) {
        console.error('Error al mostrar el modal:', e);
        showAlert('Error al abrir la vista de tarea', 'danger');
    }
};

    function setupTaskActions(task) {
        const taskActions = document.getElementById('taskActions');
        taskActions.innerHTML = '';
    
        switch (task.status) {
            case 'assigned':
                const startBtn = document.createElement('button');
                startBtn.className = 'btn-primary';
                startBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar Ticket';
                startBtn.addEventListener('click', () => startTask(task.id));
                taskActions.appendChild(startBtn);
                break;
                
            case 'in-progress':
                const reviewBtn = document.createElement('button');
                reviewBtn.className = 'btn-warning';
                reviewBtn.innerHTML = '<i class="fas fa-clipboard-check"></i> Enviar a Revisión';
                reviewBtn.addEventListener('click', () => {
                    if (!task.deliverables || task.deliverables.length === 0) {
                        const fileInput = document.getElementById('taskDeliverables');
                        if (fileInput.files.length === 0) {
                            showAlert('Debes subir al menos un entregable antes de enviar a revisión', 'warning');
                            return;
                        }
   
                    }
                    submitForReview(task.id);
                });
                taskActions.appendChild(reviewBtn);
                break;
                
            case 'delivered':
                const badge = document.createElement('span');
                badge.className = 'status-badge delivered';
                badge.textContent = 'Entregado';
                taskActions.appendChild(badge);
                break;
        }
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

    function addComment() {
        const taskId = document.getElementById('viewTaskId').textContent;
        const commentText = document.getElementById('newTaskComment').value;
        
        if (!commentText.trim()) return;
        
        const task = mockTasks[taskId];
        if (!task) return;
        
        if (!task.comments) {
            task.comments = [];
        }
        
   
        const newComment = {
            user: 'Carlos Ruiz',
            avatar: 'CR',
            date: new Date().toISOString(),
            text: commentText
        };
        
        task.comments.push(newComment);
        

        if (!task.timeline) {
            task.timeline = [];
        }
        
        task.timeline.push({
            date: new Date().toISOString(),
            action: 'comment',
            user: 'Carlos Ruiz'
        });
        
      
        const commentsContainer = document.getElementById('viewCommentsContainer');
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-avatar">${newComment.avatar}</div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${newComment.user}</span>
                    <span class="comment-date">${formatDateTime(newComment.date)}</span>
                </div>
                <p class="comment-text">${newComment.text}</p>
            </div>
        `;
        commentsContainer.appendChild(commentElement);
        
   
        document.getElementById('newTaskComment').value = '';
        
        showAlert('Comentario agregado', 'success');
    }
    
    function updateProgress() {
        const taskId = document.getElementById('viewTaskId').textContent;
        const newProgress = parseInt(document.getElementById('newProgress').value);
        
        const task = mockTasks[taskId];
        if (!task) return;
        
  
        task.progress = newProgress;
        

        if (!task.timeline) {
            task.timeline = [];
        }
        
        task.timeline.push({
            date: new Date().toISOString(),
            action: 'progress_update',
            user: 'Carlos Ruiz',
            progress: `${newProgress}%`
        });
        
 
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        
        progressBar.style.width = `${newProgress}%`;
        progressBar.setAttribute('aria-valuenow', newProgress);
        progressPercentage.textContent = `${newProgress}%`;
        
        showAlert(`Progreso actualizado a ${newProgress}%`, 'success');
    }
    
    function setupDeliverableUpload() {
        const taskDeliverables = document.getElementById('taskDeliverables');
        const deliverablesList = document.getElementById('deliverablesList');
        
        if (!taskDeliverables || !deliverablesList) return;
        
        taskDeliverables.addEventListener('change', function() {
            deliverablesList.innerHTML = '';
            
            if (this.files.length > 0) {
                for (const file of this.files) {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    fileItem.innerHTML = `
                        <span><i class="${getFileIcon(file.name.split('.').pop())} me-2"></i>${file.name}</span>
                        <i class="fas fa-times remove-file"></i>
                    `;
                    deliverablesList.appendChild(fileItem);
                }
                

                document.querySelectorAll('.remove-file').forEach(btn => {
                    btn.addEventListener('click', function() {
                        this.closest('.file-item').remove();
                    });
                });
            }
        });
    }
    
    window.downloadFile = function(fileName) {
        showAlert(`Descargando archivo: ${fileName}`, 'info');
        return false;
    };

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
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }


    renderAllTickets();
    document.getElementById('addTaskComment').addEventListener('click', addComment);
    document.getElementById('updateProgressBtn').addEventListener('click', updateProgress);
    setupDeliverableUpload();
});


