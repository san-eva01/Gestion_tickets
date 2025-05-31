document.addEventListener('DOMContentLoaded', function() {
    const cart = [];
    const cartButton = document.getElementById('cartButton');
    const cartModal = document.getElementById('cartModal');
    const closeModal = document.querySelector('.close-modal');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummaryContainer = document.getElementById('cartSummary');
    const cartCount = document.getElementById('cartCount');
    
    // Añadir productos al carrito
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const product = {
                id: this.getAttribute('data-id'),
                nombre: this.getAttribute('data-nombre'),
                color: this.getAttribute('data-color'),
                talla: this.getAttribute('data-talla'),
                precio: parseFloat(this.getAttribute('data-precio'))
            };
            
            cart.push(product);
            updateCart();
            
            // Efecto visual
            this.textContent = '✓';
            this.style.backgroundColor = '#2ecc71';
            setTimeout(() => {
                this.textContent = '+';
                this.style.backgroundColor = '#4CAF50';
            }, 500);
        });
    });
    
    // Mostrar/ocultar carrito
    cartButton.addEventListener('click', function() {
        cartModal.style.display = 'block';
        renderCart();
    });
    
    closeModal.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });
    
    // Cerrar al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
    
    // Actualizar el carrito
    function updateCart() {
        cartCount.textContent = cart.length;
    }
    
    // Renderizar contenido del carrito
    function renderCart() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío</p>';
            cartSummaryContainer.innerHTML = '';
            return;
        }
        
        let itemsHTML = '';
        let subtotal = 0;
        
        cart.forEach(item => {
            subtotal += item.precio;
            itemsHTML += `
                <div class="cart-item">
                    <h3>${item.nombre}</h3>
                    <p>Color: ${item.color} | Talla: ${item.talla}</p>
                    <p>Precio: $${item.precio.toFixed(2)}</p>
                </div>
            `;
        });
        
        const iva = subtotal * 0.16;
        const total = subtotal + iva;
        
        cartItemsContainer.innerHTML = itemsHTML;
        cartSummaryContainer.innerHTML = `
            <div class="cart-summary">
                <div class="cart-subtotal">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="cart-iva">
                    <span>IVA (16%):</span>
                    <span>$${iva.toFixed(2)}</span>
                </div>
                <div class="cart-total">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            </div>
        `;
    }
});