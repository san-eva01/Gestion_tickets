document.addEventListener('DOMContentLoaded', function() {

    const mockDeliverables = [
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

 


const deliverablesTableBody = document.querySelector('.custom-table tbody');
const searchInput = document.querySelector('.search-input');
const statusFilter = document.getElementById('statusFilter');


function renderDeliverables(deliverables = mockDeliverables) {
    deliverablesTableBody.innerHTML = '';
    
    if (deliverables.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="7" class="text-center py-4 text-muted">
                No se encontraron entregables
            </td>
        `;
        deliverablesTableBody.appendChild(emptyRow);
        return;
    }
    
    deliverables.forEach(deliverable => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${deliverable.id}</td>
            <td>${deliverable.order_id}</td>
            <td>${deliverable.title}</td>
            <td>${deliverable.client}</td>
            <td>${formatDate(deliverable.submitted_date)}</td>
            <td><span class="status-badge ${deliverable.status}">${getStatusName(deliverable.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon view" onclick="viewDeliverable('${deliverable.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        deliverablesTableBody.appendChild(row);
    });
}


function filterDeliverables() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    
    const filtered = mockDeliverables.filter(deliverable => {

        const matchesSearch = 
            deliverable.id.toLowerCase().includes(searchTerm) ||
            deliverable.order_id.toLowerCase().includes(searchTerm) ||
            deliverable.title.toLowerCase().includes(searchTerm) ||
            deliverable.client.toLowerCase().includes(searchTerm);
        
 
        const matchesStatus = statusValue ? deliverable.status === statusValue : true;
        
        return matchesSearch && matchesStatus;
    });
    
    renderDeliverables(filtered);
}


searchInput.addEventListener('input', filterDeliverables);
statusFilter.addEventListener('change', filterDeliverables);


renderDeliverables();

    
    document.getElementById('addDeliverableComment').addEventListener('click', addComment);
    

    window.viewDeliverable = function(deliverableId) {
        const deliverable = mockDeliverables.find(d => d.id === deliverableId);
        if (!deliverable) return;
        
      
        document.getElementById('viewDeliverableId').textContent = deliverable.id;
        document.getElementById('viewDeliverableTitle').textContent = deliverable.title;
        document.getElementById('viewDeliverableOrder').textContent = deliverable.order_id;
        document.getElementById('viewDeliverableStatus').textContent = getStatusName(deliverable.status);
        document.getElementById('viewDeliverableStatus').className = `status-badge ${deliverable.status}`;
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
    
    function addComment() {
        const deliverableId = document.getElementById('viewDeliverableId').textContent;
        const commentText = document.getElementById('newDeliverableComment').value;
        
        if (!commentText.trim()) return;
        
        const deliverable = mockDeliverables.find(d => d.id === deliverableId);
        if (!deliverable) return;
        
        if (!deliverable.comments) {
            deliverable.comments = [];
        }
        
   
        const newComment = {
            id: Date.now(),
            user: { id: 2, name: 'Carlos Ruiz', avatar: 'CR' },
            date: new Date().toISOString(),
            text: commentText
        };
        
        deliverable.comments.push(newComment);
        
 
        const commentsContainer = document.getElementById('viewDeliverableComments');
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
        

        document.getElementById('newDeliverableComment').value = '';
        
        showAlert('Comentario agregado', 'success');
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