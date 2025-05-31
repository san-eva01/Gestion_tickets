document.addEventListener('DOMContentLoaded', function() {

    const deliverableTableBody = document.getElementById('deliverableTableBody');
    const searchInput = document.querySelector('.search-input');
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    

    const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
    

    let mockDeliverables = [
        {
            id: 'DEL-2023-01',
            order_id: 'TKT-2023-37',
            title: 'Logo para Startup - Propuestas Iniciales',
            type: 'design',
            creative: {
                id: 2,
                name: 'Carlos Ruiz',
                avatar: 'CR'
            },
            status: 'pending',
            submitted_date: '2023-06-14',
            client: 'TechStart',
            files: [
                { name: 'propuestas_iniciales.pdf', type: 'pdf' }
            ],
            comments: [
                {
                    id: 1,
                    user: { id: 2, name: 'Carlos Ruiz', avatar: 'CR' },
                    date: '2023-06-14T09:45:00',
                    text: 'Adjunto tres propuestas iniciales para el logo. Espero sus comentarios para proceder con el desarrollo.'
                }
            ]
        },
        {
            id: 'DEL-2023-02',
            order_id: 'TKT-2023-41',
            title: 'Rediseño Sitio Web - Maquetas',
            type: 'web',
            creative: {
                id: 3,
                name: 'María López',
                avatar: 'ML'
            },
            status: 'pending',
            submitted_date: '2023-06-17',
            client: 'Tecnología Avanzada',
            files: [
                { name: 'maquetas_web.pdf', type: 'pdf' },
                { name: 'prototipos.zip', type: 'zip' }
            ],
            comments: [
                {
                    id: 2,
                    user: { id: 3, name: 'María López', avatar: 'ML' },
                    date: '2023-06-17T15:20:00',
                    text: 'He finalizado las maquetas y prototipos navegables. Por favor revisar y aprobar para proceder con el desarrollo.'
                }
            ]
        },
        {
            id: 'DEL-2023-03',
            order_id: 'TKT-2023-40',
            title: 'Video Corporativo - Versión Final',
            type: 'video',
            creative: {
                id: 4,
                name: 'Alberto Sánchez',
                avatar: 'AS'
            },
            status: 'approved',
            submitted_date: '2023-06-14',
            reviewed_date: '2023-06-15',
            client: 'Constructora Edificar',
            files: [
                { name: 'video_corporativo_final.mp4', type: 'mp4' }
            ],
            comments: [
                {
                    id: 3,
                    user: { id: 4, name: 'Alberto Sánchez', avatar: 'AS' },
                    date: '2023-06-14T16:00:00',
                    text: 'Adjunto la versión final del video corporativo con todas las correcciones solicitadas.'
                },
                {
                    id: 4,
                    user: { id: 1, name: 'Ana Martínez', avatar: 'AM' },
                    date: '2023-06-15T10:30:00',
                    text: 'Video aprobado. Excelente trabajo, Alberto. El cliente está muy satisfecho con el resultado.'
                }
            ],
            feedback: 'Excelente trabajo. El cliente está muy satisfecho con la calidad y el mensaje del video.'
        },
        {
            id: 'DEL-2023-04',
            order_id: 'TKT-2023-39',
            title: 'Copy para Newsletter - Versión Final',
            type: 'copy',
            creative: {
                id: 5,
                name: 'Laura Gómez',
                avatar: 'LG'
            },
            status: 'approved',
            submitted_date: '2023-06-13',
            reviewed_date: '2023-06-13',
            client: 'Moda Express',
            files: [
                { name: 'copy_newsletter_junio.docx', type: 'doc' }
            ],
            comments: [
                {
                    id: 5,
                    user: { id: 5, name: 'Laura Gómez', avatar: 'LG' },
                    date: '2023-06-13T11:20:00',
                    text: 'Adjunto la versión final del copy para la newsletter de junio. He incluido un CTA adicional para la promoción de temporada.'
                },
                {
                    id: 6,
                    user: { id: 1, name: 'Ana Martínez', avatar: 'AM' },
                    date: '2023-06-13T16:00:00',
                    text: 'Copy aprobado. Muy buen trabajo con los llamados a la acción.'
                }
            ],
            feedback: 'Muy buen trabajo. El copy es claro, persuasivo y mantiene el tono de la marca.'
        },
        {
            id: 'DEL-2023-05',
            order_id: 'TKT-2023-34',
            title: 'Diseño Vallas Publicitarias - Versión Final',
            type: 'design',
            creative: {
                id: 2,
                name: 'Carlos Ruiz',
                avatar: 'CR'
            },
            status: 'approved',
            submitted_date: '2023-06-08',
            reviewed_date: '2023-06-09',
            client: 'Centro Comercial Plaza',
            files: [
                { name: 'vallas_final.pdf', type: 'pdf' },
                { name: 'vallas_sources.ai', type: 'ai' }
            ],
            comments: [
                {
                    id: 7,
                    user: { id: 2, name: 'Carlos Ruiz', avatar: 'CR' },
                    date: '2023-06-08T14:20:00',
                    text: 'Adjunto los diseños finales de las vallas en el formato solicitado para impresión.'
                },
                {
                    id: 8,
                    user: { id: 1, name: 'Ana Martínez', avatar: 'AM' },
                    date: '2023-06-09T11:30:00',
                    text: 'Diseños aprobados. Excelente trabajo, Carlos. El cliente está muy satisfecho.'
                }
            ],
            feedback: 'Diseños aprobados sin cambios. El cliente está muy satisfecho con el resultado.'
        },
        {
            id: 'DEL-2023-06',
            order_id: 'TKT-2023-30',
            title: 'Rediseño Identidad Corporativa - Manual Final',
            type: 'design',
            creative: {
                id: 2,
                name: 'Carlos Ruiz',
                avatar: 'CR'
            },
            status: 'approved',
            submitted_date: '2023-06-01',
            reviewed_date: '2023-06-02',
            client: 'Restaurante Sabores',
            files: [
                { name: 'identidad_final.pdf', type: 'pdf' },
                { name: 'manual_identidad.pdf', type: 'pdf' },
                { name: 'archivos_fuente.zip', type: 'zip' }
            ],
            comments: [
                {
                    id: 9,
                    user: { id: 2, name: 'Carlos Ruiz', avatar: 'CR' },
                    date: '2023-06-01T16:20:00',
                    text: 'Adjunto el manual de identidad completo y todos los archivos fuente.'
                },
                {
                    id: 10,
                    user: { id: 1, name: 'Ana Martínez', avatar: 'AM' },
                    date: '2023-06-02T11:00:00',
                    text: 'Manual aprobado. Trabajo sobresaliente, Carlos. El cliente está encantado con el resultado final.'
                }
            ],
            feedback: 'El cliente está extremadamente satisfecho con el trabajo. Han destacado la profesionalidad y la atención al detalle.'
        }
    ];
    

    init();
    
    function init() {
        renderDeliverables();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        searchInput.addEventListener('input', filterDeliverables);
        statusFilter.addEventListener('change', filterDeliverables);
        typeFilter.addEventListener('change', filterDeliverables);
    }
    
    function renderDeliverables(filteredDeliverables = null) {
        const deliverablesToRender = filteredDeliverables || mockDeliverables;
        
        deliverableTableBody.innerHTML = '';
        
        if (deliverablesToRender.length === 0) {
            deliverableTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">No se encontraron entregables que coincidan con su búsqueda</td>
                </tr>
            `;
            return;
        }
        
        deliverablesToRender.forEach(deliverable => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${deliverable.id}</td>
                <td>${deliverable.title}</td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${deliverable.creative.avatar}</div>
                        <span>${deliverable.creative.name}</span>
                    </div>
                </td>
                <td><span class="type-badge ${deliverable.type}">${getTypeName(deliverable.type)}</span></td>
                <td><span class="status-badge ${deliverable.status}">${getStatusName(deliverable.status)}</span></td>
                <td>${formatDate(deliverable.submitted_date)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view" onclick="viewDeliverable('${deliverable.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${deliverable.status === 'pending' ? `
                            <button class="btn-icon edit" onclick="reviewDeliverable('${deliverable.id}')">
                                <i class="fas fa-clipboard-check"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            deliverableTableBody.appendChild(row);
        });
    }
    
    function filterDeliverables() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        const typeValue = typeFilter.value;
        
        const filtered = mockDeliverables.filter(deliverable => {

            const matchesSearch = !searchTerm ||
                deliverable.title.toLowerCase().includes(searchTerm) ||
                deliverable.id.toLowerCase().includes(searchTerm) ||
                deliverable.creative.name.toLowerCase().includes(searchTerm) ||
                deliverable.client.toLowerCase().includes(searchTerm);
            

            const matchesStatus = !statusValue || deliverable.status === statusValue;
            

            const matchesType = !typeValue || deliverable.type === typeValue;
            
            return matchesSearch && matchesStatus && matchesType;
        });
        
        renderDeliverables(filtered);
    }
    

    window.viewDeliverable = function(deliverableId) {
        const deliverable = mockDeliverables.find(d => d.id === deliverableId);
        if (!deliverable) return;
        

        document.getElementById('viewDeliverableId').textContent = deliverable.id;
        document.getElementById('viewDeliverableTitle').textContent = deliverable.title;
        document.getElementById('viewDeliverableType').textContent = getTypeName(deliverable.type);
        document.getElementById('viewDeliverableType').className = `type-badge ${deliverable.type}`;
        document.getElementById('viewDeliverableStatus').textContent = getStatusName(deliverable.status);
        document.getElementById('viewDeliverableStatus').className = `status-badge ${deliverable.status}`;
        document.getElementById('viewDeliverableCreative').textContent = deliverable.creative.name;
        document.getElementById('viewDeliverableClient').textContent = deliverable.client;
        document.getElementById('viewDeliverableSubmitted').textContent = formatDate(deliverable.submitted_date);
        
        if (deliverable.reviewed_date) {
            document.getElementById('viewDeliverableReviewed').textContent = formatDate(deliverable.reviewed_date);
            document.getElementById('viewReviewedDateGroup').style.display = 'block';
        } else {
            document.getElementById('viewReviewedDateGroup').style.display = 'none';
        }
        

        const filesList = document.getElementById('viewDeliverableFiles');
        filesList.innerHTML = '';
        
        if (deliverable.files && deliverable.files.length > 0) {
            deliverable.files.forEach(file => {
                const icon = getFileIcon(file.type);
                const fileItem = document.createElement('div');
                fileItem.className = 'attachment-item';
                fileItem.innerHTML = `
                    <i class="${icon}"></i>
                    <a href="#" onclick="downloadFile('${file.name}'); return false;">${file.name}</a>
                `;
                filesList.appendChild(fileItem);
            });
        }
        

        const feedbackSection = document.getElementById('viewFeedbackSection');
        if (deliverable.feedback) {
            document.getElementById('viewFeedback').textContent = deliverable.feedback;
            feedbackSection.style.display = 'block';
        } else {
            feedbackSection.style.display = 'none';
        }
        
 
        const commentsContainer = document.getElementById('viewDeliverableComments');
        commentsContainer.innerHTML = '';
        
        if (deliverable.comments && deliverable.comments.length > 0) {
            deliverable.comments.forEach(comment => {
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
        

        const viewDeliverableModal = new bootstrap.Modal(document.getElementById('viewDeliverableModal'));
        viewDeliverableModal.show();
    };
    

    window.reviewDeliverable = function(deliverableId) {
        const deliverable = mockDeliverables.find(d => d.id === deliverableId);
        if (!deliverable) return;
        

        document.getElementById('reviewDeliverableId').textContent = deliverable.id;
        document.getElementById('reviewDeliverableTitle').textContent = deliverable.title;
        document.getElementById('reviewDeliverableCreative').textContent = deliverable.creative.name;
        document.getElementById('reviewDeliverableClient').textContent = deliverable.client;
        

        const filesList = document.getElementById('reviewDeliverableFiles');
        filesList.innerHTML = '';
        
        if (deliverable.files && deliverable.files.length > 0) {
            deliverable.files.forEach(file => {
                const icon = getFileIcon(file.type);
                const fileItem = document.createElement('div');
                fileItem.className = 'attachment-item';
                fileItem.innerHTML = `
                    <i class="${icon}"></i>
                    <a href="#" onclick="downloadFile('${file.name}'); return false;">${file.name}</a>
                `;
                filesList.appendChild(fileItem);
            });
        }
        

        document.getElementById('reviewFeedback').value = '';
        

        const reviewForm = document.getElementById('reviewForm');
        reviewForm.onsubmit = function(e) {
            e.preventDefault();
            submitReview(deliverableId);
        };
        
        reviewModal.show();
    };
    
    function submitReview(deliverableId) {
        const deliverable = mockDeliverables.find(d => d.id === deliverableId);
        if (!deliverable) return;
        
        const decision = document.querySelector('input[name="reviewDecision"]:checked').value;
        const feedback = document.getElementById('reviewFeedback').value;
        
        if (!feedback.trim()) {
            showAlert('Por favor proporcione feedback para el creativo', 'warning');
            return;
        }
        

        deliverable.status = decision === 'approve' ? 'approved' : 'rejected';
        deliverable.reviewed_date = new Date().toISOString().split('T')[0];
        deliverable.feedback = feedback;
        

        if (!deliverable.comments) {
            deliverable.comments = [];
        }
        
        deliverable.comments.push({
            id: Date.now(),
            user: { id: 1, name: 'Ana Martínez', avatar: 'AM' },
            date: new Date().toISOString(),
            text: `${decision === 'approve' ? 'Entregable aprobado' : 'Entregable rechazado'}: ${feedback}`
        });
        

        const orderId = deliverable.order_id;
        const order = window.mockOrders ? window.mockOrders.find(o => o.id === orderId) : null;
        
        if (order) {
            order.status = decision === 'approve' ? 'approved' : 'rejected';
            

            if (!order.timeline) {
                order.timeline = [];
            }
            
            order.timeline.push({
                date: new Date().toISOString(),
                action: 'status_change',
                user: 'Ana Martínez',
                from_status: 'review',
                to_status: decision === 'approve' ? 'approved' : 'rejected'
            });
        }
        

        reviewModal.hide();
        renderDeliverables();
        
        showAlert(`Entregable ${decision === 'approve' ? 'aprobado' : 'rechazado'} con éxito`, 'success');
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
    
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
            'pending': 'Pendiente de Revisión',
            'approved': 'Aprobado',
            'rejected': 'Rechazado'
        };
        return statusMap[status] || status;
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
});