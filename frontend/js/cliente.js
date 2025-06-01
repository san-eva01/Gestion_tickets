document.addEventListener('DOMContentLoaded', function () {
    // Verifica que estamos en la página de clientes
    const clientsTable = document.getElementById('clientsTableBody');
    if (!clientsTable) return;  // Si no existe, termina la ejecución
    
    // Declarar todas las variables necesarias
    const clientsTableBody = document.getElementById('clientsTableBody');
    const searchInput = document.querySelector('.search-input');
    const clientForm = document.getElementById('clientForm');
    let clients = [];
    let clientModal;
    
    // Inicializar modal de Bootstrap
    try {
        clientModal = new bootstrap.Modal(document.getElementById('clientModal'));
    } catch (error) {
        console.error('Error al inicializar modal:', error);
    }
    
    // Configura Supabase (SOLO se ejecutará en clientes.html)
    const supabaseUrl = 'https://onbgqjndemplsgxdaltr.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYmdxam5kZW1wbHNneGRhbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTcxMTMsImV4cCI6MjA1OTA5MzExM30.HnBHKLOu7yY5H9xHyqeCV0S45fghKfgyGrL12oDRXWw';
    
    // Verificar que Supabase esté disponible globalmente
    if (typeof supabase === 'undefined') {
        console.error('Supabase no está cargado. Verifica que el script esté incluido.');
        showAlert('Error: No se puede conectar a la base de datos', 'danger');
        return;
    }
    
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    
    console.log('Supabase inicializado para clientes:', supabaseClient);
    console.log('URL de Supabase:', supabaseUrl);
    
    // Event listeners - verificar que los elementos existan
    const btnNewClient = document.getElementById('btnNewClient');
    if (btnNewClient) {
        btnNewClient.addEventListener('click', () => showClientModal());
    }
    
    if (clientForm) {
        clientForm.addEventListener('submit', handleClientSubmit);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', filterClients);
    }

    // Cargar clientes al iniciar
    fetchClients();

    // Función para obtener clientes desde Supabase
    async function fetchClients() {
        try {
            console.log('Intentando obtener clientes...');
            
            const { data, error } = await supabaseClient
                .from('cliente')
                .select('*')
                .order('id_cliente', { ascending: true });

            console.log('Respuesta de Supabase:', { data, error });

            if (error) {
                console.error('Error de Supabase:', error);
                throw error;
            }

            clients = data || [];
            console.log('Clientes cargados:', clients.length);
            renderClients();
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            showAlert(`Error al cargar clientes: ${error.message}`, 'danger');
            
            // Mostrar mensaje más específico si la tabla no existe
            if (error.message.includes('relation "public.cliente" does not exist')) {
                showAlert('La tabla "cliente" no existe en la base de datos. Verifica que la tabla esté creada correctamente.', 'danger');
            }
        }
    }

    function renderClients(filteredClients = null) {
        const clientsToRender = filteredClients || clients;
        
        if (!clientsTableBody) {
            console.error('Elemento clientsTableBody no encontrado');
            return;
        }
        
        clientsTableBody.innerHTML = '';

        if (clientsToRender.length === 0) {
            clientsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">No se encontraron clientes</td>
                </tr>
            `;
            return;
        }

        clientsToRender.forEach(client => {
            const row = document.createElement('tr');
            row.className = 'table-row';
            row.innerHTML = `
                <td>${client.id_cliente}</td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${getClientInitials(client.nombre)}</div>
                        <span>${client.nombre || 'Sin nombre'}</span>
                    </div>
                </td>
                <td>${client.email}</td>
                <td>${client.telefono || 'N/A'}</td>
                <td><span class="status-badge ${getTypeClass(client.tipo)}">${client.tipo || 'Sin tipo'}</span></td>
                <td>${formatDate(client.fecha_creacion)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="editClient(${client.id_cliente})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon view" onclick="viewClient(${client.id_cliente})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteClient(${client.id_cliente})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            clientsTableBody.appendChild(row);
        });
    }

    // Funciones auxiliares
    function getClientInitials(name) {
        if (!name) return '??';
        return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    }

    function getTypeClass(type) {
        if (!type) return 'bg-gray-200';
        switch (type.toLowerCase()) {
            case 'a': return 'bg-green text-white';
            case 'aa': return 'bg-blue text-white';
            case 'aaa': return 'bg-purple text-white';
            default: return 'bg-gray-200';
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-ES');
        } catch {
            return dateStr;
        }
    }

    // Mostrar modal para nuevo/editar cliente
    async function showClientModal(clientId = null) {
        if (!clientForm || !clientModal) {
            console.error('Form o modal no disponible');
            return;
        }
        
        clientForm.reset();
        const clientIdInput = document.getElementById('clientId');
        
        if (clientIdInput) clientIdInput.value = '';

        if (clientId) {
            try {
                const { data: client, error } = await supabaseClient
                    .from('cliente')
                    .select('*')
                    .eq('id_cliente', clientId)
                    .single();

                if (error) throw error;

                const elements = {
                    clientId: document.getElementById('clientId'),
                    nombre: document.getElementById('nombre'),
                    email: document.getElementById('email'),
                    telefono: document.getElementById('telefono'),
                    tipo: document.getElementById('tipo'),
                    modalTitle: document.getElementById('modalTitle')
                };

                if (elements.clientId) elements.clientId.value = client.id_cliente;
                if (elements.nombre) elements.nombre.value = client.nombre || '';
                if (elements.email) elements.email.value = client.email || '';
                if (elements.telefono) elements.telefono.value = client.telefono || '';
                if (elements.tipo) elements.tipo.value = client.tipo || 'A';
                if (elements.modalTitle) elements.modalTitle.textContent = 'Editar Cliente';
            } catch (error) {
                console.error('Error al cargar cliente:', error);
                showAlert(`Error al cargar cliente: ${error.message}`, 'danger');
                return;
            }
        } else {
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) modalTitle.textContent = 'Nuevo Cliente';
        }

        clientModal.show();
    }

    // Manejar envío del formulario
    async function handleClientSubmit(e) {
        e.preventDefault();

        const clientIdInput = document.getElementById('clientId');
        const nombreInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        const telefonoInput = document.getElementById('telefono');
        const tipoInput = document.getElementById('tipo');

        const clientId = clientIdInput ? clientIdInput.value : '';
        const clientData = {
            nombre: nombreInput ? nombreInput.value.trim() : '',
            email: emailInput ? emailInput.value.trim() : '',
            telefono: telefonoInput && telefonoInput.value.trim() ? telefonoInput.value.trim() : null,
            tipo: tipoInput ? tipoInput.value : 'A'
        };

        console.log('Datos del cliente a guardar:', clientData);

        // Validación
        if (!clientData.nombre || !clientData.email) {
            showAlert('Complete todos los campos requeridos (Nombre, Email)', 'warning');
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(clientData.email)) {
            showAlert('Ingrese un email válido', 'warning');
            return;
        }

        try {
            if (clientId) {
                // Actualizar cliente existente
                console.log('Actualizando cliente ID:', clientId);
                const { error } = await supabaseClient
                    .from('cliente')
                    .update(clientData)
                    .eq('id_cliente', clientId);

                if (error) {
                    console.error('Error al actualizar:', error);
                    throw error;
                }

                showAlert('Cliente actualizado con éxito', 'success');
            } else {
                // Crear nuevo cliente
                console.log('Creando nuevo cliente');
                const { data: insertedData, error: dbError } = await supabaseClient
                    .from('cliente')
                    .insert(clientData)
                    .select();

                console.log('Resultado de inserción:', { insertedData, dbError });

                if (dbError) {
                    console.error('Error al insertar:', dbError);
                    throw dbError;
                }

                showAlert('Cliente creado con éxito', 'success');
            }

            clientModal.hide();
            await fetchClients();
        } catch (error) {
            console.error('Error al guardar cliente:', error);
            showAlert(error.message || 'Error al procesar la solicitud', 'danger');
        }
    }

    // Filtrar clientes
    function filterClients() {
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filtered = clients.filter(client =>
            (client.nombre && client.nombre.toLowerCase().includes(searchTerm)) ||
            (client.email && client.email.toLowerCase().includes(searchTerm)) ||
            (client.tipo && client.tipo.toLowerCase().includes(searchTerm)) ||
            (client.telefono && client.telefono.includes(searchTerm)) ||
            client.id_cliente.toString().includes(searchTerm)
        );
        renderClients(filtered);
    }

    // Mostrar alertas
    function showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) {
            console.error('Alert container no encontrado');
            return;
        }
        
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        setTimeout(() => alertContainer.innerHTML = '', 5000);
    }

    // Funciones globales para los botones
    window.editClient = function (clientId) {
        showClientModal(clientId);
    };

    window.viewClient = function (clientId) {
        const client = clients.find(c => c.id_cliente === clientId);
        if (!client) return;

        const details = `
            <div style="line-height: 1.8;">
                <strong>ID:</strong> ${client.id_cliente}<br>
                <strong>Nombre:</strong> ${client.nombre || 'N/A'}<br>
                <strong>Email:</strong> ${client.email}<br>
                <strong>Teléfono:</strong> ${client.telefono || 'N/A'}<br>
                <strong>Tipo:</strong> ${client.tipo || 'Sin tipo'}<br>
                <strong>Fecha Creación:</strong> ${formatDate(client.fecha_creacion)}
            </div>
        `;

        // Crear modal de vista rápida
        const modalHtml = `
            <div class="modal fade" tabindex="-1" id="viewClientModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-building text-primary me-2"></i>
                                Detalles del Cliente
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${details}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn-primary" onclick="editClient(${clientId}); bootstrap.Modal.getInstance(document.getElementById('viewClientModal')).hide();">
                                <i class="fas fa-edit me-1"></i>Editar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior si existe
        const existingModal = document.getElementById('viewClientModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalElement = document.getElementById('viewClientModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
        });
    };

    window.deleteClient = async function (clientId) {
        const client = clients.find(c => c.id_cliente === clientId);
        if (!client) return;

        if (!confirm(`¿Eliminar el cliente "${client.nombre || 'Sin nombre'}" permanentemente?`)) return;

        try {
            // Eliminar de la tabla
            const { error } = await supabaseClient
                .from('cliente')
                .delete()
                .eq('id_cliente', clientId);

            if (error) throw error;

            showAlert('Cliente eliminado con éxito', 'success');
            await fetchClients();
        } catch (error) {
            console.error('Error al eliminar:', error);
            showAlert('Error al eliminar cliente', 'danger');
        }
    };
});