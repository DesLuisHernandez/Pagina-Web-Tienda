document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const basePrice = 60000;
    const originalTitle = document.title;
    const messages = ["No esperes más...", "¡Regresa!", "¡Te extrañamos!", "¡No te vayas!"];
    let messageIndex = 0;
    let cart = [];

    // ==================== FUNCIONALIDAD GENERAL ====================

    // Cambiar título cuando la pestaña no está activa
    function changeTitle() {
        if (document.hidden) {
            document.title = messages[messageIndex];
            messageIndex = (messageIndex + 1) % messages.length;
        } else {
            document.title = originalTitle;
        }
    }

    document.addEventListener("visibilitychange", changeTitle);
    setInterval(() => document.hidden && changeTitle(), 2000);

    // Navbar dinámico
    const navbar = document.getElementById('mainNavbar');
    const sections = document.querySelectorAll('.section');

    function updateNavbarBackground() {
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - navbar.clientHeight) {
                currentSection = section.id;
            }
        });

        if (currentSection === 'inicio' || window.scrollY === 0) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (currentSection === 'productosDestacados') {
            navbar.style.backgroundColor = 'rgba(248, 249, 250, 0.3)';
        } else if (currentSection === 'masProductos') {
            navbar.style.backgroundColor = 'rgba(255, 193, 7, 0.3)';
        } else if (currentSection === 'contacto') {
            navbar.style.backgroundColor = 'rgba(33, 37, 41, 0.3)';
        }
    }

    window.addEventListener('scroll', updateNavbarBackground);
    updateNavbarBackground();

    // ==================== PERSONALIZACIÓN DE CAMISETA ====================

    const btnFrente = document.getElementById('btnFrente');
    const btnEspalda = document.getElementById('btnEspalda');
    const fileInput = document.getElementById('hiddenFileInput');
    const canvas = document.getElementById('tshirtCanvas');
    const ctx = canvas.getContext('2d');
    const addToCartBtn = document.getElementById('addToCart');

    // Precargar imagen base de la camiseta
    const baseImage = new Image();
    baseImage.src = 'images/camisetaBlanca.png';

    let currentSide = 'front'; // 'front' o 'back'
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    const designs = {
        front: { 
            img: null, 
            x: 150, 
            y: 200, 
            width: 150, 
            height: 150,
            rotation: 0,
            visible: true 
        },
        back: { 
            img: null, 
            x: 350, 
            y: 200, 
            width: 150, 
            height: 150,
            rotation: 0,
            visible: true 
        }
    };

    // Dibujar camiseta con diseños
    function drawTshirt() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar camiseta base
        const aspectRatio = baseImage.width / baseImage.height;
        let drawWidth = canvas.width;
        let drawHeight = drawWidth / aspectRatio;
        
        if (drawHeight > canvas.height) {
            drawHeight = canvas.height;
            drawWidth = drawHeight * aspectRatio;
        }
        
        const offsetX = (canvas.width - drawWidth) / 2;
        const offsetY = (canvas.height - drawHeight) / 2;
        
        ctx.drawImage(baseImage, offsetX, offsetY, drawWidth, drawHeight);

        // Dibujar diseños
        Object.keys(designs).forEach(side => {
            const design = designs[side];
            if (design.img && design.visible) {
                ctx.save();
                ctx.translate(design.x + design.width/2, design.y + design.height/2);
                ctx.rotate(design.rotation * Math.PI / 180);
                ctx.globalAlpha = 0.9;
                
                // Resaltar diseño seleccionado
                if (currentSide === side) {
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(-design.width/2, -design.height/2, design.width, design.height);
                }
                
                ctx.drawImage(design.img, -design.width/2, -design.height/2, design.width, design.height);
                ctx.restore();
            }
        });
    }

    // Manejar subida de archivos
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                designs[currentSide].img = img;
                // Ajustar tamaño automáticamente
                const maxSize = 150;
                const ratio = Math.min(maxSize/img.width, maxSize/img.height);
                designs[currentSide].width = img.width * ratio;
                designs[currentSide].height = img.height * ratio;
                drawTshirt();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Botones para seleccionar lado
    btnFrente.addEventListener('click', function() {
        currentSide = 'front';
        designs.front.visible = true;
        drawTshirt();
        fileInput.click();
    });

    btnEspalda.addEventListener('click', function() {
        currentSide = 'back';
        designs.back.visible = true;
        drawTshirt();
        fileInput.click();
    });

    // Interacción con el canvas
    canvas.addEventListener('mousedown', function(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Verificar qué diseño se clickeó
        Object.keys(designs).forEach(side => {
            const design = designs[side];
            if (design.img && design.visible && 
                mouseX >= design.x && mouseX <= design.x + design.width &&
                mouseY >= design.y && mouseY <= design.y + design.height) {
                
                currentSide = side;
                isDragging = true;
                dragOffset = { x: mouseX - design.x, y: mouseY - design.y };
                drawTshirt();
            }
        });
    });

    canvas.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        const design = designs[currentSide];
        design.x = e.clientX - rect.left - dragOffset.x;
        design.y = e.clientY - rect.top - dragOffset.y;
        drawTshirt();
    });

    canvas.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('mouseleave', () => isDragging = false);

    // Zoom con rueda del mouse
    canvas.addEventListener('wheel', function(e) {
        e.preventDefault();
        const design = designs[currentSide];
        if (!design.img) return;
        
        const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;
        design.width *= scaleFactor;
        design.height *= scaleFactor;
        drawTshirt();
    });

    // Rotación con doble clic
    canvas.addEventListener('dblclick', function(e) {
        const design = designs[currentSide];
        if (!design.img) return;
        
        design.rotation += 45;
        if (design.rotation >= 360) design.rotation = 0;
        drawTshirt();
    });

    // Inicialización de la camiseta
    baseImage.onload = drawTshirt;

    // ==================== CARRITO DE COMPRAS ====================

    const cartIcon = document.getElementById('cartIcon');
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const procederAlPagoBtn = document.getElementById('procederAlPago');
    const misPedidosItems = document.getElementById('misPedidosItems');
    const misPedidosTotal = document.getElementById('misPedidosTotal');
    const misPedidosLink = document.getElementById('misPedidosLink');

    // Función para agregar al carrito
    function addToCart(image, price, isCustom = false, size = null, productId = null) {
        const cartItem = {
            image: image,
            price: price,
            isCustom: isCustom,
            size: size,
            productId: productId || Date.now().toString(),
            timestamp: Date.now()
        };
        
        if (isCustom) {
            cartItem.designs = {
                front: JSON.parse(JSON.stringify(designs.front)),
                back: JSON.parse(JSON.stringify(designs.back))
            };
        }
        
        cart.push(cartItem);
        updateCart();
        showFeedback('¡Producto agregado al carrito!', 'success');
    }

    // Agregar camiseta personalizada al carrito
    addToCartBtn.addEventListener('click', function() {
        if (!designs.front.img && !designs.back.img) {
            showFeedback('Agrega al menos un diseño primero', 'error');
            return;
        }

        // Obtener talla seleccionada
        const size = document.querySelector('input[name="talla-personalizada"]:checked').value;

        // Crear canvas temporal para capturar el diseño completo
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Dibujar la camiseta base
        tempCtx.drawImage(baseImage, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // Dibujar los diseños
        Object.values(designs).forEach(design => {
            if (design.img) {
                tempCtx.save();
                tempCtx.translate(design.x + design.width/2, design.y + design.height/2);
                tempCtx.rotate(design.rotation * Math.PI / 180);
                tempCtx.globalAlpha = 0.9;
                tempCtx.drawImage(design.img, -design.width/2, -design.height/2, design.width, design.height);
                tempCtx.restore();
            }
        });
        
        const imageURL = tempCanvas.toDataURL("image/png");
        addToCart(imageURL, basePrice, true, size);
    });

    // Agregar productos normales al carrito
    document.querySelectorAll('.addToCartBtn').forEach(button => {
        button.addEventListener('click', function() {
            const image = this.getAttribute('data-image');
            const price = parseFloat(this.getAttribute('data-price'));
            const productId = this.getAttribute('data-product-id');
            
            // Obtener talla seleccionada
            const size = document.querySelector(`input[name="talla-${productId}"]:checked`).value;
            
            addToCart(image, price, false, size, productId);
        });
    });

    // Actualizar carrito
    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;

            const cartItem = document.createElement('li');
            cartItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            cartItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${item.image}" width="50" height="50" class="img-thumbnail me-3">
                    <div>
                        ${item.isCustom ? '<span class="badge bg-info">Personalizada</span>' : ''}
                        ${item.size ? `<small class="d-block">Talla: ${item.size}</small>` : ''}
                        <span>$${item.price.toFixed(2)}</span>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm remove-item" data-index="${index}">&times;</button>
            `;

            cartItems.appendChild(cartItem);
        });

        cartTotal.textContent = `$${total.toFixed(2)}`;
        cartCount.textContent = cart.length;

        // Eliminar item del carrito
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCart();
                showFeedback('Producto eliminado', 'warning');
            });
        });
    }

    // Proceder al pago (guardar en Mis Pedidos)
    procederAlPagoBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showFeedback('El carrito está vacío', 'error');
            return;
        }

        // Guardar en Mis Pedidos
        cart.forEach(item => {
            const pedidoItem = document.createElement('li');
            pedidoItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            pedidoItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${item.image}" width="50" height="50" class="img-thumbnail me-3">
                    <div>
                        ${item.isCustom ? '<span class="badge bg-info">Personalizada</span>' : ''}
                        ${item.size ? `<small class="d-block">Talla: ${item.size}</small>` : ''}
                        <span>$${item.price.toFixed(2)}</span>
                    </div>
                </div>
            `;

            misPedidosItems.appendChild(pedidoItem);
        });

        const totalPedido = cart.reduce((sum, item) => sum + item.price, 0);
        misPedidosTotal.textContent = `$${totalPedido.toFixed(2)}`;

        // Vaciar carrito
        cart = [];
        updateCart();
        showFeedback('¡Compra realizada con éxito!', 'success');
        
        // Cerrar modal del carrito
        const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        modal.hide();
    });

    // Mostrar modal Mis Pedidos
    misPedidosLink.addEventListener('click', function(e) {
        e.preventDefault();
        const modal = new bootstrap.Modal(document.getElementById('misPedidosModal'));
        modal.show();
    });

    // Mostrar modal del carrito
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = new bootstrap.Modal(document.getElementById('cartModal'));
            modal.show();
        });
    }

    // ==================== FUNCIONALIDAD DE PRODUCTOS ====================

    // Alternar entre vista frontal y trasera de los productos
    const toggleButtons = [
        { buttonId: 'toggle1', imgId: 'producto1', frontImage: 'images/partesArribaPrendas/prenda1Frente.png', backImage: 'images/partesArribaPrendas/prenda1Atras.png' },
        { buttonId: 'toggle2', imgId: 'producto2', frontImage: 'images/partesArribaPrendas/prenda2Frente.png', backImage: 'images/partesArribaPrendas/prenda2Atras.png' },
        { buttonId: 'toggle3', imgId: 'producto3', frontImage: 'images/partesArribaPrendas/prenda3Frente.png', backImage: 'images/partesArribaPrendas/prenda3Atras.png' },
        { buttonId: 'toggle4', imgId: 'producto4', frontImage: 'images/partesArribaPrendas/prenda4Frente.png', backImage: 'images/partesArribaPrendas/prenda4Atras.png' },
        { buttonId: 'toggle5', imgId: 'producto5', frontImage: 'images/masProductos/masPrendas1Frente.png', backImage: 'images/masProductos/masPrendas1Atras.png' },
        { buttonId: 'toggle6', imgId: 'producto6', frontImage: 'images/masProductos/masPrendas2Frente.png', backImage: 'images/masProductos/masPrendas2Atras.png' },
        { buttonId: 'toggle7', imgId: 'producto7', frontImage: 'images/masProductos/masPrendas3Frente.png', backImage: 'images/masProductos/masPrendas3Atras.png' },
        { buttonId: 'toggle8', imgId: 'producto8', frontImage: 'images/masProductos/masPrendas4Frente.png', backImage: 'images/masProductos/masPrendas4Atras.png' }
    ];

    toggleButtons.forEach(toggle => {
        document.getElementById(toggle.buttonId).addEventListener('click', function() {
            const imgElement = document.getElementById(toggle.imgId);
            if (imgElement.src.includes(toggle.frontImage)) {
                imgElement.src = toggle.backImage;
            } else {
                imgElement.src = toggle.frontImage;
            }
        });
    });

    // ==================== FUNCIONES AUXILIARES ====================

    // Mostrar feedback al usuario
    function showFeedback(message, type = 'success') {
        const feedback = document.createElement('div');
        feedback.className = `alert alert-${type} position-fixed`;
        feedback.style.top = '20px';
        feedback.style.right = '20px';
        feedback.style.zIndex = '1000';
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 3000);
    }
});